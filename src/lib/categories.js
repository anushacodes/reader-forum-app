// Color badges for categories: reds, blues, browns, and indigos (sharp rectangular badges)
export function getCategoryBadgeClasses(category) {
  switch (category) {
    case 'Review':
      return 'border border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-200'
    case 'Recommendation':
      return 'border border-blue-300 bg-blue-50 text-blue-900 dark:border-blue-700 dark:bg-blue-950/50 dark:text-blue-200'
    case 'Question':
      return 'border border-indigo-300 bg-indigo-50 text-indigo-900 dark:border-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-200'
    case 'Opinion':
      return 'border border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-700 dark:bg-rose-950/50 dark:text-rose-200'
    default:
      return 'border border-gray-300 bg-gray-50 text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200'
  }
}
