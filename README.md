# Habit Tracker - Application Mobile

Une application mobile élégante pour suivre vos habitudes quotidiennes, développée avec Expo et Supabase.

## 🚀 Fonctionnalités

- ✅ **Gestion des habitudes** : Créez, modifiez et supprimez vos habitudes
- 🔔 **Notifications push** : Rappels quotidiens personnalisés
- 📊 **Statistiques détaillées** : Suivez vos progrès et séries
- 🔄 **Synchronisation** : Données sauvegardées en ligne avec cache offline
- 🔐 **Authentification sécurisée** : Connexion via Supabase Auth
- 📱 **Interface moderne** : Design minimaliste et intuitive

## 🛠 Technologies utilisées

- **Frontend** : React Native avec Expo
- **Backend** : Supabase (base de données + authentification)
- **Navigation** : Expo Router
- **Notifications** : Expo Notifications
- **Cache local** : AsyncStorage
- **Icônes** : Lucide React Native

## 📋 Installation

### Prérequis

1. **Node.js** (version 18 ou plus récente)
2. **Compte Supabase** : [Créer un compte](https://supabase.com)
3. **Expo CLI** : `npm install -g @expo/cli`

### Configuration

1. **Cloner le projet** ou télécharger les fichiers

2. **Installer les dépendances** :
   ```bash
   npm install
   ```

3. **Configurer Supabase** :
   - Créez un nouveau projet sur [Supabase](https://app.supabase.com)
   - Copiez l'URL et la clé anonyme de votre projet
   - Créez un fichier `.env` basé sur `.env.example` :
     ```
     EXPO_PUBLIC_SUPABASE_URL=votre_url_supabase
     EXPO_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anonyme
     ```

4. **Appliquer les migrations** :
   - Dans votre tableau de bord Supabase, allez dans "SQL Editor"
   - Copiez et exécutez le contenu du fichier `supabase/migrations/create_habits_schema.sql`

## 🚀 Lancement

### Mode développement
```bash
npm run dev
```

### Build pour production
```bash
npm run build:web
```

## 📱 Utilisation

1. **Première utilisation** :
   - Créez un compte ou connectez-vous
   - L'application demandera les permissions de notification

2. **Créer une habitude** :
   - Onglet "Ajouter"
   - Saisir le nom, choisir un emoji et définir l'heure de rappel

3. **Suivre les habitudes** :
   - Onglet "Accueil" pour cocher les habitudes du jour
   - Les séries et statistiques se mettent à jour automatiquement

4. **Consulter les progrès** :
   - Onglet "Statistiques" pour voir les graphiques et encouragements

## 🗄 Structure de la base de données

### Table `users` (profils utilisateurs)
```sql
id (uuid, PK, FK -> auth.users.id)
email (text)
full_name (text, nullable)
avatar_url (text, nullable)
timezone (text, default: 'Europe/Paris')
created_at (timestamptz)
updated_at (timestamptz)
```

### Table `habits`
```sql
id (uuid, PK)
user_id (uuid, FK -> users.id)
title (text)
emoji (text)
reminder_time (time)
created_at (timestamptz)
```

### Table `habit_logs`
```sql
id (uuid, PK)
habit_id (uuid, FK -> habits.id)
date (date)
completed (boolean)
completed_at (timestamptz)
```

## 🔒 Sécurité

- **Row Level Security (RLS)** activé sur toutes les tables
- **Politiques de sécurité** : Chaque utilisateur ne voit que ses données
- **Authentification** : Gérée par Supabase Auth
- **Profils automatiques** : Création automatique du profil utilisateur lors de l'inscription
- **Validation côté client et serveur**

## 📦 Architecture du projet

```
app/
├── (tabs)/                 # Navigation par onglets
│   ├── index.tsx          # Écran d'accueil
│   ├── add.tsx            # Création d'habitudes
│   ├── stats.tsx          # Statistiques
│   └── profile.tsx        # Profil utilisateur
├── auth/                  # Authentification
│   ├── login.tsx          # Connexion
│   └── register.tsx       # Inscription
└── _layout.tsx            # Layout racine

hooks/                     # Hooks personnalisés
├── useAuth.ts            # Gestion authentification
├── useProfile.ts         # Gestion profil utilisateur
├── useHabits.ts          # Gestion habitudes
└── useHabitLogs.ts       # Gestion logs

lib/                      # Utilitaires
├── supabase.ts          # Client Supabase
├── storage.ts           # Cache local
└── notifications.ts     # Notifications push

supabase/
└── migrations/          # Scripts SQL
    ├── create_habits_schema.sql
    └── add_users_table.sql
```

## 🌐 Fonctionnement Offline

- **Cache local** avec AsyncStorage
- **Synchronisation automatique** quand la connexion revient
- **Interface réactive** même sans connexion
- **Gestion des conflits** lors de la sync

## 🔔 Notifications

- **Notifications locales** programmées selon les habitudes
- **Rappels quotidiens** à l'heure choisie
- **Gestion des permissions** automatique
- **Annulation** lors de la suppression d'habitudes

## 🎨 Personnalisation

### Couleurs principales
- **Primaire** : `#3B82F6` (Bleu)
- **Succès** : `#10B981` (Vert)
- **Fond** : `#F8FAFC` (Gris clair)
- **Cartes** : `#FFFFFF` (Blanc)

### Emojis disponibles
30 emojis prédéfinis pour représenter vos habitudes (sport, lecture, méditation, etc.)

## 🐛 Dépannage

### Problèmes courants

1. **Erreur de connexion Supabase** :
   - Vérifiez vos variables d'environnement
   - Confirmez que les migrations ont été appliquées

2. **Notifications ne fonctionnent pas** :
   - Vérifiez les permissions sur l'appareil
   - Les notifications ne fonctionnent pas sur le web

3. **Données non synchronisées** :
   - Vérifiez votre connexion internet
   - Consultez les logs dans la console

### Logs de débogage
Les erreurs sont loggées dans la console. Activez le mode debug avec :
```bash
EXPO_DEBUG=1 npm run dev
```

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Signaler des bugs
- Proposer des améliorations
- Soumettre des pull requests

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

**Développé avec ❤️par Andrix Ng en utilisant Expo et Supabase**