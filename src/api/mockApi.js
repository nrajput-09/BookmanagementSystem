/**
 * ============================================================================
 * LIBRARYPRO API CONFIGURATION & SIMULATION LAYER
 * ============================================================================
 * 
 * DIRECTIONS FOR ADDING YOUR REAL API (JSON Server, MockAPI, Hosted REST backend):
 * 1. Change `USE_REAL_API` below to true.
 * 2. Set `API_BASE_URL` to your hosting URL (e.g. 'http://localhost:3001' or 'https://mockapi.io/api/v1/...' ).
 * 3. Make sure your server endpoints match:
 *    - GET    /books     (Returns list of all books)
 *    - POST   /books     (Creates a book, receives book body, returns created book with ID)
 *    - PUT    /books/:id (Updates a book, receives book body, returns updated book)
 *    - DELETE /books/:id (Deletes a book, returns deleted book ID or status)
 */

// 1. --- CONFIGURATION ---
export const USE_REAL_API = true; // Set to TRUE to connect to your real database server!
export const API_BASE_URL = 'https://6a14338b6c7db8aac0540840.mockapi.io/api/e-l'; // Replace with your real API endpoint

// 2. --- SECURITY & SANITIZATION UTILITIES ---
/**
 * Sanitizes input strings to escape HTML entities.
 * This blocks Stored Cross-Site Scripting (XSS) attacks by neutralizing HTML tags like <script>
 */
const sanitizeInput = (str) => {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Validates book parameters to guarantee database and application schema integrity.
 */
const validateBookSchema = (book) => {
  if (!book.title || book.title.trim().length === 0) {
    throw new Error('Validation Error: Book Title is required.');
  }
  if (book.title.length > 100) {
    throw new Error('Validation Error: Book Title is too long (Max 100 chars).');
  }
  if (!book.author || book.author.trim().length === 0) {
    throw new Error('Validation Error: Author is required.');
  }
  if (book.author.length > 100) {
    throw new Error('Validation Error: Author name is too long (Max 100 chars).');
  }
  if (!book.genre || book.genre.trim().length === 0) {
    throw new Error('Validation Error: Genre is required.');
  }
  
  const currentYear = new Date().getFullYear();
  if (!book.year || !/^\d{4}$/.test(book.year.toString().trim())) {
    throw new Error('Validation Error: Published Year must be a 4-digit number (e.g. 1998).');
  }
  const yearVal = parseInt(book.year);
  if (yearVal > currentYear) {
    throw new Error(`Validation Error: Published Year cannot exceed the current year ${currentYear}.`);
  }
};

// 3. --- INITIAL DUMMY RECORDS ---
const DEFAULT_RECORDS = [
  {
    id: '1',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    genre: 'Fiction',
    year: '1960',
    description: 'A classic novel exploring justice and racial tension in the American South.'
  },
  {
    id: '2',
    title: '1984',
    author: 'George Orwell',
    genre: 'Dystopian',
    year: '1949',
    description: 'A powerful social science fiction novel depicting the dangers of totalitarianism and surveillance.'
  },
  {
    id: '3',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    genre: 'Classic',
    year: '1925',
    description: 'A study of ambition, wealth, and the elusive nature of the American Dream in the Roaring Twenties.'
  },
  {
    id: '4',
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    genre: 'Fantasy',
    year: '1937',
    description: 'An epic high-fantasy adventure following the hobbit Bilbo Baggins on a quest for dragon gold.'
  },
  {
    id: '5',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    genre: 'Romance',
    year: '1813',
    description: 'A witty comedy of manners centered around the turbulent relationship of Elizabeth Bennet and Mr. Darcy.'
  }
];

// 4. --- LOCALSTORAGE MOCK CONTROLLER ---
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getSavedBooks = () => {
  const data = localStorage.getItem('librarypro_books');
  if (!data) {
    localStorage.setItem('librarypro_books', JSON.stringify(DEFAULT_RECORDS));
    return DEFAULT_RECORDS;
  }
  try {
    const parsed = JSON.parse(data);
    // Secure parsing: filter out malformed or corrupt objects
    if (!Array.isArray(parsed)) return DEFAULT_RECORDS;
    return parsed.filter(b => b && typeof b === 'object' && b.id && b.title);
  } catch (e) {
    return DEFAULT_RECORDS;
  }
};

const saveBooks = (books) => {
  localStorage.setItem('librarypro_books', JSON.stringify(books));
};


// 5. --- EXPORTED API WRAPPER ---
export const api = {
  getBooks: async () => {
    if (USE_REAL_API) {
      const response = await fetch(`${API_BASE_URL}/books`);
      if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);
      return await response.json();
    } else {
      await sleep(500); // Simulate network latency
      return getSavedBooks();
    }
  },

  addBook: async (rawBookData) => {
    // Validate schema
    validateBookSchema(rawBookData);
    
    // Sanitize input strings for security
    const sanitizedBook = {
      title: sanitizeInput(rawBookData.title),
      author: sanitizeInput(rawBookData.author),
      genre: sanitizeInput(rawBookData.genre),
      year: sanitizeInput(rawBookData.year),
      description: sanitizeInput(rawBookData.description || '')
    };

    if (USE_REAL_API) {
      const response = await fetch(`${API_BASE_URL}/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitizedBook)
      });
      if (!response.ok) throw new Error(`Failed to save book! Server status: ${response.status}`);
      return await response.json();
    } else {
      await sleep(700);
      const books = getSavedBooks();
      const newBook = {
        ...sanitizedBook,
        id: Date.now().toString()
      };
      books.unshift(newBook);
      saveBooks(books);
      return newBook;
    }
  },

  updateBook: async (id, rawBookData) => {
    // Validate schema
    validateBookSchema(rawBookData);

    // Sanitize input strings for security
    const sanitizedBook = {
      title: sanitizeInput(rawBookData.title),
      author: sanitizeInput(rawBookData.author),
      genre: sanitizeInput(rawBookData.genre),
      year: sanitizeInput(rawBookData.year),
      description: sanitizeInput(rawBookData.description || '')
    };

    if (USE_REAL_API) {
      const response = await fetch(`${API_BASE_URL}/books/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitizedBook)
      });
      if (!response.ok) throw new Error(`Failed to update book! Server status: ${response.status}`);
      return await response.json();
    } else {
      await sleep(700);
      const books = getSavedBooks();
      const index = books.findIndex((b) => b.id === id);
      if (index === -1) throw new Error('Book record not found.');
      
      const updatedBook = {
        ...books[index],
        ...sanitizedBook,
        id // Preserve original ID
      };
      books[index] = updatedBook;
      saveBooks(books);
      return updatedBook;
    }
  },

  deleteBook: async (id) => {
    if (USE_REAL_API) {
      const response = await fetch(`${API_BASE_URL}/books/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error(`Failed to delete book! Server status: ${response.status}`);
      return id;
    } else {
      await sleep(500);
      const books = getSavedBooks();
      const filtered = books.filter((b) => b.id !== id);
      saveBooks(filtered);
      return id;
    }
  }
};
