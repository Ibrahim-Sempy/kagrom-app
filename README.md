# KAGROM SARLU

Application complete de gestion integree pour KAGROM SARLU, construite avec Next.js, Prisma et PostgreSQL.

## Modules inclus

- Authentification securisee par email/mot de passe avec roles.
- Gestion des apprenants.
- Gestion des formations, sessions, inscriptions et notes.
- Generation de certificats avec QR Code de verification.
- Generation de badges imprimables.
- Gestion des prestations de services et des missions.
- Facturation, paiements, recus et historique comptable simplifie.
- Administration des utilisateurs et changement de mot de passe.

## Pile technique

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- Prisma ORM
- PostgreSQL
- Sessions JWT signees avec `jose`

## Installation

1. Copier les variables d'environnement :

```bash
cp .env.example .env
```

Sous Windows PowerShell :

```powershell
Copy-Item .env.example .env
```

2. Renseigner `DATABASE_URL`, `AUTH_SECRET` et `NEXT_PUBLIC_APP_URL` dans `.env`.
3. Installer les dependances :

```bash
npm install
```

4. Generer le client Prisma puis pousser le schema :

```bash
npm run db:generate
npm run db:push
```

5. Charger les donnees de demonstration :

```bash
npm run db:seed
```

6. Lancer l'application :

```bash
npm run dev
```

## PostgreSQL local via Docker

Si vous voulez une base locale prete rapidement :

```bash
docker compose up -d
```

Le `docker-compose.yml` fourni expose PostgreSQL sur `localhost:5432` avec les valeurs deja prevues dans `.env.example`.

## Compte initial

- Email : `admin@kagrom.com`
- Mot de passe : `Kagrom2026!`

## Routes principales

- `/connexion`
- `/dashboard`
- `/dashboard/apprenants`
- `/dashboard/formations`
- `/dashboard/prestations`
- `/dashboard/finances`
- `/dashboard/certificats`
- `/dashboard/parametres`

## Verification des certificats

Le QR Code pointe vers :

- `/verification/[verificationCode]` pour une verification visuelle
- `/api/certificates/verify/[verificationCode]` pour une verification JSON

## Remarques

- Les badges, certificats et recus sont optimises pour l'impression.
- La charte graphique reprend les dominantes vert/or et le style des documents fournis.
- Le projet est pret a etre branche sur une base PostgreSQL locale ou distante.
