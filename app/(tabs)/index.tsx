import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Check } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useHabits } from '@/hooks/useHabits';
import { useHabitLogs } from '@/hooks/useHabitLogs';
import { setupNotifications } from '@/lib/notifications';

export default function HomeScreen() {
  const { user } = useAuth();
  const { habits, loading: habitsLoading, refetch: refetchHabits } = useHabits(user?.id);
  const { 
    toggleHabitCompletion, 
    getHabitCompletion, 
    getHabitStreak,
    loading: logsLoading,
    refetch: refetchLogs 
  } = useHabitLogs(user?.id);
  
  const [refreshing, setRefreshing] = useState(false);
  
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    setupNotifications();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchHabits(), refetchLogs()]);
    setRefreshing(false);
  };

  const handleToggleCompletion = async (habitId: string) => {
    const { error } = await toggleHabitCompletion(habitId, today);
    if (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour l\'habitude');
    }
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  if (habitsLoading || logsLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>{getGreeting()} !</Text>
        <Text style={styles.date}>
          {new Date().toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
          })}
        </Text>
      </View>

      <View style={styles.content}>
        {habits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>🌟</Text>
            <Text style={styles.emptyStateTitle}>Aucune habitude</Text>
            <Text style={styles.emptyStateText}>
              Commencez par créer votre première habitude dans l'onglet "Ajouter"
            </Text>
          </View>
        ) : (
          <View style={styles.habitsContainer}>
            <Text style={styles.sectionTitle}>Mes habitudes d'aujourd'hui</Text>
            {habits.map((habit) => {
              const isCompleted = getHabitCompletion(habit.id, today);
              const streak = getHabitStreak(habit.id);

              return (
                <TouchableOpacity
                  key={habit.id}
                  style={[
                    styles.habitCard,
                    isCompleted && styles.habitCardCompleted
                  ]}
                  onPress={() => handleToggleCompletion(habit.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.habitContent}>
                    <View style={styles.habitInfo}>
                      <Text style={styles.habitEmoji}>{habit.emoji}</Text>
                      <View style={styles.habitDetails}>
                        <Text style={[
                          styles.habitTitle,
                          isCompleted && styles.habitTitleCompleted
                        ]}>
                          {habit.title}
                        </Text>
                        <Text style={styles.habitTime}>
                          Rappel: {formatTime(habit.reminder_time)}
                        </Text>
                        {streak > 0 && (
                          <Text style={styles.streakText}>
                            🔥 {streak} jour{streak > 1 ? 's' : ''} d'affilée
                          </Text>
                        )}
                      </View>
                    </View>
                    <View style={[
                      styles.checkButton,
                      isCompleted && styles.checkButtonCompleted
                    ]}>
                      {isCompleted && (
                        <Check size={20} color="#ffffff" strokeWidth={3} />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#ffffff',
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  habitsContainer: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  habitCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  habitCardCompleted: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  habitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  habitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  habitEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  habitDetails: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  habitTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#6b7280',
  },
  habitTime: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  streakText: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '500',
  },
  checkButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkButtonCompleted: {
    backgroundColor: '#10b981',
  },
});