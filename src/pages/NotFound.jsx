import { Link } from 'react-router'

export default function NotFound() {
  return (
    <>
      <h1 className="mb-4 text-3xl font-semibold">Page not found</h1>
      <Link to="/" className="underline">Back to all posts</Link>
    </>
  )
}
