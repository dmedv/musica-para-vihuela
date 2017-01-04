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
  isSearchResult = false;
  selectedTypeId: number = -1;
  selectedChapterId: number = -1;
  keepCurrentBook = false;
  
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
            
            let bookId = Number(params['bookId']);
            let itemId = Number(params['itemId']);
            
            let f = function(that, bookId, itemId) {
              if (that.keepCurrentBook) {
                that.setItem(itemId)
              }
              else {
                that.setBookAndItem(bookId, itemId);
              }
            }
            
            if (this.authors && this.books) {
              f(this, bookId, itemId);
            }
            else {
              Observable.forkJoin([
                    this.catalogService.getAuthors(), 
                    this.catalogService.getBooks()])  
                .subscribe(data => {
                  // Got all books and authors

                  this.authors = data[0];
                  this.books = data[1];
                  
                  f(this, bookId, itemId);
                })
            }
          })
        }
      });
  }

  navigateToItem(item: Item) {
    this.keepCurrentBook = true;
    this.router.navigate(['', item.bookId, item.itemId]);
  }
  
  navigateToBook(book: Book) {
    this.keepCurrentBook = false;
    this.isSearchResult = false;
    this.router.navigate(['', book.bookId, 1]);
  }
  
  setBookAndItem(bookId: number, itemId: number) {
    let book = this.books.find((x: Book) => x.bookId == bookId);
    this.currentBook = book;
    this.updateChapters(book);
    this.updateTypes(book);
    
    (<HTMLSelectElement>document.getElementById("chapterSelect")).disabled = false;
    
    this.catalogService.getItems(book.bookId).subscribe(x => {
      this.items = x;
      this.setItem(itemId);
    })
  }
  
  showContent() {
    document.getElementById('infoContent').style.display = 'block';
    document.getElementById('previewContent').style.display = 'block';
  }
  
  hideContent() {
    document.getElementById('infoContent').style.display = 'none';
    document.getElementById('previewContent').style.display = 'none';
  }
  
  setItem(itemId: number) {
    this.hideContent();
    let item: Item = this.items.find((x: Item) => x.itemId == itemId);
    this.currentItem = item;
    this.updatePages(item);
  }

  getItemTitle(item: Item, showBookId: boolean) {
    if (!item) return '\u2012';
    
    let s = item.title.replace(/\#/g, ' ');
    if (showBookId) { 
      s = item.bookId+' / ' + s;
    }
    return s;
  }
  
  getNotes(item: Item) {
    if (!item || !item.notes) return '\u2012';
    
    return item.notes;
  }
  
  getBookTitle(book: Book, showId: boolean = true) {
    if (!book) return '\u2012';
    
    return (showId)?(book.bookId + '. ' + book.title):book.title;
  }
  
  getBookForItem(item: Item) {
    if (item && this.books) {
      return this.books.find((x: Book) => x.bookId == item.bookId);
    }
  }
  
  getAuthorName(item: Item) {
    if (!item) return '\u2012';
    
    for(let author of this.authors)
    {
      if(author.authorId == item.authorId) return author.name;
    }
  }

  getTypeName(item: Item) {
    if (!item || !item.typeId) return '\u2012';
    
    for(let type of this.types)
    {
      if(type.typeId == item.typeId) return type.title;
    }
  }

  updateTypes(book: Book, query: string = null) {
    this.catalogService.getTypes((book) ? book.bookId : null, query).subscribe(x => {
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
    let infoContent = document.getElementById('infoContent');
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
    if (event.keyCode == 13) {
      this.search();
    }
  }
  
  search() {
    let query = (<HTMLInputElement>document.getElementById("searchInput")).value;
    
    if (query && !/^\s*$/.test(query)) {
      query = '%' + query + '%';
    }
    else {
      return;  // Ignore empty queries
    }
    
    if (!this.searchAll && !this.currentBook) {
      alert('You must select a book first');
      return;
    }

    this.catalogService.getItems((this.searchAll)?null:(this.currentBook.bookId), query).subscribe(x => {
      if (x.length > 0) {
        this.isSearchResult = true;
        this.items = x;
        if (this.searchAll) {
          this.currentBook = null;
        }
        
        this.updateTypes((this.searchAll)?null:(this.currentBook), query);
        
        // Disable chapter selection
        this.chapters = [new Chapter(-1, '*')];
        this.selectedChapterId = this.chapters[0].chapterId;
        (<HTMLSelectElement>document.getElementById("chapterSelect")).disabled = true;
        
        this.navigateToItem(x[0]);
      }
      else {
        alert('No results');
      }
    })
    
  }
  
  downloadPdf(item: Item) {
    window.open('/api/books/' + item.bookId + '/items/' + item.itemId + '/pdf');
  }
  
  downloadZip(item: Item) {
    window.open('/api/books/' + item.bookId + '/items/' + item.itemId + '/zip', '_self');
  }  

}
