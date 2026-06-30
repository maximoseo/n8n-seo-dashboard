# Deployment Guide

Complete guide for deploying the N8N SEO Dashboard to production.

---

## 🚀 Quick Deploy to Vercel

### 1. Prepare Repository

```bash
# Make sure all changes are committed
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Deploy to Vercel

#### Option A: Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

#### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### 3. Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional (N8N integration)
N8N_WEBHOOK_URL=https://your-n8n.com/webhook/audit
N8N_WEBHOOK_SECRET=your-webhook-secret

# Optional (tracking)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### 4. Redeploy

After adding environment variables, trigger a new deployment:

```bash
vercel --prod
```

Or push a new commit to trigger auto-deploy.

---

## 🗄️ Supabase Setup (Production)

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Choose region close to your users
4. Copy credentials:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Anon/Public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Run Migrations

In Supabase Dashboard → SQL Editor:

```sql
-- Run migrations in order:
-- 1. 000-init.sql
-- 2. 001-create-sites.sql
-- 3. 002-create-audit-jobs.sql
-- ... etc
```

Or use Supabase CLI:

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### 3. Create Admin User

In Supabase Dashboard → Authentication → Users:

1. Click "Add User"
2. Email: `your-email@example.com`
3. Auto-confirm: Yes
4. Create user

Or via SQL:

```sql
-- Insert user in auth.users
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES (
  'your-email@example.com',
  crypt('YourPassword123!', gen_salt('bf')),
  NOW()
);
```

### 4. Configure Auth (Optional)

In Supabase Dashboard → Authentication → Settings:

- Site URL: `https://your-app.vercel.app`
- Redirect URLs: `https://your-app.vercel.app/**`
- Email templates: Customize as needed

---

## 🔄 N8N Setup (Optional)

### 1. Deploy N8N

**Option A: N8N Cloud**
- Sign up at [n8n.cloud](https://n8n.cloud)
- Create workspace

**Option B: Self-hosted**

```bash
# Docker
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

**Option C: Railway/Heroku**
- Use N8N's one-click deploy

### 2. Create Audit Workflow

1. Create new workflow in N8N
2. Add **Webhook** node:
   - HTTP Method: `POST`
   - Path: `/audit`
   - Authentication: Header Auth
   - Header Name: `X-Webhook-Secret`
   - Header Value: `your-webhook-secret`

3. Add **SEO Audit Logic**:
   - HTTP Request node → Lighthouse API
   - HTTP Request node → PageSpeed Insights
   - Code node → Parse results
   - Supabase node → Update `audit_jobs`

4. Test webhook:

```bash
curl -X POST https://your-n8n.com/webhook/audit \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: your-webhook-secret" \
  -d '{
    "audit_id": "test-uuid",
    "site_id": "test-uuid",
    "url": "https://example.com",
    "audit_type": "full"
  }'
```

### 3. Update Environment Variables

Add to Vercel:

```env
N8N_WEBHOOK_URL=https://your-n8n.com/webhook/audit
N8N_WEBHOOK_SECRET=your-webhook-secret
```

---

## ⚡ Performance Optimization

### 1. Enable Caching

Add to `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeCss: true,
  },
  images: {
    domains: ['your-supabase-project.supabase.co'],
  },
};

module.exports = nextConfig;
```

### 2. Add Supabase Connection Pooling

In Supabase Dashboard → Settings → Database:

- Enable Connection Pooler
- Use pooler URL in production:

```env
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

### 3. Optimize Images

```bash
# Install sharp for faster image processing
npm install sharp
```

---

## 🔒 Security Checklist

### Before Going Live

- [ ] Enable RLS (Row Level Security) on all Supabase tables
- [ ] Set up proper auth policies
- [ ] Add rate limiting (use Vercel Edge Config or Upstash)
- [ ] Enable HTTPS only (enforced by Vercel)
- [ ] Rotate secrets regularly
- [ ] Set up monitoring (Vercel Analytics, Sentry)
- [ ] Configure CORS properly
- [ ] Add CSP headers

### Environment Variables Security

```env
# ✅ NEVER commit these to git
# ✅ Use Vercel's encrypted env vars
# ✅ Rotate N8N_WEBHOOK_SECRET regularly
# ✅ Use different keys for staging/production
```

---

## 📊 Monitoring

### 1. Vercel Analytics

Enable in Vercel Dashboard → Analytics:
- Web Vitals tracking
- Real User Metrics
- Speed Insights

### 2. Supabase Monitoring

In Supabase Dashboard → Reports:
- Database performance
- API usage
- Auth activity

### 3. Error Tracking (Optional)

Install Sentry:

```bash
npm install @sentry/nextjs
```

Add to `.env.local`:

```env
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions (Recommended)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install
        run: npm ci
      
      - name: Type Check
        run: npm run type-check
      
      - name: Lint
        run: npm run lint
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 🧪 Pre-Deployment Testing

```bash
# 1. Type check
npm run type-check

# 2. Lint
npm run lint

# 3. Build (catches build-time errors)
npm run build

# 4. Test production build locally
npm run start

# 5. Check bundle size
npm run build -- --analyze
```

---

## 📋 Post-Deployment Checklist

- [ ] Test login flow
- [ ] Create a test project
- [ ] Trigger a test audit
- [ ] Check audit history
- [ ] Test edit/delete operations
- [ ] Verify N8N webhook works
- [ ] Check mobile responsiveness
- [ ] Test all error states
- [ ] Verify environment variables loaded
- [ ] Check Vercel logs for errors

---

## 🆘 Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Supabase Connection Issues

- Check RLS policies
- Verify environment variables
- Check Supabase project status
- Review connection pooler settings

### N8N Webhook Not Triggering

- Verify webhook URL is correct
- Check webhook secret matches
- Review N8N workflow logs
- Test webhook manually with curl

---

## 🔄 Updates & Maintenance

### Update Dependencies

```bash
# Check for updates
npm outdated

# Update all
npm update

# Update Next.js
npm install next@latest react@latest react-dom@latest
```

### Database Migrations

```bash
# Create new migration
supabase migration new your_migration_name

# Apply migrations
supabase db push
```

---

## 📊 Performance Targets

- **Lighthouse Score**: 90+ (all categories)
- **First Contentful Paint**: < 1.8s
- **Time to Interactive**: < 3.8s
- **Total Bundle Size**: < 200KB (gzipped)

---

**🎉 Deployment complete! Your dashboard is live.**
