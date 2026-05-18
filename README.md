# LancerFlow AI — Full-Stack AI Finance Platform

A comprehensive, production-ready full-stack financial management platform built with **Next.js 15** and **Supabase**. The application empowers users to track income and expenses across multiple accounts with AI-driven automation, real-time analytics, and automated background workflows.

## 🚀 Live Demo & Repository

- **Live Demo:** [Deploy Link](https://lancer-flow.vercel.app)
- **Source Code:** [GitHub Repository](https://github.com/MarinaKramarchuk/lancer-flow)

---

## ✨ Key Features

- **🔐 Secure Auth & Data Isolation:** Fully integrated with Supabase Authentication and protected by **Row Level Security (RLS)** to guarantee absolute user data privacy.
- **🧠 AI Receipt Scanner:** Powered by **Gemini AI**, users can upload images of receipts to automatically parse descriptions, amounts, and categories directly into the transaction form.
- **⏱️ Automated Recurring Transactions:** Background **Cron Jobs** (via Inngest) automatically trigger and log periodic transactions like subscriptions, utility bills, or salary.
- **📈 Interactive Financial Dashboards:** Beautiful, responsive data visualizations using interactive charts to track historical trends and category-wise spending.
- **📧 Smart Budgeting Alerts:** Real-time email notifications (via Resend) that alert users when they hit specific thresholds (e.g., 90% of their monthly budget).
- **📋 Robust Form Validation:** Bulletproof client and server-side validation using **React Hook Form** and **Zod**.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Shadcn UI
- **Backend & Database:** Supabase (PostgreSQL, Auth, RLS), Prisma ORM
- **AI & Automation:** Gemini AI API, Inngest (Background Cron Jobs)
- **Communications:** Resend API (Transactional Emails)
- **Forms & Validation:** React Hook Form, Zod

---

## ⚙️ Getting Started

### 1. Clone the repository

````bash
git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
cd your-repo-name

### 2. Install dependencies
```bash
npm install --legacy-peer-deps

### 3. Environment Variables
Create a `.env.local` file in the root directory and add the following keys:

```env
# Next.js Config
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase & Prisma
DATABASE_URL="your-supabase-postgresql-connection-string"
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"

# Gemini AI
GEMINI_API_KEY="your-gemini-api-key"

# Inngest & Resend
INNGEST_EVENT_KEY="your-inngest-event-key"
RESEND_API_KEY="your-resend-api-key"

### 4. Run database migrations
```bash
npx prisma db push

### 5. Start the development server
```bash
npm run dev

Open http://localhost:3000 with your browser to see the result.

<p align="center">Made with ♥ by Marina</p>
````
