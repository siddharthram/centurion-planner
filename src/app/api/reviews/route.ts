import { getAuthenticatedUser, successResponse, errorResponse, unauthorizedResponse } from '@/lib/supabase/api'
import { POINTS } from '@/lib/gamification'

export async function POST(request: Request) {
  try {
    const { supabase, user, error: authError } = await getAuthenticatedUser(request)

    if (authError || !supabase || !user) {
      return unauthorizedResponse(authError || 'Unauthorized')
    }

    const body = await request.json()
    const { type, date, template_id, template_version, content, metadata } = body

    // Validate required fields
    if (!type || !date || !template_id || !template_version || !content) {
      return errorResponse('Missing required fields: type, date, template_id, template_version, content', 400)
    }

    // Validate review type
    const validTypes = ['daily', 'weekly', 'quarterly', 'annual']
    if (!validTypes.includes(type)) {
      return errorResponse(`Invalid review type. Must be one of: ${validTypes.join(', ')}`, 400)
    }

    // Insert review into database
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        user_id: user.id,
        type,
        date,
        template_id,
        template_version,
        content,
        metadata: metadata || {},
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return errorResponse(error.message, 500)
    }

    // Update gamification stats
    await updateUserStats(supabase, user.id, type, date)

    return successResponse(data, 201)
  } catch (error) {
    console.error('API error:', error)
    return errorResponse('Internal server error', 500)
  }
}

// Helper function to update user stats after a review
async function updateUserStats(
  supabase: Awaited<ReturnType<typeof getAuthenticatedUser>>['supabase'],
  userId: string,
  reviewType: string,
  reviewDate: string
) {
  if (!supabase) return

  try {
    // Get or create user stats
    const { data: existingStats } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single()

    const today = new Date().toISOString().split('T')[0]
    const isToday = reviewDate === today
    
    // Calculate points
    let pointsEarned = reviewType === 'daily' ? POINTS.DAILY_REVIEW : POINTS.WEEKLY_REVIEW
    
    if (existingStats) {
      // Calculate streak
      let newDailyStreak = existingStats.current_daily_streak || 0
      let newWeeklyStreak = existingStats.current_weekly_streak || 0
      
      if (reviewType === 'daily' && isToday) {
        const lastDailyDate = existingStats.last_daily_review_date
        
        if (lastDailyDate) {
          const last = new Date(lastDailyDate)
          const current = new Date(today)
          const diffDays = Math.floor((current.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
          
          if (diffDays === 0) {
            // Already reviewed today, don't increment streak
          } else if (diffDays === 1) {
            // Consecutive day, increment streak
            newDailyStreak += 1
            // Add streak bonus
            pointsEarned += Math.min(newDailyStreak * POINTS.STREAK_BONUS_PER_DAY, POINTS.STREAK_BONUS_CAP)
          } else {
            // Streak broken, reset to 1
            newDailyStreak = 1
          }
        } else {
          // First review
          newDailyStreak = 1
        }
      }
      
      // Update stats
      await supabase
        .from('user_stats')
        .update({
          current_daily_streak: newDailyStreak,
          longest_daily_streak: Math.max(existingStats.longest_daily_streak || 0, newDailyStreak),
          last_daily_review_date: reviewType === 'daily' && isToday ? today : existingStats.last_daily_review_date,
          current_weekly_streak: reviewType === 'weekly' ? newWeeklyStreak + 1 : existingStats.current_weekly_streak,
          longest_weekly_streak: reviewType === 'weekly' 
            ? Math.max(existingStats.longest_weekly_streak || 0, newWeeklyStreak + 1)
            : existingStats.longest_weekly_streak,
          last_weekly_review_date: reviewType === 'weekly' ? today : existingStats.last_weekly_review_date,
          total_points: (existingStats.total_points || 0) + pointsEarned,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
    } else {
      // Create new stats row
      await supabase
        .from('user_stats')
        .insert({
          user_id: userId,
          current_daily_streak: reviewType === 'daily' ? 1 : 0,
          longest_daily_streak: reviewType === 'daily' ? 1 : 0,
          current_weekly_streak: reviewType === 'weekly' ? 1 : 0,
          longest_weekly_streak: reviewType === 'weekly' ? 1 : 0,
          last_daily_review_date: reviewType === 'daily' ? today : null,
          last_weekly_review_date: reviewType === 'weekly' ? today : null,
          total_points: pointsEarned,
        })
    }

    // Log activity
    await supabase
      .from('activity_log')
      .insert({
        user_id: userId,
        activity_type: `${reviewType}_review`,
        activity_date: reviewDate,
        points_earned: pointsEarned,
      })

    // Check and award achievements
    await checkAndAwardAchievements(supabase, userId, reviewType, existingStats)
  } catch (err) {
    // Don't fail the review creation if stats update fails
    console.error('Error updating user stats:', err)
  }
}

// Check and award achievements
async function checkAndAwardAchievements(
  supabase: Awaited<ReturnType<typeof getAuthenticatedUser>>['supabase'],
  userId: string,
  reviewType: string,
  existingStats: { current_daily_streak?: number; current_weekly_streak?: number } | null
) {
  if (!supabase) return

  const achievementsToCheck: { id: string; condition: boolean }[] = []

  // First review achievements
  if (reviewType === 'daily') {
    achievementsToCheck.push({ id: 'first_daily_review', condition: true })
  }
  if (reviewType === 'weekly') {
    achievementsToCheck.push({ id: 'first_weekly_review', condition: true })
  }

  // Streak achievements
  const newStreak = (existingStats?.current_daily_streak || 0) + 1
  if (newStreak >= 7) {
    achievementsToCheck.push({ id: 'streak_7', condition: true })
  }
  if (newStreak >= 30) {
    achievementsToCheck.push({ id: 'streak_30', condition: true })
  }
  if (newStreak >= 100) {
    achievementsToCheck.push({ id: 'streak_100', condition: true })
  }

  // Time-based achievements
  const hour = new Date().getHours()
  if (hour < 7) {
    achievementsToCheck.push({ id: 'early_bird', condition: true })
  }
  if (hour >= 23) {
    achievementsToCheck.push({ id: 'night_owl', condition: true })
  }

  // Award achievements that haven't been earned yet
  for (const { id, condition } of achievementsToCheck) {
    if (!condition) continue

    try {
      // This will fail silently if achievement already exists (unique constraint)
      await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_id: id,
        })
    } catch {
      // Achievement already earned or error - ignore
    }
  }
}

export async function GET(request: Request) {
  try {
    const { supabase, user, error: authError } = await getAuthenticatedUser(request)

    if (authError || !supabase || !user) {
      return unauthorizedResponse(authError || 'Unauthorized')
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('reviews')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (type) {
      const validTypes = ['daily', 'weekly', 'quarterly', 'annual']
      if (!validTypes.includes(type)) {
        return errorResponse(`Invalid review type. Must be one of: ${validTypes.join(', ')}`, 400)
      }
      query = query.eq('type', type)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      return errorResponse(error.message, 500)
    }

    return Response.json({ 
      data, 
      meta: { 
        total: count,
        limit,
        offset,
      }
    }, { status: 200 })
  } catch (error) {
    console.error('API error:', error)
    return errorResponse('Internal server error', 500)
  }
}
