import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  ensureSeeded,
  getAllStats,
  getAllTasks,
  saveStat,
  saveTask,
  deleteTask as dbDeleteTask,
  addLog,
  getMeta,
  setMeta,
} from '../lib/db';
import { calculateOverallLevel, lowestStatLevel, calculateRank, levelFromXp } from '../lib/gameLogic';

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [stats, setStats] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  // Queue of level-up events to animate, e.g. [{ type: 'stat', name, level }, { type: 'overall', level }]
  const [levelUpQueue, setLevelUpQueue] = useState([]);

  useEffect(() => {
    (async () => {
      await ensureSeeded();
      let [s, t] = await Promise.all([getAllStats(), getAllTasks()]);

      const today = new Date().toISOString().slice(0, 10);
      const lastReset = await getMeta('lastResetDate');
      if (lastReset !== today) {
        const resetTasks = [];
        for (const task of t) {
          if (task.type === 'daily' && task.status !== 'pending') {
            const resetTask = { ...task, status: 'pending' };
            resetTasks.push(resetTask);
          }
        }
        if (resetTasks.length > 0) {
          await Promise.all(resetTasks.map(saveTask));
          t = t.map((task) => resetTasks.find((r) => r.id === task.id) || task);
        }
        await setMeta('lastResetDate', today);
      }

      setStats(s);
      setTasks(t);
      setLoading(false);
    })();
  }, []);

  const overall = useMemo(() => calculateOverallLevel(stats), [stats]);
  const lowestLevel = useMemo(() => lowestStatLevel(stats), [stats]);
  const rank = useMemo(() => calculateRank(overall.level, lowestLevel), [overall, lowestLevel]);

  const enqueueLevelUp = useCallback((event) => {
    setLevelUpQueue((q) => [...q, event]);
  }, []);

  const dismissLevelUp = useCallback(() => {
    setLevelUpQueue((q) => q.slice(1));
  }, []);

  // Applies xp gains/losses to a set of stats, persists them, and detects
  // level-ups so the caller can show the celebration animation.
  const applyXpToStats = useCallback(
    async (linkedStats, direction = 1) => {
      const updated = [...stats];

      for (const link of linkedStats) {
        const idx = updated.findIndex((s) => s.id === link.statId);
        if (idx === -1) continue;

        const before = levelFromXp(updated[idx].xp).level;
        const delta = direction === 1 ? link.xpValue : -Math.abs(link.xpValue);
        const newXp = Math.max(0, updated[idx].xp + delta);
        updated[idx] = { ...updated[idx], xp: newXp };
        await saveStat(updated[idx]);

        const after = levelFromXp(newXp).level;
        if (after > before) {
          enqueueLevelUp({ type: 'stat', name: updated[idx].name, level: after, color: updated[idx].color });
        }
      }

      setStats(updated);

      // Check overall level-up after all stat updates are applied
      const beforeOverall = calculateOverallLevel(stats).level;
      const afterOverall = calculateOverallLevel(updated).level;
      if (afterOverall > beforeOverall) {
        enqueueLevelUp({ type: 'overall', level: afterOverall });
      }
    },
    [stats, enqueueLevelUp]
  );

  const completeTask = useCallback(
    async (taskId) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task || task.status === 'done') return;

      const updatedTask = { ...task, status: 'done' };
      if (task.type === 'daily') {
        updatedTask.streak = {
          current: (task.streak?.current || 0) + 1,
          longest: Math.max(task.streak?.longest || 0, (task.streak?.current || 0) + 1),
        };
      }

      await saveTask(updatedTask);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));
      await addLog({ id: `${taskId}-${Date.now()}`, date: new Date().toISOString().slice(0, 10), taskId, status: 'done' });

      await applyXpToStats(task.linkedStats, 1);
    },
    [tasks, applyXpToStats]
  );

  // Called when a daily's deadline passes without completion.
  const failTask = useCallback(
    async (taskId) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task || task.status === 'failed') return;

      const updatedTask = {
        ...task,
        status: 'failed',
        streak: { current: 0, longest: task.streak?.longest || 0 },
      };
      await saveTask(updatedTask);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));
      await addLog({ id: `${taskId}-${Date.now()}`, date: new Date().toISOString().slice(0, 10), taskId, status: 'failed' });

      if (task.penaltyEnabled) {
        // XP loss as a percentage of current level progress
        const penaltyLinks = task.linkedStats.map((l) => {
          const stat = stats.find((s) => s.id === l.statId);
          const { xpIntoLevel } = levelFromXp(stat?.xp || 0);
          const loss = Math.round(xpIntoLevel * ((task.penaltyXpLossPercent || 10) / 100));
          return { statId: l.statId, xpValue: loss };
        });
        await applyXpToStats(penaltyLinks, -1);
      }

      if (task.penaltyQuest) {
        const newTask = {
          id: `penalty-${taskId}-${Date.now()}`,
          title: task.penaltyQuest.title,
          type: 'one-time',
          linkedStats: task.penaltyQuest.linkedStats,
          status: 'pending',
          isPenaltyQuest: true,
          originTaskId: taskId,
        };
        await saveTask(newTask);
        setTasks((prev) => [...prev, newTask]);
      }
    },
    [tasks, stats, applyXpToStats]
  );

  const addTask = useCallback(async (task) => {
    const withId = { ...task, id: task.id || crypto.randomUUID() };
    await saveTask(withId);
    setTasks((prev) => [...prev, withId]);
    return withId;
  }, []);

  const updateTask = useCallback(async (task) => {
    await saveTask(task);
    setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
  }, []);

  const removeTask = useCallback(async (taskId) => {
    await dbDeleteTask(taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }, []);

  const value = {
    loading,
    stats,
    tasks,
    overall,
    rank,
    lowestLevel,
    completeTask,
    failTask,
    addTask,
    updateTask,
    removeTask,
    setTasks,
    levelUpQueue,
    dismissLevelUp,
    refreshStats: async () => setStats(await getAllStats()),
    refreshTasks: async () => setTasks(await getAllTasks()),
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within a GameProvider');
  return ctx;
}
