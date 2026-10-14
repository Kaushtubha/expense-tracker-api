const { validationResult } = require('express-validator');

/**
 * Middleware runner that inspects express-validator results
 * Returns a 400 Bad Request with all field errors if validation fails
 */
const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validation rules sequentially or in parallel
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
      errors: formattedErrors,
    });
  };
};

module.exports = validate;
