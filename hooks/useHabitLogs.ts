import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { storage } from '@/lib/storage';
import { Database } from '@/types/database';

type HabitLog = Database['public']['Tables']['habit_logs']['Row'];
type HabitLogInsert = Database['public']['Tables']['habit_logs']['Insert'];

export function useHabitLogs(userId?: string) {
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLogs = async () => {
    if (!userId) return;

    try {
      // Charger depuis le cache local d'abord
      const cachedLogs = await storage.getItem(`logs_${userId}`);
      if (cachedLogs) {
        setLogs(JSON.parse(cachedLogs));
      }

      // Synchroniser avec Supabase - récupérer les logs des 30 derniers jours
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error: fetchError } = await supabase
        .from('habit_logs')
        .select(`
          *,
          habits!inner(user_id)
        `)
        .eq('habits.user_id', userId)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      if (data) {
        const logsData = data.map(item => ({
          id: item.id,
          habit_id: item.habit_id,
          date: item.date,
          completed: item.completed,
          completed_at: item.completed_at,
        })) as HabitLog[];
        
        setLogs(logsData);
        await storage.setItem(`logs_${userId}`, JSON.stringify(logsData));
      }
      setError(null);
    } catch (err) {
      console.error('Error loading habit logs:', err);
      setError(err instanceof Error ? err.message : 'Error loading habit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [userId]);

  const toggleHabitCompletion = async (habitId: string, date: string) => {
    try {
      const existingLog = logs.find(
        log => log.habit_id === habitId && log.date === date
      );

      if (existingLog) {
        // Mettre à jour le log existant
        const newCompleted = !existingLog.completed;
        const completed_at = newCompleted ? new Date().toISOString() : null;

        const { data, error: updateError } = await supabase
          .from('habit_logs')
          .update({ 
            completed: newCompleted,
            completed_at 
          })
          .eq('id', existingLog.id)
          .select()
          .single();

        if (updateError) throw updateError;

        if (data) {
          const updatedLogs = logs.map(log =>
            log.id === existingLog.id ? data : log
          );
          setLogs(updatedLogs);
          await storage.setItem(`logs_${userId}`, JSON.stringify(updatedLogs));
        }
      } else {
        // Créer un nouveau log
        const newLog: HabitLogInsert = {
          habit_id: habitId,
          date,
          completed: true,
          completed_at: new Date().toISOString(),
        };

        const { data, error: insertError } = await supabase
          .from('habit_logs')
          .insert(newLog)
          .select()
          .single();

        if (insertError) throw insertError;

        if (data) {
          const updatedLogs = [data, ...logs];
          setLogs(updatedLogs);
          await storage.setItem(`logs_${userId}`, JSON.stringify(updatedLogs));
        }
      }

      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error toggling habit completion');
      console.error('Error toggling habit completion:', error);
      return { error };
    }
  };

  const getHabitCompletion = (habitId: string, date: string): boolean => {
    const log = logs.find(log => log.habit_id === habitId && log.date === date);
    return log?.completed ?? false;
  };

  const getHabitStreak = (habitId: string): number => {
    const habitLogs = logs
      .filter(log => log.habit_id === habitId && log.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (habitLogs.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    let currentDate = new Date(today);
    currentDate.setHours(0, 0, 0, 0);

    for (const log of habitLogs) {
      const logDate = new Date(log.date);
      logDate.setHours(0, 0, 0, 0);

      if (logDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  const getWeeklyStats = (habitId: string) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyLogs = logs.filter(log => {
      const logDate = new Date(log.date);
      return log.habit_id === habitId && 
             log.completed && 
             logDate >= oneWeekAgo;
    });

    return {
      completed: weeklyLogs.length,
      total: 7,
      percentage: Math.round((weeklyLogs.length / 7) * 100),
    };
  };

  return {
    logs,
    loading,
    error,
    toggleHabitCompletion,
    getHabitCompletion,
    getHabitStreak,
    getWeeklyStats,
    refetch: loadLogs,
  };
}