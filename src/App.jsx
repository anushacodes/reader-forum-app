import { Route, Routes, Navigate, useLocation } from 'react-router'
import Layout from './components/Layout.jsx'
import { AuthProvider, useAuth } from './lib/auth.jsx'
import Home from './pages/Home.jsx'
import PostDetail from './pages/PostDetail.jsx'
import PostForm from './pages/PostForm.jsx'
import Auth from './pages/Auth.jsx'
import NotFound from './pages/NotFound.jsx'

/**
 * Route guard that redirects signed-out users to /login?next=...
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-text" />
      </div>
    )
  }

  if (!isAuthenticated) {
    const returnUrl = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?next=${returnUrl}`} replace />
  }

  return children
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="posts/:id" element={<PostDetail />} />
          <Route
            path="create"
            element={
              <ProtectedRoute>
                <PostForm mode="create" />
              </ProtectedRoute>
            }
          />
          <Route
            path="posts/:id/edit"
            element={
              <ProtectedRoute>
                <PostForm mode="edit" />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="login" element={<Auth mode="login" key="login" />} />
        <Route path="signup" element={<Auth mode="signup" key="signup" />} />
      </Routes>
    </AuthProvider>
  )
}
