/**
 * Standardized API response helpers
 * Ensures consistent JSON shape across all endpoints
 */

/**
 * Success response
 * @param {object} res - Express response
 * @param {any} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default 200)
 */
const success = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Created response (201)
 */
const created = (res, data = null, message = 'Created successfully') => {
  return success(res, data, message, 201);
};

/**
 * Error response
 */
const error = (res, message = 'An error occurred', statusCode = 400, errors = null) => {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
};

/**
 * Paginated response
 */
const paginated = (res, data, total, page, limit, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  });
};

module.exports = { success, created, error, paginated };
