import { useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { checkReminders } from '../lib/notifications';

export function useReminderNotifications() {
  const { tasks, loading } = useGame();

  useEffect(() => {
    if (loading) return;
    checkReminders(tasks);
    const interval = setInterval(() => checkReminders(tasks), 60 * 1000);
    return () => clearInterval(interval);
  }, [tasks, loading]);
}
