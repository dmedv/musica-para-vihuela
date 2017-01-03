import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { InfoComponent} from './info.component';
import { ItemFilterPipe } from './itemFilter.pipe';
import { CatalogService } from './catalog.service';

@NgModule({
  declarations: [
    InfoComponent,
    ItemFilterPipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [CatalogService]
})

export class InfoModule { }
