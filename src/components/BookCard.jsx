import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

export default function BookCard({ book, onEdit, onDelete }) {
  const { title, author, genre, year, description } = book;

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg shadow-md p-5 flex flex-col justify-between hover:border-blue-500 transition-colors">
      <div>
        {/* Book Title */}
        <h3 className="text-lg font-bold text-blue-800 mb-1 border-b border-gray-100 pb-1">
          {title}
        </h3>
        
        {/* Book Details */}
        <div className="space-y-1.5 my-3 text-sm">
          <p className="text-gray-700">
            <span className="font-semibold text-gray-900">Author:</span> {author}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold text-gray-900">Genre:</span>{' '}
            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
              {genre}
            </span>
          </p>
          <p className="text-gray-700">
            <span className="font-semibold text-gray-900">Published:</span> {year}
          </p>
        </div>

        {/* Book Description */}
        <div className="mt-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Description / Summary:
          </p>
          <p className="text-sm text-gray-600 italic bg-gray-50 p-2.5 rounded border border-gray-100 line-clamp-3">
            {description || 'No description provided for this book.'}
          </p>
        </div>
      </div>

      {/* Button Controls */}
      <div className="flex gap-2 justify-end mt-5 pt-3 border-t border-gray-200">
        <button
          onClick={() => onEdit(book)}
          className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-3 py-1.5 rounded shadow-sm text-xs cursor-pointer transition-colors"
        >
          <Edit className="w-3.5 h-3.5" />
          Edit Details
        </button>
        <button
          onClick={() => onDelete(book.id)}
          className="flex items-center gap-1 bg-red-600 hover:bg-red-750 text-white font-bold px-3 py-1.5 rounded shadow-sm text-xs cursor-pointer transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete
        </button>
      </div>
    </div>
  );
}
