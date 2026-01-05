# 🔑 API Keys Setup Guide for SonyLIV Clone

This SonyLIV clone uses multiple APIs to provide comprehensive entertainment content!

## ✅ Current Status - All Working!

| Section | Content Count | Status |
|---------|--------------|--------|
| 🎬 Movies | 25+ titles | ✅ Working |
| 📺 TV Series | 15+ shows | ✅ Working |
| 🍜 Anime | 20+ titles | ✅ Working |
| 🎵 Music | 15+ songs | ✅ Working |
| ⚽ Sports | 12+ events | ✅ Working |
| 📰 News | Dynamic | ✅ Working |

## 🚀 Quick Start (No API Keys Required)

```bash
cd c:\sony_live
npm run dev
```

**Demo Login:** `demo@sonyliv.com` / `demo123`

---

## 📡 APIs Used

### 1. TMDB API (Movies, TV, Anime)
- **Website**: https://www.themoviedb.org/documentation/api
- **Cost**: Free (rate limited)
- **Used For**: Movies, TV Series, Anime with trailers

### 2. News API
- **Website**: https://newsapi.org/
- **Cost**: Free tier (1,000 requests/day)
- **Used For**: Latest news articles

### 3. YouTube API (Videos)
- **Website**: https://developers.google.com/youtube
- **Used For**: Trailers, Music videos, Sports highlights

### 4. Jikan API (Anime)
- **Website**: https://jikan.moe/
- **Cost**: Free (no key required)
- **Used For**: Additional anime data

---

## 🔧 Optional API Configuration

Create `client/.env` file:

```env
REACT_APP_TMDB_API_KEY=your_tmdb_key
REACT_APP_NEWS_API_KEY=your_news_key
```

### Get TMDB API Key:
1. Visit https://www.themoviedb.org/
2. Create account → Settings → API
3. Request API key (free)

---

## 📦 Content Library Summary

### 🎬 Movies (25+ titles)
| Category | Examples |
|----------|----------|
| Hollywood | Avengers, Dark Knight, Inception, Oppenheimer |
| Bollywood | Jawan, Pathaan, 3 Idiots, Dangal, Animal |
| South Indian | RRR, KGF 2, Pushpa, Vikram, Kantara |

### 📺 TV Series (15+ shows)
| Category | Examples |
|----------|----------|
| Indian | Scam 1992, Family Man, Sacred Games, Mirzapur |
| International | Breaking Bad, Game of Thrones, Stranger Things |

### � Anime (20+ titles)
| Popular | Demon Slayer, Attack on Titan, One Piece, Jujutsu Kaisen |
| Classic | Death Note, Fullmetal Alchemist, Naruto, Dragon Ball |

### 🎵 Music (15+ songs)
| Genre | Artists |
|-------|---------|
| Bollywood | Arijit Singh, Pritam |
| K-Pop | BTS, BLACKPINK, NewJeans |
| Pop | Ed Sheeran, The Weeknd, Bruno Mars |
| EDM | Alan Walker, David Guetta |

### ⚽ Sports (12+ events)
| Sport | Events |
|-------|--------|
| Football | Champions League, Premier League |
| Cricket | World Cup, IPL |
| Basketball | NBA Finals |
| Racing | F1 Monaco GP |

---

## 🧪 Testing

### Search Examples:
- **Movies**: "Avengers", "Jawan", "RRR"
- **Series**: "Breaking Bad", "Mirzapur"
- **Anime**: "Demon Slayer", "Attack on Titan"
- **Music**: "BTS", "Arijit Singh"
- **Sports**: "Cricket", "NBA"

---

## 🎥 Video Playback

All content includes real YouTube trailers/videos:
- Click any content → "Play Trailer" or "Watch Now"
- Sports have highlight videos
- Music has official music videos

---

## 📱 API Functions

```javascript
// Available in client/src/services/api.js

// Movies
searchMovies(query, filters)
getContentDetails(id, type)
getMovieVideos(movieId)

// TV Series
searchTVSeries(query)
getTVVideos(tvId)

// Anime
searchAnime(query)

// Music
searchMusic(query)

// Sports
searchSports(query)

// News
searchNews(query, category)
```

---

## 🚀 Ready to Use!

The application is **fully functional** with:
- ✅ 80+ content items across all categories
- ✅ Real YouTube trailers and music videos
- ✅ Search functionality for all content
- ✅ Responsive design for all devices

No additional setup required! 🎉