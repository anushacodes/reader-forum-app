import { supabase, isSupabaseConfigured } from './supabase.js'
import { CATEGORIES } from './categories.js'

const LOCAL_STORAGE_KEY = 'dogear.demo_posts'

const photo = (id) => `https://images.unsplash.com/${id}?w=1000&auto=format&fit=crop&q=85`

const INITIAL_DEMO_POSTS = [
  {
    id: 'd1e2f3a4-0001-4000-8000-000000000001',
    title: 'What book made you forget to check your phone?',
    category: 'Question',
    author: 'QuietCloud4821',
    author_id: 'demo-user-1',
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    upvotes: 42,
    image_url: photo('photo-1481627834876-b7833e8f5570'),
    content:
      'Looking for the kind of story where you look up and somehow it’s midnight.\n\nWhat was the last book that did that for you? Any genre, any length. Tell me what made it hard to put down.',
  },
  {
    id: 'd1e2f3a4-0002-4000-8000-000000000002',
    title: 'A little magic for an ordinary Tuesday',
    category: 'Review',
    author: 'copper_window',
    author_id: 'demo-user-2',
    created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    upvotes: 31,
    image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1000&auto=format&fit=crop&q=85',
    content:
      'The Particular Sadness of Lemon Cake: strange, tender, and surprisingly moving.\n\nI’d love to hear what other people made of the way this story connects food and memory.',
  },
  {
    id: 'd1e2f3a4-0003-4000-8000-000000000003',
    title: 'Books that feel like a deep breath',
    category: 'Recommendation',
    author: 'mossy_steps',
    author_id: 'demo-user-3',
    created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    upvotes: 67,
    image_url: photo('photo-1519682337058-a94d519337bc'),
    content:
      'A small stack of gentle reads for when life gets a little too loud.\n\nWhat do you reach for when you want something quiet rather than another cliffhanger?',
  },
  {
    id: 'd1e2f3a4-0004-4000-8000-000000000004',
    title: 'Some stories get better every time',
    category: 'Opinion',
    author: 'OpenSky719',
    author_id: 'demo-user-4',
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    upvotes: 26,
    image_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1000&auto=format&fit=crop&q=85',
    content:
      'Reading Austen at a different age feels like finding notes from another version of yourself.\n\nWhat has changed for you on a reread?',
  },
  {
    id: 'd1e2f3a4-0005-4000-8000-000000000005',
    title: 'Do you read the ending slowly, too?',
    category: 'Question',
    author: 'amber_cove',
    author_id: 'demo-user-5',
    created_at: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    upvotes: 18,
    image_url: photo('photo-1512820790803-83ca734da794'),
    content:
      'Not ready to say goodbye to these characters just yet.\n\nI’ve been stretching out the last fifty pages for days. Does anyone else do this?',
  },
  {
    id: 'd1e2f3a4-0006-4000-8000-000000000006',
    title: 'An adventure worth coming back to',
    category: 'Recommendation',
    author: 'small_planet',
    author_id: 'demo-user-6',
    created_at: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
    upvotes: 54,
    image_url: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1000&auto=format&fit=crop&q=85',
    content:
      'A comfort reread, a cup of tea, and absolutely no plans.\n\nThe Hobbit has been my rainy-day book for years. What’s yours?',
  },
]

function getLocalPosts() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_POSTS))
      return INITIAL_DEMO_POSTS
    }
    return JSON.parse(raw)
  } catch {
    return INITIAL_DEMO_POSTS
  }
}

function saveLocalPosts(posts) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(posts))
  } catch {
    // ignore local storage quota errors
  }
}

/**
 * Escapes special pattern matching characters for PostgreSQL ilike queries.
 */
export function escapeSearchPattern(str) {
  return (str || '').replace(/[%_\\]/g, '\\$&')
}

/**
 * Lists posts with filtering, searching, sorting, and pagination.
 */
export async function listPosts({
  search = '',
  category = 'All',
  sort = 'newest',
  page = 1,
  pageSize = 12,
} = {}) {
  if (isSupabaseConfigured && supabase) {
    let query = supabase
      .from('posts')
      .select('id, title, content, category, image_url, upvotes, created_at, author_id, profiles(username), comments(count)', {
        count: 'exact',
      })

    const cleanSearch = search.trim()
    if (cleanSearch) {
      query = query.ilike('title', `%${escapeSearchPattern(cleanSearch)}%`)
    }

    if (category && category !== 'All') {
      query = query.eq('category', category)
    }

    if (sort === 'upvotes') {
      query = query
        .order('upvotes', { ascending: false })
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: false }).order('id', { ascending: false })
    }

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    query = query.range(from, to)

    const { data, count, error } = await query
    if (error) throw error

    const mappedPosts = (data || []).map((p) => ({
      ...p,
      author: p.profiles?.username || 'Reader',
      commentsCount: p.comments?.[0]?.count ?? 0,
    }))

    return { posts: mappedPosts, totalCount: count ?? 0 }
  } else {
    // Offline / Demo fallback
    let all = [...getLocalPosts()]

    const cleanSearch = search.trim().toLowerCase()
    if (cleanSearch) {
      all = all.filter((p) => p.title.toLowerCase().includes(cleanSearch))
    }

    if (category && category !== 'All') {
      all = all.filter((p) => p.category === category)
    }

    if (sort === 'upvotes') {
      all.sort((a, b) => b.upvotes - a.upvotes || new Date(b.created_at) - new Date(a.created_at))
    } else {
      all.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }

    const totalCount = all.length
    const from = (page - 1) * pageSize
    const paginated = all.slice(from, from + pageSize)

    return { posts: paginated, totalCount }
  }
}

/**
 * Gets a single post by UUID.
 */
export async function getPostById(id) {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('posts')
      .select('id, title, content, category, image_url, upvotes, created_at, author_id, profiles(username)')
      .eq('id', id)
      .maybeSingle()

    if (error) throw error
    if (!data) return null

    return {
      ...data,
      author: data.profiles?.username || 'Reader',
    }
  } else {
    const posts = getLocalPosts()
    const found = posts.find((p) => p.id === id)
    return found || null
  }
}

function getPostPayload({ title, content, category, image_url }) {
  const cleanTitle = (title || '').trim()
  const cleanContent = (content || '').trim() || null
  const cleanCategory = CATEGORIES.includes(category) ? category : 'Opinion'
  const cleanImageUrl = (image_url || '').trim() || null

  return { title: cleanTitle, content: cleanContent, category: cleanCategory, image_url: cleanImageUrl }
}

/**
 * Creates a new post.
 */
export async function createPost({ title, content, category, image_url }, currentAuthor = {}) {
  const payload = getPostPayload({ title, content, category, image_url })

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('posts')
      .insert(payload)
      .select('id, title, content, category, image_url, upvotes, created_at, author_id')
      .single()

    if (error) throw error
    return data
  } else {
    const newPost = {
      id: 'demo-post-' + Date.now(),
      ...payload,
      upvotes: 0,
      created_at: new Date().toISOString(),
      author: currentAuthor.username || 'Reader',
      author_id: currentAuthor.id || 'demo-author',
    }
    const current = getLocalPosts()
    saveLocalPosts([newPost, ...current])
    return newPost
  }
}

/**
 * Updates an existing post.
 */
export async function updatePost(id, { title, content, category, image_url }) {
  const payload = getPostPayload({ title, content, category, image_url })

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('posts')
      .update(payload)
      .eq('id', id)
      .select('id, title, content, category, image_url, upvotes, created_at, author_id')
      .single()

    if (error) throw error
    return data
  } else {
    const current = getLocalPosts()
    const index = current.findIndex((p) => p.id === id)
    if (index === -1) throw new Error('Post not found.')

    current[index] = {
      ...current[index],
      ...payload,
    }
    saveLocalPosts(current)
    return current[index]
  }
}

/**
 * Deletes a post.
 */
export async function deletePost(id) {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('posts').delete().eq('id', id)
    if (error) throw error
    return true
  } else {
    const current = getLocalPosts()
    const filtered = current.filter((p) => p.id !== id)
    saveLocalPosts(filtered)
    return true
  }
}

/**
 * Atomically increments the post upvote count via RPC.
 */
export async function upvotePost(id) {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.rpc('increment_post_upvotes', { post_id: id })
    if (error) throw error
    return Number(data)
  } else {
    const current = getLocalPosts()
    const post = current.find((p) => p.id === id)
    if (post) {
      post.upvotes = (post.upvotes || 0) + 1
      saveLocalPosts(current)
      return post.upvotes
    }
    return 0
  }
}
