# Sony Live Clone

A modern streaming platform clone built with React.js and MongoDB, featuring real-time content search using external APIs.

## Features

### 🎬 **Real API Integration**
- **Movies**: OMDB API for movie search and details
- **News**: News API for latest articles and updates.
- **TV Shows**: TV Maze API for series and episodes
- **Sports**: Enhanced sports content with live event tracking

### 🎯 **Advanced Search & Filtering**
- Real-time search with debouncing
- Language filters (English, Hindi, Tamil, Telugu, etc.)
- Genre-based filtering
- Year and category filters
- Search suggestions for popular content

### 🎨 **Modern UI/UX**
- Responsive design for all devices
- Beautiful card-based layouts
- Smooth animations and transitions
- Loading states and error handling
- Search suggestions and popular tags

### 🔐 **Authentication System**
- User registration and login
- JWT token-based authentication
- Protected routes
- User profile management

### 📱 **Content Management**
- Movie details with cast, director, ratings
- TV show episodes and seasons
- Live sports events
- News articles with categories
- Content recommendations

## Tech Stack

### Frontend
- **React.js** - UI framework
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Icons** - Icon library
- **CSS3** - Styling

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing

### External APIs
- **OMDB API** - Movie database
- **News API** - News articles
- **TV Maze API** - TV shows
- **Sports APIs** - Live sports data

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- API keys for external services

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sony_live
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   npm install
   
   # Install frontend dependencies
   cd client
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # In the root directory, create .env
   MONGODB_URI=mongodb://localhost:27017/sony_live
   JWT_SECRET=your_jwt_secret_here
   PORT=5000
   
   # In the client directory, create .env (optional)
   REACT_APP_OMDB_API_KEY=your_omdb_api_key
   REACT_APP_NEWS_API_KEY=your_news_api_key
   REACT_APP_SPORTS_API_KEY=your_sports_api_key
   ```

4. **Set up API keys**
   - Get OMDB API key from: http://www.omdbapi.com/
   - Get News API key from: https://newsapi.org/
   - Get Sports API key from: https://www.api-football.com/
   - Update `client/src/services/api.js` with your keys

5. **Start the development servers**
   ```bash
   # Start backend server (from root directory)
   npm run dev
   
   # Start frontend server (from client directory)
   cd client
   npm start
   ```

6. **Seed the database**
   ```bash
   # From root directory
   npm run seed
   ```

## API Setup

For detailed API setup instructions, see [API_SETUP.md](./API_SETUP.md)

### Quick API Configuration
1. Get free API keys from the respective services
2. Update the API keys in `client/src/services/api.js`
3. Test the APIs by searching for content in the app

## Usage

### Movies
- Search for any movie using OMDB API
- Filter by language, genre, and year
- View detailed movie information
- Get cast, director, and ratings

### News
- Search for latest news articles
- Filter by category (Technology, Politics, Sports, etc.)
- Real-time news updates

### TV Shows
- Search for TV series using TV Maze API
- View episode information and seasons
- Get show details and cast

### Sports
- View live sports events
- Filter by sport type
- Get match details and venues

## Project Structure

```
sony_live/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── ...
│   └── package.json
├── server/                # Node.js backend
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   └── index.js
├── API_SETUP.md          # API configuration guide
└── README.md
```

## Features in Detail

### Search Functionality
- **Debounced Search**: Prevents excessive API calls
- **Real-time Results**: Instant search results
- **Search Suggestions**: Popular search terms
- **Filter Combinations**: Multiple filter support

### Content Display
- **Responsive Grid**: Adapts to screen size
- **Content Cards**: Beautiful movie/show cards
- **Detail Pages**: Comprehensive content information
- **Image Fallbacks**: Handles missing images gracefully

### User Experience
- **Loading States**: Smooth loading indicators
- **Error Handling**: Graceful error messages
- **Navigation**: Intuitive browsing experience
- **Mobile Friendly**: Optimized for mobile devices

## API Endpoints

### Backend APIs
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/content/movies` - Get movies
- `GET /api/content/news` - Get news
- `GET /api/content/serials` - Get TV shows
- `GET /api/content/sports` - Get sports

### External APIs
- **OMDB**: Movie search and details
- **News API**: News articles
- **TV Maze**: TV show information
- **Sports APIs**: Live sports data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
1. Check the [API_SETUP.md](./API_SETUP.md) for API configuration
2. Review the troubleshooting section
3. Check browser console for errors
4. Verify API keys and rate limits

## Future Enhancements

- [ ] Video player integration
- [ ] User watchlist functionality
- [ ] Content recommendations
- [ ] Social features (comments, ratings)
- [ ] Advanced filtering options
- [ ] Mobile app development
- [ ] Live streaming capabilities
- [ ] Multi-language support 