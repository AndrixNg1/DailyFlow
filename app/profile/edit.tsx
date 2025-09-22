import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { ArrowLeft, Save } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

const TIMEZONES = [
  { label: 'Paris (Europe/Paris)', value: 'Europe/Paris' },
  { label: 'Londres (Europe/London)', value: 'Europe/London' },
  { label: 'New York (America/New_York)', value: 'America/New_York' },
  { label: 'Los Angeles (America/Los_Angeles)', value: 'America/Los_Angeles' },
  { label: 'Tokyo (Asia/Tokyo)', value: 'Asia/Tokyo' },
  { label: 'Sydney (Australia/Sydney)', value: 'Australia/Sydney' },
];

export default function EditProfileScreen() {
  const { user } = useAuth();
  const { profile, updateProfile, loading } = useProfile(user?.id);
  
  const [fullName, setFullName] = useState('');
  const [timezone, setTimezone] = useState('Europe/Paris');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setTimezone(profile.timezone || 'Europe/Paris');
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user?.id) return;

    setIsSubmitting(true);

    const { error } = await updateProfile({
      full_name: fullName.trim() || null,
      timezone,
    });

    setIsSubmitting(false);

    if (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour le profil');
      console.error('Error updating profile:', error);
    } else {
      Alert.alert(
        'Succès',
        'Profil mis à jour avec succès !',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Modifier le profil',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color="#1f2937" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity 
              onPress={handleSave}
              disabled={isSubmitting}
              style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
            >
              <Save size={20} color={isSubmitting ? '#9ca3af' : '#3b82f6'} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.content}>
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nom complet</Text>
              <TextInput
                style={styles.textInput}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Votre nom complet (optionnel)"
                placeholderTextColor="#9ca3af"
                maxLength={100}
              />
              <Text style={styles.helpText}>
                Ce nom sera affiché dans votre profil
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.textInput, styles.disabledInput]}
                value={profile?.email || ''}
                editable={false}
                placeholderTextColor="#9ca3af"
              />
              <Text style={styles.helpText}>
                L'email ne peut pas être modifié
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Fuseau horaire</Text>
              <View style={styles.timezoneContainer}>
                {TIMEZONES.map((tz) => (
                  <TouchableOpacity
                    key={tz.value}
                    style={[
                      styles.timezoneOption,
                      timezone === tz.value && styles.timezoneOptionSelected
                    ]}
                    onPress={() => setTimezone(tz.value)}
                  >
                    <Text style={[
                      styles.timezoneText,
                      timezone === tz.value && styles.timezoneTextSelected
                    ]}>
                      {tz.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.helpText}>
                Utilisé pour programmer les notifications au bon moment
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
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
  content: {
    flex: 1,
  },
  form: {
    padding: 24,
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#1f2937',
  },
  disabledInput: {
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
  },
  helpText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  timezoneContainer: {
    gap: 8,
  },
  timezoneOption: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  timezoneOptionSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  timezoneText: {
    fontSize: 16,
    color: '#1f2937',
  },
  timezoneTextSelected: {
    color: '#3b82f6',
    fontWeight: '500',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  saveButton: {
    padding: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
});