import React, { useState, useEffect, useMemo } from 'react';
import { api, USE_REAL_API, API_BASE_URL } from './api/mockApi';
import BookCard from './components/BookCard';
import BookFormModal from './components/BookFormModal';
import { Library, Plus, Search, Grid, List, RefreshCw, AlertCircle, HelpCircle } from 'lucide-react';

export default function App() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  
  // Layout Selector (Card Grid vs Data Table - Very typical for MCA student projects!)
  const [viewMode, setViewMode] = useState('table'); // Default to table for data management style

  // Modal Control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null); // null is add, object is edit

  // Fetch all book records on load
  const fetchLibraryData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getBooks();
      setBooks(data);
    } catch (err) {
      setError(err.message || 'Error occurred while loading data from library database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibraryData();
  }, []);

  // Compute unique genres list dynamically from state
  const genresList = useMemo(() => {
    const list = new Set(books.map((b) => b.genre));
    return ['All', ...Array.from(list)];
  }, [books]);

  // Derived state: Search and Filter matching records
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchSearch =
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchGenre = selectedGenre === 'All' || book.genre === selectedGenre;
      
      return matchSearch && matchGenre;
    });
  }, [books, searchQuery, selectedGenre]);

  // Derived database statistics
  const stats = useMemo(() => {
    if (books.length === 0) return { total: 0, genresCount: 0, latestYear: 'N/A' };
    const genres = new Set(books.map((b) => b.genre));
    const years = books.map((b) => parseInt(b.year)).filter((y) => !isNaN(y));
    const latestYear = years.length > 0 ? Math.max(...years) : 'N/A';
    return {
      total: books.length,
      genresCount: genres.size,
      latestYear
    };
  }, [books]);

  // CRUD Operation: Create or Update book
  const handleSaveBook = async (formData) => {
    if (selectedBook) {
      // Execute Update Action
      const updated = await api.updateBook(selectedBook.id, formData);
      setBooks((prev) => prev.map((b) => (b.id === selectedBook.id ? updated : b)));
    } else {
      // Execute Create Action
      const newBook = await api.addBook(formData);
      setBooks((prev) => [newBook, ...prev]);
    }
  };

  // CRUD Operation: Delete book
  const handleDeleteBook = async (id) => {
    if (window.confirm('Delete Alert: Are you sure you want to permanently delete this book record?')) {
      try {
        await api.deleteBook(id);
        setBooks((prev) => prev.filter((b) => b.id !== id));
      } catch (err) {
        alert(err.message || 'Error occurred while attempting to delete the book.');
      }
    }
  };

  const handleEditClick = (book) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setSelectedBook(null);
    setIsModalOpen(true);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedGenre('All');
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 font-sans antialiased">
      
      {/* College Project Style Blue Header Banner */}
      <header className="bg-blue-800 text-white shadow-md border-b-4 border-blue-900">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded shadow-inner">
              <Library className="w-8 h-8 text-blue-800" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">LIBRARYPRO</h1>
              <p className="text-xs text-blue-200 font-semibold uppercase tracking-wider">
                Book Management System (MCA Term Assignment Project)
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={fetchLibraryData}
              className="bg-blue-700 hover:bg-blue-600 text-white font-bold px-3 py-2 rounded text-sm flex items-center gap-1.5 border border-blue-500 shadow-sm cursor-pointer"
              title="Reload database records"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Database
            </button>
            <button
              onClick={handleAddClick}
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded text-sm flex items-center gap-1.5 border border-green-500 shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Book Record
            </button>
          </div>
        </div>
      </header>

      {/* Main Database Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">

        {/* Database Quick Stats Boxes */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border-2 border-gray-300 rounded shadow-md p-4 text-center">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total Book Count</p>
            <p className="text-3xl font-extrabold text-blue-800">{stats.total}</p>
          </div>
          <div className="bg-white border-2 border-gray-300 rounded shadow-md p-4 text-center">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Unique Genres Available</p>
            <p className="text-3xl font-extrabold text-green-700">{stats.genresCount}</p>
          </div>
          <div className="bg-white border-2 border-gray-300 rounded shadow-md p-4 text-center">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Latest Publication Year</p>
            <p className="text-3xl font-extrabold text-yellow-600">{stats.latestYear}</p>
          </div>
        </section>

        {/* Database Filter and Integration Status Info Bar */}
        <section className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6 rounded shadow-sm text-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <p className="text-blue-900 font-semibold flex items-center gap-1.5">
              <HelpCircle className="w-4.5 h-4.5 text-blue-700 shrink-0" />
              <span>
                <strong>API Config Mode:</strong> {USE_REAL_API ? `🌐 CONNECTED to real server (${API_BASE_URL})` : '💾 RUNNING in simulated browser storage mode.'}
              </span>
            </p>
            <p className="text-xs text-blue-700">
              * Switch <code className="bg-blue-100 px-1 py-0.5 rounded font-mono font-bold">USE_REAL_API</code> in <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">src/api/mockApi.js</code> to link real backends.
            </p>
          </div>
        </section>

        {/* Search, Filter Toolbar & View Toggle */}
        <section className="bg-white border-2 border-gray-300 rounded shadow-md p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
            
            {/* Search Input Box */}
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2">
              <label htmlFor="search" className="text-sm font-bold text-gray-700 shrink-0">
                🔍 Search Title/Author:
              </label>
              <div className="relative w-full sm:max-w-md">
                <input
                  type="text"
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter book title or author keyword..."
                  className="w-full pl-3 pr-3 py-1.5 text-sm bg-white border-2 border-gray-300 rounded focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            {/* Genre Filter & View Toggle Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              
              {/* Select Genre */}
              <div className="flex items-center gap-2">
                <label htmlFor="genreFilter" className="text-sm font-bold text-gray-700 shrink-0">
                  📁 Genre Filter:
                </label>
                <select
                  id="genreFilter"
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="px-2 py-1.5 text-sm bg-white border-2 border-gray-300 rounded focus:outline-none focus:border-blue-600 cursor-pointer"
                >
                  {genresList.map((g) => (
                    <option key={g} value={g}>
                      {g === 'All' ? 'All Genres' : g}
                    </option>
                  ))}
                </select>
              </div>

              {/* Layout view toggle buttons */}
              <div className="flex items-center border-2 border-gray-300 rounded overflow-hidden">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                    viewMode === 'table'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  title="Table layout view"
                >
                  <List className="w-3.5 h-3.5" />
                  Table
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  title="Card layout view"
                >
                  <Grid className="w-3.5 h-3.5" />
                  Cards
                </button>
              </div>

              {/* Reset filter button */}
              {(searchQuery || selectedGenre !== 'All') && (
                <button
                  onClick={handleResetFilters}
                  className="bg-gray-100 hover:bg-gray-200 text-blue-800 font-bold border border-gray-300 px-3 py-1.5 rounded text-xs cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Database Load Alert Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border-2 border-red-400 rounded text-red-950 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">⚠️ Database Connection Issue</h4>
              <p className="text-xs mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Loading database spinner */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border-2 border-gray-300 rounded shadow-md">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-800 rounded-full animate-spin"></div>
            <p className="mt-4 text-sm font-bold text-gray-600">Loading library database records...</p>
          </div>
        ) : (
          <>
            {filteredBooks.length > 0 ? (
              viewMode === 'table' ? (
                /* 1. STUDENT PROJECT DATA TABLE MODE */
                <div className="bg-white border-2 border-gray-300 rounded shadow-md overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-blue-800 text-white border-b-2 border-blue-900 text-sm font-bold">
                        <th className="px-4 py-3 text-center w-16">S.No.</th>
                        <th className="px-4 py-3">Book Title</th>
                        <th className="px-4 py-3">Author</th>
                        <th className="px-4 py-3 w-32">Genre</th>
                        <th className="px-4 py-3 text-center w-24">Year</th>
                        <th className="px-4 py-3">Description</th>
                        <th className="px-4 py-3 text-center w-48">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-sm">
                      {filteredBooks.map((book, idx) => (
                        <tr
                          key={`book-row-${book.id || idx}-${idx}`}
                          className={`hover:bg-blue-5/30 transition-colors ${
                            idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          }`}
                        >
                          <td className="px-4 py-3 text-center font-bold text-gray-500">{idx + 1}</td>
                          <td className="px-4 py-3 font-bold text-blue-950">{book.title}</td>
                          <td className="px-4 py-3 font-medium text-gray-700">{book.author}</td>
                          <td className="px-4 py-3">
                            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[11px] font-bold uppercase">
                              {book.genre}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center font-semibold text-gray-700">{book.year}</td>
                          <td className="px-4 py-3 text-xs text-gray-600 max-w-xs truncate" title={book.description}>
                            {book.description || '-'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex gap-1.5 justify-center">
                              <button
                                onClick={() => handleEditClick(book)}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-2.5 py-1 rounded text-[11px] cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteBook(book.id)}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold px-2.5 py-1 rounded text-[11px] cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 text-xs text-gray-500 font-semibold text-right">
                    Showing {filteredBooks.length} record(s) in Database table
                  </div>
                </div>
              ) : (
                /* 2. CARD VIEW GRID MODE */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredBooks.map((book, idx) => (
                    <BookCard
                      key={`book-card-${book.id || idx}-${idx}`}
                      book={book}
                      onEdit={handleEditClick}
                      onDelete={handleDeleteBook}
                    />
                  ))}
                </div>
              )
            ) : (
              /* EMPTY DATABASE VIEW */
              <div className="bg-white border-2 border-gray-300 rounded shadow-md py-16 px-4 text-center">
                <p className="text-4xl mb-3">📁</p>
                <h3 className="text-lg font-bold text-gray-900 mb-1">No Records Found</h3>
                <p className="text-sm text-gray-600 max-w-sm mx-auto mb-5">
                  No matching books exist in the collection for the current search criteria or active genre filters.
                </p>
                <div className="flex justify-center gap-2">
                  {(searchQuery || selectedGenre !== 'All') && (
                    <button
                      onClick={handleResetFilters}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold border border-gray-300 px-4 py-2 rounded text-sm cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  )}
                  <button
                    onClick={handleAddClick}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold border border-green-500 px-4 py-2 rounded text-sm cursor-pointer"
                  >
                    Add New Record
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Book Add/Edit modal popup */}
      <BookFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveBook}
        book={selectedBook}
      />
    </div>
  );
}
