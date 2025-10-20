// This model is now using Supabase.

const supabase = require('../../api-util/supabase');
const supabaseService = require('../../api-util/supabaseService');
const NodeCache = require('node-cache');

// Cache for 30 minutes
const urlCache = new NodeCache({ stdTTL: 1800 });


/**
 * Save a URL mapping to the database
 * @param {string} shortCode - The short code for the URL
 * @param {string} originalUrl - The original URL
 * @returns {Promise} - Resolves with the saved record
 */
const saveUrlMapping = async (shortCode, originalUrl) => {
  if (!supabaseService) {
    return null;
  }

  const { data, error } = await supabaseService
    .from('url_mapping')
    .insert([
      { short_code: shortCode, original_url: originalUrl },
    ])
    .select();

  if (error) {
    throw error;
  }
  // The select() returns an array, so we take the first element.
  return data ? data[0] : null;
};

/**
 * Find original URL by short code
 * @param {string} shortCode - The short code to look up
 * @returns {Promise} - Resolves with the original URL or null if not found
 */
const findOriginalUrl = async (shortCode) => {
  if (!supabase) {
    return null;
  }

  const cachedUrl = urlCache.get(shortCode);
  if (cachedUrl) {
    return cachedUrl;
  }

  const { data, error } = await supabase
    .from('url_mapping')
    .select('original_url')
    .eq('short_code', shortCode)
    .single();
    

  if (error) {
    // PGRST116: "Not a single row was found"
    // If no record is found, Supabase returns an error. We want to return null instead.
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  const originalUrl = data ? data.original_url : null;

  if (originalUrl) {
    urlCache.set(shortCode, originalUrl);
  }

  return originalUrl;
};

module.exports = {
  saveUrlMapping,
  findOriginalUrl
};