/*
  # Ajouter table users personnalisée

  1. Nouvelle table
    - `users`
      - `id` (uuid, clé primaire, référence vers auth.users.id)
      - `email` (text, email de l'utilisateur)
      - `full_name` (text, nom complet optionnel)
      - `avatar_url` (text, URL de l'avatar optionnel)
      - `timezone` (text, fuseau horaire de l'utilisateur)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Relations
    - users.id -> auth.users.id (1:1)

  3. Sécurité
    - RLS activé sur la table users
    - Politiques pour que les utilisateurs gèrent leur profil
    - Trigger pour créer automatiquement un profil utilisateur
*/

-- Créer la table users personnalisée
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  timezone text DEFAULT 'Europe/Paris',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activer RLS sur la table users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Politiques pour la table users
CREATE POLICY "Users can read their own profile"
  ON users FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON users FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour créer automatiquement un profil utilisateur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement un profil lors de l'inscription
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS users_created_at_idx ON users(created_at);
