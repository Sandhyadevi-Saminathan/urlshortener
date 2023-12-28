const express = require('express');
const app = express();
const cors = require('cors'); 
app.use(express.json());
app.use(express.static('public'));
const urlDatabase = {}; 
const urlAccessCounts = {};
app.use(cors());



// Middleware for error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });


  
// Error handling for unknown errors
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Internal Server Error');
  });

// Endpoint to shorten URLs
app.post('/shorten', (req, res,next) => {
    try {
  const { longUrl } = req.body;
  if (!longUrl) {
    return res.status(400).json({ error: 'Long URL is required' });
  }

  const shortCode = generateShortCode();
  urlDatabase[shortCode] = longUrl;
  const shortenedUrl = `http://localhost:3000/${shortCode}`; 
  res.json({ originalUrl: longUrl, shortenedUrl });
}catch (error) {
    next(error);
}
}
);

// Endpoint to redirect to original URL
app.get('/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  const longUrl = urlDatabase[shortCode];
  if (!longUrl) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  // Increment access count for the short URL
  urlAccessCounts[shortCode] = (urlAccessCounts[shortCode] || 0) + 1;
  console.log(`Access count for ${shortCode}: ${urlAccessCounts[shortCode]}`);
  res.redirect(longUrl);
});

// Implement analytics endpoint
app.get('/analytics/:shortCode', (req, res) => {
  const { shortCode } = req.params;
  const accessCount = urlAccessCounts[shortCode] || 0;
  const originalUrl = urlDatabase[shortCode];
  if (!originalUrl) {
    return res.status(404).json({ error: 'Short URL not found' });
  }

  res.json({ shortCode, originalUrl, accessCount });

});


// to generate the start code

function generateShortCode() {
    let shortCode;
    do {
      shortCode = Math.random().toString(36).substring(6);
    } while (urlDatabase[shortCode]);
    
    return shortCode;
  }

  // Middleware for not found routes
app.use((req, res) => {
    res.status(404).send('Route not found');
  });
  
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});