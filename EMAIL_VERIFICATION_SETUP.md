# Email Verification Database Setup

This guide walks you through setting up the email verification database functionality for your AI-powered skill gamification platform.

## Overview

The email verification system includes:
- Database tables for tracking verification attempts and user profiles
- Email verification service for handling database operations
- Enhanced authentication context with verification methods
- UI components for handling verification flow

## Database Setup

### 1. Run the Migration

In your Supabase project dashboard:

1. Go to the **SQL Editor**
2. Copy and paste the contents of `supabase/migrations/001_email_verification.sql`
3. Click **Run** to execute the migration

This will create:
- `email_verifications` table for tracking verification tokens
- `user_profiles` table for extended user data
- Database functions for handling verification logic
- Row-level security policies
- Triggers for automatic profile creation

### 2. Verify Tables

After running the migration, verify these tables exist in your Supabase database:

#### `email_verifications`
```sql
id                  UUID PRIMARY KEY
user_id             UUID (references auth.users)
email               TEXT
verification_token  TEXT UNIQUE
verified_at         TIMESTAMP
expires_at          TIMESTAMP
attempts            INTEGER
created_at          TIMESTAMP
updated_at          TIMESTAMP
```

#### `user_profiles`
```sql
id                  UUID PRIMARY KEY (references auth.users)
email               TEXT
display_name        TEXT
avatar_url          TEXT
email_verified      BOOLEAN
email_verified_at   TIMESTAMP
total_points        INTEGER
level               INTEGER
skills              JSONB
missions_completed  INTEGER
streak_days         INTEGER
last_activity       TIMESTAMP
created_at          TIMESTAMP
updated_at          TIMESTAMP
```

## Application Integration

### Email Verification Service

The `emailVerificationService` provides methods for:

- `createVerification(userId, email)` - Create new verification record
- `verifyEmail(token)` - Verify email using token
- `getVerificationStatus(userId)` - Check verification status
- `resendVerification(userId)` - Resend verification email
- `getUserProfile(userId)` - Get user profile data
- `updateUserProfile(userId, updates)` - Update profile data

### Enhanced Auth Context

The AuthContext now includes:

- `checkVerificationStatus()` - Check if user's email is verified
- `getUserProfile()` - Get user profile with verification status
- Integration with email verification service

### UI Components

- `EmailVerificationCallback` - Handles verification callback from email links
- Enhanced `AuthForm` - Shows verification status and resend options
- Updated routing to handle verification flow

## Email Verification Flow

1. **User Signs Up**
   - User creates account with email/password
   - Supabase sends verification email automatically
   - User profile created with `email_verified: false`

2. **Email Verification**
   - User clicks verification link in email
   - Link redirects to `/auth/callback` route
   - `EmailVerificationCallback` component handles verification
   - Database updated with verification status

3. **Verification Status**
   - App checks verification status on login
   - Unverified users see prompt to verify email
   - Option to resend verification email

## Testing the System

### 1. Local Development

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Test signup flow:
   - Create new account
   - Check email for verification link
   - Click link to verify

### 2. Database Verification

Check that records are created properly:

```sql
-- Check user profiles
SELECT * FROM user_profiles WHERE email = 'your-test-email@example.com';

-- Check verification records
SELECT * FROM email_verifications WHERE email = 'your-test-email@example.com';
```

## Security Features

- **Row Level Security (RLS)** - Users can only access their own data
- **Token Expiration** - Verification tokens expire after 24 hours
- **Rate Limiting** - Prevents spam verification requests
- **Secure Functions** - Database functions run with elevated privileges

## Troubleshooting

### Common Issues

1. **Migration Fails**
   - Check for existing tables with same names
   - Ensure you have proper permissions in Supabase
   - Review error messages in SQL editor

2. **Verification Not Working**
   - Check email configuration in Supabase Auth settings
   - Verify redirect URLs are configured correctly
   - Check browser network tab for API errors

3. **Database Access Issues**
   - Verify RLS policies are enabled
   - Check user authentication status
   - Ensure service role key is not being used client-side

### Debug Commands

```sql
-- Check verification status
SELECT 
  p.email,
  p.email_verified,
  p.email_verified_at,
  COUNT(ev.id) as verification_attempts
FROM user_profiles p
LEFT JOIN email_verifications ev ON p.id = ev.user_id
WHERE p.email = 'your-email@example.com'
GROUP BY p.id, p.email, p.email_verified, p.email_verified_at;

-- Clean up expired tokens
SELECT public.cleanup_expired_tokens();
```

## Environment Variables

Ensure these environment variables are set:

```bash
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Next Steps

With the email verification database setup complete, you can:

1. Customize email templates in Supabase Auth settings
2. Add email verification requirements to protected routes
3. Implement email change verification flow
4. Add verification badges/status indicators in UI
5. Set up notification preferences based on verification status

## Support

If you encounter issues:

1. Check Supabase dashboard logs
2. Review browser console for errors
3. Test database functions directly in SQL editor
4. Verify authentication flow step by step