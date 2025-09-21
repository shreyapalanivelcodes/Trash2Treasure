const express = require('express');
const router = express.Router();
const Contact = require('../models/contact');
const auth = require('../middleware/auth');

// ================== SUBMIT CONTACT/FEEDBACK/SUPPORT ==================
router.post('/submit', async (req, res) => {
    try {
        const { name, email, subject, message, type } = req.body;

        // Validation
        if (!name || !email || !subject || !message || !type) {
            return res.status(400).json({ 
                message: 'All fields are required (name, email, subject, message, type)' 
            });
        }

        // Validate type
        if (!['contact', 'feedback', 'support'].includes(type)) {
            return res.status(400).json({ 
                message: 'Type must be one of: contact, feedback, support' 
            });
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Please provide a valid email address' });
        }

        // Get user ID if authenticated (from token)
        let userId = null;
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (token) {
            try {
                const jwt = require('jsonwebtoken');
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded.id;
            } catch (err) {
                // Token invalid or expired, but that's OK for contact forms
            }
        }

        // Set priority based on type
        let priority = 'medium';
        if (type === 'support') priority = 'high';
        if (type === 'feedback') priority = 'low';

        const newContact = new Contact({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            subject: subject.trim(),
            message: message.trim(),
            type,
            userId,
            priority
        });

        await newContact.save();

        res.status(201).json({
            message: `Your ${type} message has been submitted successfully! We'll get back to you soon.`,
            contactId: newContact._id
        });

    } catch (err) {
        console.error(`${req.body.type || 'Contact'} submission error:`, err);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

// ================== GET USER'S SUBMISSIONS (AUTHENTICATED) ==================
router.get('/my-submissions', auth, async (req, res) => {
    try {
        const contacts = await Contact.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .select('-__v');

        res.json(contacts);
    } catch (err) {
        console.error('Get user submissions error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ================== GET SINGLE SUBMISSION (AUTHENTICATED) ==================
router.get('/submission/:id', auth, async (req, res) => {
    try {
        const contact = await Contact.findOne({ 
            _id: req.params.id, 
            userId: req.user.id 
        }).select('-__v');

        if (!contact) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        res.json(contact);
    } catch (err) {
        console.error('Get submission error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ================== ADMIN ROUTES (Protected - for future use) ==================

// Get all submissions (Admin only)
router.get('/admin/all', auth, async (req, res) => {
    try {
        // For now, any authenticated user can view (you can add admin check later)
        const { type, status, page = 1, limit = 10 } = req.query;
        
        let filter = {};
        if (type && ['contact', 'feedback', 'support'].includes(type)) {
            filter.type = type;
        }
        if (status && ['open', 'in-progress', 'resolved', 'closed'].includes(status)) {
            filter.status = status;
        }

        const contacts = await Contact.find(filter)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('userId', 'name email organization')
            .select('-__v');

        const total = await Contact.countDocuments(filter);

        res.json({
            contacts,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (err) {
        console.error('Admin get all submissions error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update submission status (Admin only)
router.put('/admin/:id/status', auth, async (req, res) => {
    try {
        const { status, response, respondedBy } = req.body;

        if (!['open', 'in-progress', 'resolved', 'closed'].includes(status)) {
            return res.status(400).json({ 
                message: 'Status must be one of: open, in-progress, resolved, closed' 
            });
        }

        const updateData = { status };
        
        if (response && respondedBy) {
            updateData.adminResponse = {
                message: response.trim(),
                respondedBy: respondedBy.trim(),
                respondedAt: new Date()
            };
        }

        const contact = await Contact.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!contact) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        res.json({
            message: 'Submission updated successfully',
            contact
        });
    } catch (err) {
        console.error('Admin update status error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;