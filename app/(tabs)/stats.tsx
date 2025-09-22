import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useHabits } from '@/hooks/useHabits';
import { useHabitLogs } from '@/hooks/useHabitLogs';

const { width } = Dimensions.get('window');

export default function StatsScreen() {
  const { user } = useAuth();
  const { habits, loading: habitsLoading } = useHabits(user?.id);
  const { 
    getHabitStreak, 
    getWeeklyStats,
    loading: logsLoading 
  } = useHabitLogs(user?.id);

  if (habitsLoading || logsLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  const totalHabits = habits.length;
  const habitsWithStats = habits.map(habit => ({
    ...habit,
    streak: getHabitStreak(habit.id),
    weeklyStats: getWeeklyStats(habit.id),
  }));

  const totalWeeklyCompleted = habitsWithStats.reduce(
    (sum, habit) => sum + habit.weeklyStats.completed, 0
  );
  const totalWeeklyPossible = totalHabits * 7;
  const weeklyPercentage = totalWeeklyPossible > 0 
    ? Math.round((totalWeeklyCompleted / totalWeeklyPossible) * 100)
    : 0;

  const longestStreak = Math.max(0, ...habitsWithStats.map(h => h.streak));
  const activeStreaks = habitsWithStats.filter(h => h.streak > 0).length;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Statistiques</Text>
        <Text style={styles.subtitle}>
          Suivez votre progression et vos réussites
        </Text>
      </View>

      <View style={styles.content}>
        {habits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>📊</Text>
            <Text style={styles.emptyStateTitle}>Aucune statistique</Text>
            <Text style={styles.emptyStateText}>
              Créez des habitudes pour voir vos statistiques apparaître ici
            </Text>
          </View>
        ) : (
          <>
            {/* Vue d'ensemble */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Vue d'ensemble</Text>
              <View style={styles.overviewGrid}>
                <View style={styles.overviewCard}>
                  <Text style={styles.overviewNumber}>{totalHabits}</Text>
                  <Text style={styles.overviewLabel}>
                    Habitude{totalHabits > 1 ? 's' : ''}
                  </Text>
                </View>
                <View style={styles.overviewCard}>
                  <Text style={styles.overviewNumber}>{weeklyPercentage}%</Text>
                  <Text style={styles.overviewLabel}>Cette semaine</Text>
                </View>
                <View style={styles.overviewCard}>
                  <Text style={styles.overviewNumber}>{longestStreak}</Text>
                  <Text style={styles.overviewLabel}>Plus longue série</Text>
                </View>
                <View style={styles.overviewCard}>
                  <Text style={styles.overviewNumber}>{activeStreaks}</Text>
                  <Text style={styles.overviewLabel}>Séries actives</Text>
                </View>
              </View>
            </View>

            {/* Détails par habitude */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Détails par habitude</Text>
              {habitsWithStats.map(habit => (
                <View key={habit.id} style={styles.habitStatsCard}>
                  <View style={styles.habitStatsHeader}>
                    <Text style={styles.habitStatsEmoji}>{habit.emoji}</Text>
                    <Text style={styles.habitStatsTitle}>{habit.title}</Text>
                  </View>
                  
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>{habit.streak}</Text>
                      <Text style={styles.statLabel}>Série actuelle</Text>
                    </View>
                    
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>
                        {habit.weeklyStats.completed}/7
                      </Text>
                      <Text style={styles.statLabel}>Cette semaine</Text>
                    </View>
                    
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>
                        {habit.weeklyStats.percentage}%
                      </Text>
                      <Text style={styles.statLabel}>Taux de réussite</Text>
                    </View>
                  </View>

                  {/* Barre de progression hebdomadaire */}
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { width: `${habit.weeklyStats.percentage}%` }
                        ]} 
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Conseils et encouragements */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Encouragements</Text>
              <View style={styles.encouragementCard}>
                {weeklyPercentage >= 80 ? (
                  <>
                    <Text style={styles.encouragementEmoji}>🎉</Text>
                    <Text style={styles.encouragementTitle}>Excellent travail !</Text>
                    <Text style={styles.encouragementText}>
                      Vous maintenez un taux de réussite de {weeklyPercentage}% cette semaine. 
                      Continuez comme ça !
                    </Text>
                  </>
                ) : weeklyPercentage >= 50 ? (
                  <>
                    <Text style={styles.encouragementEmoji}>👍</Text>
                    <Text style={styles.encouragementTitle}>Bon progrès</Text>
                    <Text style={styles.encouragementText}>
                      Vous êtes à {weeklyPercentage}% cette semaine. 
                      Quelques efforts supplémentaires et vous y êtes !
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.encouragementEmoji}>💪</Text>
                    <Text style={styles.encouragementTitle}>Nouvelle semaine, nouveau départ</Text>
                    <Text style={styles.encouragementText}>
                      Chaque jour est une nouvelle opportunité. 
                      Concentrez-vous sur une habitude à la fois !
                    </Text>
                  </>
                )}
              </View>
            </View>
          </>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  overviewCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: (width - 60) / 2, // 2 colonnes avec marges
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  overviewNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  habitStatsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  habitStatsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  habitStatsEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  habitStatsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 3,
  },
  encouragementCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  encouragementEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  encouragementTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  encouragementText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});