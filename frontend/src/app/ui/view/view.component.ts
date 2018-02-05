import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params, NavigationEnd, Event } from '@angular/router';

import { Page } from '../../model';
import { CatalogService } from '../../catalog.service';

import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})
export class ViewComponent implements OnInit {

  pages: Page[];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private catalogService: CatalogService) {
  }

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      let bookId = Number(params['bookId']);
      let itemId = Number(params['itemId']);

      this.catalogService.getPages(bookId, itemId, 'json').subscribe((x: Page[]) => {
        this.pages = x;
      })
    });

    document.getElementById('nextControl').focus();
  }

}
