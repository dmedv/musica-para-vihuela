export class Author {
    authorId: number;
    name: string;
  }
  
  export class Book {
    bookId: number;
    title: string;
  }
  
  export class Item {
    bookId: number;
    itemId: number;
    authorId: number;
    title: string;
    notes: string;
    typeId: number;
    chapterId: number;
  }
  
  export class Page {
    pageId: number;
    filename: string;
  }
  
  export class Type {
    constructor(
      public typeId: number, 
      public title: string) {
    }
  }
  
  export class Chapter {
    constructor(
      public chapterId: number, 
      public title: string) {
    }
  }