/**
 * Get day of week name from number
 * @param {number} dayNumber - 0-6 (Sunday=0, Monday=1, ..., Saturday=6)
 * @returns {string} Day name
 */
export const getDayOfWeekName = (dayNumber) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[dayNumber] || ''
}

/**
 * Format weight for display
 * @param {string|number} weight - Weight value
 * @returns {string} Formatted weight
 */
export const formatWeight = (weight) => {
  if (weight === null || weight === undefined || weight === '') {
    return 'N/A'
  }
  const num = typeof weight === 'string' ? parseFloat(weight) : weight
  if (isNaN(num)) return 'N/A'
  return `${num.toFixed(2)}`
}

/**
 * Format rest time in seconds to human-readable format
 * @param {number} seconds - Rest time in seconds
 * @returns {string} Formatted time (e.g., "1m 30s" or "45s")
 */
export const formatRestTime = (seconds) => {
  if (!seconds || seconds === 0) return '0s'
  
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  
  if (minutes > 0 && remainingSeconds > 0) {
    return `${minutes}m ${remainingSeconds}s`
  } else if (minutes > 0) {
    return `${minutes}m`
  } else {
    return `${seconds}s`
  }
}

/**
 * Get WorkoutTemplateExercise ID from exercise pivot data
 * This is needed for update/delete operations
 * @param {object} exercise - Exercise object with pivot data
 * @returns {number|null} Pivot ID
 */
export const getPivotId = (exercise) => {
  // The API returns the pivot ID in exercise.pivot.id
  // This is the WorkoutTemplateExercise record ID (pivot table record ID)
  if (!exercise?.pivot?.id) {
    console.warn('Exercise pivot ID not found:', exercise)
    return null
  }
  return exercise.pivot.id
}

/**
 * Format sets and reps for compact display
 * @param {object} pivot - Exercise pivot data
 * @returns {string} Formatted string (e.g., "3 sets x 6-8 reps")
 */
export const formatSetsReps = (pivot) => {
  if (!pivot) return 'No sets/reps'
  
  const sets = pivot.target_sets || 0
  const reps = pivot.target_reps || ''
  
  if (!sets) return 'No sets/reps'
  if (!reps) return `${sets} sets`
  
  return `${sets} sets x ${reps} reps`
}

