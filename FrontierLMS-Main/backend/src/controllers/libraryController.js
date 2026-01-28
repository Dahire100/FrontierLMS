// controllers/libraryController.js
const { Book, IssueRecord, BookRequest } = require('../models/Library');

// ===== BOOK MANAGEMENT =====

// Get all books
exports.getAllBooks = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { category, isActive } = req.query;

    const query = { schoolId };
    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const books = await Book.find(query).sort({ title: 1 });

    res.json({
      success: true,
      data: books
    });
  } catch (err) {
    console.error('Error fetching books:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch books'
    });
  }
};

// Get book by ID
exports.getBookById = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { id } = req.params;

    const book = await Book.findOne({ _id: id, schoolId });

    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }

    // Get issue history
    const issueHistory = await IssueRecord.find({ bookId: id })
      .populate('issuedTo.userId', 'firstName lastName')
      .sort({ issueDate: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        ...book.toObject(),
        issueHistory
      }
    });
  } catch (err) {
    console.error('Error fetching book:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch book'
    });
  }
};

// Create book
exports.createBook = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { title, author, isbn, bookNumber, category, publisher, publishedYear, quantity, rackNumber, price, description } = req.body;

    // Check if book number already exists
    const existingBook = await Book.findOne({ schoolId, bookNumber });
    if (existingBook) {
      return res.status(400).json({
        success: false,
        error: 'Book number already exists'
      });
    }

    const newBook = new Book({
      schoolId,
      title,
      author,
      isbn,
      bookNumber,
      category,
      publisher,
      publishedYear,
      quantity: quantity || 1,
      availableQuantity: quantity || 1,
      rackNumber,
      price: price || 0,
      description
    });

    await newBook.save();

    res.status(201).json({
      success: true,
      message: 'Book added successfully',
      data: newBook
    });
  } catch (err) {
    console.error('Error creating book:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to add book'
    });
  }
};

// Update book
exports.updateBook = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { id } = req.params;

    const book = await Book.findOneAndUpdate(
      { _id: id, schoolId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }

    res.json({
      success: true,
      message: 'Book updated successfully',
      data: book
    });
  } catch (err) {
    console.error('Error updating book:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to update book'
    });
  }
};

// Delete book (soft delete)
exports.deleteBook = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { id } = req.params;

    // Check if book is issued
    const issuedCount = await IssueRecord.countDocuments({
      bookId: id,
      status: 'issued'
    });

    if (issuedCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete book. ${issuedCount} copies are currently issued.`
      });
    }

    const book = await Book.findOneAndUpdate(
      { _id: id, schoolId },
      { $set: { isActive: false } },
      { new: true }
    );

    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }

    res.json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting book:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to delete book'
    });
  }
};

// ===== ISSUE/RETURN MANAGEMENT =====

// Issue book
exports.issueBook = async (req, res) => {
  try {
    const { schoolId, userId } = req.user;
    const { bookId, userType, issuedToId, dueDate, name, contactNumber } = req.body;

    // Check if book exists and is available
    const book = await Book.findOne({ _id: bookId, schoolId, isActive: true });

    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }

    if (book.availableQuantity <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Book is not available for issue'
      });
    }

    // Create issue record
    const issueRecord = new IssueRecord({
      schoolId,
      bookId,
      issuedTo: {
        userType,
        userId: issuedToId,
        name,
        contactNumber
      },
      dueDate,
      issuedBy: userId,
      status: 'issued'
    });

    await issueRecord.save();

    // Update book availability
    book.availableQuantity -= 1;
    await book.save();

    res.status(201).json({
      success: true,
      message: 'Book issued successfully',
      data: issueRecord
    });
  } catch (err) {
    console.error('Error issuing book:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to issue book'
    });
  }
};

// Return book
exports.returnBook = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { id } = req.params;
    const { fineAmount, remarks } = req.body;

    const issueRecord = await IssueRecord.findOne({ _id: id, schoolId });

    if (!issueRecord) {
      return res.status(404).json({
        success: false,
        error: 'Issue record not found'
      });
    }

    if (issueRecord.status === 'returned') {
      return res.status(400).json({
        success: false,
        error: 'Book already returned'
      });
    }

    // Update issue record
    issueRecord.returnDate = new Date();
    issueRecord.status = 'returned';
    issueRecord.fineAmount = fineAmount || 0;
    issueRecord.remarks = remarks;

    await issueRecord.save();

    // Update book availability
    const book = await Book.findById(issueRecord.bookId);
    if (book) {
      book.availableQuantity += 1;
      await book.save();
    }

    res.json({
      success: true,
      message: 'Book returned successfully',
      data: issueRecord
    });
  } catch (err) {
    console.error('Error returning book:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to return book'
    });
  }
};

// Get all issue records
exports.getAllIssueRecords = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { status, userType } = req.query;

    const query = { schoolId };
    if (status) query.status = status;
    if (userType) query['issuedTo.userType'] = userType;

    const records = await IssueRecord.find(query)
      .populate('bookId', 'title author bookNumber')
      .populate('issuedBy', 'firstName lastName')
      .sort({ issueDate: -1 });

    res.json({
      success: true,
      data: records
    });
  } catch (err) {
    console.error('Error fetching issue records:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch issue records'
    });
  }
};

// Get library statistics
exports.getLibraryStats = async (req, res) => {
  try {
    const { schoolId } = req.user;

    const totalBooks = await Book.countDocuments({ schoolId, isActive: true });
    const totalQuantity = await Book.aggregate([
      { $match: { schoolId, isActive: true } },
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]);

    const availableQuantity = await Book.aggregate([
      { $match: { schoolId, isActive: true } },
      { $group: { _id: null, total: { $sum: '$availableQuantity' } } }
    ]);

    const issuedCount = await IssueRecord.countDocuments({ schoolId, status: 'issued' });
    const overdueCount = await IssueRecord.countDocuments({
      schoolId,
      status: 'issued',
      dueDate: { $lt: new Date() }
    });

    res.json({
      success: true,
      data: {
        totalBooks,
        totalQuantity: totalQuantity[0]?.total || 0,
        availableQuantity: availableQuantity[0]?.total || 0,
        issuedCount,
        overdueCount
      }
    });
  } catch (err) {
    console.error('Error fetching library stats:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
};

// ===== BOOK REQUEST / RESERVATION =====

// Create book request
exports.createBookRequest = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { studentId, bookTitle, author, remarks } = req.body;

    const newRequest = new BookRequest({
      schoolId,
      studentId,
      bookTitle,
      author,
      remarks
    });

    await newRequest.save();

    res.status(201).json({
      success: true,
      message: 'Book request submitted',
      data: newRequest
    });
  } catch (err) {
    console.error('Error creating book request:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to submit request'
    });
  }
};

// Get all requests
exports.getAllBookRequests = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { status } = req.query;

    const query = { schoolId };
    if (status) query.status = status;

    const requests = await BookRequest.find(query)
      .populate('studentId', 'firstName lastName admissionNumber')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: requests
    });
  } catch (err) {
    console.error('Error fetching requests:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch requests'
    });
  }
};

// Update request status
exports.updateRequestStatus = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { id } = req.params;
    const { status, remarks } = req.body;

    const request = await BookRequest.findOneAndUpdate(
      { _id: id, schoolId },
      { $set: { status, remarks } },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }

    res.json({
      success: true,
      message: `Request ${status}`,
      data: request
    });
  } catch (err) {
    console.error('Error updating request:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to update request'
    });
  }
};
