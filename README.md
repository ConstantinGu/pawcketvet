# PawcketVet - Plateforme de gestion veterinaire

Plateforme complete de gestion de clinique veterinaire avec double interface : **staff clinique** (veterinaires, assistants, admin) et **proprietaires d'animaux**.

## Pre-requis

- **Node.js** >= 18
- **PostgreSQL** >= 14
- **npm** >= 8

## Installation rapide

### 1. Cloner le projet

```bash
git clone <url-du-repo>
cd pawcketvet
```

### 2. Verifier que PostgreSQL tourne

```bash
# Verifier le statut
pg_isready

# Si "accepting connections" -> OK
# Si "no response" -> demarrer PostgreSQL :
# Linux (systemd) :
sudo systemctl start postgresql

# Linux (pg_ctlcluster) :
sudo pg_ctlcluster 16 main start

# macOS (Homebrew) :
brew services start postgresql@16

# Windows : demarrer le service "postgresql" dans services.msc
```

### 3. Creer la base de donnees

```bash
# Se connecter a PostgreSQL et creer la base
psql -U postgres -c "CREATE DATABASE pawcketvet;"

# Si l'utilisateur postgres n'a pas de mot de passe :
sudo -u postgres psql -c "CREATE DATABASE pawcketvet;"

# (Optionnel) Creer un utilisateur dedie :
sudo -u postgres psql -c "CREATE USER pawcketvet WITH PASSWORD 'pawcketvet'; GRANT ALL ON DATABASE pawcketvet TO pawcketvet;"
```

### 4. Configurer le backend

```bash
cd pawcketvet-backend

# Creer le fichier .env
cp .env.example .env
```

Editer le fichier `.env` avec vos identifiants PostgreSQL :

```env
# OBLIGATOIRE - adapter selon votre config PostgreSQL
DATABASE_URL="postgresql://postgres:votre_mot_de_passe@localhost:5432/pawcketvet?schema=public"

# ou si vous avez cree un utilisateur dedie :
DATABASE_URL="postgresql://pawcketvet:pawcketvet@localhost:5432/pawcketvet?schema=public"

# OBLIGATOIRE - changer en production
JWT_SECRET="mon-secret-jwt-a-changer"

# Le reste peut garder les valeurs par defaut
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
```

### 5. Installer les dependances et initialiser la base

```bash
# Installer les dependances backend
npm install

# Creer les tables dans PostgreSQL (via Prisma)
npm run db:push

# Remplir la base avec des donnees de demo
npm run db:seed
```

Le seed cree automatiquement tous les comptes de test (voir section "Comptes de demo").

### 6. Lancer le backend

```bash
npm run dev
```

Le serveur demarre sur **http://localhost:5000**.
Vous devriez voir : `Serveur PawcketVet demarre sur le port 5000`.

### 7. Lancer le frontend (dans un 2e terminal)

```bash
cd pawcketvet-frontend

# Installer les dependances
npm install

# Lancer le frontend
npm start
```

L'application s'ouvre sur **http://localhost:3000**.

## Comptes de demo

Mot de passe pour tous les comptes : **`Test1234!`**

### Staff clinique (interface veterinaire)

| Role | Email | Acces |
|------|-------|-------|
| Admin | `admin@vetopaws.fr` | Acces complet + parametres clinique |
| Veterinaire | `vet@vetopaws.fr` | Dashboard, patients, RDV, medical, stats |
| Assistant | `assistant@vetopaws.fr` | Dashboard, patients, RDV, messages |

### Proprietaires (interface client)

| Nom | Email | Animaux |
|-----|-------|---------|
| Lucas Bernard | `client@test.fr` | Max (Golden Retriever), Luna (Chat Europeen) |
| Claire Petit | `claire@test.fr` | Rocky (Bouledogue), Noisette (Lapin) |

## Donnees de demo incluses

Le seed cree un jeu de donnees complet :

- 1 clinique avec horaires d'ouverture
- 3 membres du staff + 2 proprietaires
- 4 animaux (2 chiens, 1 chat, 1 lapin)
- 5 vaccinations avec dates de rappel
- 3 rendez-vous (dont 2 aujourd'hui)
- 1 consultation avec examen clinique
- 8 articles en stock (dont 1 en alerte stock bas)
- 2 factures (1 payee, 1 en attente)
- 5 notifications, 2 messages

## Commandes utiles

```bash
# --- BACKEND (dans pawcketvet-backend/) ---

npm run dev          # Lancer en mode developpement (hot reload)
npm run start        # Lancer en mode production
npm run db:push      # Appliquer le schema Prisma a la BDD
npm run db:seed      # Remplir la BDD avec les donnees de demo
npm run db:studio    # Ouvrir Prisma Studio (interface BDD visuelle)

# --- FRONTEND (dans pawcketvet-frontend/) ---

npm start            # Lancer en mode developpement
npm run build        # Build de production
npm test             # Lancer les tests
```

## Reinitialiser la base de donnees

Si vous voulez repartir de zero :

```bash
cd pawcketvet-backend

# Supprimer et recreer toutes les tables
npx prisma db push --force-reset

# Relancer le seed
npm run db:seed
```

## Architecture technique

```
pawcketvet/
├── pawcketvet-backend/          # API Express.js
│   ├── prisma/
│   │   └── schema.prisma        # Schema de la base de donnees (23 modeles)
│   └── src/
│       ├── server.js            # Point d'entree (18 routes montees)
│       ├── controllers/         # 13 controllers
│       ├── routes/              # 18 fichiers de routes
│       ├── middleware/          # Auth JWT
│       └── db/seed.js           # Donnees de demo
│
├── pawcketvet-frontend/         # React 19
│   └── src/
│       ├── App.js               # Routes + protection par role
│       ├── components/
│       │   ├── Layout.js        # Sidebar veterinaire (11 pages)
│       │   └── ClientLayout.js  # Sidebar proprietaire (9 pages)
│       ├── contexts/
│       │   └── AuthContext.js    # Authentification JWT
│       ├── pages/               # 22 pages
│       └── services/
│           └── api.js           # Client Axios (13 modules API)
│
└── README.md
```

## Stack technique

| Couche | Technologies |
|--------|-------------|
| Frontend | React 19, React Router v7, TanStack React Query, react-hot-toast, lucide-react |
| Backend | Node.js, Express.js, Prisma ORM |
| Base de donnees | PostgreSQL |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Style | Inline styles, design system terracotta (#B8704F) |

## Fonctionnalites

### Interface veterinaire
- Tableau de bord avec indicateurs cles
- Gestion des patients (dossier medical complet)
- Calendrier de rendez-vous
- Ordonnances et certificats
- Gestion du stock avec alertes
- Facturation et paiements
- Messagerie avec proprietaires
- Gestion d'equipe
- Statistiques et analytics
- Parametres clinique

### Interface proprietaire
- Tableau de bord avec rappels vaccins
- Mes animaux (profils detailles)
- Prise de RDV en 4 etapes
- SOS Triage veterinaire d'urgence
- Messages avec la clinique
- Documents et certificats
- Historique des paiements
- Rappels de vaccinations

## Depannage

**`ECONNREFUSED` sur le frontend**
Le backend ne tourne pas. Verifier qu'il est lance sur le port 5000.

**`P1001: Can't reach database server`**
PostgreSQL n'est pas demarre ou le `DATABASE_URL` est incorrect.

**`Unique constraint failed`** lors du seed
La base contient deja des donnees. Faire `npx prisma db push --force-reset` puis relancer le seed.

**Le frontend ne se lance pas sur le port 3000**
Un autre processus utilise le port. React proposera le port 3001 automatiquement. Il faut alors aussi mettre a jour `FRONTEND_URL` dans `.env`.
