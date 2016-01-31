angular.module('vihuelaApp.controllers', []).controller('vihuelaCtrl', function($scope, $http) {
  
  $http.get('Books').success(function(response) {
    $scope.books = response;
    $scope.currentBook = $scope.books[0];
    $scope.updateRecords();
  });
  
  $http.get('Authors').success(function(response) {
    $scope.authors = response;
  });
  
  $scope.updateChapters = function() {
    $http.get('Chapters?bookId='+$scope.currentBook.bookId).success(function(response) {
      response.unshift({"chapterId":-1,"title":"*"});
      $scope.chapters = response;
      $scope.currentChapter = $scope.chapters[0];
    });
  }
  
  $scope.updateTypes = function(bookId, query) {
    var requestUrl;
    if (!query) requestUrl = 'Types?bookId='+bookId;  
      else
      {
        requestUrl = 'Types?query='+query;
        if (bookId) requestUrl = requestUrl +'&bookId='+bookId;
      }
    $http.get(requestUrl).success(function(response) {
      response.unshift({"id":-1,"title":"*"});
      $scope.types = response;
      $scope.currentType = $scope.types[0];
    });
  }
  
  $scope.updateRecords = function() {
    $scope.records = [];
    document.getElementById("chapterSelect").disabled = false;  
    $scope.updateChapters();
    $scope.updateTypes($scope.currentBook.bookId);
    $scope.showBookId = false;
    $http.get('Items?bookId='+$scope.currentBook.bookId).success(function(response){
      $scope.records = response;
      $scope.currentRecord = $scope.records[0];
      $scope.updatePages();
    });
  };
   
  $scope.selectRecord = function(record) {
    $scope.pages = [];
    infoContent.style.display = 'none';
    $scope.currentRecord = record;
    $scope.updatePages();
  }
  
  $scope.selectBook = function(book) {
    $scope.currentBook = book;
    $scope.updateRecords();
  }
  
  $scope.updatePages = function() {
    var infoContent = document.getElementById('infoContent');
    if ($scope.currentRecord !== undefined) {
      $http.get('Pages?bookId='+$scope.currentRecord.bookId+'&ref='+$scope.currentRecord.itemId).success(function(response){
        $scope.pages = response; 
        if ($scope.pages.length > 0 && !/^\s*$/.test($scope.pages[0].filename)) {
          infoContent.style.display = 'block';
        }
        else {
          $scope.pages = [];
          infoContent.style.display = 'none';
        }
      });
    }
    else {
      $scope.pages = [];
      infoContent.style.display = 'none';
    }
    resize();
  };
  
  $scope.doSearch = function() {
    var searchAll = $scope.searchAll;
    if (!searchAll && $scope.currentBook == null) {
      alert('You must select a book first');
      return;
    }
    $scope.records = [];
    var query = document.getElementById("searchInput").value;
    if (query && !/^\s*$/.test(query)) {
    query = '%'+query+'%';
    query = query.replace(/\%/g, '%25');
    $scope.chapters = [{"id":-1,"title":"*"}];
    $scope.currentChapter = $scope.chapters[0];
    document.getElementById("chapterSelect").disabled = true;
    if (!searchAll) $scope.updateTypes($scope.currentBook.bookId,query);
      else $scope.updateTypes(null,query);
    var requestUrl = 'Items?query='+query;
    if (!searchAll) requestUrl = requestUrl + '&bookId=' + $scope.currentBook.bookId;
      else $scope.showBookId = true;
    if (searchAll) $scope.currentBook = null;
    $http.get(requestUrl).success(function(response) {
      $scope.records = response;
      $scope.currentRecord = $scope.records[0];
      $scope.updatePages();  
    });
    }
  }
  
  $scope.downloadAsPdf = function() {
    window.open('Pages?bookId='+$scope.currentRecord.bookId+'&ref='+$scope.currentRecord.itemId+'&pdf');
  }
  
  $scope.downloadAsZip = function() {
    window.open('Pages?bookId='+$scope.currentRecord.bookId+'&ref='+$scope.currentRecord.itemId+'&zip','_self');
  }  
  
  $scope.getTitle = function(record, showBookId) {
    if (record) {
      var result = String(record.title).replace(/\#/g, ' ');
      if (showBookId) result = '(' + record.bookId + ') ' + result;
      return result;
    }
  }
  
  $scope.getTypeName = function(typeId) {
    if ($scope.types) {
      for(var i = 0; i < $scope.types.length; i++)
      {
        if($scope.types[i].typeId == typeId) return $scope.types[i].title;
      }
    }
  }
  
  $scope.getAuthorName = function(authorId) {
    if ($scope.authors && authorId != null) {
      for(var i = 0; i < $scope.authors.length; i++)
      {
        if($scope.authors[i].authorId == authorId) return $scope.authors[i].name;
      }
    }
  }
  
  $scope.getBookTitle = function(book) {
    if (book) return book.bookId + '. ' + book.title;
  }
  
})
