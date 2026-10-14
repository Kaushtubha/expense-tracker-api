const complaintService = require('../services/complaintService');

/**
 * Controller: Register a new maintenance complaint
 */
const createComplaint = async (req, res, next) => {
  try {
    const complaint = await complaintService.createComplaint(req.user, req.body);

    res.status(201).json({
      success: true,
      message: 'Complaint registered successfully',
      requestId: req.id,
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Get paginated list of complaints with dynamic filters
 */
const getComplaints = async (req, res, next) => {
  try {
    const result = await complaintService.getComplaints(req.user, req.query);

    res.status(200).json({
      success: true,
      message: 'Complaints fetched successfully',
      requestId: req.id,
      data: result.complaints,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Get single complaint details
 */
const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await complaintService.getComplaintById(
      req.user,
      req.params.id
    );

    res.status(200).json({
      success: true,
      message: 'Complaint retrieved successfully',
      requestId: req.id,
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Update complaint status & record statusHistory audit trail
 */
const updateStatus = async (req, res, next) => {
  try {
    const complaint = await complaintService.updateStatus(
      req.user,
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: `Complaint status updated to ${complaint.status}`,
      requestId: req.id,
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Assign staff member to complaint (Admin only)
 */
const assignStaff = async (req, res, next) => {
  try {
    const complaint = await complaintService.assignStaff(
      req.user,
      req.params.id,
      req.body.staffId
    );

    res.status(200).json({
      success: true,
      message: 'Staff assigned to complaint successfully',
      requestId: req.id,
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Add comment or internal staff note
 */
const addComment = async (req, res, next) => {
  try {
    const complaint = await complaintService.addComment(
      req.user,
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: 'Comment added successfully',
      requestId: req.id,
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateStatus,
  assignStaff,
  addComment,
};
