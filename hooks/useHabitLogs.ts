import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { storage } from "@/lib/storage";
import { Database } from "@/types/database";

type HabitLog = Database["public"]["Tables"]["habit_logs"]["Row"];

export function useHabitLogs(userId?: string) {
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLogs = async () => {
    if (!userId) return;

    setLoading(true);

    try {
      // Cache local
      const cachedLogs = await storage.getItem(`logs_${userId}`);
      if (cachedLogs) setLogs(JSON.parse(cachedLogs));

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error: fetchError } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: false }) as { data: HabitLog[] | null; error: any };

      if (fetchError) throw fetchError;

      if (data) {
        // Filtrer seulement les vrais logs (évite SelectQueryError)
        const validLogs = data.filter(
          (log): log is HabitLog => !("error" in log)
        );
        setLogs(validLogs);
        await storage.setItem(`logs_${userId}`, JSON.stringify(validLogs));
      }

      setError(null);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Error loading logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [userId]);

  const toggleHabitCompletion = async (habitId: string, date: string): Promise<{ error: any | null }> => {
    try {
      const existingLog = logs.find(
        (log) => log.habit_id === habitId && log.date === date
      );

      if (existingLog) {
        const newCompleted = !existingLog.completed;
        const completed_at = newCompleted ? new Date().toISOString() : null;

        const { data, error: updateError } = await (supabase.from('habit_logs') as any)
          .update({ completed: newCompleted, completed_at })
          .eq('id', existingLog.id)
          .select()
          .single() as { data: HabitLog | null; error: any };

        if (updateError) throw updateError;
        if (data) {
          setLogs((prev) =>
            prev.map((log) => (log.id === data.id ? data : log))
          );
        }
      } else {
        const newLog = {
          habit_id: habitId,
          date,
          completed: true,
          completed_at: new Date().toISOString(),
        };

        const { data, error: insertError } = await (supabase.from('habit_logs') as any)
          .insert(newLog)
          .select()
          .single() as { data: HabitLog | null; error: any };

        if (insertError) throw insertError;
        if (data) setLogs((prev) => [data, ...prev]);
      }
      return { error: null };
    } catch (err) {
      console.error("Toggle habit completion error:", err);
      return { error: err instanceof Error ? err : true };
    }
    // fallback
    return { error: null };
  };

  const getHabitCompletion = (habitId: string, date: string) =>
    logs.find((l) => l.habit_id === habitId && l.date === date)?.completed ??
    false;

  const getHabitStreak = (habitId: string) => {
    const habitLogs = logs
      .filter((l) => l.habit_id === habitId && l.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (!habitLogs.length) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const log of habitLogs) {
      const logDate = new Date(log.date);
      logDate.setHours(0, 0, 0, 0);

      if (+logDate === +currentDate) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else break;
    }

    return streak;
  };

  const getWeeklyStats = (habitId: string) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyLogs = logs.filter(
      (l) => l.habit_id === habitId && l.completed && new Date(l.date) >= oneWeekAgo
    );

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
