# Sony Live Clone - Setup Guide

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Quick Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd sony-live-clone
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/sony-live-clone
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   PORT=5000
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system:
   ```bash
   # On Windows
   net start MongoDB
   
   # On macOS/Linux
   sudo systemctl start mongod
   ```

5. **Seed the database**
   ```bash
   npm run seed
   ```

6. **Start the application**
   ```bash
   npm run dev
   ```

7. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Features

- 🏠 **Home Page** with featured content and "Get Started" button
- 🎬 **Movies** section with filtering and search
- ⚽ **Sports** live streaming and highlights
- 📰 **News** channels and articles
- 📺 **Serials** and TV shows
- 🔍 **Search** functionality across all content
- 👤 **User Authentication** (login/register)
- 💾 **MongoDB** database integration
- 🎨 **Modern UI/UX** design

## Demo Credentials

- Email: demo@example.com
- Password: password123

## API Endpoints

- `GET /api/content` - Get all content
- `GET /api/content/movies` - Get movies
- `GET /api/content/sports` - Get sports content
- `GET /api/content/news` - Get news content
- `GET /api/content/serials` - Get serials
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

## Project Structure

```
sony-live-clone/
├── client/                 # React frontend
│   ├── public/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── styles/        # CSS files
│   └── package.json
├── server/                 # Node.js backend
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── index.js           # Server entry point
│   └── seed.js            # Database seeder
├── package.json
└── README.md
```

## Troubleshooting

1. **MongoDB connection error**
   - Make sure MongoDB is running
   - Check your MONGODB_URI in .env file

2. **Port already in use**
   - Change the PORT in .env file
   - Kill processes using the ports

3. **Module not found errors**
   - Run `npm run install-all` again
   - Clear node_modules and reinstall

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for learning and development! 