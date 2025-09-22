import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { LogOut, Trash2 } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useHabits } from '@/hooks/useHabits';
import { useProfile } from '@/hooks/useProfile';
import { cancelAllNotifications } from '@/lib/notifications';
import { storage } from '@/lib/storage';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { habits } = useHabits(user?.id);
  const { profile, getDisplayName, getInitials } = useProfile(user?.id);

  const handleSignOut = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnecter',
          style: 'destructive',
          onPress: () => {
            (async () => {
              try {
                await cancelAllNotifications();
                await signOut();
              } catch (error) {
                console.error('Error during sign out:', error);
              }
            })();
          },
        },
      ]
    );
  };

  const handleClearCache = async () => {
    Alert.alert(
      'Vider le cache',
      'Supprime les données mises en cache localement.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Vider',
          style: 'destructive',
          onPress: async () => {
            await storage.clear();
            Alert.alert('Succès', 'Le cache a été vidé');
          },
        },
      ]
    );
  };

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Inconnu';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profil</Text>
        <Text style={styles.subtitle}>Gérez votre compte et vos préférences</Text>
      </View>

      <View style={styles.content}>
        {/* User Info */}
        <View style={styles.section}>
          <View style={styles.userCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials()}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{getDisplayName()}</Text>
              <Text style={styles.userEmail}>{profile?.email}</Text>
              <Text style={styles.memberSince}>Membre depuis {memberSince}</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mes statistiques</Text>
          <View style={styles.statsCard}>
            <Text style={styles.statNumber}>{habits.length}</Text>
            <Text style={styles.statLabel}>
              Habitude{habits.length > 1 ? 's' : ''} créée{habits.length > 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <TouchableOpacity style={styles.actionButton} onPress={handleClearCache}>
            <Trash2 size={20} color="#6b7280" />
            <Text style={styles.actionButtonTitle}>Vider le cache</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.signOutButton]} onPress={handleSignOut}>
            <LogOut size={20} color="#ef4444" />
            <Text style={[styles.actionButtonTitle, styles.signOutText]}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations</Text>
          <View style={styles.infoCard}>
            <Text style={styles.appName}>Habit Tracker</Text>
            <Text style={styles.version}>Version 1.0.0</Text>
            <Text style={styles.description}>
              Une application simple pour suivre vos habitudes quotidiennes.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  userCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
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
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 14,
    color: '#6b7280',
  },
  statsCard: {
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
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  signOutButton: {
    marginTop: 8,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonText: {
    marginLeft: 12,
    flex: 1,
  },
  actionButtonTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  signOutText: {
    color: '#ef4444',
  },
  actionButtonSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
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
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  version: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});