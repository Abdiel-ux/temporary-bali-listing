const express = require('express');
const { getOriginalUrl } = require('./api/url-shortener/urlShortenerService');

const router = express.Router();

/**
 * Redirect to the original URL
 * GET /s/:shortCode
 */
router.get('/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    const originalUrl = await getOriginalUrl(shortCode);
    if (originalUrl) {
      res.redirect(301, originalUrl);
    } else {
      // Return a 404 status - frontend will automatically show 404.html
      res.status(404).send('Not Found');
    }
  } catch (error) {
    console.error('Error redirecting URL:', error);
    // Return a 500 status - frontend will automatically show 500.html
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;