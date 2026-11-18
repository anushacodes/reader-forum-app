export const CATEGORIES = ['Review', 'Question', 'Recommendation', 'Opinion']
export const ALL_CATEGORIES = ['All', ...CATEGORIES]

// Muted category colors shared by labels and the post form.
export function getCategoryBadgeClasses(category) {
  switch (category) {
    case 'Review':
      return 'rounded-[2px] bg-amber-100/60 text-amber-900'
    case 'Recommendation':
      return 'rounded-[2px] bg-blue-100/60 text-blue-900'
    case 'Question':
      return 'rounded-[2px] bg-indigo-100/60 text-indigo-900'
    case 'Opinion':
      return 'rounded-[2px] bg-rose-100/60 text-rose-900'
    default:
      return 'rounded-[2px] bg-gray-100/60 text-gray-800'
  }
}
