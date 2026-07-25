import { useEffect } from 'react';
import { useGame } from '../context/GameContext';

function isPastDeadline(deadlineTime) {
  if (!deadlineTime) return false;
  const [h, m] = deadlineTime.split(':').map(Number);
  const now = new Date();
  const deadline = new Date();
  deadline.setHours(h, m, 0, 0);
  return now > deadline;
}

// Runs while the app is open (foreground). It cannot fire while the
// PWA is fully closed - see the notifications hook for the same
// limitation on reminders. Checking on load + every minute is enough
// for a personal habit tracker that's opened at least once a day.
export function useDeadlineChecker() {
  const { tasks, failTask, loading } = useGame();

  useEffect(() => {
    if (loading) return;

    const check = () => {
      for (const task of tasks) {
        if (task.type === 'daily' && task.status === 'pending' && isPastDeadline(task.deadlineTime)) {
          failTask(task.id);
        }
      }
    };

    check();
    const interval = setInterval(check, 60 * 1000);
    return () => clearInterval(interval);
  }, [tasks, failTask, loading]);
}
