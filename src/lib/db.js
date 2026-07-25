import { openDB } from 'idb';
import { DEFAULT_STATS } from './gameLogic';

const DB_NAME = 'solo-tracker';
const DB_VERSION = 1;
export const BACKUP_VERSION = 1;

export async function getDb() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('stats')) {
        db.createObjectStore('stats', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('tasks')) {
        db.createObjectStore('tasks', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('logs')) {
        const logs = db.createObjectStore('logs', { keyPath: 'id' });
        logs.createIndex('by-date', 'date');
      }
      if (!db.objectStoreNames.contains('meta')) {
        db.createObjectStore('meta', { keyPath: 'key' });
      }
    },
  });
}

const EXAMPLE_TASKS = [
  {
    id: 'example-gym',
    title: 'Morning gym session',
    type: 'daily',
    linkedStats: [{ statId: 'strength', xpValue: 40 }],
    reminderTime: '07:00',
    deadlineTime: '22:00',
    hasAlarm: false,
    status: 'pending',
    streak: { current: 0, longest: 0 },
    penaltyEnabled: true,
    penaltyXpLossPercent: 10,
    penaltyQuest: {
      title: '20 pushups',
      linkedStats: [{ statId: 'strength', xpValue: 10 }],
    },
  },
  {
    id: 'example-reading',
    title: 'Read 20 pages',
    type: 'daily',
    linkedStats: [{ statId: 'intellect', xpValue: 25 }],
    deadlineTime: '22:00',
    hasAlarm: false,
    status: 'pending',
    streak: { current: 0, longest: 0 },
    penaltyEnabled: false,
    penaltyQuest: null,
  },
];

export async function ensureSeeded() {
  const db = await getDb();
  const existingStats = await db.getAll('stats');
  if (existingStats.length === 0) {
    const tx = db.transaction('stats', 'readwrite');
    for (const stat of DEFAULT_STATS) {
      await tx.store.put(stat);
    }
    await tx.done;
  }

  // Only ever seed the example quests once, tracked via a meta flag -
  // not "if the task list happens to be empty", which would bring
  // deleted example tasks back from the dead every time you clear them.
  const alreadySeeded = await db.get('meta', 'exampleTasksSeeded');
  if (!alreadySeeded) {
    const existingTasks = await db.getAll('tasks');
    // Only seed on a genuinely fresh install (no tasks ever created).
    // If tasks already exist, this is an existing user upgrading to this
    // fix - just mark seeding as done without resurrecting anything.
    if (existingTasks.length === 0) {
      const tx = db.transaction('tasks', 'readwrite');
      for (const task of EXAMPLE_TASKS) {
        await tx.store.put(task);
      }
      await tx.done;
    }
    await db.put('meta', { key: 'exampleTasksSeeded', value: true });
  }
}

export async function getAllStats() {
  const db = await getDb();
  return db.getAll('stats');
}

export async function saveStat(stat) {
  const db = await getDb();
  return db.put('stats', stat);
}

export async function getMeta(key) {
  const db = await getDb();
  const row = await db.get('meta', key);
  return row ? row.value : undefined;
}

export async function setMeta(key, value) {
  const db = await getDb();
  return db.put('meta', { key, value });
}

export async function getAllTasks() {
  const db = await getDb();
  return db.getAll('tasks');
}

export async function saveTask(task) {
  const db = await getDb();
  return db.put('tasks', task);
}

export async function deleteTask(id) {
  const db = await getDb();
  return db.delete('tasks', id);
}

export async function addLog(entry) {
  const db = await getDb();
  return db.put('logs', entry);
}

export async function getAllLogs() {
  const db = await getDb();
  return db.getAll('logs');
}

// ---- Export / Import backup ----

export async function exportBackup() {
  const db = await getDb();
  const [stats, tasks, logs] = await Promise.all([
    db.getAll('stats'),
    db.getAll('tasks'),
    db.getAll('logs'),
  ]);

  const backup = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    stats,
    tasks,
    logs,
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `solo-tracker-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function validateBackup(data) {
  if (typeof data !== 'object' || data === null) return 'File is not a valid backup.';
  if (typeof data.version !== 'number') return 'Missing version field.';
  if (!Array.isArray(data.stats) || !Array.isArray(data.tasks) || !Array.isArray(data.logs)) {
    return 'Backup is missing stats, tasks, or logs.';
  }
  return null;
}

// mode: "replace" wipes existing data first, "merge" only adds missing ids
export async function importBackup(file, mode = 'replace') {
  const text = await file.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('That file is not valid JSON.');
  }

  const error = validateBackup(data);
  if (error) throw new Error(error);

  const db = await getDb();

  if (mode === 'replace') {
    await Promise.all([
      db.clear('stats'),
      db.clear('tasks'),
      db.clear('logs'),
    ]);
  }

  const writeAll = async (storeName, items) => {
    const tx = db.transaction(storeName, 'readwrite');
    for (const item of items) {
      if (mode === 'merge') {
        const exists = await tx.store.get(item.id);
        if (exists) continue;
      }
      await tx.store.put(item);
    }
    await tx.done;
  };

  await writeAll('stats', data.stats);
  await writeAll('tasks', data.tasks);
  await writeAll('logs', data.logs);

  return {
    statsImported: data.stats.length,
    tasksImported: data.tasks.length,
    logsImported: data.logs.length,
  };
}
