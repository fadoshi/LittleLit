import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      maxlength: 1000,
    },
    genre: {
      type: String,
      enum: ['Fantasy', 'Adventure', 'Science Fiction', 'Mystery', 'Educational', 'Picture Book', 'Other'],
      default: 'Other',
    },
    ageGroup: {
      type: String,
      enum: ['3-5', '6-8', '9-12', 'Teen'],
      required: true,
    },
    coverImage: {
      type: String, // URL to cover image
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // optional: link to user who added the book
      required: true,
    },
  });
  
  const Book = mongoose.model('Book', bookSchema);
  export default Book;