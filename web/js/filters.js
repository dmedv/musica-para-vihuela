angular.module('vihuelaApp.filters', []).filter('recordsFilter', function () {
  return function (items, chapter, type) {
    if (typeof items == 'undefined') return items;     
    var filtered = [];
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (typeof chapter != 'undefined' && typeof type != 'undefined') {
        if (chapter.chapterId > -1 && item.chapterId != chapter.chapterId) continue;      
        if (type.typeId > -1 && item.typeId != type.typeId) continue;
      }
      filtered.push(item);
    }
    return filtered;
  };
});