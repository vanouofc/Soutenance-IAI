# API Soutenances IAI

API REST de collecte des frais de soutenance pour l'**Institut Africain d'Informatique (IAI) – Centre d'Excellence Technologique Paul Biya**. Permet aux étudiants de payer leurs frais via Mobile Money (Orange Money & MTN Mobile Money), de recevoir un email de confirmation et de télécharger une photo.

## Fonctionnalités

- Paiement Mobile Money (Orange/MTN) via l'API MeSomb
- Envoi d'email de confirmation avec récapitulatif du paiement (via Resend)
- Upload de photo avec validation (formats, taille)
- Authentification et gestion des administrateurs (JWT)
- Recherche et filtrage des paiements (nom, matricule, classe, filière, niveau)
- Soft delete des utilisateurs et paiements
- Documentation Swagger intégrée
- Sécurité : rate limiting, détection de bots, protection SQL (Arcjet)

## Tech Stack

| Technologie       | Rôle                     |
|-------------------|--------------------------|
| Node.js / Express | Framework backend        |
| MongoDB / Mongoose| Base de données          |
| JWT / bcryptjs    | Authentification         |
| MeSomb SDK        | Paiement Mobile Money    |
| Resend            | Envoi d'emails           |
| Arcjet            | Sécurité (rate limiting) |
| Multer            | Upload de fichiers       |
| Swagger           | Documentation API        |

## Installation

```bash
git clone <votre-repo>
cd Soutenances
npm install
```

## Configuration

Copiez le fichier `.env.example` vers `.env` et renseignez les variables :

```env
# PORT & CORS
CORS_ORIGIN = http://localhost:3000
PORT = 3000

# DATABASE
DB_URL = votre_url_mongodb

# MESOMB API
ACCESS_KEY = votre_access_key
SECRET_KEY = votre_secret_key
APP_KEY = votre_app_key

# JWT CONFIG
JWT_SECRET = votre_secret_jwt
JWT_EXPIRE_IN = 30m

# RESEND
RESEND_API_KEY = votre_api_key_resend
FROM = email_expediteur

# ARCTET
ARCJET_KEY = votre_cle_arcjet
ARCJET_ENV = development
```

## Démarrage

```bash
npm start
```

L'API est accessible sur `http://localhost:3000`. La documentation Swagger est disponible sur `/api-docs`.

## Scripts

| Commande           | Description                    |
|--------------------|--------------------------------|
| `npm start`        | Lance le serveur avec nodemon  |
| `npm run swagger`  | Génère la spec Swagger         |

## Aperçu des endpoints

### Paiements (`/buy-it`)
| Méthode | Route             | Auth     | Description                     |
|---------|-------------------|----------|---------------------------------|
| POST    | `/buy-it/`        | Non      | Initier un paiement Mobile Money|
| GET     | `/buy-it/`        | JWT      | Lister tous les paiements       |
| GET     | `/buy-it/:id`     | JWT      | Détail d'un paiement            |
| DELETE  | `/buy-it/:id`     | JWT      | Supprimer (soft) un paiement    |
| GET     | `/buy-it/search/:field` | JWT | Rechercher des paiements      |

### Utilisateurs (`/utilisateurs`)
| Méthode | Route                          | Auth | Description                    |
|---------|--------------------------------|------|--------------------------------|
| POST    | `/utilisateurs/`               | Non  | Créer un compte administrateur |
| POST    | `/utilisateurs/signin`         | Non  | Connexion                      |
| POST    | `/utilisateurs/signout`        | Non  | Déconnexion                    |
| GET     | `/utilisateurs/get-session`    | JWT  | Vérifier la session            |

### Photos (`/photos`)
| Méthode | Route              | Auth       | Description         |
|---------|--------------------|------------|---------------------|
| POST    | `/photos/upload`   | JWT (paiement)| Uploader une photo|

## Structure du projet

```
├── app.js                     # Point d'entrée
├── config/                    # Configuration (DB, Multer, Arcjet, Resend)
├── controllers/               # Contrôleurs Express
├── error/                     # Classes d'erreur métier
├── middlewares/               # Middlewares (auth, erreur, arcjet)
├── models/                    # Modèles Mongoose
├── routes/                    # Définition des routes
├── services/                  # Logique métier
├── uploads/photos/            # Dossier d'upload
└── swagger-output.json        # Spécification OpenAPI
```

## Auteur

Projet développé pour l'IAI – Centre d'Excellence Technologique Paul Biya.
