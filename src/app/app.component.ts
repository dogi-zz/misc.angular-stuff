import {Component, OnInit} from '@angular/core';
import * as _ from 'lodash';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {

  public title = 'misc.angular-stuff';

  public showPage: 'form' | 'split_bar' | 'svg_tools';

  constructor() {
  }

  public ngOnInit() {
    const params = this.getParams();
    if (params.page === 'form') {
      this.showPage = 'form';
    }
    if (params.page === 'split_bar') {
      this.showPage = 'split_bar';
    }
    if (params.page === 'svg_tools') {
      this.showPage = 'svg_tools';
    }
  }


  public showGenericForm() {
    this.setParams({page: 'form'});
    this.ngOnInit();
  }

  public showSplitBar() {
    this.setParams({page: 'split_bar'});
    this.ngOnInit();
  }

  public showSvgTools() {
    this.setParams({page: 'svg_tools'});
    this.ngOnInit();
  }

  public getParams() {
    return _.fromPairs((window.location.search || '?').substring(1).split('&').filter(p => p.length).map(p => p.split('=')));
  }

  public setParams(params: { [key: string]: string }) {
    const url = `${window.location.protocol}//${window.location.host}${window.location.pathname}?${Object.entries(params).map(([key, value]) => `${key}=${value}`).join('&')}`;
    window.history.replaceState({}, '', url);
  }

}
