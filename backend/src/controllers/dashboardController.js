const dashboardService = require('../services/dashboardService');

/**
 * Controller: Get aggregated dashboard summary metrics (Admin/Staff only)
 */
const getSummary = async (req, res, next) => {
  try {
    const summary = await dashboardService.getDashboardSummary();

    res.status(200).json({
      success: true,
      message: 'Dashboard summary retrieved successfully',
      requestId: req.id,
      cached: summary.fromCache,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummary,
};
