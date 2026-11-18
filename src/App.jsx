import { Route, Routes } from 'react-router'
import Layout from './components/Layout.jsx'
import SetupNotice from './components/SetupNotice.jsx'
import { isSupabaseConfigured } from './lib/supabase.js'
import Home from './pages/Home.jsx'
import PostDetail from './pages/PostDetail.jsx'
import PostForm from './pages/PostForm.jsx'
import Auth from './pages/Auth.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  if (!isSupabaseConfigured) return <SetupNotice />

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="posts/:id" element={<PostDetail />} />
        <Route path="create" element={<PostForm mode="create" />} />
        <Route path="posts/:id/edit" element={<PostForm mode="edit" />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="login" element={<Auth mode="login" />} />
      <Route path="signup" element={<Auth mode="signup" />} />
    </Routes>
  )
}
