const express = require('express');
const bodyParser = require('body-parser');
const { createShortUrl } = require('./urlShortenerService');

const router = express.Router();

// Parse JSON body for URL shortener endpoints
router.use(bodyParser.json());

/**
 * Validates if a given URL's hostname matches the server's hostname.
 * @param {string} urlString - The full URL string to check.
 * @param {string} serverHostname - The hostname of the current server (e.g., from req.get('host')).
 * @returns {boolean} - True if the hostname matches, false otherwise.
 */
function isHostnameAllowed(urlString, serverHostname) {
  try {
    const url = new URL(urlString);
    return url.hostname === serverHostname;
  } catch (err) {
    return false;
  }
}

/**
 * Create a short URL
 * POST /api/url-shortener
 * Body: { url: 'https://example.com/very/long/url' }
 */
router.post('/', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    // Validate URL format
    try {
      new URL(url);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }
    
    // Validate hostname - must match the server's hostname
    const serverHostname = req.get('host');
    if (!isHostnameAllowed(url, serverHostname)) {
      return res.status(400).json({ error: 'URL hostname must match the server hostname.' });
    }
    
    const shortCode = await createShortUrl(url);
    const shortUrl = `${req.protocol}://${req.get('host')}/sh/${shortCode}`;
    
    res.json({ shortUrl, shortCode });
  } catch (error) {
    console.error('Error creating short URL:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;