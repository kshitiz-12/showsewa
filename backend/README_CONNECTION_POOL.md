# Database Connection Pool Configuration

## Problem
Connection pool exhaustion occurs when all database connections are in use. This happens when:
- Multiple concurrent requests try to use the database
- Connections are not properly released
- Connection pool limit is too low (Supabase free tier has 9 connections)

## Solution

### 1. Update DATABASE_URL in Render Environment Variables

Add connection pool parameters to your `DATABASE_URL`:

**Current (causes exhaustion):**
```
DATABASE_URL="postgresql://...@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"
```

**Updated (with pool management):**
```
DATABASE_URL="postgresql://...@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require&connection_limit=5&pool_timeout=20"
```

### 2. Important Parameters:
- `connection_limit=5`: Limits Prisma to use max 5 connections (leaves room for other operations)
- `pool_timeout=20`: Increases timeout to 20 seconds (default is 10)
- `pgbouncer=true`: Ensures you're using the pooler (required for port 6543)

### 3. DIRECT_URL (for migrations):
Keep DIRECT_URL without pool parameters:
```
DIRECT_URL="postgresql://...@aws-1-us-east-2.pooler.supabase.com:5432/postgres?sslmode=require"
```

### 4. Render Environment Variables Checklist:
- [ ] DATABASE_URL has `connection_limit=5` and `pool_timeout=20`
- [ ] DATABASE_URL uses port 6543 (pooler)
- [ ] DIRECT_URL uses port 5432 (direct connection)
- [ ] Both URLs have `sslmode=require`

## After Updating:
1. Redeploy your Render service
2. Monitor logs for connection pool errors
3. If issues persist, reduce `connection_limit` to 3

## Alternative: Upgrade Supabase
If you need more connections, consider upgrading your Supabase plan which offers higher connection limits.
