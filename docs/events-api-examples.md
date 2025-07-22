# Example Usage of Events API

## Using curl

### Create an event from a Codeforces contest

```bash
curl -X POST "http://localhost:3000/api/events" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "eventLink": "https://codeforces.com/contest/1234",
    "eventPassword": "optional_password",
    "weight": 1.5,
    "ranklistId": 42
  }'
```

### Create an event from an AtCoder contest

```bash
curl -X POST "http://localhost:3000/api/events" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "eventLink": "https://atcoder.jp/contests/abc123",
    "weight": 2.0,
    "ranklistId": 15
  }'
```

### Create an event from a VJudge contest

```bash
curl -X POST "http://localhost:3000/api/events" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "eventLink": "https://vjudge.net/contest/456789",
    "eventPassword": "contest123",
    "weight": 1.0,
    "ranklistId": 8
  }'
```

## Using JavaScript/TypeScript

```typescript
async function createEvent(eventData: {
  eventLink: string;
  eventPassword?: string;
  weight: number;
  ranklistId: number;
}) {
  const response = await fetch('/api/events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventData),
  });

  const result = await response.json();
  
  if (result.success) {
    console.log('Event created successfully:', result.data);
    return result.data;
  } else {
    console.error('Error creating event:', result.error);
    throw new Error(result.error);
  }
}

// Usage examples
try {
  // Create from Codeforces contest
  const cfEvent = await createEvent({
    eventLink: "https://codeforces.com/contest/1234",
    eventPassword: "mypassword",
    weight: 1.5,
    ranklistId: 42
  });

  // Create from AtCoder contest (no password)
  const atEvent = await createEvent({
    eventLink: "https://atcoder.jp/contests/abc123",
    weight: 2.0,
    ranklistId: 15
  });

  // Create from VJudge contest
  const vjEvent = await createEvent({
    eventLink: "https://vjudge.net/contest/456789",
    eventPassword: "contest123",
    weight: 1.0,
    ranklistId: 8
  });
} catch (error) {
  console.error('Failed to create event:', error);
}
```

## Using Python

```python
import requests
import json

def create_event(event_link, weight, ranklist_id, event_password=None, session_token=None):
    """
    Create a new event using the Events API
    """
    url = "http://localhost:3000/api/events"
    
    headers = {
        "Content-Type": "application/json"
    }
    
    # Add session token if provided (for authentication)
    if session_token:
        headers["Cookie"] = f"next-auth.session-token={session_token}"
    
    data = {
        "eventLink": event_link,
        "weight": weight,
        "ranklistId": ranklist_id
    }
    
    if event_password:
        data["eventPassword"] = event_password
    
    response = requests.post(url, headers=headers, data=json.dumps(data))
    
    if response.status_code == 201:
        result = response.json()
        print(f"Event created successfully: {result['data']['event']['title']}")
        return result
    else:
        error_data = response.json()
        print(f"Error: {error_data['error']}")
        raise Exception(error_data['error'])

# Usage examples
try:
    # Create from Codeforces contest
    cf_event = create_event(
        event_link="https://codeforces.com/contest/1234",
        weight=1.5,
        ranklist_id=42,
        event_password="mypassword"
    )
    
    # Create from AtCoder contest
    at_event = create_event(
        event_link="https://atcoder.jp/contests/abc123",
        weight=2.0,
        ranklist_id=15
    )
    
    # Create from VJudge contest
    vj_event = create_event(
        event_link="https://vjudge.net/contest/456789",
        weight=1.0,
        ranklist_id=8,
        event_password="contest123"
    )
    
except Exception as e:
    print(f"Failed to create event: {e}")
```

## Response Examples

### Successful Response

```json
{
  "success": true,
  "message": "Event created and added to ranklist successfully",
  "data": {
    "event": {
      "id": 123,
      "title": "Educational Codeforces Round 123",
      "eventLink": "https://codeforces.com/contest/1234"
    },
    "ranklist": {
      "id": 42,
      "keyword": "weekly-contest",
      "trackerId": 5
    },
    "weight": 1.5
  }
}
```

### Error Responses

#### Invalid Ranklist ID

```json
{
  "success": false,
  "error": "Ranklist not found"
}
```

#### Duplicate Event Link

```json
{
  "success": false,
  "error": "An event with this event link already exists"
}
```

#### Invalid Event Link

```json
{
  "success": false,
  "error": "Unsupported platform. Currently supporting Codeforces, AtCoder, and VJudge."
}
```

#### Validation Errors

```json
{
  "success": false,
  "error": "Invalid request data",
  "details": {
    "eventLink": ["Must be a valid URL"],
    "weight": ["Weight must be a non-negative number"],
    "ranklistId": ["Ranklist ID must be a positive integer"]
  }
}
```

## Notes

1. **Authentication**: You need to be authenticated and have `EVENTS:MANAGE` permission
2. **Session Token**: In production, ensure you handle authentication properly (NextAuth session)
3. **Rate Limiting**: Consider implementing rate limiting for production use
4. **Error Handling**: Always handle errors appropriately in your client code
5. **Validation**: The API validates all inputs and provides detailed error messages
