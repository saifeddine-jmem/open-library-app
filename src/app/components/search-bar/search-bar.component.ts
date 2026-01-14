import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { BookService } from '../../services/book.service';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css'
})
export class SearchBarComponent implements OnInit {
  @Output() searchTriggered = new EventEmitter<any>();

  searchForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private bookService: BookService
  ) {
    this.searchForm = this.fb.group({
      title: ['', [Validators.minLength(2)]],
      year: ['', [Validators.pattern(/^\d{4}$/)]]
    });
  }

  ngOnInit(): void {}

  performSearch(): void {
    const { title, year } = this.searchForm.value;

    if (!title && !year) {
      this.loadDefaultBooks();
      return;
    }

    this.isLoading = true;

    let searchObservable;

    // Convert year string to number for proper comparison
    const yearNum = year ? parseInt(year, 10) : null;

    if (title && yearNum) {
      searchObservable = this.bookService.searchByTitleAndYear(title, yearNum);
    } else if (title) {
      searchObservable = this.bookService.searchByTitle(title);
    } else if (yearNum) {
      searchObservable = this.bookService.searchByYear(yearNum);
    }

    searchObservable?.subscribe({
      next: (data) => {
        this.searchTriggered.emit(data.works);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Search error:', error);
        this.isLoading = false;
      }
    });
  }

  loadDefaultBooks(): void {
    this.isLoading = true;
    this.bookService.getBooks().subscribe({
      next: (data) => {
        this.searchTriggered.emit(data.works);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading books:', error);
        this.isLoading = false;
      }
    });
  }

  resetSearch(): void {
    this.searchForm.reset();
    this.loadDefaultBooks();
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.performSearch();
    }
  }
}
