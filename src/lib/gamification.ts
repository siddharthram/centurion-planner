// Gamification system for Centurion

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  points: number
  category: 'setup' | 'streak' | 'consistency' | 'special'
}

export const ACHIEVEMENTS: Achievement[] = [
  // Setup achievements
  {
    id: 'first_daily_review',
    title: 'First Steps',
    description: 'Complete your first daily review',
    icon: '🌱',
    points: 50,
    category: 'setup',
  },
  {
    id: 'first_weekly_review',
    title: 'Week in Review',
    description: 'Complete your first weekly review',
    icon: '📅',
    points: 50,
    category: 'setup',
  },
  {
    id: 'foundation_complete',
    title: 'Solid Foundation',
    description: 'Complete your North Star document',
    icon: '⭐',
    points: 100,
    category: 'setup',
  },
  {
    id: 'all_goals_set',
    title: 'Visionary',
    description: 'Set all three goal horizons (1, 3, and 10 year)',
    icon: '🔭',
    points: 150,
    category: 'setup',
  },
  {
    id: 'fully_setup',
    title: 'System Online',
    description: 'Complete the full Centurion setup',
    icon: '🚀',
    points: 200,
    category: 'setup',
  },
  
  // Streak achievements
  {
    id: 'streak_7',
    title: 'One Week Strong',
    description: '7-day daily review streak',
    icon: '🔥',
    points: 100,
    category: 'streak',
  },
  {
    id: 'streak_30',
    title: 'Monthly Master',
    description: '30-day daily review streak',
    icon: '💪',
    points: 300,
    category: 'streak',
  },
  {
    id: 'streak_100',
    title: 'Century Club',
    description: '100-day daily review streak',
    icon: '👑',
    points: 1000,
    category: 'streak',
  },
  
  // Consistency achievements
  {
    id: 'perfect_week',
    title: 'Perfect Week',
    description: '7 daily reviews + 1 weekly review in a single week',
    icon: '✨',
    points: 150,
    category: 'consistency',
  },
  {
    id: 'monthly_consistency',
    title: 'Consistent',
    description: 'Complete reviews on 20+ days in a month',
    icon: '📊',
    points: 200,
    category: 'consistency',
  },
  
  // Special achievements
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Complete a review before 7am',
    icon: '🌅',
    points: 50,
    category: 'special',
  },
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Complete a review after 11pm',
    icon: '🦉',
    points: 50,
    category: 'special',
  },
  {
    id: 'comeback_kid',
    title: 'Comeback Kid',
    description: 'Return and complete a review after 7+ days away',
    icon: '💫',
    points: 75,
    category: 'special',
  },
]

export const POINTS = {
  DAILY_REVIEW: 10,
  WEEKLY_REVIEW: 25,
  GOAL_UPDATE: 15,
  DOCUMENT_UPDATE: 20,
  STREAK_BONUS_PER_DAY: 5,
  STREAK_BONUS_CAP: 50,
}

export function getAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find(a => a.id === id)
}

export function calculateStreakBonus(streakDays: number): number {
  return Math.min(streakDays * POINTS.STREAK_BONUS_PER_DAY, POINTS.STREAK_BONUS_CAP)
}

export function getLevel(totalPoints: number): { level: number; title: string; nextLevelPoints: number; progress: number } {
  const levels = [
    { threshold: 0, title: 'Beginner' },
    { threshold: 100, title: 'Apprentice' },
    { threshold: 300, title: 'Practitioner' },
    { threshold: 600, title: 'Dedicated' },
    { threshold: 1000, title: 'Committed' },
    { threshold: 1500, title: 'Disciplined' },
    { threshold: 2500, title: 'Master' },
    { threshold: 4000, title: 'Sage' },
    { threshold: 6000, title: 'Legend' },
    { threshold: 10000, title: 'Enlightened' },
  ]
  
  let currentLevel = 0
  for (let i = levels.length - 1; i >= 0; i--) {
    if (totalPoints >= levels[i].threshold) {
      currentLevel = i
      break
    }
  }
  
  const nextLevel = currentLevel < levels.length - 1 ? levels[currentLevel + 1] : null
  const currentThreshold = levels[currentLevel].threshold
  const nextThreshold = nextLevel?.threshold || levels[currentLevel].threshold
  
  const progress = nextLevel
    ? ((totalPoints - currentThreshold) / (nextThreshold - currentThreshold)) * 100
    : 100
  
  return {
    level: currentLevel + 1,
    title: levels[currentLevel].title,
    nextLevelPoints: nextThreshold,
    progress: Math.min(progress, 100),
  }
}

export function getStreakMessage(streak: number, isAtRisk: boolean): string {
  if (isAtRisk) {
    return `⚠️ Your ${streak}-day streak is at risk! Complete a review today to keep it alive.`
  }
  
  if (streak === 0) {
    return 'Start your streak today!'
  } else if (streak < 7) {
    return `${streak} day${streak > 1 ? 's' : ''} and counting. Keep it up!`
  } else if (streak < 30) {
    return `🔥 ${streak} days! You're building a solid habit.`
  } else if (streak < 100) {
    return `💪 ${streak} days! You're crushing it.`
  } else {
    return `👑 ${streak} days! You're a legend.`
  }
}

export function isStreakAtRisk(lastReviewDate: string | null): boolean {
  if (!lastReviewDate) return false
  
  const last = new Date(lastReviewDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  last.setHours(0, 0, 0, 0)
  
  const diffDays = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
  return diffDays === 1 // At risk if last review was yesterday (need to review today)
}

