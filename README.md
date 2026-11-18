<div align="center">

  <img src="public/logo.png" width="96" height="auto" alt="Dogear Logo" />

  # dogear<span style="color: #e11d48;">.</span>

  **A warm, sleek, minimalist book discussion community for readers who love talking about books.**

  [Features](#-features) • [Walkthrough](#-walkthrough) • [Architecture](#-architecture) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [License](#-license)

</div>

---

## 📖 Overview

**Dogear** is a focused discussion forum where book lovers share thoughts, ask questions, review their latest reads, and discover new recommendations. Built for speed, clarity, and authentic conversation, it combines the threaded discussion mechanics of Reddit with an inviting, editorial visual design.

---

## 🎬 Walkthrough

<div align="center">
  <img src="walkthrough.gif" width="100%" alt="Dogear Video Walkthrough" />
</div>

> *Note: Place your recorded walkthrough GIF at `walkthrough.gif` in the repository root.*

---

## ✨ Features

### 📖 Book Discussions & Creation
- **Structured Posting**: Create discussions with a required title (1–160 characters), optional markdown/plain-text thoughts (up to 10,000 characters), and an optional HTTPS book cover URL.
- **Author Permissions**: Authors retain exclusive control to edit or delete their posts, backed by database-level security policies.
- **Image Fallback**: Graceful error handling for missing or broken external image links.

### 📰 Reddit-Style List Feed
- **Smart Adaptive Layout**:
  - Posts with book covers display a compact rectangular thumbnail on the right side.
  - Text-only discussions expand to full width with a 2-line preview snippet—**zero awkward empty placeholder boxes**.
- **Left Upvote Pillar**: Prominent vote button and count inspired by classic forum and Reddit mechanics.
- **50 Posts per Page Pagination**: Discussions are loaded in 50-item batches (`PAGE_SIZE = 50`) so discussions appear complete and uninterrupted on a single screen.

### 🔍 Debounced Search & Dynamic Sorting
- **Instant Search**: 300ms debounced search matching titles case-insensitively using PostgreSQL `ilike`.
- **Flexible Sorting**: Switch between **Newest first** (`created_at desc`) and **Most upvoted** (`upvotes desc`).
- **Full URL Synchronization**: Active query parameters (`?q=...&category=...&sort=...&page=...`) persist in the URL so browser back/forward and shareable links work out of the box.

### 💬 Threaded Comment Hierarchy
- **Visual Thread Tree**: Replies are visually nested directly beneath the parent comment with connector guide lines and an explicit `↳ in reply to @author` badge.
- **Inline Reply Composer**: Clicking `[ ↳ Reply ]` opens an inline composer directly attached to that comment with clear cancel and post actions.
- **Distinct Top Composer**: The top-level comment composer is clearly labeled **"Start a comment thread"** to distinguish root comments from nested replies.
- **Typography & Live Counts**: Comment body text is set to 14–15px (`text-sm sm:text-[15px] leading-relaxed`) for easy reading, with live comment counts displayed on feed cards and detail pages.

### 👤 Persistent Authentication & Dual Login
- **Email OR Username Sign In**: Users can log in using either their email address or their `@username` handle.
- **Pseudonymous Handles**: Choose a custom handle or auto-generate one on signup (`generateUsername()`).
- **Database Row-Level Security**: Only authenticated authors can update or delete their content; unauthorized client mutations are rejected directly by PostgreSQL.

### 🎨 Illustrated Vector Profile Avatars
- **Handcrafted Vector Line-Art Icons**: A custom set of line-art illustrated icons matching the exact ink doodle aesthetic of the Dogear dog mascot:
  - 🐶 **Dog**: The official Dogear mascot logo
  - 👧 **Girl**: Book lover with twin buns and bangs
  - 👦 **Boy**: Bookworm with tousled hair tufts
  - 🌸 **Flower**: Cheerful doodle flower with smiling center
  - 📚 **Books**: Cozy stack of books with ribbon bookmark and glasses
  - ☕ **Coffee**: Steaming book-reading ceramic mug
  - 🐱 **Cat**: Companion cat with perked ears and whiskers
- **Dedicated Profile Page (`/profile`)**: Manage your profile icon, change your password with validation alerts, and update your public username handle.

### 🏷️ Categories & Tag Filtering
- **Color-Coded Flags**: Posts are flagged as **Review**, **Question**, **Recommendation**, or **Opinion**.
- **Sidebar Navigation**: Left sidebar navigation panel provides one-click browsing across all tags.

### 📐 Anti-AI Editorial Aesthetic
- **Zero Rounded Corners**: Strictly enforces `* { border-radius: 0 !important; }` for a sharp, honest, rectilinear design with clean 1px borders.
- **System Typography**: Clean Apple SF / Inter type stack with high-contrast text and a white background.

---

## 🏛️ Architecture & Technical Highlights

```text
┌────────────────────────────────────────────────────────┐
│                      Client Layer                      │
│        React 19 • Vite • React Router 8 • Tailwind v4   │
└───────────────┬────────────────────────┬───────────────┘
                │                        │
       PostgREST API Calls       Supabase Auth API
                │                        │
┌───────────────▼────────────────────────▼───────────────┐
│                     Supabase Backend                   │
│   PostgreSQL 15 • Row-Level Security (RLS) • Auth Hook │
├────────────────────────────────────────────────────────┤
│ • public.profiles  (id, username, created_at)          │
│ • public.posts     (id, author_id, title, content, ...)│
│ • public.comments  (id, post_id, author_id, body, ...) │
├────────────────────────────────────────────────────────┤
│ RPC: increment_post_upvotes(post_id uuid)              │
│ Trigger: on_auth_user_created -> handle_new_user()     │
└────────────────────────────────────────────────────────┘
```

1. **Row-Level Security (RLS)**:
   - All three tables (`profiles`, `posts`, `comments`) have strict RLS enabled.
   - Public visitors have read-only access.
   - Insert and update privileges are verified via `auth.uid() = author_id`.
2. **Atomic Upvote RPC**:
   - Upvotes are incremented via a `SECURITY DEFINER` PostgreSQL function:
     ```sql
     CREATE OR REPLACE FUNCTION public.increment_post_upvotes(post_id uuid)
     RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER AS $$
     ...
     ```
   - This prevents race conditions and ensures client tokens cannot tamper with vote tallies directly.
3. **Threaded Comment Tree Engine**:
   - The comment parser in `src/pages/PostDetail.jsx` indexes comments and constructs a hierarchical multi-level thread tree, handling reply IDs and `@author` mentions with tree line connectors.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | [React 19](https://react.dev/), [Vite](https://vite.dev/), [React Router 8](https://reactrouter.com/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/) |
| **Backend & DB** | [Supabase](https://supabase.com/) (PostgreSQL, Row-Level Security, Auth, RPC Functions) |
| **Code Quality** | [oxlint](https://oxc.rs/) |

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/anushacodes/codepath-final-project.git
cd codepath-final-project
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the project root:
```bash
cp .env.example .env.local
```

Fill in your Supabase project credentials:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-anon-key
```

### 3. Database Schema Migration
Run the SQL migration in `supabase/migrations/0001_schema.sql` inside your Supabase project's **SQL Editor**. This sets up the `profiles`, `posts`, `comments` tables, triggers, RLS policies, and the atomic upvotes RPC.

### 4. Run the Development Server
```bash
npm run dev
```
Visit `http://localhost:5173` in your browser.

### 5. Build & Lint
```bash
npm run lint    # Run oxlint checks
npm run build   # Production Vite bundle build
```

---

## 📄 License

Licensed under the [Apache License, Version 2.0](LICENSE).
