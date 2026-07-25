import { useState } from 'react';

const inputStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid var(--panel-border)',
  borderRadius: 8,
  color: 'var(--text)',
  padding: '8px 10px',
  fontSize: 14,
  fontFamily: 'var(--font-body)',
};

const labelStyle = {
  fontSize: 12,
  color: 'var(--muted)',
  fontFamily: 'var(--font-heading)',
  fontWeight: 600,
  letterSpacing: 0.5,
  display: 'block',
  marginBottom: 4,
  marginTop: 14,
  textTransform: 'uppercase',
};

const buttonPrimary = {
  background: 'linear-gradient(90deg, #3B82F6, #22D3EE)',
  border: 'none',
  borderRadius: 8,
  color: '#0A0E1A',
  fontWeight: 600,
  padding: '10px 16px',
  fontSize: 14,
};

const buttonSecondary = {
  background: 'transparent',
  border: '1px solid var(--panel-border)',
  borderRadius: 8,
  color: 'var(--text)',
  padding: '10px 16px',
  fontSize: 14,
};

function emptyTask() {
  return {
    title: '',
    type: 'daily',
    statId: '',
    xpValue: 20,
    reminderTime: '',
    deadlineTime: '',
    hasAlarm: false,
    dueDate: '',
    penaltyEnabled: false,
    penaltyXpLossPercent: 10,
    penaltyQuestTitle: '',
    penaltyQuestXp: 10,
  };
}

// Flattens/unflattens between the form's simple fields and the
// underlying linkedStats / penaltyQuest shape the data model uses.
function taskToForm(task) {
  if (!task) return emptyTask();
  return {
    title: task.title,
    type: task.type,
    statId: task.linkedStats?.[0]?.statId || '',
    xpValue: task.linkedStats?.[0]?.xpValue ?? 20,
    reminderTime: task.reminderTime || '',
    deadlineTime: task.deadlineTime || '',
    hasAlarm: !!task.hasAlarm,
    dueDate: task.dueDate || '',
    penaltyEnabled: !!task.penaltyEnabled,
    penaltyXpLossPercent: task.penaltyXpLossPercent ?? 10,
    penaltyQuestTitle: task.penaltyQuest?.title || '',
    penaltyQuestXp: task.penaltyQuest?.linkedStats?.[0]?.xpValue ?? 10,
  };
}

function formToTask(form, existingTask) {
  const task = {
    ...(existingTask || {}),
    title: form.title.trim(),
    type: form.type,
    linkedStats: [{ statId: form.statId, xpValue: Number(form.xpValue) || 0 }],
    status: existingTask?.status || 'pending',
  };

  if (form.type === 'daily') {
    task.reminderTime = form.reminderTime || null;
    task.deadlineTime = form.deadlineTime || null;
    task.hasAlarm = form.hasAlarm;
    task.streak = existingTask?.streak || { current: 0, longest: 0 };
    task.penaltyEnabled = form.penaltyEnabled;
    task.penaltyXpLossPercent = form.penaltyEnabled ? Number(form.penaltyXpLossPercent) || 0 : 0;
    task.penaltyQuest = form.penaltyEnabled
      ? {
          title: form.penaltyQuestTitle.trim() || 'Penalty quest',
          linkedStats: [{ statId: form.statId, xpValue: Number(form.penaltyQuestXp) || 0 }],
        }
      : null;
    delete task.dueDate;
  } else {
    task.dueDate = form.dueDate || null;
    delete task.reminderTime;
    delete task.deadlineTime;
    delete task.hasAlarm;
    delete task.penaltyEnabled;
    delete task.penaltyQuest;
    delete task.streak;
  }

  return task;
}

export default function TaskForm({ stats, existingTask, onSave, onCancel }) {
  const [form, setForm] = useState(taskToForm(existingTask));

  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const canSubmit = form.title.trim().length > 0 && form.statId;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSave(formToTask(form, existingTask));
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: 'var(--panel)',
        border: '1px solid var(--panel-border)',
        borderRadius: 14,
        padding: 16,
      }}
    >
      <label style={{ ...labelStyle, marginTop: 0 }}>Title</label>
      <input style={inputStyle} value={form.title} onChange={set('title')} placeholder="e.g. Morning gym session" />

      <label style={labelStyle}>Type</label>
      <select style={inputStyle} value={form.type} onChange={set('type')}>
        <option value="daily">Daily task</option>
        <option value="one-time">One-time quest</option>
      </select>

      <label style={labelStyle}>Linked stat</label>
      <select style={inputStyle} value={form.statId} onChange={set('statId')}>
        <option value="" disabled>Choose a stat</option>
        {stats.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>

      <label style={labelStyle}>XP reward</label>
      <input style={inputStyle} type="number" min="1" value={form.xpValue} onChange={set('xpValue')} />

      {form.type === 'daily' ? (
        <>
          <label style={labelStyle}>Reminder time (optional)</label>
          <input style={inputStyle} type="time" value={form.reminderTime} onChange={set('reminderTime')} />

          <label style={labelStyle}>Deadline (optional)</label>
          <input style={inputStyle} type="time" value={form.deadlineTime} onChange={set('deadlineTime')} />

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, fontSize: 13 }}>
            <input type="checkbox" checked={form.hasAlarm} onChange={set('hasAlarm')} />
            Alarm-style reminder (harder to dismiss)
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, fontSize: 13 }}>
            <input type="checkbox" checked={form.penaltyEnabled} onChange={set('penaltyEnabled')} />
            Enable penalty if missed
          </label>

          {form.penaltyEnabled && (
            <div style={{ paddingLeft: 12, borderLeft: '2px solid var(--panel-border)', marginTop: 10 }}>
              <label style={labelStyle}>XP loss on miss (%)</label>
              <input style={inputStyle} type="number" min="0" max="100" value={form.penaltyXpLossPercent} onChange={set('penaltyXpLossPercent')} />

              <label style={labelStyle}>Penalty quest title</label>
              <input style={inputStyle} value={form.penaltyQuestTitle} onChange={set('penaltyQuestTitle')} placeholder="e.g. 20 pushups" />

              <label style={labelStyle}>Penalty quest XP</label>
              <input style={inputStyle} type="number" min="0" value={form.penaltyQuestXp} onChange={set('penaltyQuestXp')} />
            </div>
          )}
        </>
      ) : (
        <>
          <label style={labelStyle}>Due date (optional)</label>
          <input style={inputStyle} type="date" value={form.dueDate} onChange={set('dueDate')} />
        </>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        <button type="submit" style={{ ...buttonPrimary, opacity: canSubmit ? 1 : 0.5 }} disabled={!canSubmit}>
          {existingTask ? 'Save changes' : 'Create quest'}
        </button>
        <button type="button" style={buttonSecondary} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
