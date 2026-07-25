import { useRef, useState } from 'react';
import { useGame } from '../context/GameContext';
import { exportBackup, importBackup } from '../lib/db';
import { requestNotificationPermission, notificationPermissionStatus } from '../lib/notifications';

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

const buttonPrimary = {
  background: 'linear-gradient(90deg, #3B82F6, #22D3EE)',
  border: 'none',
  borderRadius: 8,
  color: '#0A0E1A',
  fontWeight: 600,
  padding: '10px 16px',
  fontSize: 14,
  width: '100%',
};

const buttonSecondary = {
  background: 'transparent',
  border: '1px solid var(--panel-border)',
  borderRadius: 8,
  color: 'var(--text)',
  padding: '10px 16px',
  fontSize: 14,
  width: '100%',
};

export default function SettingsScreen() {
  const { refreshStats, refreshTasks } = useGame();
  const fileInputRef = useRef(null);
  const [importMode, setImportMode] = useState('replace');
  const [status, setStatus] = useState(null);
  const [notifStatus, setNotifStatus] = useState(notificationPermissionStatus());

  const handleExport = async () => {
    await exportBackup();
    setStatus({ type: 'ok', message: 'Backup downloaded.' });
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChosen = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const confirmMsg =
      importMode === 'replace'
        ? 'This replaces ALL current data with the backup file. Continue?'
        : 'This adds any missing habits/entries from the backup without touching what you already have. Continue?';
    if (!window.confirm(confirmMsg)) return;

    try {
      const result = await importBackup(file, importMode);
      await Promise.all([refreshStats(), refreshTasks()]);
      setStatus({
        type: 'ok',
        message: `Imported ${result.tasksImported} tasks, ${result.statsImported} stats.`,
      });
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    }
  };

  const handleEnableNotifications = async () => {
    const result = await requestNotificationPermission();
    setNotifStatus(result);
  };

  return (
    <div style={{ maxWidth: 420, margin: '0 auto', padding: '20px 16px 90px' }}>
      <div style={{ marginBottom: 18, fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--blue-light)' }}>
        Settings
      </div>

      <div style={panelStyle}>
        <div style={sectionTitle}>Backup</div>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 14, lineHeight: 1.5 }}>
          Your data lives only on this device. Export a backup occasionally so you don't lose progress.
        </p>
        <button style={{ ...buttonPrimary, marginBottom: 10 }} onClick={handleExport}>
          Export backup
        </button>

        <div style={{ display: 'flex', gap: 10, marginBottom: 10, marginTop: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <input
              type="radio"
              name="importMode"
              checked={importMode === 'replace'}
              onChange={() => setImportMode('replace')}
            />
            Replace
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <input
              type="radio"
              name="importMode"
              checked={importMode === 'merge'}
              onChange={() => setImportMode('merge')}
            />
            Merge
          </label>
        </div>
        <button style={buttonSecondary} onClick={handleImportClick}>
          Import backup
        </button>
        <input ref={fileInputRef} type="file" accept="application/json" hidden onChange={handleFileChosen} />

        {status && (
          <div
            style={{
              marginTop: 12,
              fontSize: 13,
              color: status.type === 'error' ? 'var(--red)' : 'var(--cyan)',
            }}
          >
            {status.message}
          </div>
        )}
      </div>

      <div style={panelStyle}>
        <div style={sectionTitle}>Reminders</div>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10, lineHeight: 1.5 }}>
          Notifications only fire while this app is open (foreground or backgrounded). True background push while
          fully closed would need a small push server - not something a static GitHub Pages site alone can do.
        </p>
        <p style={{ fontSize: 13, marginBottom: 14 }}>
          Status: <strong>{notifStatus}</strong>
        </p>
        {notifStatus !== 'granted' && notifStatus !== 'unsupported' && (
          <button style={buttonPrimary} onClick={handleEnableNotifications}>
            Enable notifications
          </button>
        )}
      </div>
    </div>
  );
}
