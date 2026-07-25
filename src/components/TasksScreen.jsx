import { useState } from 'react';
import { useGame } from '../context/GameContext';
import TaskForm from './TaskForm';
import ScreenContainer from './ScreenContainer';

const panelStyle = {
  background: 'var(--panel)',
  border: '1px solid var(--panel-border)',
  borderRadius: 14,
  padding: 16,
  marginBottom: 14,
};

const sectionTitle = {
  fontFamily: 'var(--font-heading)',
  fontSize: 13,
  fontWeight: 600,
  letterSpacing: 1.5,
  color: 'var(--muted)',
  textTransform: 'uppercase',
  marginBottom: 10,
};

const iconButton = {
  background: 'transparent',
  border: '1px solid var(--panel-border)',
  borderRadius: 6,
  color: 'var(--muted)',
  width: 28,
  height: 28,
  fontSize: 13,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

function TaskRow({ task, onEdit, onDelete }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 0',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 500 }}>{task.title}</div>
        <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-heading)', marginTop: 2 }}>
          {task.type === 'daily'
            ? `Daily${task.deadlineTime ? ` · deadline ${task.deadlineTime}` : ''}${task.penaltyEnabled ? ' · penalty on' : ''}`
            : `One-time${task.dueDate ? ` · due ${task.dueDate}` : ''}`}
        </div>
      </div>
      <button style={iconButton} onClick={() => onEdit(task)} aria-label="Edit quest">
        <i className="ti ti-edit" aria-hidden="true" />
      </button>
      <button style={iconButton} onClick={() => onDelete(task.id)} aria-label="Delete quest">
        <i className="ti ti-trash" aria-hidden="true" />
      </button>
    </div>
  );
}

export default function TasksScreen() {
  const { tasks, stats, addTask, updateTask, removeTask } = useGame();
  const [editingTask, setEditingTask] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const dailies = tasks.filter((t) => t.type === 'daily' && !t.isPenaltyQuest);
  const oneTimes = tasks.filter((t) => t.type === 'one-time' && !t.isPenaltyQuest);
  const penaltyQuests = tasks.filter((t) => t.isPenaltyQuest && t.status !== 'done');

  const handleSave = async (task) => {
    if (editingTask) {
      await updateTask(task);
    } else {
      await addTask(task);
    }
    setShowForm(false);
    setEditingTask(null);
  };

  const startEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const startCreate = () => {
    setEditingTask(null);
    setShowForm(true);
  };

  return (
    <ScreenContainer>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--blue-light)' }}>Quests</span>
        {!showForm && (
          <button
            onClick={startCreate}
            style={{
              background: 'linear-gradient(90deg, #3B82F6, #22D3EE)',
              border: 'none',
              borderRadius: 8,
              color: '#0A0E1A',
              fontWeight: 600,
              fontSize: 13,
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <i className="ti ti-plus" aria-hidden="true" /> New quest
          </button>
        )}
      </div>

      {showForm && (
        <div style={{ marginBottom: 14 }}>
          <TaskForm
            stats={stats}
            existingTask={editingTask}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false);
              setEditingTask(null);
            }}
          />
        </div>
      )}

      {penaltyQuests.length > 0 && (
        <div style={panelStyle}>
          <div style={{ ...sectionTitle, color: 'var(--red)' }}>Active penalty quests</div>
          {penaltyQuests.map((t) => (
            <TaskRow key={t.id} task={t} onEdit={startEdit} onDelete={removeTask} />
          ))}
        </div>
      )}

      <div style={panelStyle}>
        <div style={sectionTitle}>Daily tasks</div>
        {dailies.length === 0 && <div style={{ color: 'var(--muted)', fontSize: 13 }}>No daily tasks yet.</div>}
        {dailies.map((t) => (
          <TaskRow key={t.id} task={t} onEdit={startEdit} onDelete={removeTask} />
        ))}
      </div>

      <div style={panelStyle}>
        <div style={sectionTitle}>One-time quests</div>
        {oneTimes.length === 0 && <div style={{ color: 'var(--muted)', fontSize: 13 }}>No one-time quests yet.</div>}
        {oneTimes.map((t) => (
          <TaskRow key={t.id} task={t} onEdit={startEdit} onDelete={removeTask} />
        ))}
      </div>
    </ScreenContainer>
  );
}
