-- Email verification table for tracking verification attempts and status
CREATE TABLE IF NOT EXISTS email_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    verification_token TEXT UNIQUE NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_email_verifications_user_id ON email_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verifications_token ON email_verifications(verification_token);
CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON email_verifications(email);

-- User profiles table (if not exists) to store additional user data
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    total_points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    skills JSONB DEFAULT '[]',
    missions_completed INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
DROP TRIGGER IF EXISTS update_email_verifications_updated_at ON email_verifications;
CREATE TRIGGER update_email_verifications_updated_at
    BEFORE UPDATE ON email_verifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create user profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, email_verified)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.email_confirmed_at IS NOT NULL, FALSE));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to handle email verification confirmation
CREATE OR REPLACE FUNCTION public.confirm_email_verification(verification_token TEXT)
RETURNS JSONB AS $$
DECLARE
    verification_record email_verifications%ROWTYPE;
    user_record auth.users%ROWTYPE;
BEGIN
    -- Find the verification record
    SELECT * INTO verification_record
    FROM email_verifications
    WHERE verification_token = $1
    AND verified_at IS NULL
    AND expires_at > NOW();

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Invalid or expired verification token'
        );
    END IF;

    -- Mark as verified
    UPDATE email_verifications
    SET verified_at = NOW(),
        updated_at = NOW()
    WHERE id = verification_record.id;

    -- Update user profile
    UPDATE user_profiles
    SET email_verified = TRUE,
        email_verified_at = NOW(),
        updated_at = NOW()
    WHERE id = verification_record.user_id;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Email verified successfully'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Row Level Security (RLS) policies
ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Email verifications policies
CREATE POLICY "Users can view their own email verifications" ON email_verifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own email verifications" ON email_verifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email verifications" ON email_verifications
    FOR UPDATE USING (auth.uid() = user_id);

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;