const CMSPage = require('../models/CMSPage');
const BannerImage = require('../models/BannerImage');
const Gallery = require('../models/Gallery');
const Testimonial = require('../models/Testimonial');
const Event = require('../models/Event');
const Notice = require('../models/Notice');
const Menu = require('../models/Menu');
const Media = require('../models/Media');

const mongoose = require('mongoose');

// Helper for safe ID
const getSchoolId = (req) => {
    const sid = req.user.schoolId;
    if (typeof sid === 'string' && mongoose.Types.ObjectId.isValid(sid)) {
        return new mongoose.Types.ObjectId(sid);
    }
    return sid;
};

// --- Pages ---
exports.getPages = async (req, res) => {
    try {
        const schoolId = getSchoolId(req);
        const pages = await CMSPage.find({ schoolId }).sort({ createdAt: -1 });
        res.json({ success: true, data: pages });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createPage = async (req, res) => {
    try {
        const page = new CMSPage({ ...req.body, schoolId: req.user.schoolId });
        await page.save();
        res.status(201).json({ success: true, data: page });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updatePage = async (req, res) => {
    try {
        const page = await CMSPage.findOneAndUpdate(
            { _id: req.params.id, schoolId: req.user.schoolId },
            req.body,
            { new: true }
        );
        if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
        res.json({ success: true, data: page });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deletePage = async (req, res) => {
    try {
        const page = await CMSPage.findOneAndDelete({ _id: req.params.id, schoolId: req.user.schoolId });
        if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
        res.json({ success: true, message: 'Page deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Banner Images ---
exports.getBanners = async (req, res) => {
    try {
        const schoolId = getSchoolId(req);
        const banners = await BannerImage.find({ schoolId }).sort({ order: 1 });
        res.json({ success: true, data: banners });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createBanner = async (req, res) => {
    try {
        const banner = new BannerImage({ ...req.body, schoolId: req.user.schoolId });
        await banner.save();
        res.status(201).json({ success: true, data: banner });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateBanner = async (req, res) => {
    try {
        const banner = await BannerImage.findOneAndUpdate(
            { _id: req.params.id, schoolId: req.user.schoolId },
            req.body,
            { new: true }
        );
        if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });
        res.json({ success: true, data: banner });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteBanner = async (req, res) => {
    try {
        const banner = await BannerImage.findOneAndDelete({ _id: req.params.id, schoolId: req.user.schoolId });
        if (!banner) return res.status(404).json({ message: 'Banner not found' });
        res.json({ message: 'Banner deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Gallery ---
exports.getGalleries = async (req, res) => {
    try {
        const schoolId = getSchoolId(req);
        const galleries = await Gallery.find({ schoolId }).sort({ createdAt: -1 });
        res.json({ success: true, data: galleries });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createGallery = async (req, res) => {
    try {
        const gallery = new Gallery({ ...req.body, schoolId: req.user.schoolId });
        await gallery.save();
        res.status(201).json({ success: true, data: gallery });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateGallery = async (req, res) => {
    try {
        const gallery = await Gallery.findOneAndUpdate(
            { _id: req.params.id, schoolId: req.user.schoolId },
            req.body,
            { new: true }
        );
        if (!gallery) return res.status(404).json({ success: false, message: 'Gallery not found' });
        res.json({ success: true, data: gallery });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteGallery = async (req, res) => {
    try {
        const gallery = await Gallery.findOneAndDelete({ _id: req.params.id, schoolId: req.user.schoolId });
        if (!gallery) return res.status(404).json({ message: 'Gallery not found' });
        res.json({ message: 'Gallery deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Testimonials ---
exports.getTestimonials = async (req, res) => {
    try {
        const schoolId = getSchoolId(req);
        const testimonials = await Testimonial.find({ schoolId }).sort({ createdAt: -1 });
        res.json({ success: true, data: testimonials });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createTestimonial = async (req, res) => {
    try {
        const testimonial = new Testimonial({ ...req.body, schoolId: req.user.schoolId });
        await testimonial.save();
        res.status(201).json({ success: true, data: testimonial });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateTestimonial = async (req, res) => {
    try {
        const testimonial = await Testimonial.findOneAndUpdate(
            { _id: req.params.id, schoolId: req.user.schoolId },
            req.body,
            { new: true }
        );
        if (!testimonial) return res.status(404).json({ message: 'Testimonial not found' });
        res.json(testimonial);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteTestimonial = async (req, res) => {
    try {
        const testimonial = await Testimonial.findOneAndDelete({ _id: req.params.id, schoolId: req.user.schoolId });
        if (!testimonial) return res.status(404).json({ message: 'Testimonial not found' });
        res.json({ message: 'Testimonial deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Events (Using existing Event model but simplified/filtered for CMS if needed) ---
// Just reusing existing endpoint logic or creating a wrapper for flexibility
exports.getCMSEvents = async (req, res) => {
    try {
        // Maybe filter by 'public' or similar if we add such field later.
        // For now, return all upcoming events for the school.
        const schoolId = getSchoolId(req);
        const events = await Event.find({ schoolId }).sort({ eventDate: 1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Notices (Using existing Notice model) ---
exports.getCMSNotices = async (req, res) => {
    try {
        const schoolId = getSchoolId(req);
        const notices = await Notice.find({ schoolId }).sort({ date: -1 });
        res.json(notices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Menus ---
exports.getMenus = async (req, res) => {
    try {
        const schoolId = getSchoolId(req);
        const menus = await Menu.find({ schoolId }).sort({ createdAt: -1 });
        res.json({ success: true, data: menus });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createMenu = async (req, res) => {
    try {
        const menu = new Menu({ ...req.body, schoolId: req.user.schoolId });
        await menu.save();
        res.status(201).json(menu);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateMenu = async (req, res) => {
    try {
        const menu = await Menu.findOneAndUpdate(
            { _id: req.params.id, schoolId: req.user.schoolId },
            req.body,
            { new: true }
        );
        if (!menu) return res.status(404).json({ message: 'Menu not found' });
        res.json(menu);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteMenu = async (req, res) => {
    try {
        const menu = await Menu.findOneAndDelete({ _id: req.params.id, schoolId: req.user.schoolId });
        if (!menu) return res.status(404).json({ message: 'Menu not found' });
        res.json({ message: 'Menu deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Media ---
exports.getMedia = async (req, res) => {
    try {
        const { type } = req.query;
        const schoolId = getSchoolId(req);
        const query = { schoolId };
        if (type && type !== 'all') {
            query.type = type;
        }
        const media = await Media.find(query).sort({ createdAt: -1 });
        res.json({ success: true, data: media });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createMedia = async (req, res) => {
    try {
        if (!req.file && !req.body.url) {
            return res.status(400).json({ message: 'No file uploaded or URL provided' });
        }

        let mediaData = {};

        if (req.file) {
            const { originalname, mimetype, filename, size } = req.file;
            // Determine type based on mimetype
            let type = 'document';
            if (mimetype.startsWith('image/')) type = 'image';
            else if (mimetype.startsWith('video/')) type = 'video';
            else if (mimetype === 'application/pdf') type = 'pdf';

            // Construct URL
            const url = `/uploads/documents/${filename}`;

            mediaData = {
                name: req.body.name || originalname,
                type: type,
                url: url,
                size: size
            };
        } else if (req.body.url) {
            // Check for YouTube specifically or general strict video type
            mediaData = {
                name: req.body.name || 'External Link',
                type: req.body.type || 'video', // Default to video for YT links
                url: req.body.url,
                size: req.body.size || 0
            };
        }

        const media = new Media({
            schoolId: req.user.schoolId,
            uploadedBy: req.user.userId || req.user._id,
            ...mediaData
        });

        await media.save();
        res.status(201).json({ success: true, data: media });
    } catch (error) {
        console.error('Media upload error:', error);
        res.status(400).json({ message: error.message });
    }
};

exports.deleteMedia = async (req, res) => {
    try {
        const media = await Media.findOneAndDelete({ _id: req.params.id, schoolId: req.user.schoolId });
        if (!media) return res.status(404).json({ message: 'Media not found' });
        res.json({ message: 'Media deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
