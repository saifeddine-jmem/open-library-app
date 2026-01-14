import { Component, Input, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BookService } from '../../services/book.service';
import { Book } from '../../models/book.model';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.css'
})
export class BookListComponent implements OnChanges, OnInit {
  @Input() books: Book[] = [];

  booksList: Book[] = [];
  filteredBooks: Book[] = [];
  currentPage = 1;
  itemsPerPage = 12;
  totalPages = 0;

  constructor(
    private router: Router,
    private bookService: BookService
  ) {}

  ngOnInit(): void {
    this.loadDefaultBooks();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['books']) {
      this.booksList = this.books || [];
      this.currentPage = 1;
      this.updatePagination();
    }
  }

  loadDefaultBooks(): void {
    this.bookService.getBooks().subscribe({
      next: (data) => {
        this.booksList = data.works || [];
        this.updatePagination();
      },
      error: (error) => {
        console.error('Error loading books:', error);
      }
    });
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.booksList.length / this.itemsPerPage);
    this.updateFilteredBooks();
  }

  updateFilteredBooks(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.filteredBooks = this.booksList.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateFilteredBooks();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  viewBookDetails(book: Book): void {
    if (book.key) {
      this.router.navigate(['/book', book.key]);
    }
  }

  getCoverUrl(book: Book): string {
    return this.bookService.getCoverUrl(book.cover_id);
  }

  getPageNumbers(): number[] {
    const pages = [];
    const maxPages = 5;
    let startPage = Math.max(1, this.currentPage - 2);
    let endPage = Math.min(this.totalPages, startPage + maxPages - 1);

    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }
}
