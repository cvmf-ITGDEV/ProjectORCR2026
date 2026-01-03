# Authentication & Authorization

This directory contains the authentication and authorization utilities for the OR/CR Loan System.

## Overview

The authentication system follows a strict separation of concerns:
- **Supabase Auth** handles authentication (sign in/sign up/sign out)
- **TypeORM & PostgreSQL** handles user data and authorization (roles, permissions)
- **Middleware** protects routes and enforces authentication requirements
- **Role Guards** provide server-side role checks

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Supabase Auth                         │
│              (Email/Password Authentication)             │
└──────────────────────┬──────────────────────────────────┘
                       │
                       │ auth.users.id
                       ▼
┌─────────────────────────────────────────────────────────┐
│                  User Sync Service                       │
│         Maps auth.users.id → users.supabase_user_id     │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│               Users Table (TypeORM)                      │
│   - supabase_user_id (links to Supabase Auth)          │
│   - role (admin | processor)                            │
│   - is_active (account status)                          │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                   Role Guards                            │
│         Server-side role checks via TypeORM              │
└─────────────────────────────────────────────────────────┘
```

## Files

### `user-sync.ts`
User synchronization service that handles first-time login.

**Key Methods**:
- `syncUserOnFirstLogin(supabaseUserId, email, fullName?)` - Creates user on first login
- `getUserBySupabaseId(supabaseUserId)` - Gets user from database
- `ensureUserExists(supabaseUserId, email, fullName?)` - Gets or creates user
- `updateUser(supabaseUserId, updates)` - Updates user data

**Usage**:
```typescript
import { UserSyncService } from "@/lib/auth/user-sync";

// On login/signup
const user = await UserSyncService.ensureUserExists(
  supabaseUser.id,
  supabaseUser.email,
  supabaseUser.user_metadata?.full_name
);
```

---

### `role-guards.ts`
Server-side role checking utilities.

**Key Classes**:
- `RoleGuard` - Main role checking class

**Key Methods**:
- `getCurrentUser()` - Gets current authenticated user with role info
- `requireAuth()` - Throws if not authenticated
- `requireAdmin()` - Throws if not admin
- `requireRole(role)` - Throws if user doesn't have specific role
- `checkPermission(role)` - Returns boolean for role check
- `hasAdminAccess()` - Returns boolean for admin check
- `getUserRole()` - Returns current user's role or null

**Types**:
```typescript
type UserRole = "admin" | "processor";

interface AuthUser {
  supabaseUserId: string;
  dbUser: User;
  role: UserRole;
  isAdmin: boolean;
}
```

**Usage**:
```typescript
import { RoleGuard } from "@/lib/auth/role-guards";

// In a server action
export async function adminOnlyAction() {
  const user = await RoleGuard.requireAdmin();
  // ... admin logic
}

// Optional check
const isAdmin = await RoleGuard.hasAdminAccess();
if (isAdmin) {
  // ... show admin UI
}
```

---

### `guards.ts`
Higher-order functions for cleaner auth checks.

**Functions**:
- `withAuth(handler)` - Wraps handler, requires authentication
- `withAdmin(handler)` - Wraps handler, requires admin role
- `withRole(role, handler)` - Wraps handler, requires specific role

**Usage**:
```typescript
import { withAuth, withAdmin } from "@/lib/auth/guards";

export async function updateProfile(data: ProfileData) {
  return withAuth(async (user) => {
    // user is guaranteed to be authenticated
    await updateUserProfile(user.dbUser.id, data);
  });
}

export async function deleteUser(userId: string) {
  return withAdmin(async (user) => {
    // user is guaranteed to be admin
    await UserRepository.delete(userId);
  });
}
```

---

## Middleware Protection

The middleware in `src/lib/supabase/middleware.ts` protects routes:

### Protected Routes
- `/dashboard/*` - Requires authentication
- `/admin/*` - Requires authentication + admin role

### Behavior
- Unauthenticated users → Redirect to `/login`
- Non-admin users accessing `/admin/*` → Redirect to `/dashboard`
- Inactive users → Sign out + redirect to `/login`
- Authenticated users on `/login` → Redirect to `/dashboard`

---

## User Synchronization Flow

### First Sign Up
1. User signs up via Supabase Auth
2. `UserSyncService.syncUserOnFirstLogin()` creates user in database
3. User is assigned "processor" role by default
4. User redirected to `/dashboard`

### First Sign In (Existing Supabase User)
1. User signs in via Supabase Auth
2. `UserSyncService.ensureUserExists()` checks if user exists in database
3. If not exists, creates user with "processor" role
4. If exists, returns existing user
5. User redirected to `/dashboard`

### Subsequent Sign Ins
1. User signs in via Supabase Auth
2. `UserSyncService.ensureUserExists()` returns existing user
3. User redirected to `/dashboard`

---

## Role-Based Access Control (RBAC)

### Roles
- **admin** - Full system access
- **processor** - Standard user access

### Role Storage
Roles are stored in the `users` table:
```sql
CREATE TABLE users (
  id uuid PRIMARY KEY,
  supabase_user_id uuid UNIQUE NOT NULL,
  email varchar UNIQUE NOT NULL,
  role varchar DEFAULT 'processor',
  is_active boolean DEFAULT true,
  ...
);
```

### Changing User Roles
To promote a user to admin:
```typescript
import { UserRepository } from "@/repositories/UserRepository";

const user = await UserRepository.findByEmail("user@example.com");
await UserRepository.update(user.id, { role: "admin" });
```

Or via SQL:
```sql
UPDATE users SET role = 'admin' WHERE email = 'user@example.com';
```

---

## Server Action Examples

### Protected Action (Any Authenticated User)
```typescript
"use server";

import { RoleGuard } from "@/lib/auth/role-guards";

export async function updateMyProfile(data: ProfileData) {
  const user = await RoleGuard.requireAuth();

  // Update profile for current user
  return await UserRepository.update(user.dbUser.id, data);
}
```

### Admin-Only Action
```typescript
"use server";

import { RoleGuard } from "@/lib/auth/role-guards";

export async function deleteApplication(applicationId: string) {
  const user = await RoleGuard.requireAdmin();

  // Admin can delete any application
  return await ApplicationRepository.delete(applicationId);
}
```

### Role-Specific Action
```typescript
"use server";

import { RoleGuard } from "@/lib/auth/role-guards";

export async function approveApplication(applicationId: string) {
  // Only admins can approve
  const user = await RoleGuard.requireRole("admin");

  return await ApplicationRepository.update(applicationId, {
    status: "approved",
    approvedAt: new Date(),
  });
}
```

### Conditional UI Display
```typescript
import { RoleGuard } from "@/lib/auth/role-guards";

export async function AdminDashboard() {
  const isAdmin = await RoleGuard.hasAdminAccess();

  if (!isAdmin) {
    redirect("/dashboard");
  }

  return (
    <div>
      {/* Admin UI */}
    </div>
  );
}
```

---

## Best Practices

### 1. Never Use Supabase Client for Business Logic
❌ **Don't**:
```typescript
const supabase = createClient();
const { data } = await supabase.from("users").select("*");
```

✅ **Do**:
```typescript
const user = await UserRepository.findAll();
```

### 2. Always Check Auth in Server Actions
❌ **Don't**:
```typescript
export async function deleteUser(userId: string) {
  // No auth check!
  await UserRepository.delete(userId);
}
```

✅ **Do**:
```typescript
export async function deleteUser(userId: string) {
  await RoleGuard.requireAdmin();
  await UserRepository.delete(userId);
}
```

### 3. Check Active Status
The middleware automatically checks `is_active` status. Inactive users are signed out.

### 4. Use Type-Safe Role Checks
✅ **Good**:
```typescript
const user = await RoleGuard.requireRole("admin");
// TypeScript knows role is "admin" | "processor"
```

---

## Security Considerations

1. **Separation of Concerns**
   - Supabase Auth handles authentication only
   - TypeORM handles authorization and business logic
   - Never mix the two

2. **Server-Side Checks**
   - All role checks must happen server-side
   - Never trust client-side role checks
   - Middleware enforces at route level
   - Role guards enforce at action level

3. **Session Management**
   - Supabase handles session tokens
   - Middleware refreshes sessions automatically
   - Sessions are HTTP-only cookies

4. **Database Isolation**
   - Supabase client cannot access users table
   - All user data accessed via TypeORM
   - Role data never exposed to client

5. **Active Status**
   - Inactive users are immediately signed out
   - Middleware checks active status on every request
   - Admin can deactivate users anytime

---

## Troubleshooting

### User Not Found After Login
**Problem**: User signs in but gets "user not found" error.

**Solution**: The user sync service should create the user automatically. Check:
1. Is `UserSyncService.ensureUserExists()` called after login?
2. Is the database connection working?
3. Check server logs for errors

### Admin Can't Access /admin Routes
**Problem**: Admin user redirected to /dashboard.

**Solution**: Check the user's role in the database:
```sql
SELECT id, email, role FROM users WHERE email = 'admin@example.com';
```

If role is not "admin", update it:
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

### Middleware Redirects in Loop
**Problem**: Constant redirects between /login and /dashboard.

**Solution**: Check:
1. Is the Supabase session being set correctly?
2. Are environment variables configured?
3. Check browser console for errors

---

## Testing Auth Flow

### Test Sign Up
1. Go to `/login`
2. Register new account
3. Should create user in database with "processor" role
4. Should redirect to `/dashboard`

### Test Sign In
1. Go to `/login`
2. Sign in with existing account
3. Should sync user if not exists
4. Should redirect to `/dashboard`

### Test Protected Routes
1. Sign out
2. Try to access `/dashboard`
3. Should redirect to `/login`

### Test Admin Routes
1. Sign in as processor
2. Try to access `/admin`
3. Should redirect to `/dashboard`

4. Promote user to admin (via database)
5. Try to access `/admin`
6. Should allow access

---

## Migration Notes

The users table schema:
```sql
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supabase_user_id uuid UNIQUE NOT NULL,
  email varchar UNIQUE NOT NULL,
  full_name varchar,
  role varchar DEFAULT 'processor',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_users_supabase_id ON users(supabase_user_id);
CREATE INDEX idx_users_role ON users(role);
```

To create the first admin user:
```sql
INSERT INTO users (supabase_user_id, email, role, is_active)
VALUES ('supabase-auth-user-id', 'admin@example.com', 'admin', true);
```

Or update existing user:
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```
