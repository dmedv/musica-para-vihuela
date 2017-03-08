import { Component } from '@angular/core';
import { Router, ActivatedRoute, Params, NavigationEnd, Event } from '@angular/router';

import { Book, Item, Author, Page, Type, Chapter } from './model';
import { CatalogService } from './catalog.service';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/first';

@Component({
  styleUrls: ['./info.component.css'],
  templateUrl: './info.component.html'
})

export class InfoComponent {

  readonly dashChar: string = '\u2012';

  books: Book[];
  currentBook: Book;
  items: Item[];
  currentItem: Item;
  authors: Author[];
  types: Type[];
  chapters: Chapter[];
  pages: Page[];
  searchAllBooks: boolean = true;
  isSearchResult: boolean = false;
  selectedTypeId: number = -1;
  selectedChapterId: number = -1;

  conditionalSet(that, bookId, itemId): void {
    if (that.items) {
      let item =  that.items.find(
          (x: Item) =>
              x.itemId == itemId &&
              x.bookId == bookId)
      if (item) { 
        that.setItemObj(item);
        return;
      }
    }
    
    that.items = [];
    that.isSearchResult = false;
    that.setBookAndItem(bookId, itemId);
  }

  constructor(
      private router: Router,
      private route: ActivatedRoute,
      private catalogService: CatalogService) {
  }

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      // Navigation parameters received
      let bookId = Number(params['bookId']);
      let itemId = Number(params['itemId']);

      if (this.authors && this.books) {
        this.conditionalSet(this, bookId, itemId);
      }
      else {
        Observable.forkJoin([
            this.catalogService.getAuthors(),
            this.catalogService.getBooks()])
          .subscribe(x => {
            // Got all books and authors
            this.authors = x[0];
            this.books = x[1];
            this.conditionalSet(this, bookId, itemId);
          })
      }
    });
  }

  navigateToItem(item: Item): void {
    this.router.navigate(['', item.bookId, item.itemId]);
  }

  navigateToBook(book: Book): void {
    this.router.navigate(['', book.bookId, 1]);
  }

  setBookAndItem(bookId: number, itemId: number): void {
    let book = this.books.find((x: Book) => x.bookId == bookId);

    this.currentBook = book;
    this.updateChapters(book);
    this.updateTypes(book);

    (<HTMLSelectElement>document.getElementById("chapterSelect")).disabled = false;

    this.catalogService.getItems(book.bookId).subscribe((x: Item[]) => {
      this.items = x;
      this.setItem(itemId);
    })
  }

  showContent(): void {
    document.getElementById('infoContent').style.display = 'block';
    document.getElementById('previewContent').style.display = 'block';
  }

  hideContent(): void {
    document.getElementById('infoContent').style.display = 'none';
    document.getElementById('previewContent').style.display = 'none';
  }

  setItem(itemId: number): void {
    this.hideContent();
    let item: Item = this.items.find((x: Item) => x.itemId == itemId);
    this.currentItem = item;
    this.updatePages(item);
  }

  setItemObj(item: Item): void {
    this.hideContent();
    this.currentItem = item;
    this.updatePages(item);
  }

  getItemTitle(item: Item, showBookId: boolean): string {
    if (!item) return this.dashChar;

    let s = item.title.replace(/\#/g, ' ');
    if (showBookId) {
      s = item.bookId + ' / ' + s;
    }
    return s;
  }

  getNotes(item: Item): string {
    if (!item || !item.notes) return this.dashChar;

    return item.notes;
  }

  getBookTitle(book: Book, showId: boolean = true): string {
    if (!book) return this.dashChar;

    return (showId)?(book.bookId + '. ' + book.title):book.title;
  }

  getBookForItem(item: Item): Book {
    if (item && this.books) {
      return this.books.find((x: Book) => x.bookId == item.bookId);
    }
  }

  getAuthorName(item: Item): string {
    if (!item) return this.dashChar;

    for(let author of this.authors)
    {
      if(author.authorId == item.authorId) return author.name;
    }
  }

  getTypeName(item: Item): string {
    if (!item || !item.typeId) return this.dashChar;

    for(let type of this.types)
    {
      if(type.typeId == item.typeId) return type.title;
    }
  }

  updateTypes(book: Book): void {
    this.catalogService.getTypes(book.bookId).subscribe((x: Type[]) => {
      this.types = x;
      this.types.unshift(new Type(-1, '*'));
      this.selectedTypeId = -1;
    })
  }

  updateChapters(book: Book): void {
    this.catalogService.getChapters(book.bookId).subscribe(x => {
      this.chapters = x;
      this.chapters.unshift(new Chapter(-1, '*'));
      this.selectedChapterId = -1;
    })
  }

  updatePages(item: Item): void {
    let infoContent = document.getElementById('infoContent');
    if (this.currentItem) {
      this.catalogService.getPages(item.bookId, item.itemId, 'json').subscribe((x: Page[]) => {
        this.pages = x;
        if (x.length > 0 && !/^\s*$/.test(x[0].filename)) {
          this.showContent();
        }
      })
    }
  }

  keyboardEventHandler(event): void {
    if (event.keyCode == 13) {
      this.search();
    }
  }

  search(): void {
    let query = (<HTMLInputElement>document.getElementById("searchInput")).value;

    if (query && !/^\s*$/.test(query)) {
      query = '%' + query + '%';
    }
    else {
      return;  // Ignore empty queries
    }

    if (!this.searchAllBooks && !this.currentBook) {
      this.showMessage('You must select a book first');
      return;
    }

    let maybeBookId = this.searchAllBooks ? null : this.currentBook.bookId;
    Observable.forkJoin([
        this.catalogService.getItems(maybeBookId, query),
        this.catalogService.getTypes(maybeBookId, query)])
      .subscribe(x => {
        if (x[0].length > 0) {
          this.isSearchResult = true;
          if (this.searchAllBooks) {
            this.currentBook = null;
          }

          this.items = x[0];
          this.types = x[1];
          this.types.unshift(new Type(-1, '*'));
          this.selectedTypeId = -1;

          // Disable chapter selection
          this.chapters = [new Chapter(-1, '*')];
          this.selectedChapterId = this.chapters[0].chapterId;
          (<HTMLSelectElement>document.getElementById("chapterSelect")).disabled = true;

          this.navigateToItem(this.items[0]);
        }
        else {
          this.showMessage('No results');
        }
      });
  }
  
  showMessage(message: string) {
    document.getElementById("messageText").innerText = message;
    document.getElementById("messageToggle").click();
  }

  downloadPdf(item: Item): void {
    window.open('/api/books/' + item.bookId + '/items/' + item.itemId + '/pdf');
  }

  downloadZip(item: Item): void {
    window.open('/api/books/' + item.bookId + '/items/' + item.itemId + '/zip', '_self');
  }

}
