import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Book, Item, Author, Page, Type, Chapter } from './model';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Injectable()
export class CatalogService {
  private booksUrl = '/api/books';
  private itemsUrl = '/api/books/{bookId}/items'
  private authorsUrl = '/api/authors';
  private typesUrl = '/api/books/{bookId}/types';
  private pagesUrl = '/api/books/{bookId}/items/{itemId}/{output}';
  private chaptersUrl = '/api/books/{bookId}/chapters'

  constructor (private http: Http) {}

  getBooks(): Observable<Book[]> {
    return this.http.get(this.booksUrl)
        .map((res: Response) => { return res.json() || {}; });
  }

  getItems(bookId: number, query: string = null): Observable<Item[]> {
    let url = this.itemsUrl.replace(/\{bookId\}/g, (bookId)?String(bookId):'*');
    if (query) {
        url += ('?query=' + encodeURIComponent(query));
    }
    
    return this.http.get(url)
        .map((res: Response) => { return res.json() || {}; });
  }

  getChapters(bookId: number): Observable<Chapter[]> {
    return this.http.get(this.chaptersUrl.replace(/\{bookId\}/g, String(bookId)))
        .map((res: Response) => { return res.json() || {}; });
  }

  getAuthors(): Observable<Author[]> {
    return this.http.get(this.authorsUrl)
        .map((res: Response) => { return res.json() || {}; });
  }

  getTypes(bookId: number, query: string = null): Observable<Type[]> {
    let url = this.typesUrl.replace(/\{bookId\}/g, (bookId)?String(bookId):'*');
    if (query) {
        url += ('?query=' + encodeURIComponent(query));
    }
    return this.http.get(url)
        .map((res: Response) => { return res.json() || {}; });
  }

  getPages(bookId: number, itemId: number, output: string): Observable<Page[]> {
    return this.http.get(this.pagesUrl
      .replace(/\{bookId\}/g, String(bookId))
      .replace(/\{itemId\}/g, String(itemId))
      .replace(/\{output\}/g, output))
        .map((res: Response) => { return res.json() || {}; });
  }
}
