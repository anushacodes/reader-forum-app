import { supabase, isSupabaseConfigured } from './supabase.js'

/**
 * Lists all comments for a post, ordered oldest to newest.
 * Joins with profiles to get the commenter's username.
 * @param {string} postId
 * @returns {Promise<Array>}
 */
export async function listComments(postId) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase database is not configured. Please add your credentials to .env.local.')
  }

  const { data, error } = await supabase
    .from('comments')
    .select('id, post_id, author_id, body, created_at, profiles(username)')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (error) throw error

  return (data || []).map((c) => ({
    ...c,
    author: c.profiles?.username || 'Reader',
  }))
}

/**
 * Adds a new comment to a post.
 * The author_id is automatically set by Supabase to auth.uid().
 * @param {string} postId
 * @param {string} body
 * @returns {Promise<Object>}
 */
export async function addComment(postId, body) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase database is not configured. Please add your credentials to .env.local.')
  }

  const cleanBody = (body || '').trim()
  if (!cleanBody) {
    throw new Error('Comment cannot be empty.')
  }

  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      body: cleanBody,
    })
    .select('id, post_id, author_id, body, created_at, profiles(username)')
    .single()

  if (error) throw error

  return {
    ...data,
    author: data.profiles?.username || 'Reader',
  }
}

/**
 * Deletes a comment. Only the comment author can delete it (enforced by RLS).
 * @param {string} commentId
 * @returns {Promise<boolean>}
 */
export async function deleteComment(commentId) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase database is not configured. Please add your credentials to .env.local.')
  }

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)

  if (error) throw error
  return true
}
