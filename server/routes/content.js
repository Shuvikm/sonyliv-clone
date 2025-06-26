const express = require('express');
const Content = require('../models/Content');
const router = express.Router();

// Get all content with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      type, 
      genre, 
      search, 
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = { $or: [{ status: 'active' }, { status: { $exists: false } }] };

    // Filter by type
    if (type) {
      query.type = type;
    }

    // Filter by genre
    if (genre) {
      query.genre = { $in: [genre] };
    }

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { genre: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const sortOptions = {};
    sortOptions[sort] = order === 'desc' ? -1 : 1;

    const content = await Content.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Content.countDocuments(query);

    res.json({
      content,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// Get featured content
router.get('/featured', async (req, res) => {
  try {
    const featured = await Content.find({ 
      isFeatured: true,
      $or: [{ status: 'active' }, { status: { $exists: false } }]
    }).limit(10);

    res.json({ featured });
  } catch (error) {
    console.error('Get featured error:', error);
    res.status(500).json({ error: 'Failed to fetch featured content' });
  }
});

// Get trending content
router.get('/trending', async (req, res) => {
  try {
    const trending = await Content.find({ 
      isTrending: true,
      $or: [{ status: 'active' }, { status: { $exists: false } }]
    }).sort({ views: -1 }).limit(10);

    res.json({ trending });
  } catch (error) {
    console.error('Get trending error:', error);
    res.status(500).json({ error: 'Failed to fetch trending content' });
  }
});

// Get movies
router.get('/movies', async (req, res) => {
  try {
    const { genre, year, search, page = 1, limit = 20 } = req.query;
    
    const query = { 
      type: 'movie',
      $or: [{ status: 'active' }, { status: { $exists: false } }]
    };
    
    if (genre) {
      query.genre = { $in: [genre] };
    }
    
    if (year) {
      query.releaseYear = parseInt(year);
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { genre: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const movies = await Content.find(query)
      .sort({ releaseYear: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Content.countDocuments(query);

    res.json({
      movies,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Get movies error:', error);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});

// Get sports content
router.get('/sports', async (req, res) => {
  try {
    const { sportType, isLive, search, page = 1, limit = 20 } = req.query;
    
    const query = { 
      type: 'sport',
      $or: [{ status: 'active' }, { status: { $exists: false } }]
    };
    
    if (sportType) {
      query.sportType = sportType;
    }
    
    if (isLive === 'true') {
      query.isLive = true;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sportType: { $regex: search, $options: 'i' } }
      ];
    }

    const sports = await Content.find(query)
      .sort({ matchDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Content.countDocuments(query);

    res.json({
      sports,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Get sports error:', error);
    res.status(500).json({ error: 'Failed to fetch sports content' });
  }
});

// Get news content
router.get('/news', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    
    const query = { 
      type: 'news',
      $or: [{ status: 'active' }, { status: { $exists: false } }]
    };
    
    if (category) {
      query.newsCategory = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { newsCategory: { $regex: search, $options: 'i' } }
      ];
    }

    const news = await Content.find(query)
      .sort({ publishDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Content.countDocuments(query);

    res.json({
      news,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({ error: 'Failed to fetch news content' });
  }
});

// Get serials/shows
router.get('/serials', async (req, res) => {
  try {
    const { genre, search, page = 1, limit = 20 } = req.query;
    
    const query = { 
      type: { $in: ['serial', 'show'] },
      $or: [{ status: 'active' }, { status: { $exists: false } }]
    };
    
    if (genre) {
      query.genre = { $in: [genre] };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { genre: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const serials = await Content.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Content.countDocuments(query);

    res.json({
      serials,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Get serials error:', error);
    res.status(500).json({ error: 'Failed to fetch serials' });
  }
});

// Get content by ID
router.get('/:id', async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    // Increment views
    content.views += 1;
    await content.save();

    res.json({ content });
  } catch (error) {
    console.error('Get content by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// Search content
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const searchResults = await Content.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { genre: { $in: [new RegExp(query, 'i')] } },
        { type: { $regex: query, $options: 'i' } }
      ],
      $or: [{ status: 'active' }, { status: { $exists: false } }]
    })
    .sort({ views: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();

    const total = await Content.countDocuments({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { genre: { $in: [new RegExp(query, 'i')] } },
        { type: { $regex: query, $options: 'i' } }
      ],
      $or: [{ status: 'active' }, { status: { $exists: false } }]
    });

    res.json({
      results: searchResults,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

module.exports = router; 