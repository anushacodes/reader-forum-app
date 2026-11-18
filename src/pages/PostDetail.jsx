import { useParams } from 'react-router'

// TODO(TASKS.md §3): full post, media, upvotes, comments, owner edit/delete, repost.
export default function PostDetail() {
  const { id } = useParams()
  return (
    <>
      <h1 className="text-3xl font-semibold">Post</h1>
      <p className="text-muted">Post {id} will appear here.</p>
    </>
  )
}
