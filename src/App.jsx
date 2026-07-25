import { useState } from 'react';
import { GameProvider } from './context/GameContext';
import Dashboard from './components/Dashboard';
import TasksScreen from './components/TasksScreen';
import SettingsScreen from './components/SettingsScreen';
import BottomNav from './components/BottomNav';
import LevelUpModal from './components/LevelUpModal';
import { useDeadlineChecker } from './hooks/useDeadlineChecker';
import { useReminderNotifications } from './hooks/useReminderNotifications';

function AppShell() {
  const [tab, setTab] = useState('dashboard');

  // Runs continuously while the app is open: auto-fails overdue dailies
  // and fires reminder notifications at their scheduled time.
  useDeadlineChecker();
  useReminderNotifications();

  return (
    <>
      {tab === 'dashboard' && <Dashboard />}
      {tab === 'tasks' && <TasksScreen />}
      {tab === 'settings' && <SettingsScreen />}
      <BottomNav active={tab} onChange={setTab} />
      <LevelUpModal />
    </>
  );
}

export default function App() {
  return (
    <GameProvider>
      <AppShell />
    </GameProvider>
  );
}
