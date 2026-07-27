// Date.toISOString() is UTC, which shifts the "day boundary" away from
// local midnight depending on timezone (e.g. UTC+5:30 rolls over at
// 5:30am local time, not midnight). This gives the local calendar date
// instead, so daily resets/logs line up with the user's actual day.
export function todayLocal() {
  const d = new Date();
  const offsetMs = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offsetMs).toISOString().slice(0, 10);
}
