/*
  # Schema Habit Tracker

  1. Tables principales
    - `habits`
      - `id` (uuid, clé primaire)
      - `user_id` (uuid, référence vers auth.users)
      - `title` (text, nom de l'habitude)
      - `emoji` (text, emoji représentant l'habitude)
      - `reminder_time` (time, heure de rappel)
      - `created_at` (timestamptz)
    
    - `habit_logs`
      - `id` (uuid, clé primaire)
      - `habit_id` (uuid, référence vers habits)
      - `date` (date, jour de completion)
      - `completed` (boolean, statut de completion)
      - `completed_at` (timestamptz)

  2. Relations
    - habits.user_id -> auth.users.id
    - habit_logs.habit_id -> habits.id

  3. Sécurité
    - RLS activé sur toutes les tables
    - Politiques pour que les utilisateurs ne voient que leurs données
*/

-- Créer la table habits
CREATE TABLE IF NOT EXISTS habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  emoji text DEFAULT '⭐',
  reminder_time time NOT NULL DEFAULT '09:00:00',
  created_at timestamptz DEFAULT now()
);

-- Créer la table habit_logs
CREATE TABLE IF NOT EXISTS habit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id uuid REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  UNIQUE(habit_id, date)
);

-- Activer RLS
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

-- Politiques pour habits
CREATE POLICY "Users can read their own habits"
  ON habits
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own habits"
  ON habits
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habits"
  ON habits
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habits"
  ON habits
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Politiques pour habit_logs
CREATE POLICY "Users can read their own habit logs"
  ON habit_logs
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM habits 
    WHERE habits.id = habit_logs.habit_id 
    AND habits.user_id = auth.uid()
  ));

CREATE POLICY "Users can create their own habit logs"
  ON habit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM habits 
    WHERE habits.id = habit_logs.habit_id 
    AND habits.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own habit logs"
  ON habit_logs
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM habits 
    WHERE habits.id = habit_logs.habit_id 
    AND habits.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM habits 
    WHERE habits.id = habit_logs.habit_id 
    AND habits.user_id = auth.uid()
  ));

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS habits_user_id_idx ON habits(user_id);
CREATE INDEX IF NOT EXISTS habit_logs_habit_id_idx ON habit_logs(habit_id);
CREATE INDEX IF NOT EXISTS habit_logs_date_idx ON habit_logs(date);