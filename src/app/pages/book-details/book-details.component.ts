import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BookService } from '../../services/book.service';
import { BookDetailsResponse } from '../../models/book.model';
import { HeadBarComponent } from '../../components/head-bar/head-bar.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-book-details',
  standalone: true,
  imports: [CommonModule, HeadBarComponent],
  templateUrl: './book-details.component.html',
  styleUrl: './book-details.component.css'
})
export class BookDetailsComponent implements OnInit {
  book: BookDetailsResponse | null = null;
  isLoading = true;
  error = false;
  authorNames: string[] = [];
  publicationDate: string = 'Unknown';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookService: BookService
  ) {}

  ngOnInit(): void {
    const bookId = this.route.snapshot.paramMap.get('id');
    if (bookId) {
      this.loadBookDetails(bookId);
    }
  }

  loadBookDetails(bookId: string): void {
    this.isLoading = true;
    this.bookService.getBookById(bookId).subscribe({
      next: (data) => {
        this.book = data;
        this.loadAuthors();
        this.loadPublicationDate(bookId);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading book details:', error);
        this.error = true;
        this.isLoading = false;
      }
    });
  }

  loadAuthors(): void {
    if (this.book?.authors && this.book.authors.length > 0) {
      const authorObservables = this.book.authors.map(author => 
        this.bookService.getAuthorById(author.author?.key || '')
      );

      forkJoin(authorObservables).subscribe({
        next: (authors) => {
          this.authorNames = authors.map(a => a.name);
        },
        error: (error) => {
          console.error('Error loading authors:', error);
        }
      });
    }
  }

  loadPublicationDate(bookId: string): void {
    // Check if we already have a publication date from the works API
    if (this.book?.first_publish_date) {
      this.publicationDate = this.book.first_publish_date;
    } else if (this.book?.first_publish_year) {
      this.publicationDate = this.book.first_publish_year.toString();
    } else {
      // Fetch from editions if not available
      this.bookService.getFirstEditionDate(bookId).subscribe({
        next: (date) => {
          this.publicationDate = date || 'Unknown';
        },
        error: () => {
          this.publicationDate = 'Unknown';
        }
      });
    }
  }

  getCoverUrl(): string {
    if (this.book?.covers && this.book.covers.length > 0) {
      return this.bookService.getCoverUrl(this.book.covers[0], 'L');
    }
    return '/placeholder-book.png';
  }

  getDescription(): string {
    if (!this.book?.description) return 'No description available.';
    
    if (typeof this.book.description === 'string') {
      return this.book.description;
    }
    
    return this.book.description.value || 'No description available.';
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
