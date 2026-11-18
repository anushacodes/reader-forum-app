export const CATEGORIES = ['Review', 'Question', 'Recommendation', 'Opinion']
export const ALL_CATEGORIES = ['All', ...CATEGORIES]

// Color badges for categories: reds, blues, browns, and indigos (sharp rectangular badges)
export function getCategoryBadgeClasses(category) {
  switch (category) {
    case 'Review':
      return 'border border-amber-300 bg-amber-50 text-amber-900'
    case 'Recommendation':
      return 'border border-blue-300 bg-blue-50 text-blue-900'
    case 'Question':
      return 'border border-indigo-300 bg-indigo-50 text-indigo-900'
    case 'Opinion':
      return 'border border-rose-300 bg-rose-50 text-rose-900'
    default:
      return 'border border-gray-300 bg-gray-50 text-gray-800'
  }
}
