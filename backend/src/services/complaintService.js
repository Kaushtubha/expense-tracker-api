const mongoose = require('mongoose');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const cache = require('../config/redis');

/**
 * Invalidate cached dashboard metrics whenever complaint data mutates
 */
const invalidateDashboardCache = async () => {
  await cache.del('dashboard:summary');
  await cache.flushPattern('dashboard:*');
};

/**
 * Service: Create a new complaint (Student)
 */
const createComplaint = async (studentUser, data) => {
  const roomNumber = data.roomNumber || studentUser.roomNumber;
  if (!roomNumber) {
    throw new AppError('Room number is required to register a complaint', 400);
  }

  const complaint = new Complaint({
    title: data.title,
    description: data.description,
    category: data.category,
    priority: data.priority || 'medium',
    student: studentUser._id,
    roomNumber,
    imageUrl: data.imageUrl || '',
    status: 'Open',
    statusHistory: [
      {
        status: 'Open',
        changedBy: studentUser._id,
        note: 'Complaint registered by student',
        timestamp: new Date(),
      },
    ],
  });

  await complaint.save();
  await invalidateDashboardCache();

  return complaint;
};

/**
 * Service: List complaints with pagination and dynamic filters
 */
const getComplaints = async (user, query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const filter = {};

  // Role-based scoping: Students only see their own complaints
  if (user.role === 'student') {
    filter.student = user._id;
  } else if (user.role === 'staff' && query.assignedOnly === 'true') {
    filter.assignedTo = user._id;
  }

  // Filter by Status
  if (query.status) {
    filter.status = query.status;
  }

  // Filter by Category
  if (query.category) {
    filter.category = query.category;
  }

  // Filter by Priority
  if (query.priority) {
    filter.priority = query.priority;
  }

  // Filter by Room Number
  if (query.roomNumber) {
    filter.roomNumber = query.roomNumber.trim();
  }

  // Search keyword in title or description
  if (query.search) {
    const searchRegex = new RegExp(query.search.trim(), 'i');
    filter.$or = [{ title: searchRegex }, { description: searchRegex }];
  }

  // Date Range filter (createdAt)
  if (query.startDate || query.endDate) {
    filter.createdAt = {};
    if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
    if (query.endDate) {
      const end = new Date(query.endDate);
      if (query.endDate.length === 10) end.setUTCHours(23, 59, 59, 999);
      filter.createdAt.$lte = end;
    }
  }

  const [total, complaints] = await Promise.all([
    Complaint.countDocuments(filter),
    Complaint.find(filter)
      .populate('student', 'name email roomNumber phone')
      .populate('assignedTo', 'name email role phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
  ]);

  return {
    complaints,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

/**
 * Service: Get single complaint details with ownership verification
 */
const getComplaintById = async (user, complaintId) => {
  if (!mongoose.Types.ObjectId.isValid(complaintId)) {
    throw new AppError('Invalid complaint ID format', 400);
  }

  const complaint = await Complaint.findById(complaintId)
    .populate('student', 'name email roomNumber phone')
    .populate('assignedTo', 'name email role phone')
    .populate('statusHistory.changedBy', 'name role')
    .populate('comments.user', 'name role');

  if (!complaint) {
    throw new AppError('Complaint not found', 404);
  }

  // User Isolation Guard: Students can only view their own complaints
  if (
    user.role === 'student' &&
    complaint.student._id.toString() !== user._id.toString()
  ) {
    throw new AppError('You do not have permission to access this complaint', 403);
  }

  // Filter out internal notes for students
  const sanitized = complaint.toObject();
  if (user.role === 'student') {
    sanitized.comments = (sanitized.comments || []).filter((c) => !c.isInternal);
  }

  return sanitized;
};

/**
 * Service: Update complaint status & record status audit trail
 */
const updateStatus = async (user, complaintId, { status, note }) => {
  if (!mongoose.Types.ObjectId.isValid(complaintId)) {
    throw new AppError('Invalid complaint ID format', 400);
  }

  const complaint = await Complaint.findById(complaintId);
  if (!complaint) {
    throw new AppError('Complaint not found', 404);
  }

  const validStatuses = ['Open', 'In Progress', 'Resolved', 'Closed'];
  if (!validStatuses.includes(status)) {
    throw new AppError(`Invalid status: ${status}. Allowed: ${validStatuses.join(', ')}`, 400);
  }

  // Student specific logic: Students can only reopen Resolved complaints
  if (user.role === 'student') {
    if (complaint.student.toString() !== user._id.toString()) {
      throw new AppError('You do not have permission to update this complaint', 403);
    }

    if (complaint.status !== 'Resolved' || status !== 'In Progress') {
      throw new AppError(
        'Students can only reopen complaints that are marked as Resolved',
        400
      );
    }

    complaint.reopenedCount += 1;
    complaint.resolvedAt = null;
  }

  complaint.status = status;

  if (status === 'Resolved') {
    complaint.resolvedAt = new Date();
  } else if (status === 'Closed') {
    complaint.closedAt = new Date();
  }

  // Record audit history entry
  complaint.statusHistory.push({
    status,
    changedBy: user._id,
    note: note || `Status transitioned to ${status} by ${user.name}`,
    timestamp: new Date(),
  });

  await complaint.save();
  await invalidateDashboardCache();

  return complaint;
};

/**
 * Service: Assign complaint to maintenance staff member (Admin only)
 */
const assignStaff = async (adminUser, complaintId, staffId) => {
  if (!mongoose.Types.ObjectId.isValid(complaintId)) {
    throw new AppError('Invalid complaint ID format', 400);
  }

  if (!mongoose.Types.ObjectId.isValid(staffId)) {
    throw new AppError('Invalid staff ID format', 400);
  }

  const [complaint, staff] = await Promise.all([
    Complaint.findById(complaintId),
    User.findById(staffId),
  ]);

  if (!complaint) {
    throw new AppError('Complaint not found', 404);
  }

  if (!staff || (staff.role !== 'staff' && staff.role !== 'admin')) {
    throw new AppError('Assigned user must have staff or admin role', 400);
  }

  complaint.assignedTo = staff._id;

  // If status is Open, transition to In Progress automatically
  if (complaint.status === 'Open') {
    complaint.status = 'In Progress';
  }

  complaint.statusHistory.push({
    status: complaint.status,
    changedBy: adminUser._id,
    note: `Assigned to ${staff.name} (${staff.role})`,
    timestamp: new Date(),
  });

  await complaint.save();
  await invalidateDashboardCache();

  return complaint;
};

/**
 * Service: Add comment / internal note to complaint
 */
const addComment = async (user, complaintId, { text, isInternal }) => {
  if (!mongoose.Types.ObjectId.isValid(complaintId)) {
    throw new AppError('Invalid complaint ID format', 400);
  }

  const complaint = await Complaint.findById(complaintId);
  if (!complaint) {
    throw new AppError('Complaint not found', 404);
  }

  // Students can only comment on their own complaints
  if (
    user.role === 'student' &&
    complaint.student.toString() !== user._id.toString()
  ) {
    throw new AppError('You do not have permission to comment on this complaint', 403);
  }

  // Students cannot create internal notes
  const internalFlag = user.role === 'student' ? false : Boolean(isInternal);

  complaint.comments.push({
    user: user._id,
    text: text.trim(),
    isInternal: internalFlag,
    createdAt: new Date(),
  });

  await complaint.save();

  return complaint;
};

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateStatus,
  assignStaff,
  addComment,
};
