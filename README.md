# SongCheck!
<img width="375" height="669" alt="Capture d’écran 2026-04-08 à 18 51 04" src="https://github.com/user-attachments/assets/ec2d18f4-e221-4e33-a2c8-74640dde2b8f" />

<img width="350" height="620" alt="Capture d’écran 2026-04-08 à 15 33 33" src="https://github.com/user-attachments/assets/cb3f7cd4-0230-47d9-abdb-57abab6feb91" />

<img width="349" height="621" alt="Capture d’écran 2026-04-08 à 15 33 41" src="https://github.com/user-attachments/assets/d4a0501b-93b4-402f-89b3-5c57ee8cfafd" />

SongCheck! est mon projet **fullstack** autour de la musique : l'utilisateur construit une liste de morceaux/artistes, puis une IA analyse sa vibe musicale.

Ce projet a une valeur speciale pour moi :
- je l'ai apprehende et construit avec l'aide d'un **agent IA**
- c'est mon **premier projet en Python**

## Objectif du projet

Proposer une experience simple et visuelle pour :
- saisir une playlist (titres + artistes)
- lancer une analyse IA
- obtenir un **Genre Dominant**
- obtenir un **Energy Score** (0 a 100)
- recevoir **3 artistes similaires**

## Stack technique

### Frontend
- **Next.js** (App Router)
- **React**
- **TypeScript**
- **Tailwind CSS**
- **Lucide React** (icones)

### Backend
- **Python** (version recente / derniere version stable recommandee)
- **FastAPI**
- **Uvicorn**
- **python-dotenv**
- **Groq API** (analyse IA)

## Architecture

Le repo est organise en monorepo simple :

```text
SongCheck-Project/
  backend/   # API FastAPI + logique IA
  frontend/  # app Next.js / React
```

## Fonctionnalites principales

- Landing page "SongCheck!" avec CTA central
- Dashboard dark/glassmorphism avec accents orange
- Saisie utilisateur des musiques/artistes
- Auto-completion sur la saisie
- Normalisation du format `Artiste - Titre`
- Limite configurable du nombre de morceaux (5 / 10 / 15)
- Appel API FastAPI vers `/analyze`
- Affichage du resultat IA (genre, score energie, recommandations)

## API Backend

### `POST /analyze`
Requete JSON :

```json
{
  "songs": [
    "Nirvana - Smells Like Teen Spirit",
    "Linkin Park - Numb"
  ]
}
```

Reponse JSON :

```json
{
  "genre_dominant": "Alternative Rock",
  "energy_score": 78,
  "similar_artists": ["Foo Fighters", "Paramore", "Muse"]
}
```

## Lancement en local

### 1) Backend

```bash
cd "backend"
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### 2) Frontend

```bash
cd "frontend"
npm install
npm run dev
```

Frontend : [http://localhost:3000](http://localhost:3000)  
Backend : [http://127.0.0.1:8000](http://127.0.0.1:8000)

## Variables d'environnement

Dans `backend/.env` :

```env
GROQ_API_KEY=your_key_here
```

## A propos de ce projet

Ce projet m'a permis de :
- decouvrir Python via FastAPI
- comprendre l'integration d'un service IA (Groq) dans une API
- relier un frontend moderne (Next.js/React) a un backend Python
- apprendre a structurer un projet fullstack proprement
