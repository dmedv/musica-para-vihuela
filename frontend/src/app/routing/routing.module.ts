import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { InfoComponent } from '../ui/info/info.component';
import { ViewComponent } from '../ui/view/view.component';

const routes: Routes = [
  {  path: ':bookId/:itemId', component: InfoComponent },
  {  path: ':bookId/:itemId/view', component: ViewComponent },
  {  path: '', redirectTo: '/1/1', pathMatch: 'full' }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes, { useHash: true })
  ],
  declarations: [],
  exports:[ 
    RouterModule
  ]
})
export class RoutingModule { }
