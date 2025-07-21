# Score Recalculation API

Optimized API for recalculating rank list scores with minimal database queries.

## Endpoints

### POST `/api/trackers/recalculate-score`

Recalculates scores for all active rank lists using optimized batch processing.

**Response:**
```json
{
  "success": true,
  "message": "Recalculated scores for 3 rank lists",
  "totalRankListsProcessed": 3,
  "totalUsersUpdated": 150,
  "results": [
    {
      "rankListId": 1,
      "rankListKeyword": "weekly_contest",
      "updatedUsers": 50,
      "eventsCount": 5
    }
  ]
}
```

### POST `/api/trackers/recalculate-score/[id]`

Recalculates scores for a specific rank list.

**Response:**
```json
{
  "success": true,
  "message": "Recalculated scores for \"weekly_contest\"",
  "rankListId": 1,
  "rankListKeyword": "weekly_contest",
  "updatedUsers": 50,
  "eventsCount": 5
}
```

### GET `/api/trackers/recalculate-score`

Returns current statistics without performing calculations.

**Response:**
```json
{
  "success": true,
  "info": {
    "activeRankLists": 3,
    "totalUsersInRankLists": 150
  },
  "message": "Use POST method to trigger score recalculation"
}
```

## Optimizations

- **Single Query**: All data fetched in one complex join instead of multiple loops
- **Batch Updates**: Parallel processing of user score updates
- **Memory Efficient**: Uses Maps for score calculation instead of nested loops
- **Parallel Processing**: Rank lists processed concurrently when possible

## Score Logic

1. **Total Score** = Sum of event scores
2. **Event Score** = `(solveCount × weight) + (upsolveCount × weight × weightOfUpsolve)`
3. **Strict Attendance**: Non-attendees' solves become upsolves

## Usage

```bash
# Recalculate all
curl -X POST /api/trackers/recalculate-score

# Recalculate specific
curl -X POST /api/trackers/recalculate-score/1

# Get info
curl /api/trackers/recalculate-score
```
