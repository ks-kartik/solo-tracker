// ---- Tunable constants ----
// XP needed for a given level uses a scaling RPG curve:
//   xpToNextLevel(level) = BASE_XP * (level ^ GROWTH)
export const BASE_XP = 100;
export const GROWTH = 1.5;

export function xpToNextLevel(level) {
  return Math.round(BASE_XP * Math.pow(level, GROWTH));
}

// Given total accumulated xp for a stat, derive its current level and
// progress toward the next one. Runs the scaling curve level by level
// rather than a closed-form solve, since GROWTH may change later.
export function levelFromXp(totalXp) {
  let level = 1;
  let remaining = totalXp;
  let need = xpToNextLevel(level);

  while (remaining >= need) {
    remaining -= need;
    level += 1;
    need = xpToNextLevel(level);
  }

  return { level, xpIntoLevel: remaining, xpForNextLevel: need };
}

// Rank thresholds: BOTH the overall level and the lowest individual
// stat level must meet the requirement to hold that rank.
export const RANKS = [
  { rank: 'E', minOverallLevel: 1, minStatLevel: 1 },
  { rank: 'D', minOverallLevel: 5, minStatLevel: 3 },
  { rank: 'C', minOverallLevel: 10, minStatLevel: 6 },
  { rank: 'B', minOverallLevel: 18, minStatLevel: 10 },
  { rank: 'A', minOverallLevel: 28, minStatLevel: 15 },
  { rank: 'S', minOverallLevel: 40, minStatLevel: 22 },
];

export function calculateRank(overallLevel, lowestStatLevel) {
  let current = RANKS[0].rank;
  for (const tier of RANKS) {
    if (overallLevel >= tier.minOverallLevel && lowestStatLevel >= tier.minStatLevel) {
      current = tier.rank;
    }
  }
  return current;
}

// Overall level/XP is just the sum of every stat's XP fed through the
// same curve - grinding any stat contributes to your overall level.
export function calculateOverallLevel(stats) {
  const totalXp = stats.reduce((sum, s) => sum + s.xp, 0);
  return levelFromXp(totalXp);
}

export function lowestStatLevel(stats) {
  if (stats.length === 0) return 1;
  return Math.min(...stats.map((s) => levelFromXp(s.xp).level));
}

// Default starting stats - rename/trim these later, the app doesn't
// hard-code assumptions about which stats exist.
export const DEFAULT_STATS = [
  { id: 'strength', name: 'Strength', icon: 'ti-barbell', color: '#3B82F6', xp: 0 },
  { id: 'intellect', name: 'Intellect', icon: 'ti-brain', color: '#A855F7', xp: 0 },
  { id: 'vitality', name: 'Vitality', icon: 'ti-heart', color: '#22D3EE', xp: 0 },
  { id: 'agility', name: 'Agility', icon: 'ti-bolt', color: '#60A5FA', xp: 0 },
];
