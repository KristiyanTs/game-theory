# Prisoner's Dilemma Benchmark

**When the only goal is to win, which AI's logic is best?**

A strategic game theory platform that pits AI models against each other in 10-round Prisoner's Dilemma matches. Watch as different AI models battle it out using cooperation, betrayal, and strategic thinking.

## 🎮 How It Works

1. **Select Two AI Models**: Choose from any OpenRouter-supported models (GPT-4o, Claude 3.5 Sonnet, Gemini 2.0 Flash, etc.)
2. **Watch the Battle**: AI models make strategic decisions across 10 rounds
3. **Analyze Results**: See detailed reasoning, move patterns, and final scores
4. **Compare Performance**: View leaderboards and match history

## 🚀 Features

- **Epic AI Battles**: 10-round strategic matches between any AI models
- **Real-time Leaderboard**: Rankings based on wins, losses, and strategic performance  
- **Detailed Analysis**: Round-by-round reasoning from each AI's perspective
- **Mobile-First Design**: Fully responsive across all devices
- **Dark Mode**: Modern, rebellious styling

## 🎯 Game Theory

The Prisoner's Dilemma tests fundamental strategic thinking:
- **Cooperation**: Risk trust for mutual benefit (3 points each)
- **Defection**: Guarantee short-term gain, risk retaliation (5 vs 0 points)
- **Mutual Defection**: Both lose (1 point each)
- **Strategic Patterns**: Tit-for-tat, always defect, pavlov, etc.

## 🛠️ Technical Details

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Node.js API routes
- **Database**: Supabase (PostgreSQL)
- **AI Models**: OpenRouter API
- **Deployment**: Hugging Face Spaces with Docker

## 🔧 Environment Setup

This Space requires the following environment variables to be set in the Space settings:

- `OPENROUTER_API_KEY`: Your OpenRouter API key
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `ADMIN_PASSWORD`: Password for admin access
- `NEXTAUTH_SECRET`: Random string for Next.js auth

## 🎮 Usage

1. Navigate to the `/admin` page
2. Enter the admin password
3. Select two different AI models
4. Click "Initiate Battle" and wait for completion
5. View detailed results with round-by-round analysis

## 🏆 Supported Models

Any OpenRouter model including:
- GPT-4o, GPT-4o-mini
- Claude 3.5 Sonnet, Claude 3.5 Haiku  
- Gemini 2.0 Flash
- Llama 3.2 90B
- Qwen 2.5 72B
- Mistral Large
- Command R+
- Grok 2

## 🔥 Why It's Different

This isn't your typical AI demo:
- **Strategic Warfare**: Competition over collaboration
- **Real Analysis**: Deep dive into AI reasoning
- **Unfiltered Results**: Let the best model win
- **Game Theory Focus**: Pure strategic thinking

Built for those who dare to question AI cooperation and want to see which models truly understand strategy.

**Let the games begin.** ⚔️
