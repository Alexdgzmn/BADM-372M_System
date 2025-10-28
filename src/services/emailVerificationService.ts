import { supabase } from '../lib/supabase';

export interface EmailVerification {
  id: string;
  user_id: string;
  email: string;
  verification_token: string;
  verified_at?: string;
  expires_at: string;
  attempts: number;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  email_verified: boolean;
  email_verified_at?: string;
  total_points: number;
  level: number;
  skills: any[];
  missions_completed: number;
  streak_days: number;
  last_activity: string;
  created_at: string;
  updated_at: string;
}

class EmailVerificationService {
  /**
   * Create a new email verification record
   */
  async createVerification(userId: string, email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const verificationToken = this.generateVerificationToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

      const { error } = await supabase
        .from('email_verifications')
        .insert({
          user_id: userId,
          email: email,
          verification_token: verificationToken,
          expires_at: expiresAt.toISOString()
        });

      if (error) {
        console.error('Error creating email verification:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Unexpected error creating email verification:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  /**
   * Verify an email using the verification token
   */
  async verifyEmail(token: string): Promise<{ success: boolean; error?: string; message?: string }> {
    try {
      const { data, error } = await supabase
        .rpc('confirm_email_verification', { token_param: token });

      if (error) {
        console.error('Error verifying email:', error);
        return { success: false, error: error.message };
      }

      return data;
    } catch (error) {
      console.error('Unexpected error verifying email:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  /**
   * Get verification status for a user
   */
  async getVerificationStatus(userId: string): Promise<{ verified: boolean; pending: boolean; error?: string }> {
    try {
      // Check user profile for verification status
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('email_verified')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error checking profile:', profileError);
        return { verified: false, pending: false, error: profileError.message };
      }

      if (profile?.email_verified) {
        return { verified: true, pending: false };
      }

      // Check for pending verification
      const { data: verification, error: verificationError } = await supabase
        .from('email_verifications')
        .select('*')
        .eq('user_id', userId)
        .is('verified_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      if (verificationError) {
        console.error('Error checking verification:', verificationError);
        return { verified: false, pending: false, error: verificationError.message };
      }

      return {
        verified: false,
        pending: verification && verification.length > 0
      };
    } catch (error) {
      console.error('Unexpected error checking verification status:', error);
      return { verified: false, pending: false, error: 'An unexpected error occurred' };
    }
  }

  /**
   * Resend verification email (increment attempts)
   */
  async resendVerification(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if there's a recent verification attempt (within last 5 minutes)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      const { data: recentVerification } = await supabase
        .from('email_verifications')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', fiveMinutesAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      if (recentVerification && recentVerification.length > 0) {
        return { success: false, error: 'Please wait a few minutes before requesting another verification email.' };
      }

      // Get user email
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('email')
        .eq('id', userId)
        .single();

      if (!profile?.email) {
        return { success: false, error: 'User email not found' };
      }

      // Create new verification
      return await this.createVerification(userId, profile.email);
    } catch (error) {
      console.error('Unexpected error resending verification:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: string): Promise<{ profile?: UserProfile; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return { error: error.message };
      }

      return { profile: data };
    } catch (error) {
      console.error('Unexpected error fetching user profile:', error);
      return { error: 'An unexpected error occurred' };
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userId);

      if (error) {
        console.error('Error updating user profile:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Unexpected error updating user profile:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  /**
   * Generate a secure verification token
   */
  private generateVerificationToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Clean up expired verification tokens (utility function)
   */
  async cleanupExpiredTokens(): Promise<{ success: boolean; error?: string; cleaned?: number }> {
    try {
      const { data, error } = await supabase
        .from('email_verifications')
        .delete()
        .lt('expires_at', new Date().toISOString())
        .select('id');

      if (error) {
        console.error('Error cleaning up expired tokens:', error);
        return { success: false, error: error.message };
      }

      return { success: true, cleaned: data?.length || 0 };
    } catch (error) {
      console.error('Unexpected error cleaning up expired tokens:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }
}

export const emailVerificationService = new EmailVerificationService();