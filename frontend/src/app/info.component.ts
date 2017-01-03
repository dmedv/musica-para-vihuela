import { Component } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Book, Item, Author, Page, Type, Chapter } from './model';
import { CatalogService } from './catalog.service';
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
  }

  ngOnInit() {   
    this.catalogService.getAuthors().first().subscribe(x => {
      this.authors = x;
    })

    this.route.params.first().subscribe((params: Params) => {
      var bookId = Number(params['bookId']);
      var itemId = Number(params['itemId']);
      this.setBookAndItem(bookId, itemId);
    })
  }

  setBookAndItem(bookId, itemId) {
    this.catalogService.getBooks().first().subscribe(x => {
      this.books = x;
      this.setCurrentBook((bookId)?x.find((y:Book) => y.bookId == bookId):x[0], itemId);
    })
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

  setCurrentItem(item: Item) {
    document.getElementById('infoContent').style.display = 'none';
    this.currentItem = item;
    this.updatePages(item);
    
    if (item) {
      this.router.navigate(['', item.bookId, item.itemId]);
    } 
    else {
      this.router.navigate(['']);
    }
    
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
          infoContent.style.display = 'block';
        }
        else {
          infoContent.style.display = 'none';
        }
      })
    }
    else {
      this.pages = [];
      infoContent.style.display = 'none';
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
    
    this.catalogService.getItems((this.searchAll)?null:(this.currentBook.bookId), query).first().subscribe(x => {
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
