# 🚀 Quick Setup Guide

## 1. Environment Configuration

The environment files have been created for you:
- `.env.example` - Template for production
- `.env.local` - Local development (with placeholder values)

### Update `.env.local` with your actual credentials:

```bash
# 1. Get OpenRouter API Key
# Visit: https://openrouter.ai/keys
OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here

# 2. Create Supabase Project
# Visit: https://supabase.com/dashboard
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key

# 3. Set Admin Password
ADMIN_PASSWORD=your_secure_password
```

## 2. Database Setup

The database has been automatically set up using Supabase migrations! ✅

The following tables have been created in your GameTheory database:
- `models` - AI model statistics and rankings
- `matches` - Game records between AI models  
- `rounds` - Individual round data with moves and reasoning

If you need to make database changes in the future:
```bash
supabase migration new your_migration_name
# Edit the migration file in supabase/migrations/
supabase db push
```

## 3. Start Development

```bash
npm install
npm run dev
```

## 4. First Battle

1. Visit `http://localhost:3000`
2. Click "Run New Match" or go to `/admin`
3. Enter your admin password
4. Select two different AI models (e.g., `openai/gpt-4o` vs `anthropic/claude-3.5-sonnet`)
5. Hit "Initiate Battle" and wait for the epic 20-round strategic warfare!

## 🔥 Ready to watch AIs battle!

The platform is now configured for epic strategic AI battles. Each match will take 2-5 minutes depending on model response times.

---

**Having TypeScript issues in your IDE?**
Try restarting your TypeScript language server or run: `npm run type-check`
