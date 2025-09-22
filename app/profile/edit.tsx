import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { ArrowLeft, Save } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

const TIMEZONES = [
  { label: 'Paris', value: 'Europe/Paris' },
  { label: 'Londres', value: 'Europe/London' },
  { label: 'New York', value: 'America/New_York' },
  { label: 'Los Angeles', value: 'America/Los_Angeles' },
  { label: 'Tokyo', value: 'Asia/Tokyo' },
  { label: 'Sydney', value: 'Australia/Sydney' },
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
    const { error } = await updateProfile({ full_name: fullName.trim() || null, timezone });
    setIsSubmitting(false);

    if (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour le profil');
    } else {
      Alert.alert('Succès', 'Profil mis à jour', [{ text: 'OK', onPress: () => router.back() }]);
    }
  };

  if (loading) return <View style={styles.center}><Text>Chargement...</Text></View>;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Modifier le profil',
          headerLeft: () => <TouchableOpacity onPress={() => router.back()}><ArrowLeft size={24} /></TouchableOpacity>,
          headerRight: () => (
            <TouchableOpacity onPress={handleSave} disabled={isSubmitting}>
              <Save size={20} color={isSubmitting ? '#9ca3af' : '#3b82f6'} />
            </TouchableOpacity>
          ),
        }}
      />

      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView style={styles.content}>
          <View style={styles.form}>
            <Text style={styles.label}>Nom complet</Text>
            <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Nom complet" />
            <Text style={styles.help}>Affiché dans votre profil</Text>

            <Text style={styles.label}>Fuseau horaire</Text>
            {TIMEZONES.map((tz) => (
              <TouchableOpacity key={tz.value} onPress={() => setTimezone(tz.value)} style={[styles.timezoneOption, timezone === tz.value && styles.selected]}>
                <Text style={[styles.timezoneText, timezone === tz.value && styles.selectedText]}>{tz.label}</Text>
              </TouchableOpacity>
            ))}

            <Text style={styles.help}>Utilisé pour programmer les notifications</Text>

            <Text style={styles.label}>Email</Text>
            <TextInput style={[styles.input, styles.disabled]} value={profile?.email || ''} editable={false} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8fafc' 
  },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  content: { 
    padding: 24 
  },
  form: { 
    gap: 16 
  },
  label: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#1f2937', 
    marginBottom: 4 
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#d1d5db', 
    borderRadius: 12, 
    padding: 12, 
    backgroundColor: '#fff', 
    color: '#1f2937' 
  },
  disabled: { 
    backgroundColor: '#f3f4f6', 
    color: '#6b7280' 
  },
  help: { 
    fontSize: 12, 
    color: '#6b7280', 
    fontStyle: 'italic', 
    marginBottom: 8 
  },
  timezoneOption: { 
    padding: 12, 
    borderWidth: 1, 
    borderColor: '#d1d5db', 
    borderRadius: 12, 
    marginBottom: 4, 
    backgroundColor: '#fff' 
  },
  selected: { 
    borderColor: '#3b82f6', 
    backgroundColor: '#eff6ff' 
  },
  timezoneText: { 
    color: '#1f2937' 
  },
  selectedText: { 
    color: '#3b82f6', 
    fontWeight: '500' 
  },
});
