import Book from '../models/Book.js';
import cloudinary from'../lib/cloudinary.js';
import fs from 'fs/promises';

//create new book post
export const book = async (req, res) => {
    try {
        const { title, author, description, genre, ageGroup, coverImage, rating } = req.body;
        const userId = req.user?._id; // assuming you're using JWT and attaching user info via middleware
    
        // Validate required fields
        if (!title || !author || !ageGroup) {
          return res.status(400).json({ message: 'Title, author, and age group are required.' });
        }

        // Ensure file is present
        if (!req.file) {
            return res.status(400).json({ message: 'Cover image is required.' });
        }

        //Uplode he image to clouninary
        const bookImage = await cloudinary.uploader.upload(req.file.path, {
          folder: 'book_covers',
        });
        // deletes the uploaded file from local disk
        await fs.unlink(req.file.path); 
    
        // Create new book entry
        const newBook = new Book({
            title,
            author,
            description,
            genre,
            ageGroup,
            coverImage: bookImage.secure_url,
            rating: rating || 0,
            addedBy: userId || null,
          });
    
        await newBook.save();
    
        res.status(201).json({
          message: 'Book added successfully',
          book: newBook,
        });
      } catch (err) {
        console.error('Error creating book:', err);
        res.status(500).json({ message: 'Server error while adding book.' });
      }
}

//Fetch all books
export const allBooks = async (req, res) => {
    try {
        const { title, genre, ageGroup, page = 1, limit = 10 } = req.query;
    
        const query = {};
    
        // Search by title (case-insensitive)
        if (title) {
          query.title = { $regex: title, $options: 'i' };
        }
    
        // Filter by genre
        if (genre) {
          query.genre = genre;
        }
    
        // Filter by age group
        if (ageGroup) {
          query.ageGroup = ageGroup;
        }
    
        const skip = (page - 1) * limit;
    
        const books = await Book.find(query)
          .populate('addedBy', 'username profileImage')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit));
    
        const total = await Book.countDocuments(query);
    
        res.status(200).json({
          message: 'Books fetched successfully',
          count: books.length,
          total,
          page: parseInt(page),
          totalPages: Math.ceil(total / limit),
          books,
        });
      } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ message: 'Failed to fetch books. Server error.' });
      }
}

//Delete a books
export const deleteBook = async (req, res) => {
    try {
        const bookId = req.params.id;
        const userId = req.user?._id; // from JWT middleware
    
        const book = await Book.findById(bookId);
    
        if (!book) {
          return res.status(404).json({ message: 'Book not found' });
        }
        console.log("User ID from token:", userId);
console.log("Book addedBy ID:", book.addedBy);
    
        // Optional: Only allow deletion by the user who added the book
        if (book.addedBy?.toString() !== userId?.toString()) {
          return res.status(403).json({ message: 'Unauthorized to delete this book' });
        }

        // Delete image from Cloudinary
        if (book.coverImage && book.coverImage.includes("cloudinary")) {
            try {
                const publicId = book.coverImage.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(publicId);
            }catch(err){
                console.log("Error deleting image from Cloudinary", err);
            }
        }
    
        await book.deleteOne();
    
        res.status(200).json({ message: 'Book deleted successfully' });
    } catch (error) {
        console.error('Delete book error:', error);
        res.status(500).json({ message: 'Server error while deleting book' });
    }
}

//Get books added by user
export const addedByUser = async (req, res) => {
    try {
        const userId = req.user?._id;
    
        if (!userId) {
          return res.status(401).json({ message: 'Unauthorized: User not found' });
        }
    
        const books = await Book.find({ addedBy: userId }).sort({ createdAt: -1 });
    
        res.status(200).json({
          message: 'Books added by user fetched successfully',
          count: books.length,
          books,
        });
      } catch (error) {
        console.error('Error fetching user books:', error);
        res.status(500).json({ message: 'Failed to fetch user books. Server error.' });
      }
}