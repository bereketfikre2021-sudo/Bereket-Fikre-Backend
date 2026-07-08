/**
 * Cloudinary SDK Initialisation
 *
 * Reads credentials exclusively from environment variables via env.js.
 * No values are hardcoded here.
 *
 * All three Cloudinary variables are guaranteed non-empty when this module
 * loads — env.js exits the process if any are missing.
 *
 * Upload / delete logic lives in src/services/upload.service.js.
 * This module only exports the configured cloudinary v2 instance.
 */

'use strict';

const cloudinary = require('cloudinary').v2;
const env        = require('./env');

cloudinary.config({
  cloud_name : process.env.CLOUDINARY_CLOUD_NAME,  // read directly so value
  api_key    : process.env.CLOUDINARY_API_KEY,      // is never logged or
  api_secret : process.env.CLOUDINARY_API_SECRET,   // serialised via env obj
  secure     : true,                                 // always https:// URLs
});

module.exports = cloudinary;
