import {Component, OnInit} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {

  public title = 'misc.angular-stuff';

  public showPage: string;

  constructor(
    public router: Router,
  ) {
  }

  public ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.showPage = event.url.split('/')[1];
      }
    });
    // if (params.page === 'form') {
    //   this.showPage = 'form';
    // }
    // if (params.page === 'split_bar') {
    //   this.showPage = 'split_bar';
    // }
    // if (params.page === 'svg_tools') {
    //   this.showPage = 'svg_tools';
    // }
  }


  public showGenericForm() {
    this.router.navigate(['/form']);
    // this.setParams({page: 'form'});
    // this.ngOnInit();
  }

  public showSplitBar() {
    this.router.navigate(['/panel']);
    // this.setParams({page: 'split_bar'});
    // this.ngOnInit();
  }

  public showSvgTools() {
    this.setParams({page: 'svg_tools'});
    this.ngOnInit();
  }


  public setParams(params: { [key: string]: string }) {
    const url = `${window.location.protocol}//${window.location.host}${window.location.pathname}?${Object.entries(params).map(([key, value]) => `${key}=${value}`).join('&')}`;
    window.history.replaceState({}, '', url);
  }

}
