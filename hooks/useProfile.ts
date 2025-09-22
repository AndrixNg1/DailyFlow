import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';

type UserProfile = Database['public']['Tables']['users']['Row'];
type UserProfileUpdate = Database['public']['Tables']['users']['Update'];

export function useProfile(userId?: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = async () => {
    if (!userId) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single<UserProfile>();

      if (fetchError) throw fetchError;

      setProfile(data ?? null);
      setError(null);
    } catch (err) {
      console.error('Error loading profile:', err);
      setError(err instanceof Error ? err.message : 'Error loading profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const updateProfile = async (updates: UserProfileUpdate) => {
    if (!userId) {
      return { data: null, error: new Error('User not authenticated') };
    }

    try {
      const { data, error: updateError } = await (supabase.from('users') as any)
        .update(updates)
        .eq('id', userId)
        .select('*')
        .single() as { data: UserProfile | null; error: any };

      if (updateError) throw updateError;

      if (data) setProfile(data);

      return { data, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error updating profile');
      console.error('Error updating profile:', error);
      return { data: null, error };
    }
  };

  const getDisplayName = () => {
    if (!profile) return 'Utilisateur';
    return profile.full_name || profile.email.split('@')[0];
  };

  const getInitials = () => {
    if (!profile) return '?';

    if (profile.full_name) {
      return profile.full_name
        .split(' ')
        .map((name) => name.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }

    return profile.email.charAt(0).toUpperCase();
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
    getDisplayName,
    getInitials,
    refetch: loadProfile,
  };
}
