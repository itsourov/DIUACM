# Events API

## POST /api/events

Creates a new event from an event link and adds it to a ranklist with a specified weight.

### Authentication

Requires `EVENTS:MANAGE` permission.

### Request Body

```json
{
  "eventLink": "string (URL)", // Required - The event URL (Codeforces, AtCoder, or VJudge)
  "eventPassword": "string", // Optional - Password for the event
  "weight": "number", // Required - Weight value for this event in the ranklist (>= 0)
  "ranklistId": "number" // Required - ID of the ranklist to add this event to (positive integer)
}
```

### Example Request

```json
{
  "eventLink": "https://codeforces.com/contest/1234",
  "eventPassword": "mypassword",
  "weight": 1.5,
  "ranklistId": 42
}
```

### Validation

1. **Ranklist Validation**: Checks if the provided `ranklistId` exists and is active
2. **Event Link Uniqueness**: Ensures no event with the same `eventLink` already exists
3. **Contest Data Fetching**: Uses the existing quickfill functionality to automatically fetch contest information from the event link
4. **Supported Platforms**: Codeforces, AtCoder, VJudge

### Response

#### Success (201 Created)

```json
{
  "success": true,
  "message": "Event created and added to ranklist successfully",
  "data": {
    "event": {
      "id": 123,
      "title": "Contest Title",
      "eventLink": "https://codeforces.com/contest/1234"
    },
    "ranklist": {
      "id": 42,
      "keyword": "ranklist-keyword",
      "trackerId": 5
    },
    "weight": 1.5
  }
}
```

#### Error Responses

- **400 Bad Request**: Invalid request data, ranklist not active, or failed to fetch contest data
- **403 Forbidden**: User doesn't have `EVENTS:MANAGE` permission
- **404 Not Found**: Ranklist not found
- **409 Conflict**: Event with same event link already exists
- **500 Internal Server Error**: Server error

### Example Error Response

```json
{
  "success": false,
  "error": "Ranklist not found"
}
```

### Features

- **Automatic Event Information**: Automatically fetches event title, start time, end time, and other details from the event link
- **Weight Assignment**: Assigns the specified weight to the event in the ranklist
- **Duplicate Prevention**: Prevents creating events with duplicate event links
- **Permission Control**: Ensures only authorized users can create events
- **Input Validation**: Validates all input parameters including URL format and positive integers

### Use Cases

This API is ideal for:

- Bulk event creation from external contest platforms
- Automated contest tracking setup
- Integration with external systems that manage contest events
- Quick event setup with automatic data population

### Platform Support

The API supports automatic data fetching from:

- **Codeforces**: `https://codeforces.com/contest/{contestId}`
- **AtCoder**: `https://atcoder.jp/contests/{contestId}`
- **VJudge**: `https://vjudge.net/contest/{contestId}`
