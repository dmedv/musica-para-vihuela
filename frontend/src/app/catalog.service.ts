import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Book, Item, Author, Page, Type, Chapter } from './model';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Injectable()
export class CatalogService {

  // readonly urlPrefix = 'http://localhost:8080/musica-para-vihuela/api';
  readonly urlPrefix = '/api';

  readonly books = '/books';
  readonly items = '/books/{bookId}/items'
  readonly authors = '/authors';
  readonly types = '/books/{bookId}/types';
  readonly pages = '/books/{bookId}/items/{itemId}/{output}';
  readonly chapters = '/books/{bookId}/chapters'

  constructor (private http: Http) {}

  getBooks(): Observable<Book[]> {
    return this.http.get(this.urlPrefix + this.books)
      .map((res: Response) => { return res.json() || []; });
  }

  getItems(bookId: number, query: string = null): Observable<Item[]> {
    let url = this.urlPrefix + this.items
      .replace(/\{bookId\}/g, bookId ? String(bookId) : '*');

    if (query) {
      url += ('?query=' + encodeURIComponent(query));
    }

    return this.http.get(url)
      .map((res: Response) => { return res.json() || []; });
  }

  getChapters(bookId: number): Observable<Chapter[]> {
    let url = this.urlPrefix + this.chapters
      .replace(/\{bookId\}/g, String(bookId));

    return this.http.get(url)
      .map((res: Response) => { return res.json() || []; });
  }

  getAuthors(): Observable<Author[]> {
    return this.http.get(this.urlPrefix + this.authors)
      .map((res: Response) => { return res.json() || []; });
  }

  getTypes(bookId: number, query: string = null): Observable<Type[]> {
    let url = this.urlPrefix + this.types
      .replace(/\{bookId\}/g, bookId ? String(bookId) : '*');

    if (query) {
      url += ('?query=' + encodeURIComponent(query));
    }

    return this.http.get(url)
      .map((res: Response) => { return res.json() || []; });
  }

  getPages(bookId: number, itemId: number, output: string): Observable<Page[]> {
    let url = this.urlPrefix + this.pages
      .replace(/\{bookId\}/g, String(bookId))
      .replace(/\{itemId\}/g, String(itemId))
      .replace(/\{output\}/g, output);

    return this.http.get(url)
      .map((res: Response) => { return res.json() || []; });
  }

}
