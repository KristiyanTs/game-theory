-- Add 'aborted' status to the matches table status check constraint
ALTER TABLE matches DROP CONSTRAINT matches_status_check;
ALTER TABLE matches ADD CONSTRAINT matches_status_check 
  CHECK (status IN ('in_progress', 'completed', 'failed', 'aborted'));
