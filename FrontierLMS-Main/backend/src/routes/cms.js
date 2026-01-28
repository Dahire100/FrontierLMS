const express = require('express');
const router = express.Router();
const cmsController = require('../controllers/cmsController');
const { verifyToken, verifyRole } = require('../middleware/auth');

// Apply middleware to all routes
router.use(verifyToken);
router.use(verifyRole(['school_admin', 'super_admin'])); // Adjust roles as needed

// Pages
router.get('/pages', cmsController.getPages);
router.post('/pages', cmsController.createPage);
router.put('/pages/:id', cmsController.updatePage);
router.delete('/pages/:id', cmsController.deletePage);

// Banners
router.get('/banners', cmsController.getBanners);
router.post('/banners', cmsController.createBanner);
router.put('/banners/:id', cmsController.updateBanner);
router.delete('/banners/:id', cmsController.deleteBanner);

// Gallery
router.get('/galleries', cmsController.getGalleries);
router.post('/galleries', cmsController.createGallery);
router.put('/galleries/:id', cmsController.updateGallery);
router.delete('/galleries/:id', cmsController.deleteGallery);

// Testimonials
router.get('/testimonials', cmsController.getTestimonials);
router.post('/testimonials', cmsController.createTestimonial);
router.put('/testimonials/:id', cmsController.updateTestimonial);
router.delete('/testimonials/:id', cmsController.deleteTestimonial);

// Menus
router.get('/menus', cmsController.getMenus);
router.post('/menus', cmsController.createMenu);
router.put('/menus/:id', cmsController.updateMenu);
router.delete('/menus/:id', cmsController.deleteMenu);

// Media
router.get('/media', cmsController.getMedia);
router.post('/media', cmsController.createMedia);
router.delete('/media/:id', cmsController.deleteMedia);

// Events & Notices (Read-only or managed via this endpoint for CMS views)
router.get('/events', cmsController.getCMSEvents);
router.get('/notices', cmsController.getCMSNotices);

module.exports = router;
