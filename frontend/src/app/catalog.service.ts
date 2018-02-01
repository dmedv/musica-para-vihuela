import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { catchError } from 'rxjs/operators';
import 'rxjs/add/observable/of';

import { Book, Item, Author, Page, Type, Chapter } from './model';

@Injectable()
export class CatalogService {
    readonly urlPrefix = '/api';
    //readonly urlPrefix = 'http://localhost:8080/musica-para-vihuela/api';
    readonly books = '/books';
    readonly items = '/books/{bookId}/items';
    readonly authors = '/authors';
    readonly types = '/books/{bookId}/types';
    readonly pages = '/books/{bookId}/items/{itemId}/{output}';
    readonly chapters = '/books/{bookId}/chapters';

    constructor(private http: HttpClient) { }

    getBooks(): Observable<Book[]> {
        return this.http.get<Book[]>(this.urlPrefix + this.books).pipe(
            catchError(this.handleError([]))
        );
    }

    getItems(bookId: number, query: string = null): Observable<Item[]> {
        let url = this.urlPrefix + this.items
            .replace(/\{bookId\}/g, bookId ? String(bookId) : '*');

        if (query) {
            url += ('?query=' + encodeURIComponent(query));
        }

        return this.http.get<Item[]>(url).pipe(
            catchError(this.handleError([]))
        );
    }

    getChapters(bookId: number): Observable<Chapter[]> {
        let url = this.urlPrefix + this.chapters
            .replace(/\{bookId\}/g, String(bookId));

        return this.http.get<Chapter[]>(url).pipe(
            catchError(this.handleError([]))
        );
    }

    getAuthors(): Observable<Author[]> {
        return this.http.get<Author[]>(this.urlPrefix + this.authors).pipe(
            catchError(this.handleError([]))
        );
    }

    getTypes(bookId: number, query: string = null): Observable<Type[]> {
        let url = this.urlPrefix + this.types
            .replace(/\{bookId\}/g, bookId ? String(bookId) : '*');

        if (query) {
            url += ('?query=' + encodeURIComponent(query));
        }

        return this.http.get<Type[]>(url).pipe(
            catchError(this.handleError([]))
        );
    }

    getPages(bookId: number, itemId: number, output: string): Observable<Page[]> {
        let url = this.urlPrefix + this.pages
            .replace(/\{bookId\}/g, String(bookId))
            .replace(/\{itemId\}/g, String(itemId))
            .replace(/\{output\}/g, output);

        return this.http.get<Page[]>(url).pipe(
            catchError(this.handleError([]))
        );
    }

    private handleError<T>(result?: T) {
        return (error: any): Observable<T> => {
            return Observable.of(result as T);
        }
    }
}
