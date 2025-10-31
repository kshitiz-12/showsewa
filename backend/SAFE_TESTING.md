# Safe Theater API Testing Guide

## 🛡️ Safety First Approach

This system allows you to test theater integrations **safely** without real theater APIs.

---

## 📋 Current Testing (Without Real Theater APIs)

### Mock System
We use a **mock system** that simulates theater responses:

```typescript
// Mock theaters are defined in: backend/src/mocks/theaterApiMock.ts
```

**Available Mock Theaters:**
- `theater-001`: QFX Cinemas - Civil Mall (Kathmandu)
- `theater-002`: BigMovies - Jaya Nepal (Kathmandu)  
- `theater-003`: QFX Cinemas - Pokhara (Pokhara)

### Test Endpoints

#### 1. Check Theater API Status
```bash
GET /api/testing/theater/theater-001/enabled
```
Response:
```json
{
  "success": true,
  "theaterId": "theater-001",
  "enabled": true,
  "safeMode": true
}
```

#### 2. Simulate Inventory Sync
```bash
POST /api/testing/sync-inventory
Content-Type: application/json

{
  "theaterId": "theater-001",
  "showtimeId": "cmh123..."
}
```

#### 3. Simulate Booking Confirmation
```bash
POST /api/testing/confirm-booking
Content-Type: application/json

{
  "theaterId": "theater-001",
  "bookingDetails": {
    "bookingId": "booking-123",
    "seats": ["A1", "A2"],
    "showtimeId": "cmh123..."
  }
}
```

---

## 🔐 Future Testing (With Real Theater APIs)

### Safety Features Built-In

1. **Dry-Run Mode** (Built-in protection)
   - All API calls are simulated by default
   - Enable/disable via environment variable
   ```bash
   # Enable dry-run mode
   SAFE_MODE=true npm run dev
   
   # Disable for real API calls (production)
   SAFE_MODE=false npm run dev
   ```

2. **Rate Limiting**
   - Prevents API abuse
   - Automatic retry with exponential backoff

3. **Timeout Protection**
   - API calls timeout after 5 seconds
   - Prevents hanging connections

4. **Authentication Required**
   - Valid API keys needed for all theater API calls
   - Keys stored securely (not in code)

5. **Error Handling & Rollback**
   - Failed API calls are logged
   - Transactions can be rolled back
   - No data corruption if API fails

---

## 🧪 How to Test Safely

### Step 1: Start in Safe Mode
```bash
cd backend
SAFE_MODE=true npm run dev
```

### Step 2: Test Mock Theater APIs
```bash
# Test inventory sync
curl -X POST http://localhost:5000/api/testing/sync-inventory \
  -H "Content-Type: application/json" \
  -d '{"theaterId":"theater-001","showtimeId":"cmh123..."}'
```

### Step 3: Check Logs
```bash
# Watch for mock calls in console:
# 🎬 Mock Theater API Call: { theaterId: 'theater-001', ... }
```

---

## 🚀 When You Get Real Theater APIs

### Step 1: Add Theater Configuration
In database, add theater API config:
```sql
INSERT INTO theater_api_config (
  theater_id,
  api_key,
  api_secret,
  endpoint,
  timeout,
  retry_count
) VALUES (
  'real-theater-id',
  'real-api-key',
  'encrypted-secret',
  'https://real-theater-api.com',
  5000,
  3
);
```

### Step 2: Test with Dry-Run First
```bash
# Test in safe mode first
SAFE_MODE=true npm run dev

# Make test calls - will be simulated, not real
curl -X POST http://localhost:5000/api/testing/sync-inventory ...
```

### Step 3: Enable Real API Calls (Carefully)
```bash
# ONLY after thorough testing
SAFE_MODE=false npm run dev

# Now real API calls will be made
```

---

## 🛡️ Additional Safety Measures

### 1. Staging Environment
- Test on separate staging database
- Use staging theater APIs

### 2. Webhook Verification
- Verify webhook signatures
- Use HMAC for authentication

### 3. Monitoring
- Log all API calls
- Alert on failures
- Track API usage

### 4. Rollback Plan
- Database backups before changes
- Ability to disable API for a theater
- Graceful degradation if API fails

---

## 📊 Testing Workflow

```
1. Development: Test with mocks (SAFE_MODE=true)
                  ↓
2. Staging: Test with dry-run (SAFE_MODE=true)
                  ↓
3. Production: Enable real APIs (SAFE_MODE=false)
```

---

## 🚨 Danger Zone (Production)

**DO NOT:**
- ❌ Call real theater APIs without testing first
- ❌ Use production database for testing
- ❌ Disable safe mode in development
- ❌ Skip API authentication
- ❌ Ignore error logs

**DO:**
- ✅ Always test in SAFE_MODE first
- ✅ Use staging environment
- ✅ Monitor all API calls
- ✅ Have rollback plan
- ✅ Log everything

---

## 📝 Example: Complete Testing Flow

```bash
# 1. Start backend in safe mode
cd backend
SAFE_MODE=true npm run dev

# 2. Test with curl
curl -X POST http://localhost:5000/api/testing/confirm-booking \
  -H "Content-Type: application/json" \
  -d '{
    "theaterId": "theater-001",
    "bookingDetails": {
      "bookingId": "test-123",
      "seats": ["A1", "A2"]
    }
  }'

# 3. Check response
# Should return: { "success": true, "data": { "dryRun": true, ... } }

# 4. Check logs
# Should see: 🎬 Mock Theater API Call ...
```

---

## ✅ Summary

**Current:** Use mocks to test everything safely  
**Future:** Enable real APIs with dry-run protection  
**Always:** Test first, enable carefully, monitor closely

You can test everything safely now, and when you get real theater APIs, it won't be dangerous because of the built-in protections! 🛡️

