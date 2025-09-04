# Tournament Script

This script automates running a complete tournament between AI models in the Game Theory project.

## Tournament Configuration

The tournament runs between these 4 models:
- `anthropic/claude-sonnet-4`
- `openai/gpt-5`
- `x-ai/grok-4`
- `google/gemini-2.5-pro`

Each model plays 10 games against every other model, for a total of 60 games:
- 6 pairs of models × 10 games each = 60 total games

## Usage

First, make sure you have the required dependencies:
```bash
npm install tsx
```

### Check Current Progress
```bash
npm run tournament:check
```
This shows how many games have been completed between each pair of models.

### Dry Run (See What Would Be Executed)
```bash
npm run tournament:dry-run
```
This shows which games would be executed without actually running them.

### Run the Tournament
```bash
npm run tournament:run
```
This starts executing all remaining games in the tournament.

### Resume Tournament
```bash
npm run tournament:resume
```
Same as `run` - the script automatically detects which games are missing and only runs those.

## Features

- **Smart Progress Tracking**: Only runs games that haven't been completed yet
- **Randomized Order**: For each pair, randomly decides which model goes first to avoid bias
- **Rate Limiting**: Adds delays between games to be respectful to API limits
- **Error Handling**: If a game fails, it continues with the next one
- **Progress Reporting**: Shows detailed progress throughout execution

## Current Status

According to your message, you already have 6 games between `openai/gpt-5` and `google/gemini-2.5-pro`, so the script will:

1. Complete the remaining 4 games for this pair
2. Run all 10 games for each of the other 5 pairs
3. Total: 4 + (5 × 10) = 54 games remaining

## Estimated Time

With the current delays (15 seconds between rounds, 2 minutes between games), expect:
- Each game: ~5-10 minutes (10 rounds + delays)
- Total tournament: ~5-9 hours for all remaining games

You can adjust the delays in the script if needed to run faster or slower based on API limits.
