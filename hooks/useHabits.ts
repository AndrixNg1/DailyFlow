import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { storage } from '@/lib/storage';
import { scheduleHabitNotification, cancelHabitNotification } from '@/lib/notifications';
import { Database } from '@/types/database';

type Habit = Database['public']['Tables']['habits']['Row'];
type HabitInsert = Database['public']['Tables']['habits']['Insert'];
type HabitLog = Database['public']['Tables']['habit_logs']['Row'];

export function useHabits(userId?: string) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHabits = async () => {
    if (!userId) return;

    try {
      // Essayer de charger depuis le cache local d'abord
      const cachedHabits = await storage.getItem(`habits_${userId}`);
      if (cachedHabits) {
        setHabits(JSON.parse(cachedHabits));
      }

      // Puis synchroniser avec Supabase
      // Provide table generic so Supabase client returns correct typed rows
      const { data, error: fetchError } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }) as { data: Habit[] | null; error: any };

      if (fetchError) {
        throw fetchError;
      }

      if (data) {
        setHabits(data);
        await storage.setItem(`habits_${userId}`, JSON.stringify(data));
      }
      setError(null);
    } catch (err) {
      console.error('Error loading habits:', err);
      setError(err instanceof Error ? err.message : 'Error loading habits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHabits();
  }, [userId]);

  const createHabit = async (habitData: Omit<HabitInsert, 'user_id'>) => {
    if (!userId) return { error: new Error('User not authenticated') };

    try {
      const newHabit: HabitInsert = {
        ...habitData,
        user_id: userId,
      };

      // Use explicit generic for insert so types align with Database.Insert
      const { data, error: insertError } = await (supabase.from('habits') as any)
        .insert(newHabit as any)
        .select()
        .single() as { data: Habit | null; error: any };

      if (insertError) {
        throw insertError;
      }

      if (data) {
        const updatedHabits = [data, ...habits];
        setHabits(updatedHabits);
        if (userId) await storage.setItem(`habits_${userId}`, JSON.stringify(updatedHabits));
        
        // Programmer la notification
        await scheduleHabitNotification(
          data.id,
          data.title,
          data.emoji,
          data.reminder_time
        );
      }

      return { data, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error creating habit');
      console.error('Error creating habit:', error);
      return { data: null, error };
    }
  };

  const updateHabit = async (habitId: string, updates: Partial<Habit>) => {
    try {
      const { data, error: updateError } = await (supabase.from('habits') as any)
        .update(updates as any)
        .eq('id', habitId)
        .select()
        .single() as { data: Habit | null; error: any };

      if (updateError) {
        throw updateError;
      }

      if (data) {
        const updatedHabits = habits.map(h => h.id === habitId ? data : h);
  setHabits(updatedHabits);
  if (userId) await storage.setItem(`habits_${userId}`, JSON.stringify(updatedHabits));
        
        // Reprogrammer la notification si l'heure a changé
        if (updates.reminder_time || updates.title || updates.emoji) {
          await scheduleHabitNotification(
            data.id,
            data.title,
            data.emoji,
            data.reminder_time
          );
        }
      }

      return { data, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error updating habit');
      console.error('Error updating habit:', error);
      return { data: null, error };
    }
  };

  const deleteHabit = async (habitId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('habits')
        .delete()
        .eq('id', habitId);

      if (deleteError) {
        throw deleteError;
      }

      const updatedHabits = habits.filter(h => h.id !== habitId);
      setHabits(updatedHabits);
      await storage.setItem(`habits_${userId}`, JSON.stringify(updatedHabits));
      
      // Annuler la notification
      await cancelHabitNotification(habitId);

      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error deleting habit');
      console.error('Error deleting habit:', error);
      return { error };
    }
  };

  return {
    habits,
    loading,
    error,
    createHabit,
    updateHabit,
    deleteHabit,
    refetch: loadHabits,
  };
}