import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouterModule} from '@angular/router';
import {AppComponent} from './app.component';
import {BarAndPanelShowcaseModule} from './bar-and-panel-showcase/bar-and-panel-showcase.module';
import {GenericFormShowcaseModule} from './generic-form-showcase/generic-form-showcase.module';
import {SvgPathShowcaseModule} from './svg-path-showcase/svg-path-showcase.module';

@NgModule({
  imports: [
    BrowserModule,
    RouterModule.forRoot([]),

    BarAndPanelShowcaseModule,
    GenericFormShowcaseModule,
    SvgPathShowcaseModule,
  ],
  providers: [],
  declarations: [
    AppComponent,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
