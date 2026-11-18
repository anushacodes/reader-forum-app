// TODO(TASKS.md §3): shared create/edit form (title, body, category, image, video, book, repost).
export default function PostForm({ mode }) {
  return (
    <>
      <h1 className="text-3xl font-semibold">{mode === 'edit' ? 'Edit post' : 'New post'}</h1>
      <p className="text-muted">The post form will appear here.</p>
    </>
  )
}
