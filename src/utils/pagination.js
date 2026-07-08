/**
 * Pagination helper
 * Parses page/limit from query params and returns Prisma-compatible skip/take
 */

const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;
  return { page, limit, skip, take: limit };
};

/**
 * Parse sort params
 * @param {string} sortBy - Field name
 * @param {string} order - 'asc' | 'desc'
 * @param {string} defaultField - Fallback sort field
 */
const parseSort = (query, defaultField = 'createdAt', defaultOrder = 'desc') => {
  const sortBy = query.sortBy || defaultField;
  const order = ['asc', 'desc'].includes(query.order) ? query.order : defaultOrder;
  return { [sortBy]: order };
};

module.exports = { parsePagination, parseSort };
