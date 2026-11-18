import { CornerDownRight, Trash2 } from 'lucide-react'
import { formatTimeAgo } from '../lib/date.js'

function ReplyComposer({ author, reply }) {
  return (
    <form
      onSubmit={reply.onSubmit}
      className="mt-4 border-l-2 border-line pl-4 space-y-3"
    >
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-text flex items-center gap-1.5">
          <CornerDownRight size={13} className="text-accent-blue" />
          Replying to <span className="text-accent-blue font-bold">@{author}</span>
        </span>
        <button
          type="button"
          onClick={reply.onCancel}
          className="text-xs text-muted hover:text-text underline font-semibold"
        >
          Cancel
        </button>
      </div>
      <textarea
        rows={2}
        required
        value={reply.text}
        onChange={(event) => reply.onChange(event.target.value)}
        placeholder={`Write your reply to @${author}...`}
        aria-label={`Reply to @${author}`}
        className="w-full border border-line-strong bg-surface p-3 text-sm text-text outline-none focus:border-accent-blue"
      />
      {reply.error && <p className="text-xs text-accent-red" role="alert">{reply.error}</p>}
      <div className="flex items-center justify-end gap-2 text-xs">
        <button
          type="button"
          onClick={reply.onCancel}
          className="press px-3 py-2 font-semibold text-muted hover:text-text"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={reply.submitting || !reply.text.trim()}
          className="press bg-text px-4 py-1.5 font-bold text-background hover:opacity-90 disabled:opacity-50"
        >
          {reply.submitting ? 'Posting...' : 'Post Reply'}
        </button>
      </div>
    </form>
  )
}

export default function CommentThread({
  comment,
  userId,
  deletingCommentId,
  onReply,
  onDelete,
  reply,
  parentAuthor,
  depth = 0,
}) {
  const nested = depth > 0
  const isAuthor = userId && comment.author_id === userId

  return (
    <div className="space-y-2">
      <div className={`space-y-3 ${nested ? 'py-3' : 'border-b border-line/70 py-5'}`}>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
          <div className="flex flex-wrap items-center gap-2">
            <strong className="text-sm font-bold text-text">@{comment.author || 'reader'}</strong>
            {nested && (
              <span className="inline-flex items-center gap-1 text-[0.7rem] font-medium text-accent-blue">
                ↳ in reply to @{comment.replyToAuthor || parentAuthor}
              </span>
            )}
            <span className="text-muted/60">•</span>
            <time dateTime={comment.created_at} className="text-xs text-muted">
              {formatTimeAgo(comment.created_at)}
            </time>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onReply(comment)}
              className="press inline-flex items-center gap-1 px-2 py-2 text-xs font-medium text-muted hover:text-accent-blue"
              title={`Reply to @${comment.author}`}
            >
              <CornerDownRight size={nested ? 11 : 12} />
              <span>Reply</span>
            </button>
            {isAuthor && (
              <button
                type="button"
                onClick={() => onDelete(comment.id)}
                disabled={deletingCommentId === comment.id}
                aria-label="Delete comment"
                title="Delete comment"
                className="press text-muted hover:text-accent-red p-1"
              >
                <Trash2 size={nested ? 12 : 13} />
              </button>
            )}
          </div>
        </div>
        <p className="text-sm sm:text-[15px] font-normal leading-relaxed text-text whitespace-pre-line">
          {comment.cleanText || comment.body}
        </p>
        {reply.target?.id === comment.id && (
          <ReplyComposer author={comment.author} reply={reply} />
        )}
      </div>
      {comment.replies.length > 0 && (
        <div className={depth === 0
          ? 'ml-4 sm:ml-8 pl-3.5 sm:pl-4 border-l border-line space-y-2 pt-1'
          : 'space-y-2 pt-1'}>
          {comment.replies.map((child) => (
            <CommentThread
              key={child.id}
              comment={child}
              userId={userId}
              deletingCommentId={deletingCommentId}
              onReply={onReply}
              onDelete={onDelete}
              reply={reply}
              parentAuthor={comment.author}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
