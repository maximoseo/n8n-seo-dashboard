# N8N SEO Dashboard

A comprehensive SEO monitoring dashboard built with Next.js 14, Supabase, and N8N automation.

## ✨ Features

### ✅ **Implemented (MVP Complete)**

- **Project Management**
  - Create, edit, delete projects
  - List view with search and filtering
  - Project details with statistics
  - Soft delete support

- **SEO Audit System**
  - Trigger audits manually
  - N8N webhook integration
  - Audit history tracking
  - Status monitoring (pending/running/completed/failed)

- **Authentication**
  - Supabase Auth integration
  - Protected routes
  - User sessions

- **Modern UI/UX**
  - Responsive design (mobile/tablet/desktop)
  - Loading states
  - Error handling
  - Empty states with CTAs

### 🔵 **Coming Soon**

- Audit results visualization
- Dashboard overview with stats
- Backlink discovery
- Analytics charts
- Team collaboration

---

## 🚀 Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase (PostgreSQL + Auth)
- **Validation**: Zod
- **Automation**: N8N webhooks
- **Deployment**: Vercel

---

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account
- N8N instance (optional for automation)

---

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd n8n-dashboard
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Set up environment variables

Create `.env.local` based on `.env.example`:

```bash
cp .env.example .env.local
```

Fill in your credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# N8N Webhook (optional)
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/audit
N8N_WEBHOOK_SECRET=your-webhook-secret

# Production URL (optional)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### 4. Set up Supabase

Run the migrations in your Supabase project:

1. Go to your Supabase dashboard → SQL Editor
2. Copy the migration files from `supabase/migrations/`
3. Run each migration in order

**Tables created**:
- `sites` - Projects/websites to monitor
- `audit_jobs` - SEO audit job tracking
- `seo_backlinks` - Backlink discovery results
- `workflows` - N8N workflow configurations
- Plus: `users`, `workspaces`, `api_usage_logs`

### 5. Create admin user

In Supabase SQL Editor:

```sql
-- Create user via Supabase Auth UI first, then update:
UPDATE auth.users 
SET encrypted_password = crypt('YourPassword123!', gen_salt('bf')),
    email_confirmed_at = NOW()
WHERE email = 'your-email@example.com';
```

---

## 🏃 Running Locally

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000)

Default login:
- Email: `service@maximo-seo.com`
- Password: `Supermario60@!`

---

## 📁 Project Structure

```
n8n-dashboard/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── audits/            # Audit API routes
│   │   │   └── projects/          # Project CRUD
│   │   ├── dashboard/
│   │   │   └── projects/
│   │   │       ├── page.tsx       # Projects list
│   │   │       ├── new/           # Create project
│   │   │       └── [id]/
│   │   │           ├── page.tsx   # Project details
│   │   │           ├── edit/      # Edit project
│   │   │           └── audits/    # Audit history
│   │   └── login/                 # Auth pages
│   └── lib/
│       ├── supabase/
│       │   └── server.ts          # Supabase client
│       └── validations/
│           └── project.schema.ts  # Zod schemas
├── supabase/
│   └── migrations/                # Database migrations
└── public/
```

---

## 🔗 API Routes

### Projects

```typescript
GET    /api/projects              # List all projects
POST   /api/projects              # Create project
GET    /api/projects/[id]         # Get single project
PATCH  /api/projects/[id]         # Update project
DELETE /api/projects/[id]         # Delete project (soft)
```

### Audits

```typescript
GET  /api/audits?project_id={id}  # List audits for project
POST /api/audits                  # Trigger new audit
```

---

## 🎨 Database Schema

### `sites` (Projects)

```sql
id              UUID PRIMARY KEY
workspace_id    UUID NULLABLE
name            TEXT
url             TEXT
description     TEXT NULLABLE
status          TEXT ('active'|'paused'|'archived')
health_score    INTEGER DEFAULT 0
last_audit_at   TIMESTAMPTZ NULLABLE
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
deleted_at      TIMESTAMPTZ NULLABLE
```

### `audit_jobs`

```sql
id              UUID PRIMARY KEY
site_id         UUID
status          TEXT ('pending'|'running'|'completed'|'failed')
audit_type      TEXT
started_at      TIMESTAMPTZ
completed_at    TIMESTAMPTZ NULLABLE
created_at      TIMESTAMPTZ
```

---

## 🔄 N8N Integration

### Setup N8N Workflow

1. Create a new workflow in N8N
2. Add a Webhook trigger node
3. Set webhook URL in `.env.local`
4. Workflow receives:

```json
{
  "audit_id": "uuid",
  "site_id": "uuid",
  "url": "https://example.com",
  "audit_type": "full"
}
```

5. Add SEO audit logic (Lighthouse, PageSpeed, etc.)
6. Update `audit_jobs` table with results

---

## 🚢 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

```bash
# Or use Vercel CLI
vercel --prod
```

### Environment Variables (Production)

Add these in Vercel dashboard:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `N8N_WEBHOOK_URL`
- `N8N_WEBHOOK_SECRET`

---

## 📊 Current Progress

**MVP Status**: 55% Complete ✅

✅ Authentication  
✅ Project CRUD  
✅ Audit trigger system  
✅ N8N webhook integration  
🔵 Audit results visualization (coming soon)  
🔵 Dashboard stats (coming soon)  
🔵 Backlink discovery (coming soon)

---

## 🧪 Testing

```bash
# Run tests (when added)
npm test

# Type checking
npm run type-check

# Linting
npm run lint
```

---

## 📝 License

MIT

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📞 Support

For issues or questions, please open a GitHub issue.

---

**Built with ❤️ using Next.js, Supabase, and N8N**
# Trigger deployment - Tue Jun 30 20:32:51 UTC 2026
