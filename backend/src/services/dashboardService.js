const Complaint = require('../models/Complaint');
const cache = require('../config/redis');

const CACHE_KEY = 'dashboard:summary';
const CACHE_TTL_SECONDS = parseInt(process.env.REDIS_CACHE_TTL, 10) || 60;

/**
 * Service: Aggregate high-level maintenance dashboard metrics
 * Uses a single MongoDB $facet aggregation pipeline and caches in Redis with a 60s TTL.
 */
const getDashboardSummary = async () => {
  // 1. Check Redis Cache
  const cachedData = await cache.get(CACHE_KEY);
  if (cachedData) {
    return {
      ...cachedData,
      fromCache: true,
    };
  }

  // 2. MongoDB Aggregation Pipeline with $facet
  const [results] = await Complaint.aggregate([
    {
      $facet: {
        totalComplaints: [{ $count: 'count' }],
        statusBreakdown: [
          { $group: { _id: '$status', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ],
        categoryBreakdown: [
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ],
        priorityBreakdown: [
          { $group: { _id: '$priority', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ],
        resolutionMetrics: [
          {
            $match: {
              resolvedAt: { $ne: null },
            },
          },
          {
            $project: {
              durationHours: {
                $divide: [
                  { $subtract: ['$resolvedAt', '$createdAt'] },
                  1000 * 60 * 60, // Convert ms to hours
                ],
              },
            },
          },
          {
            $group: {
              _id: null,
              avgResolutionHours: { $avg: '$durationHours' },
              totalResolved: { $sum: 1 },
            },
          },
        ],
        urgentUnresolved: [
          {
            $match: {
              priority: { $in: ['urgent', 'high'] },
              status: { $in: ['Open', 'In Progress'] },
            },
          },
          { $count: 'count' },
        ],
      },
    },
  ]);

  // Format the aggregated facet results
  const total = results.totalComplaints[0]?.count || 0;
  const urgentCount = results.urgentUnresolved[0]?.count || 0;
  const avgHours = results.resolutionMetrics[0]?.avgResolutionHours || 0;
  const resolvedCount = results.resolutionMetrics[0]?.totalResolved || 0;

  // Format Status map
  const statusMap = { Open: 0, 'In Progress': 0, Resolved: 0, Closed: 0 };
  (results.statusBreakdown || []).forEach((item) => {
    statusMap[item._id] = item.count;
  });

  // Format Category list
  const categories = (results.categoryBreakdown || []).map((item) => ({
    category: item._id,
    count: item.count,
    percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
  }));

  // Format Priority map
  const priorityMap = { low: 0, medium: 0, high: 0, urgent: 0 };
  (results.priorityBreakdown || []).forEach((item) => {
    priorityMap[item._id] = item.count;
  });

  const summary = {
    totalComplaints: total,
    unresolvedUrgentCount: urgentCount,
    statusBreakdown: statusMap,
    categoryBreakdown: categories,
    priorityBreakdown: priorityMap,
    averageResolutionTimeHours: Math.round(avgHours * 10) / 10, // 1 decimal place
    totalResolvedCount: resolvedCount,
    calculatedAt: new Date().toISOString(),
  };

  // 3. Store in Redis with TTL
  await cache.set(CACHE_KEY, summary, CACHE_TTL_SECONDS);

  return {
    ...summary,
    fromCache: false,
  };
};

module.exports = {
  getDashboardSummary,
};
