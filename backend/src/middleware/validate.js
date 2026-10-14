const { validationResult } = require('express-validator');

/**
 * Middleware runner that executes validation chains and returns
 * formatted 400 Bad Request error response if validation fails.
 */
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));

    return res.status(400).json({
      success: false,
      status: 'fail',
      message: 'Validation failed. Please correct the highlighted errors.',
      requestId: req.id,
      errors: formattedErrors,
    });
  };
};

module.exports = validate;
