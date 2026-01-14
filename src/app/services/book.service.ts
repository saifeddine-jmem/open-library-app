import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Book, BooksResponse, BookDetailsResponse } from '../models/book.model';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private apiUrl = 'https://openlibrary.org';
  private booksSubject = new BehaviorSubject<Book[]>([]);
  public books$ = this.booksSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Fetch all computer science books
   * @returns Observable of books
   */
  getBooks(): Observable<BooksResponse> {
    return this.http.get<BooksResponse>(`${this.apiUrl}/subjects/computer_science.json?limit=50`).pipe(
      map(response => ({
        ...response,
        works: this.transformBooks(response.works || [])
      })),
      catchError(error => {
        console.error('Error fetching books:', error);
        throw error;
      })
    );
  }

  /**
   * Search books by title
   * @param title - Book title to search
   * @returns Observable of books matching the title
   */
  searchByTitle(title: string): Observable<BooksResponse> {
    const query = title.toLowerCase().replace(/\s+/g, '+');
    return this.http.get<BooksResponse>(`${this.apiUrl}/search.json?title=${query}&limit=50`).pipe(
      map(response => ({
        ...response,
        works: this.transformBooks(response.docs || [])
      })),
      catchError(error => {
        console.error('Error searching by title:', error);
        throw error;
      })
    );
  }

  /**
   * Search books by publication year
   * @param year - Publication year
   * @returns Observable of books from that year
   */
  searchByYear(year: number): Observable<BooksResponse> {
    // Use a generic search term with year filter to get results
    // API requires a query term (minimum 3 chars), so we use 'book' as a broad search
    return this.http.get<BooksResponse>(`${this.apiUrl}/search.json?q=book&first_publish_year=${year}&limit=100`).pipe(
      map(response => {
        // Filter to ensure exact year match
        const filtered = (response.docs || []).filter(book => 
          book.first_publish_year === year
        );
        return {
          ...response,
          works: this.transformBooks(filtered)
        };
      }),
      catchError(error => {
        console.error('Error searching by year:', error);
        throw error;
      })
    );
  }

  /**
   * Combined search by title and year
   * @param title - Book title
   * @param year - Publication year
   * @returns Observable of filtered books
   */
  searchByTitleAndYear(title: string, year: number): Observable<BooksResponse> {
    const query = title.toLowerCase().replace(/\s+/g, '+');
    // Search by title with year parameter for better results
    return this.http.get<BooksResponse>(
      `${this.apiUrl}/search.json?q=${query}&first_publish_year=${year}&limit=100`
    ).pipe(
      map(response => {
        // Filter to only include books with exact first_publish_year match
        const filtered = (response.docs || []).filter(book => 
          book.first_publish_year === year
        );
        return {
          ...response,
          works: this.transformBooks(filtered)
        };
      }),
      catchError(error => {
        console.error('Error searching by title and year:', error);
        throw error;
      })
    );
  }

  /**
   * Get book details by ID
   * @param bookId - Book identifier (e.g., /works/OL17365W)
   * @returns Observable of book details
   */
  getBookById(bookId: string): Observable<BookDetailsResponse> {
    const id = bookId.replace('/works/', '');
    return this.http.get<BookDetailsResponse>(`${this.apiUrl}/works/${id}.json`).pipe(
      catchError(error => {
        console.error('Error fetching book details:', error);
        throw error;
      })
    );
  }

  /**
   * Get author details
   * @param authorKey - Author key (e.g., /authors/OL123A)
   * @returns Observable of author name
   */
  getAuthorById(authorKey: string): Observable<{ name: string }> {
    return this.http.get<{ name: string }>(`${this.apiUrl}${authorKey}.json`);
  }

  /**
   * Get first edition publication date for a work
   * @param workKey - Work key (e.g., /works/OL123W or OL123W)
   * @returns Observable with publish_date from first edition
   */
  getFirstEditionDate(workKey: string): Observable<string | null> {
    const id = workKey.replace('/works/', '');
    return this.http.get<{ entries: Array<{ publish_date?: string }> }>(
      `${this.apiUrl}/works/${id}/editions.json?limit=1`
    ).pipe(
      map(response => {
        if (response.entries && response.entries.length > 0) {
          return response.entries[0].publish_date || null;
        }
        return null;
      }),
      catchError(() => {
        return [null];
      })
    );
  }

  /**
   * Get cover image URL
   * @param coverId - Cover ID
   * @param size - Image size (S, M, L)
   * @returns Cover image URL
   */
  getCoverUrl(coverId: number | undefined, size: 'S' | 'M' | 'L' = 'M'): string {
    if (!coverId) {
      return '/placeholder-book.png';
    }
    return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
  }

  /**
   * Transform raw API response to Book interface
   */
  private transformBooks(books: any[]): Book[] {
    return books.map(book => ({
      key: book.key || '',
      title: book.title || 'Untitled',
      edition_count: book.edition_count || 0,
      cover_id: book.cover_id || book.cover_i,
      first_publish_year: book.first_publish_year,
      subtitle: book.subtitle || '',
      description: book.description || '',
      author_name: book.author_name || []
    }));
  }

  /**
   * Update books subject (for component subscription)
   */
  updateBooks(books: Book[]): void {
    this.booksSubject.next(books);
  }
}
