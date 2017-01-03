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

  books: Book[];
  currentBook: Book;
  items: Item[];
  currentItem: Item;
  authors: Author[];
  types: Type[];
  chapters: Chapter[];
  pages: Page[];
  searchAll = true;
  showBookId = false;
  selectedTypeId: number = -1;
  selectedChapterId: number = -1;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private catalogService: CatalogService) {

      // This is tricky... We can't just subscribe to 
      // route.params in onNgInit, because onNgInit 
      // is not called during navigation within 
      // the same component.

      router.events.subscribe((x: Event) => {
        if (x instanceof NavigationEnd) {
          // NavigationEnd event captured
    
          this.route.params.first().subscribe((params: Params) => {
            // Navigation parameters received
            
            var bookId = Number(params['bookId']);
            var itemId = Number(params['itemId']);
            
            Observable.forkJoin([
                  this.catalogService.getAuthors(), 
                  this.catalogService.getBooks()])  
              .subscribe(data => {
                // Got all books and authors
                
                this.authors = data[0];
                this.books = data[1];
                this.setBookAndItem(bookId, itemId);
              })
          })
        }
      });
  }

  setBookAndItem(bookId, itemId) {
    this.setCurrentBook((bookId)?this.books.find((y:Book) => y.bookId == bookId):this.books[0], itemId);
  }

  setCurrentBook(book: Book, itemId = null) {
    this.currentBook = book;
    this.showBookId = false;
    (<HTMLSelectElement>document.getElementById("chapterSelect")).disabled = false;
    
    this.catalogService.getItems(book.bookId, null).subscribe(x => {
      this.items = x;
      this.setCurrentItem((itemId)?x.find((y:Item) => y.itemId == itemId):x[0]);
    })
    
    this.updateChapters(book);
    this.updateTypes(book, null);
  }

  showContent() {
    document.getElementById('infoContent').style.display = 'block';
    document.getElementById('previewContent').style.display = 'block';
  }
  
  hideContent() {
    document.getElementById('infoContent').style.display = 'none';
    document.getElementById('previewContent').style.display = 'none';
  }
  
  setCurrentItem(item: Item) {
    this.hideContent();
    this.currentItem = item;
    this.updatePages(item);
  }

  getTitle(item: Item, showBookId: boolean) {
    if (item) {
      var result = item.title.replace(/\#/g, ' ');
      if (showBookId) { 
        result = '(' + item.bookId + ') ' + result;
      }
      return result;
    }
  }

  getBookTitle(book: Book) {
    if (book) { 
      return book.bookId + '. ' + book.title;
    }
  }
  
  getBookForItem(item: Item) {
    if (item && this.books) {
      return this.books.find((x: Book) => x.bookId == item.bookId);
    }
  }
  
  getAuthor(item: Item) {
    if (item && this.authors) {
      for(var author of this.authors)
      {
        if(author.authorId == item.authorId) return author.name;
      }
    }
  }

  getType(item: Item) {
    if (item && this.types) {
      for(var type of this.types)
      {
        if(type.typeId == item.typeId) return type.title;
      }
    }
  }

  updateTypes(book: Book, query: string) {
    this.catalogService.getTypes((book)?book.bookId:null, query).subscribe(x => {
      this.types = x;
      this.types.unshift(new Type(-1,'*'));
      this.selectedTypeId = -1;
    })
  }

  updateChapters(book: Book) {
    this.catalogService.getChapters(book.bookId).subscribe(x => {
      this.chapters = x;
      this.chapters.unshift(new Chapter(-1,'*'));
      this.selectedChapterId = -1;
    })
  }

  updatePages(item: Item) {
    var infoContent = document.getElementById('infoContent');
    if (this.currentItem) {
      this.catalogService.getPages(item.bookId, item.itemId, 'json').subscribe(x => {
        this.pages = x;
        if (x.length > 0 && !/^\s*$/.test(x[0].filename)) {
          this.showContent();
        }
      })
    }
  }
  
  keyboardEventHandler(event) {
    if (event.code == 'Enter') {
      this.search();
    }
  }
  
  search() {
    if (!this.searchAll && !this.currentBook) {
      alert('You must select a book first');
      return;
    }
    this.items = [];
    var query = (<HTMLInputElement>document.getElementById("searchInput")).value;
    
    if (query && !/^\s*$/.test(query)) {
      query = '%'+query+'%';
    }
    
    query = encodeURIComponent(query);
    this.chapters = [new Chapter(-1, '*')];
    this.selectedChapterId = this.chapters[0].chapterId;
    (<HTMLSelectElement>document.getElementById("chapterSelect")).disabled = true;
    this.updateTypes((this.searchAll)?null:(this.currentBook), query);
   
    if (this.searchAll) {
      this.currentBook = null;
      this.showBookId = true;
    }
    
    this.catalogService.getItems((this.searchAll)?null:(this.currentBook.bookId), query).subscribe(x => {
      this.items = x;
      this.setCurrentItem(x[0]);
    })
    
  }
  
  downloadPdf(item: Item) {
    window.open('/api/books/' + item.bookId + '/items/' + item.itemId + '/pdf');
  }
  
  downloadZip(item: Item) {
    window.open('/api/books/' + item.bookId + '/items/' + item.itemId + '/zip', '_self');
  }  

}
