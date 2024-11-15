import {HashLocationStrategy, LocationStrategy} from '@angular/common';
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouterModule} from '@angular/router';
import {AppComponent} from './app.component';
import {BarAndPanelShowcaseComponent} from './bar-and-panel-showcase/bar-and-panel-showcase.component';
import {BarAndPanelShowcaseModule} from './bar-and-panel-showcase/bar-and-panel-showcase.module';
import {GenericFormShowcaseComponent} from './generic-form-showcase/generic-form-showcase.component';
import {GenericFormShowcaseModule} from './generic-form-showcase/generic-form-showcase.module';
import {SvgPathShowcaseComponent} from './svg-path-showcase/svg-path-showcase.component';
import {SvgPathShowcaseModule} from './svg-path-showcase/svg-path-showcase.module';
import {GridBuilderShowcaseModule} from "./grid-builder-showcase/grid-builder-showcase.module";
import {GridBuilderShowcaseComponent} from "./grid-builder-showcase/grid-builder-showcase.component";

@NgModule({
  imports: [
    BrowserModule,
    RouterModule.forRoot([
      {path: 'form/:formName', component: GenericFormShowcaseComponent},
      {path: 'panel', component: BarAndPanelShowcaseComponent},
      {path: 'layout', component: GridBuilderShowcaseComponent},
      {path: 'svg', component: SvgPathShowcaseComponent},
      {path: '**', redirectTo: '/form/form1'},
    ]),

    BarAndPanelShowcaseModule,
    GenericFormShowcaseModule,
    SvgPathShowcaseModule,
    GridBuilderShowcaseModule,
  ],
  providers: [
    {provide: LocationStrategy, useClass: HashLocationStrategy},
  ],
  declarations: [
    AppComponent,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
