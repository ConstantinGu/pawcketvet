# 🐾 PawcketVet - SPRINT 1: Backend Foundation

## 📦 Contenu du Package

Ce package contient la **fondation backend complète** pour PawcketVet MVP.

### ✅ Ce qui est inclus

- 🗄️ **Base de données PostgreSQL** avec Prisma ORM
- 🔐 **Authentification JWT** complète
- 📡 **API REST** avec toutes les routes essentielles
- 👥 **Gestion des utilisateurs** et rôles
- 🏥 **Gestion des cliniques**
- 🐕 **Gestion des animaux** et propriétaires
- 📅 **Système de rendez-vous**
- 💬 **Messagerie**
- 📦 **Gestion du stock**
- 💳 **Facturation**
- 📊 **Analytics de base**

---

## 🚀 Installation Rapide

### Prérequis

Assurez-vous d'avoir installé :
- ✅ **Node.js 18+** : [nodejs.org](https://nodejs.org)
- ✅ **PostgreSQL 14+** : [postgresql.org](https://www.postgresql.org/download/)
- ✅ **Git** : [git-scm.com](https://git-scm.com)

### Étape 1 : Installer PostgreSQL

#### Sur Mac (avec Homebrew)
```bash
brew install postgresql@14
brew services start postgresql@14
```

#### Sur Windows
Téléchargez et installez depuis [postgresql.org](https://www.postgresql.org/download/windows/)

#### Sur Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Étape 2 : Créer la base de données

```bash
# Se connecter à PostgreSQL
psql postgres

# Créer la base de données
CREATE DATABASE pawcketvet;

# Créer un utilisateur
CREATE USER pawcketvet_user WITH PASSWORD 'votre_mot_de_passe';

# Donner les permissions
GRANT ALL PRIVILEGES ON DATABASE pawcketvet TO pawcketvet_user;

# Quitter
\q
```

### Étape 3 : Cloner et installer le projet

```bash
# Aller dans le dossier
cd pawcketvet-backend

# Installer les dépendances
npm install

# Copier le fichier .env
cp .env.example .env
```

### Étape 4 : Configurer .env

Éditez le fichier `.env` et modifiez :

```env
DATABASE_URL="postgresql://pawcketvet_user:votre_mot_de_passe@localhost:5432/pawcketvet?schema=public"
JWT_SECRET="votre-secret-super-securise-changez-moi"
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
```

### Étape 5 : Initialiser la base de données

```bash
# Générer le client Prisma
npx prisma generate

# Créer les tables
npx prisma db push

# Seed (données de test)
npm run db:seed
```

### Étape 6 : Démarrer le serveur

```bash
# Mode développement (avec hot reload)
npm run dev

# Mode production
npm start
```

✅ **Le serveur devrait démarrer sur http://localhost:5000**

---

## 🧪 Tester l'API

### 1. Health Check

```bash
curl http://localhost:5000/health
```

Réponse attendue :
```json
{
  "status": "OK",
  "timestamp": "2025-01-11T14:52:00.000Z",
  "environment": "development"
}
```

### 2. Créer un compte vétérinaire

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dr.martin@pawcketvet.com",
    "password": "Password123!",
    "firstName": "Sophie",
    "lastName": "Martin",
    "role": "VETERINARIAN",
    "clinicName": "Clinique Vétérinaire du Centre"
  }'
```

### 3. Se connecter

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dr.martin@pawcketvet.com",
    "password": "Password123!"
  }'
```

Vous recevrez un **token JWT** à utiliser pour les requêtes suivantes.

### 4. Récupérer les patients (authentifié)

```bash
curl -X GET http://localhost:5000/api/animals \
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

---

## 📁 Structure du Projet

```
pawcketvet-backend/
├── prisma/
│   └── schema.prisma       # Schéma de base de données
├── src/
│   ├── routes/            # Routes API
│   │   ├── auth.routes.js
│   │   ├── animal.routes.js
│   │   ├── appointment.routes.js
│   │   └── ...
│   ├── controllers/       # Logique métier
│   │   ├── auth.controller.js
│   │   ├── animal.controller.js
│   │   └── ...
│   ├── middleware/        # Middleware
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── validation.js
│   ├── utils/            # Utilitaires
│   │   ├── jwt.js
│   │   ├── password.js
│   │   └── email.js
│   ├── db/              # Database utilities
│   │   └── seed.js
│   └── server.js        # Point d'entrée
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 🔑 Authentification

L'API utilise **JWT (JSON Web Tokens)** pour l'authentification.

### Comment utiliser l'auth

1. **Login** : `POST /api/auth/login`
   - Retourne un token JWT

2. **Utiliser le token** : 
   - Ajouter le header : `Authorization: Bearer {token}`
   - Le token expire après 7 jours par défaut

3. **Roles disponibles** :
   - `ADMIN` : Accès complet
   - `VETERINARIAN` : Gestion des consultations
   - `ASSISTANT` : Accès limité
   - `OWNER` : Propriétaire d'animal (app mobile)

---

## 📡 Routes API Principales

### Auth
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/refresh` - Rafraîchir le token
- `GET /api/auth/me` - Profil utilisateur

### Animaux
- `GET /api/animals` - Liste des animaux
- `GET /api/animals/:id` - Détails d'un animal
- `POST /api/animals` - Créer un animal
- `PUT /api/animals/:id` - Modifier un animal
- `DELETE /api/animals/:id` - Supprimer un animal

### Rendez-vous
- `GET /api/appointments` - Liste des RDV
- `GET /api/appointments/:id` - Détails d'un RDV
- `POST /api/appointments` - Créer un RDV
- `PUT /api/appointments/:id` - Modifier un RDV
- `DELETE /api/appointments/:id` - Annuler un RDV

### Consultations
- `GET /api/consultations` - Liste des consultations
- `GET /api/consultations/:id` - Détails consultation
- `POST /api/consultations` - Créer consultation
- `PUT /api/consultations/:id` - Modifier consultation

### Inventaire
- `GET /api/inventory` - Liste du stock
- `GET /api/inventory/alerts` - Alertes stock faible
- `POST /api/inventory` - Ajouter un article
- `PUT /api/inventory/:id` - Modifier article
- `DELETE /api/inventory/:id` - Supprimer article

### Factures
- `GET /api/invoices` - Liste des factures
- `GET /api/invoices/:id` - Détails facture
- `POST /api/invoices` - Créer facture
- `PUT /api/invoices/:id/pay` - Marquer comme payée

### Messages
- `GET /api/messages` - Liste des messages
- `GET /api/messages/:id` - Détails message
- `POST /api/messages` - Envoyer message
- `PUT /api/messages/:id/read` - Marquer comme lu

---

## 🔧 Commandes Utiles

```bash
# Développement
npm run dev              # Démarrer avec hot reload

# Base de données
npm run db:push          # Synchroniser le schéma
npm run db:seed          # Remplir avec données de test
npm run db:studio        # Ouvrir Prisma Studio (GUI)

# Production
npm start                # Démarrer le serveur

# Prisma
npx prisma generate      # Générer le client Prisma
npx prisma migrate dev   # Créer une migration
npx prisma studio        # Interface graphique DB
```

---

## 🐛 Debug

### Le serveur ne démarre pas

1. Vérifiez que PostgreSQL tourne :
```bash
# Mac
brew services list

# Linux
sudo systemctl status postgresql

# Windows
# Vérifier dans les Services Windows
```

2. Vérifiez la connexion à la DB :
```bash
psql postgresql://pawcketvet_user:password@localhost:5432/pawcketvet
```

3. Vérifiez le fichier .env

### Erreurs Prisma

```bash
# Réinitialiser complètement
npx prisma migrate reset

# Recréer les tables
npx prisma db push

# Régénérer le client
npx prisma generate
```

---

## 📊 Données de Test

Le script `npm run db:seed` crée :

- ✅ 1 clinique vétérinaire
- ✅ 2 vétérinaires
- ✅ 1 assistant
- ✅ 5 propriétaires d'animaux
- ✅ 10 animaux (chiens et chats)
- ✅ 15 rendez-vous
- ✅ 20 articles en stock
- ✅ 10 factures

**Comptes de test** :
- Email : `dr.martin@test.com` / Password : `Test1234!`
- Email : `dr.dubois@test.com` / Password : `Test1234!`

---

## 🚀 Prochaines Étapes

Une fois que ce backend fonctionne, nous passerons à :

1. ✅ **SPRINT 2** : Connexion du frontend React
2. ✅ **SPRINT 3** : Export PDF & Certificats
3. ✅ **SPRINT 4** : QR Code & Partage
4. ✅ **SPRINT 5** : Messagerie temps réel
5. ✅ **SPRINT 6** : Rappels automatiques

---

## 💬 Feedback & Questions

Une fois que vous avez testé le backend, dites-moi :

1. ✅ Le serveur démarre-t-il correctement ?
2. ✅ Pouvez-vous créer un compte et vous connecter ?
3. ✅ Les routes API fonctionnent-elles ?
4. ✅ Y a-t-il des erreurs ?
5. 💡 Des suggestions d'amélioration ?

**Nous itérerons ensemble jusqu'à ce que tout soit parfait !** 🎯

---

## 📞 Support

En cas de problème, envoyez-moi :
- Les logs d'erreur
- Votre système d'exploitation
- La version de Node.js (`node --version`)
- La version de PostgreSQL (`psql --version`)

---

**Fait avec ❤️ pour PawcketVet** 🐾
