import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const GENRES = [
  'Fiction',
  'Dystopian',
  'Classic',
  'Fantasy',
  'Romance',
  'Sci-Fi',
  'Mystery',
  'Thriller',
  'Biography',
  'Non-Fiction'
];

export default function BookFormModal({ isOpen, onClose, onSubmit, book }) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: 'Fiction',
    year: '',
    description: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prefill form in edit mode or clear it in add mode
  useEffect(() => {
    if (isOpen) {
      if (book) {
        setFormData({
          title: book.title || '',
          author: book.author || '',
          genre: book.genre || 'Fiction',
          year: book.year || '',
          description: book.description || ''
        });
      } else {
        setFormData({
          title: '',
          author: '',
          genre: 'Fiction',
          year: '',
          description: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, book]);

  // ESC shortcut to close modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error dynamically
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const tempErrors = {};
    const titleVal = formData.title.trim();
    const authorVal = formData.author.trim();
    const yearVal = formData.year.trim();

    // 1. Title checks
    if (!titleVal) {
      tempErrors.title = 'Book Title is required.';
    } else if (titleVal.length > 100) {
      tempErrors.title = 'Title must not exceed 100 characters.';
    }

    // 2. Author checks
    if (!authorVal) {
      tempErrors.author = 'Author name is required.';
    } else if (authorVal.length > 100) {
      tempErrors.author = 'Author name must not exceed 100 characters.';
    }

    // 3. Year checks
    const currentYear = new Date().getFullYear();
    if (!yearVal) {
      tempErrors.year = 'Published Year is required.';
    } else if (!/^\d{4}$/.test(yearVal)) {
      tempErrors.year = 'Year must be a full 4-digit number (e.g. 1998).';
    } else {
      const numericYear = parseInt(yearVal);
      if (numericYear > currentYear) {
        tempErrors.year = `Year cannot exceed the current year ${currentYear}.`;
      }
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      alert(err.message || 'Error occurred while saving the record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-60 backdrop-blur-xs">
      {/* Modal Backdrop Closer */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Dialog Content */}
      <div className="relative w-full max-w-md bg-white border-2 border-blue-600 rounded-lg shadow-2xl overflow-hidden transform transition-all">
        
        {/* Header Block (Student Project Blue Style) */}
        <div className="bg-blue-600 px-5 py-3 flex justify-between items-center text-white">
          <h2 className="text-lg font-bold">
            {book ? '✏️ Edit Book Record' : '➕ Add New Book Record'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-white hover:text-gray-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleFormSubmit}>
          <div className="p-5 space-y-4">
            
            {/* Title Input */}
            <div>
              <label htmlFor="title" className="block text-sm font-bold text-gray-700 mb-1">
                Book Title <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter title (e.g. 1984)"
                className="w-full px-3 py-2 text-sm bg-white border-2 border-gray-300 rounded focus:outline-none focus:border-blue-600"
              />
              {errors.title && <p className="mt-1 text-xs text-red-600 font-bold">{errors.title}</p>}
            </div>

            {/* Author Input */}
            <div>
              <label htmlFor="author" className="block text-sm font-bold text-gray-700 mb-1">
                Author Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleChange}
                placeholder="Enter author (e.g. George Orwell)"
                className="w-full px-3 py-2 text-sm bg-white border-2 border-gray-300 rounded focus:outline-none focus:border-blue-600"
              />
              {errors.author && <p className="mt-1 text-xs text-red-600 font-bold">{errors.author}</p>}
            </div>

            {/* Genre and Year Select/Input */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="genre" className="block text-sm font-bold text-gray-700 mb-1">
                  Genre <span className="text-red-600">*</span>
                </label>
                <select
                  id="genre"
                  name="genre"
                  value={formData.genre}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm bg-white border-2 border-gray-300 rounded focus:outline-none focus:border-blue-600 cursor-pointer font-medium"
                >
                  {GENRES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="year" className="block text-sm font-bold text-gray-700 mb-1">
                  Published Year <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  placeholder="e.g. 1949"
                  className="w-full px-3 py-2 text-sm bg-white border-2 border-gray-300 rounded focus:outline-none focus:border-blue-600"
                />
                {errors.year && <p className="mt-1 text-xs text-red-600 font-bold">{errors.year}</p>}
              </div>
            </div>

            {/* Description Textarea */}
            <div>
              <label htmlFor="description" className="block text-sm font-bold text-gray-700 mb-1">
                Description / Summary
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter a brief summary (optional)..."
                rows={3}
                className="w-full px-3 py-2 text-sm bg-white border-2 border-gray-300 rounded focus:outline-none focus:border-blue-600 resize-none"
              />
            </div>
          </div>

          {/* Form Action Controls */}
          <div className="bg-gray-100 px-5 py-3.5 flex justify-end gap-2 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold px-4 py-1.5 rounded text-sm cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-1.5 rounded text-sm cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Processing...' : 'Save Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
