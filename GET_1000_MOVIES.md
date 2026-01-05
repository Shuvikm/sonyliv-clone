# 🎬 Get 1000+ Movies & Shows - API Setup

To access **unlimited movies, TV shows, and anime**, you need a **free TMDB API key**.

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Free TMDB API Key

1. Go to **https://www.themoviedb.org/signup**
2. Create a free account
3. Go to **Settings → API** (https://www.themoviedb.org/settings/api)
4. Click **"Create"** → Select **"Developer"**
5. Fill the form (use any URL for "Application URL")
6. Copy your **API Read Access Token** (the long one starting with "eyJ...")

### Step 2: Add to Your Project

Create/edit the file `client/.env`:

```env
REACT_APP_TMDB_API_KEY=eyJhbGciOiJIUzI1NiJ9.YOUR_ACTUAL_TOKEN_HERE
```

### Step 3: Restart the App

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

---

## ✅ What You Get with TMDB API

| Content | Count | Details |
|---------|-------|---------|
| **Movies** | 500,000+ | Hollywood, Bollywood, Regional |
| **TV Series** | 100,000+ | All languages |
| **Anime** | 10,000+ | Japanese animation |
| **Real Trailers** | Automatic | YouTube trailers for all content |
| **Cast & Crew** | Full data | Directors, actors, etc. |

---

## 🎯 Without API Key (Current)

Using comprehensive fallback data:
- 60+ Movies (Hollywood, Bollywood, South Indian)
- 15+ TV Series (Indian & International)
- 20+ Anime titles
- 15+ Music videos
- 12+ Sports events

---

## 🔧 Troubleshooting

**"401 Unauthorized" error:**
- Make sure you're using the **Read Access Token**, not the "API Key"
- Token starts with "eyJ..."

**Still showing fallback data:**
- Restart the server after adding `.env`
- Check browser console for errors

---

## 📱 Alternative: Use Jikan API for Anime

For more anime, add Jikan API (free, no key required):

```javascript
// In api.js, add:
const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';
```

This gives access to **50,000+ anime** titles from MyAnimeList!
