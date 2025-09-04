# AI War Zone - Prisoner's Dilemma Tournament 🔥

The definitive platform for ranking Large Language Models through strategic game theory battles. Watch AIs clash in the ultimate test of cooperation vs. betrayal.

🌐 **[Live Demo](https://game-theory-liart.vercel.app/)** - See it in action!

## 🚀 Features

- **Epic AI Battles**: 10-round Prisoner's Dilemma matches between any OpenRouter-supported models
- **Real-time Leaderboard**: Rankings based on wins, losses, and strategic performance  
- **Detailed Analysis**: Round-by-round reasoning from each AI's perspective
- **Rebellious Design**: Dark mode with bold, modern styling that breaks the rules
- **Mobile-First**: Fully responsive across all devices
- **Lightning Fast**: Optimized with Next.js and Vercel deployment

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS 4
- **Backend**: Node.js, Express.js (Serverless Functions)
- **Database**: Supabase (PostgreSQL)
- **AI Models**: OpenRouter API
- **Deployment**: Vercel
- **TypeScript**: Full type safety

## 🔧 Setup & Installation

### Prerequisites
- Node.js 18+
- Supabase account
- OpenRouter API key
- Vercel account (for deployment)

### Environment Variables
Create a `.env.local` file with:

```bash
# OpenRouter API Configuration
OPENROUTER_API_KEY=your_openrouter_api_key

# Supabase Configuration  
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Admin Configuration
ADMIN_PASSWORD=your_secure_admin_password

# Next.js Configuration
NEXTAUTH_SECRET=your_secure_random_string
NEXTAUTH_URL=http://localhost:3000
```

### Database Setup
1. Create a new Supabase project
2. Use Supabase CLI to link and push migrations:
   ```bash
   supabase init
   supabase link --project-ref your-project-ref
   supabase db push
   ```
3. This creates the models, matches, and rounds tables with proper relationships

### Local Development
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## 🎮 Usage

### Running Matches
1. Navigate to `/admin`
2. Enter admin password
3. Select two different AI models (e.g., `openai/gpt-4o` vs `anthropic/claude-3.5-sonnet`)
4. Hit "Initiate Battle" and wait 2-5 minutes for completion
5. View detailed results with round-by-round analysis

### Supported Models
Any OpenRouter model including:
- GPT-4o, GPT-4o-mini
- Claude 3.5 Sonnet, Claude 3.5 Haiku  
- Gemini 2.0 Flash
- Llama 3.2 90B
- Qwen 2.5 72B
- Mistral Large
- Command R+
- Grok 2

## 🏗️ Architecture

### Game Engine
- **10 rounds** of strategic decision-making
- **Payoff matrix**: Cooperate/Cooperate=3/3, Cooperate/Defect=0/5, Defect/Defect=1/1
- **History awareness**: Each AI sees complete game history
- **Robust parsing**: Extracts reasoning and moves from AI responses

### API Endpoints
- `POST /api/matches/run` - Execute new match
- `GET /api/matches` - List recent matches
- `GET /api/matches/[id]` - Match details with rounds
- `GET /api/models` - Leaderboard data

### Database Schema
- **models**: AI model stats (wins, losses, total_score)
- **matches**: Game records with participants and results
- **rounds**: Individual round data with moves and reasoning

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy with automatic optimization

### Environment Variables for Production
Set these in your Vercel dashboard:
- `OPENROUTER_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL` 
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD`
- `NEXTAUTH_SECRET`

## 🎯 Roadmap

### Phase 2: User-Prompted AI
- User authentication 
- Custom AI personas and prompts
- Prompt Arena battles

### Phase 3: Tournaments & Monetization  
- Bracket-style tournaments
- Entry fees via Stripe
- Advanced analytics

## 🛡️ Security

- Row Level Security (RLS) enabled on all tables
- Admin password protection for match creation
- API keys stored securely as environment variables
- No client-side exposure of sensitive data

## 📊 Game Theory

The Prisoner's Dilemma tests fundamental strategic thinking:
- **Cooperation**: Risk trust for mutual benefit
- **Defection**: Guarantee short-term gain, risk retaliation
- **Patterns**: Tit-for-tat, always defect, pavlov, etc.
- **Evolution**: How strategies adapt over 10 rounds

## 🔥 Why It's Rebellious

This isn't your typical corporate AI demo:
- **Dark by default**: Embrace the shadows
- **Brutal honesty**: No sugarcoating AI behavior  
- **Strategic warfare**: Competition over collaboration
- **Real analysis**: Deep dive into AI reasoning
- **Unfiltered results**: Let the best model win

---

Built for the rebellious minds who dare to question AI cooperation. 

**Let the games begin.** ⚔️