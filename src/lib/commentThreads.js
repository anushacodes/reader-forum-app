/** Build threads from oldest-first comments, including legacy @mention replies. */
export function buildCommentTree(rawComments) {
  const commentMap = new Map()
  const latestByAuthor = new Map()
  const roots = []

  for (const comment of rawComments) {
    let cleanText = comment.body || ''
    const tagMatch = cleanText.match(/^\[reply:([a-zA-Z0-9_-]+)\]\s*(.*)$/s)
    const replyToId = tagMatch?.[1] || null
    if (tagMatch) cleanText = tagMatch[2]

    const mentionMatch = cleanText.match(/^@([A-Za-z0-9_]+)\s*(.*)$/s)
    const replyToAuthor = mentionMatch?.[1] || null
    if (mentionMatch) cleanText = mentionMatch[2]

    const item = {
      ...comment,
      cleanText: cleanText.trim(),
      replyToId,
      replyToAuthor,
      replies: [],
    }

    // Only earlier comments can be parents, so malformed references cannot form cycles.
    // An explicit missing parent stays a root instead of attaching to a different thread.
    const parent = replyToId
      ? commentMap.get(replyToId)
      : latestByAuthor.get(replyToAuthor?.toLowerCase())

    if (parent) {
      parent.replies.push(item)
    } else {
      roots.push(item)
    }

    commentMap.set(item.id, item)
    if (item.author) latestByAuthor.set(item.author.toLowerCase(), item)
  }

  return roots
}
