import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeadBarComponent } from '../../components/head-bar/head-bar.component';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { BookListComponent } from '../../components/book-list/book-list.component';
import { Book } from '../../models/book.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeadBarComponent, SearchBarComponent, BookListComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  searchResults: Book[] = [];

  onSearchTriggered(books: Book[]): void {
    this.searchResults = books;
  }
}
