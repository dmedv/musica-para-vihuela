import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { CatalogService } from '../catalog.service';
import { ItemFilterPipe } from '../itemFilter.pipe';

import { InfoComponent } from './info/info.component';
import { ViewComponent } from './view/view.component';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule
  ],
  declarations: [InfoComponent, ViewComponent, ItemFilterPipe],
  providers: [CatalogService]
})
export class UiModule { }
