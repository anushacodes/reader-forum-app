# 🐶 Dogear

> A warm, minimalist book discussion community for readers who can't stop talking about books.

Dogear is a focused discussion forum where book lovers share thoughts, ask questions, review their latest reads, and discover new recommendations. Built for simplicity and speed, it combines Reddit-style community discussion with an inviting editorial visual aesthetic.

---

## ✨ Features

- **📖 Book Discussions**: Create and share posts with rich titles, thoughts, and external cover/image URLs.
- **🏷️ Categories & Flags**: Organize and filter conversations by **Review**, **Question**, **Recommendation**, or **Opinion**.
- **🔍 Search & Sort**: Instantly search posts by title and sort discussions by **Newest** or **Most Upvoted**.
- **💬 Comments & Upvotes**: Join the conversation with nested comments and support posts with atomic upvoting.
- **👤 Pseudonymous Accounts**: Simple email/password authentication with custom or generated usernames; authors retain exclusive edit and delete control over their posts.
- **🌓 Light & Dark Theme**: Built-in theme switcher with zero-flash persistence matching your system preferences.

---

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/), [Vite](https://vite.dev/), [React Router](https://reactrouter.com/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/)
- **Backend & Database**: [Supabase](https://supabase.com/) (Auth, PostgreSQL, Row-Level Security)

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/anushacodes/codepath-final-project.git
cd codepath-final-project
npm install
```

### 2. Environment Setup
Create a `.env.local` file from the example:
```bash
cp .env.example .env.local
```

Fill in your Supabase credentials in `.env.local`:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-anon-key
```

### 3. Database Setup
Run the SQL migration in [supabase/migrations/0001_schema.sql](supabase/migrations/0001_schema.sql) in your Supabase project's **SQL Editor**.

### 4. Run the App
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.
