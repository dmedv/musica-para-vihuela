import { Pipe, PipeTransform } from '@angular/core';
import { Item } from './model'; 

@Pipe({name: 'itemFilter'})
export class ItemFilterPipe implements PipeTransform {
  transform(items: Item[], params: number[]): Item[] {
    let chapterId = params[0];
    let typeId = params[1];
    
    if (items) {
      return items.filter(x => (
          (x.chapterId == chapterId || chapterId == -1) && 
          (x.typeId == typeId || typeId == -1)       
      ))
    }
  }
}
