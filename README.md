# 📝 AI-Powered Note-Taking App

A modern note-taking app built with **Next.js**, **Supabase**, **shadcn/ui**, and **Google OAuth**. Users can sign in, create and manage notes, and generate AI-powered explanations for their content.

---

### For Testing purpose you can use 
```
Gmail :-  rohibanga1@gmail.com
pass :- password
```

## 🚀 Features

- 🔐 Auth with Supabase (email/password & Google OAuth)
- 📄 Create, edit, and delete notes
- 🧠 Generate AI explanations for notes (via HuggingFace or custom API)
- 🎨 Beautiful UI with `shadcn/ui` and Tailwind CSS
- 🔒 Private notes per user
- ☁️ Fully deployed on Vercel

---

## 🛠️ Tech Stack

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [shadcn/ui](https://ui.shadcn.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Hugging Face API](https://huggingface.co/)
- [Vercel](https://vercel.com/)

---

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Ajeet-Rana/Notefie.git
cd notefie
```
### 1. Install Dependencies

```base
npm install
# or
yarn
```

### 3. Create a .env.local File

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (if needed)

NEXT_PUBLIC_HUGGINGFACE_API=https://api-inference.huggingface.co/models/<model-name>
HUGGINGFACE_API_KEY=your-huggingface-token

```
### 4. Run Locally

```
npm run dev
# or
yarn dev
```


