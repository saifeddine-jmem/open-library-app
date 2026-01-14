export interface Book {
  key: string;
  title: string;
  edition_count?: number;
  cover_id?: number;
  first_publish_year?: number;
  subtitle?: string;
  description?: string | { value?: string };
  author_name?: string[];
  isbn?: string[];
}

export interface BooksResponse {
  works?: Book[];
  docs?: Book[];
  numFound?: number;
}

export interface BookDetailsResponse {
  key: string;
  title: string;
  subtitle?: string;
  first_publish_date?: string;
  first_publish_year?: number;
  description?: string | { value?: string };
  covers?: number[];
  authors?: Array<{ author?: { key: string }; type?: { key: string } }>;
  number_of_pages?: number;
  isbn_13?: string[];
  subjects?: string[];
}

export interface SearchFilters {
  title?: string;
  year?: number;
}
