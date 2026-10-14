const crypto = require('crypto');

/**
 * Middleware that assigns a unique request ID (X-Request-Id) to each incoming HTTP request.
 * Useful for correlating logs in microservices and debugging production issues.
 */
const requestId = (req, res, next) => {
  const existingId = req.headers['x-request-id'];
  const currentId = existingId || crypto.randomUUID();

  req.id = currentId;
  res.setHeader('X-Request-Id', currentId);
  next();
};

module.exports = requestId;
