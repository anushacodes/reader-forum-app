<div align="center">

  <img src="public/logo.png" width="96" height="auto" alt="Dogear Logo" />

  # dogear<span style="color: #e11d48;">.</span>

  **A warm, sleek, minimalist book discussion community for readers who love talking about books.**

  [Features](#-features) • [Walkthrough](#-walkthrough) • [Architecture](#-architecture) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started)

</div>

---

## 📖 Overview

**Dogear** is a focused discussion forum where book lovers share thoughts, ask questions, review their latest reads, and discover new recommendations. Built for speed, clarity, and authentic conversation, it combines the threaded discussion mechanics of Reddit with an inviting, editorial visual design.

---

## 🎬 Walkthrough

A walkthrough recording is pending. Add `walkthrough.gif` here when it is ready.

---

## ✨ Features

### 📖 Book Discussions & Creation
- **Structured Posting**: Create discussions with a required title (1–160 characters), optional plain-text thoughts (up to 10,000 characters), and an optional HTTP or HTTPS book cover URL.
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
- **Typography & Live Counts**: Comment body text is set to 14–15px (`text-sm sm:text-[15px] leading-relaxed`) for easy reading, with comment counts fetched on feed load and updated after comments are added or deleted on the detail page.

### 👤 Persistent Authentication & Dual Login
- **Email or Username Sign In**: Email works across devices. Username sign-in uses a username-to-email mapping saved in the current browser, plus the existing demo account mappings; other accounts must use email on a new browser.
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
- **Dedicated Profile Page (`/profile`)**: Manage your profile icon and change your password. The page also includes a username form; see the database permission limitation below.

### 🏷️ Categories & Tag Filtering
- **Color-Coded Flags**: Posts are flagged as **Review**, **Question**, **Recommendation**, or **Opinion**.
- **Sidebar Navigation**: Left sidebar navigation panel provides one-click browsing across all tags.

### 📐 Editorial Design
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
│   PostgreSQL    • Row-Level Security (RLS) • Auth Hook │
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
   - The parser in `src/lib/commentThreads.js` builds threads from reply IDs and legacy `@author` mentions. `src/components/CommentThread.jsx` renders every reply level using one shared comment layout and reply composer.

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
For a new Supabase project, run `supabase/migrations/0001_schema.sql` in its **SQL Editor** once. Keep the file as the database setup blueprint; restarting the app does not rerun it. This sets up the `profiles`, `posts`, `comments` tables, triggers, RLS policies, and the atomic upvotes RPC.

### 4. Run the Development Server
```bash
npm run dev
```
Visit `http://localhost:5173` in your browser.

### 5. Check the App
```bash
npm run lint    # Run oxlint checks
npm run build   # Production Vite bundle build
```

---

## Data Persistence and Known Limitations

- With `.env.local` configured, accounts, posts, comments, and upvotes are stored in Supabase. Closing the browser, editor, or dev server does not delete them. Unsubmitted form text is held in memory and can be lost on reload.
- Avatar choices and username-to-email mappings are stored in this browser's local storage, so they do not automatically follow you to another browser or device.
- Without Supabase credentials, legacy demo posts and sign-in use browser storage. Comments still require Supabase; demo mode is not a complete offline app.
- The checked-in migration grants read access to profiles, but no profile update policy or grant. Username changes need those database permissions; the current form can show a local change that does not persist in the shared profile table.
- Replies store their parent reference in the comment body. That reference counts toward the database's 2,000-character limit.
- Comments are fetched together, with no pagination or realtime subscription. Upvotes allow repeated clicks rather than tracking one vote per user.
- The walkthrough recording and production deployment are pending.
