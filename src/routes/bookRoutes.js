import express from "express";
import {book, allBooks, deleteBook, addedByUser } from "../controllers/book.js"
import protectedRoute from "../middleware/auth.middleware.js";
import upload from '../middleware/upload.middleware.js';

const router = express.Router();

//endpoints
router.post("/", protectedRoute, upload.single('coverImage'), book)
router.get("/", protectedRoute, allBooks);
router.delete("/:id", protectedRoute, deleteBook);
router.get("/user", protectedRoute, addedByUser);

export default router;
