import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useHabits } from '@/hooks/useHabits';

const EMOJI_OPTIONS = [
  '💪', '🏃', '📚', '💧', '🧘', '🍎', '💤', '🚶', '📝', '🎵',
  '🎨', '💻', '📱', '🧹', '🌱', '☕', '🥗', '🍵', '📖', '✍️',
  '🎯', '💡', '🔥', '⭐', '🌟', '🎉', '🚀', '💎', '🏆', '👑',
];

export default function AddHabitScreen() {
  const { user } = useAuth();
  const { createHabit } = useHabits(user?.id);
  
  const [title, setTitle] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('⭐');
  const [reminderTime, setReminderTime] = useState('09:00');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un nom pour votre habitude');
      return;
    }

    if (!user?.id) {
      Alert.alert('Erreur', 'Vous devez être connecté pour créer une habitude');
      return;
    }

    setIsSubmitting(true);

    const { error } = await createHabit({
      title: title.trim(),
      emoji: selectedEmoji,
      reminder_time: reminderTime + ':00',
    });

    setIsSubmitting(false);

    if (error) {
      Alert.alert('Erreur', 'Impossible de créer l\'habitude');
      console.error('Error creating habit:', error);
    } else {
      Alert.alert(
        'Succès',
        'Habitude créée avec succès !',
        [
          {
            text: 'OK',
            onPress: () => {
              setTitle('');
              setSelectedEmoji('⭐');
              setReminderTime('09:00');
              router.push('/(tabs)/');
            }
          }
        ]
      );
    }
  };

  const formatTimeDisplay = (time: string) => {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  const handleTimeChange = (value: string) => {
    // Validation simple pour le format HH:MM
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (timeRegex.test(value) || value.length <= 5) {
      setReminderTime(value);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nouvelle habitude</Text>
        <Text style={styles.subtitle}>
          Créez une nouvelle habitude à suivre quotidiennement
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nom de l'habitude</Text>
          <TextInput
            style={styles.textInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Ex: Faire du sport, Lire un livre..."
            placeholderTextColor="#9ca3af"
            maxLength={50}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Choisir un emoji</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.emojiScrollView}
            contentContainerStyle={styles.emojiContainer}
          >
            {EMOJI_OPTIONS.map((emoji) => (
              <TouchableOpacity
                key={emoji}
                style={[
                  styles.emojiButton,
                  selectedEmoji === emoji && styles.emojiButtonSelected
                ]}
                onPress={() => setSelectedEmoji(emoji)}
              >
                <Text style={styles.emojiText}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Heure de rappel</Text>
          <TextInput
            style={styles.textInput}
            value={reminderTime}
            onChangeText={handleTimeChange}
            placeholder="09:00"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
            maxLength={5}
          />
          <Text style={styles.helpText}>
            Format 24h (ex: 09:00 pour 9h00, 14:30 pour 14h30)
          </Text>
        </View>

        <View style={styles.preview}>
          <Text style={styles.previewLabel}>Aperçu:</Text>
          <View style={styles.previewCard}>
            <Text style={styles.previewEmoji}>{selectedEmoji}</Text>
            <View style={styles.previewContent}>
              <Text style={styles.previewTitle}>
                {title || 'Nom de l\'habitude'}
              </Text>
              <Text style={styles.previewTime}>
                Rappel: {formatTimeDisplay(reminderTime)}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            (!title.trim() || isSubmitting) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={!title.trim() || isSubmitting}
        >
          <Text style={[
            styles.submitButtonText,
            (!title.trim() || isSubmitting) && styles.submitButtonTextDisabled
          ]}>
            {isSubmitting ? 'Création...' : 'Créer l\'habitude'}
          </Text>
        </TouchableOpacity>
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
    lineHeight: 24,
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
  helpText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  emojiScrollView: {
    maxHeight: 80,
  },
  emojiContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 8,
  },
  emojiButton: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiButtonSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  emojiText: {
    fontSize: 28,
  },
  preview: {
    gap: 12,
  },
  previewLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  previewCard: {
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
  previewEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  previewContent: {
    flex: 1,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  previewTime: {
    fontSize: 14,
    color: '#6b7280',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  submitButtonTextDisabled: {
    color: '#9ca3af',
  },
});