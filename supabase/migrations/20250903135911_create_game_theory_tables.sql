-- Create the models table
CREATE TABLE models (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create the matches table
CREATE TABLE matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    model_a_id UUID REFERENCES models(id) ON DELETE CASCADE,
    model_b_id UUID REFERENCES models(id) ON DELETE CASCADE,
    model_a_final_score INTEGER DEFAULT 0,
    model_b_final_score INTEGER DEFAULT 0,
    winner_id UUID REFERENCES models(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed'))
);

-- Create the rounds table
CREATE TABLE rounds (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    model_a_move TEXT NOT NULL CHECK (model_a_move IN ('COOPERATE', 'DEFECT')),
    model_b_move TEXT NOT NULL CHECK (model_b_move IN ('COOPERATE', 'DEFECT')),
    model_a_reasoning TEXT NOT NULL,
    model_b_reasoning TEXT NOT NULL,
    model_a_score INTEGER NOT NULL,
    model_b_score INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(match_id, round_number)
);

-- Create indexes for better performance
CREATE INDEX idx_models_wins_losses ON models(wins DESC, losses ASC);
CREATE INDEX idx_matches_created_at ON matches(created_at DESC);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_rounds_match_id ON rounds(match_id);
CREATE INDEX idx_rounds_round_number ON rounds(match_id, round_number);

-- Enable Row Level Security (RLS)
ALTER TABLE models ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to models" ON models FOR SELECT USING (true);
CREATE POLICY "Allow public read access to matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Allow public read access to rounds" ON rounds FOR SELECT USING (true);

-- Only allow inserts/updates from service role (backend)
CREATE POLICY "Allow service role to insert models" ON models FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Allow service role to update models" ON models FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role to insert matches" ON matches FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Allow service role to update matches" ON matches FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role to insert rounds" ON rounds FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Allow service role to update rounds" ON rounds FOR UPDATE USING (auth.role() = 'service_role');
