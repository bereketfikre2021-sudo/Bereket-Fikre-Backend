/**
 * Contact & Project Request Controller
 * Accepts submissions from the frontend forms
 * Field names match EXACTLY what the frontend sends
 */

const prisma = require('../config/database');
const { success, error, paginated } = require('../utils/response');
const { parsePagination, parseSort } = require('../utils/pagination');
const { sendContactNotification, sendProjectRequestNotification } = require('../utils/email');
const logger = require('../utils/logger');

// ============================================================
// CONTACT FORM — matches Contact.jsx submission
// POST /api/contact
// ============================================================
const submitContact = async (req, res, next) => {
  try {
    // Frontend sends: name, email, subject, message, form_type, _subject
    const { name, email, subject, message } = req.body;

    const submission = await prisma.contactSubmission.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject.trim(),
        message: message.trim(),
        formType: 'contact',
        ipAddress: req.ip,
      },
    });

    // Send email notification async (don't block response)
    sendContactNotification(submission).catch(() => {});

    logger.info(`Contact submission: ${email}`);

    // Return the exact shape the frontend checks: { ok: true }
    return res.status(200).json({ ok: true, message: 'Message sent successfully.' });
  } catch (err) {
    next(err);
  }
};

// ============================================================
// PROJECT REQUEST FORM — matches ProjectRequestModal.jsx submission
// POST /api/project-request
// ============================================================
const submitProjectRequest = async (req, res, next) => {
  try {
    // Frontend sends snake_case field names:
    const {
      first_name, last_name, email, phone, company,
      service_needed, budget_range, timeline,
      project_description, preferred_contact_method,
      submitted_at,
    } = req.body;

    const submission = await prisma.projectRequest.create({
      data: {
        firstName: first_name.trim(),
        lastName: last_name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        company: company?.trim() || null,
        serviceNeeded: service_needed,
        budgetRange: budget_range,
        timeline,
        projectDescription: project_description.trim(),
        preferredContactMethod: preferred_contact_method || 'email',
        formType: 'project_request',
        submittedAt: submitted_at ? new Date(submitted_at) : new Date(),
        ipAddress: req.ip,
      },
    });

    // Send email notification async
    sendProjectRequestNotification({
      firstName: submission.firstName,
      lastName: submission.lastName,
      email: submission.email,
      phone: submission.phone,
      company: submission.company,
      serviceNeeded: submission.serviceNeeded,
      budgetRange: submission.budgetRange,
      timeline: submission.timeline,
      projectDescription: submission.projectDescription,
      preferredContactMethod: submission.preferredContactMethod,
    }).catch(() => {});

    logger.info(`Project request: ${email}`);

    // Return the exact shape the frontend checks: response.ok (HTTP 200)
    return res.status(200).json({ ok: true, message: 'Project request submitted successfully.' });
  } catch (err) {
    next(err);
  }
};

// ============================================================
// ADMIN — Contact Submissions Management
// ============================================================

// GET /api/admin/contacts
const getContacts = async (req, res, next) => {
  try {
    const { page, limit, skip, take } = parsePagination(req.query);
    const orderBy = parseSort(req.query, 'createdAt', 'desc');

    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.search) {
      where.OR = [
        { name: { contains: req.query.search, mode: 'insensitive' } },
        { email: { contains: req.query.search, mode: 'insensitive' } },
        { subject: { contains: req.query.search, mode: 'insensitive' } },
      ];
    }

    const [contacts, total] = await Promise.all([
      prisma.contactSubmission.findMany({ where, orderBy, skip, take }),
      prisma.contactSubmission.count({ where }),
    ]);

    return paginated(res, contacts, total, page, limit);
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/contacts/:id
const getContact = async (req, res, next) => {
  try {
    const contact = await prisma.contactSubmission.findUnique({ where: { id: req.params.id } });
    if (!contact) return error(res, 'Contact submission not found.', 404);

    // Auto-mark as read
    if (contact.status === 'NEW') {
      await prisma.contactSubmission.update({ where: { id: req.params.id }, data: { status: 'READ' } });
    }

    return success(res, contact);
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/contacts/:id/status
const updateContactStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['NEW', 'READ', 'REPLIED', 'ARCHIVED'];
    if (!validStatuses.includes(status)) {
      return error(res, `Status must be one of: ${validStatuses.join(', ')}`, 400);
    }

    const updated = await prisma.contactSubmission.update({
      where: { id },
      data: { status, ...(notes !== undefined && { notes }) },
    });
    return success(res, updated, 'Status updated');
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/contacts/:id
const deleteContact = async (req, res, next) => {
  try {
    await prisma.contactSubmission.delete({ where: { id: req.params.id } });
    return success(res, null, 'Contact deleted');
  } catch (err) {
    next(err);
  }
};

// ============================================================
// ADMIN — Project Requests Management
// ============================================================

// GET /api/admin/project-requests
const getProjectRequests = async (req, res, next) => {
  try {
    const { page, limit, skip, take } = parsePagination(req.query);
    const orderBy = parseSort(req.query, 'createdAt', 'desc');

    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.serviceNeeded) where.serviceNeeded = req.query.serviceNeeded;
    if (req.query.search) {
      where.OR = [
        { firstName: { contains: req.query.search, mode: 'insensitive' } },
        { lastName: { contains: req.query.search, mode: 'insensitive' } },
        { email: { contains: req.query.search, mode: 'insensitive' } },
        { company: { contains: req.query.search, mode: 'insensitive' } },
      ];
    }

    const [requests, total] = await Promise.all([
      prisma.projectRequest.findMany({ where, orderBy, skip, take }),
      prisma.projectRequest.count({ where }),
    ]);

    return paginated(res, requests, total, page, limit);
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/project-requests/:id
const getProjectRequest = async (req, res, next) => {
  try {
    const req_ = await prisma.projectRequest.findUnique({ where: { id: req.params.id } });
    if (!req_) return error(res, 'Project request not found.', 404);

    if (req_.status === 'NEW') {
      await prisma.projectRequest.update({ where: { id: req.params.id }, data: { status: 'READ' } });
    }

    return success(res, req_);
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/project-requests/:id/status
const updateProjectRequestStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['NEW', 'READ', 'REPLIED', 'ARCHIVED'];
    if (!validStatuses.includes(status)) {
      return error(res, `Status must be one of: ${validStatuses.join(', ')}`, 400);
    }

    const updated = await prisma.projectRequest.update({
      where: { id },
      data: { status, ...(notes !== undefined && { notes }) },
    });

    return success(res, updated, 'Status updated');
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/project-requests/:id
const deleteProjectRequest = async (req, res, next) => {
  try {
    await prisma.projectRequest.delete({ where: { id: req.params.id } });
    return success(res, null, 'Project request deleted');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  submitContact,
  submitProjectRequest,
  getContacts, getContact, updateContactStatus, deleteContact,
  getProjectRequests, getProjectRequest, updateProjectRequestStatus, deleteProjectRequest,
};
