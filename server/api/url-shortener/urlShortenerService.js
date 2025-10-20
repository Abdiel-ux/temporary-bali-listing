const { saveUrlMapping, findOriginalUrl } = require('./urlShortenerModel');

const SUPABASE_URL = process.env.SUPABASE_URL;


/**
 * Generate a random short code
 * @param {number} length - Length of the short code
 * @returns {string} - Generated short code
 */
const generateShortCode = (length = 6) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

/**
 * Create a short URL for the given original URL
 * @param {string} originalUrl - The original URL to shorten
 * @returns {Promise} - Resolves with the short code
 */
const createShortUrl = async (originalUrl) => {
  if (!SUPABASE_URL) {
    return originalUrl;
  }

  // Generate a unique short code
  let shortCode;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 8;
  
  while (!isUnique && attempts < maxAttempts) {
    shortCode = generateShortCode(6);
    try {
      const existingUrl = await findOriginalUrl(shortCode);
      if (!existingUrl) {
        isUnique = true;
      }
    } catch (err) {
      // If there's an error checking, we'll try again
      console.error('Error checking short code uniqueness:', err);
    }
    attempts++;
  }
  
  if (!isUnique) {
    throw new Error('Unable to generate unique short code');
  }
  
  // Save the mapping
  await saveUrlMapping(shortCode, originalUrl);
  
  return shortCode;
};

/**
 * Get the original URL for a short code
 * @param {string} shortCode - The short code to look up
 * @returns {Promise} - Resolves with the original URL or null if not found
 */
const getOriginalUrl = async (shortCode) => {
  return await findOriginalUrl(shortCode);
};

module.exports = {
  createShortUrl,
  getOriginalUrl
};