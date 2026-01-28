// routes/library.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  issueBook,
  returnBook,
  getAllIssueRecords,
  getLibraryStats,
  createBookRequest,
  getAllBookRequests,
  updateRequestStatus
} = require('../controllers/libraryController');

// All routes require authentication
router.use(authenticateToken);

// Statistics
router.get('/stats', getLibraryStats);

// Book management
router.get('/books', getAllBooks);
router.get('/books/:id', getBookById);
router.post('/books', createBook);
router.put('/books/:id', updateBook);
router.delete('/books/:id', deleteBook);

// Issue/Return management
router.get('/issues', getAllIssueRecords);
router.post('/issue', issueBook);
router.post('/return/:id', returnBook);

// Book Requests / Reservations
router.get('/requests', getAllBookRequests);
router.post('/requests', createBookRequest);
router.put('/requests/:id', updateRequestStatus);

module.exports = router;
