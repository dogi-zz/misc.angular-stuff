import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppComponent} from './app.component';
import {BarAndPanelShowcaseModule} from './bar-and-panel-showcase/bar-and-panel-showcase.module';
import {GenericFormShowcaseModule} from './generic-form-showcase/generic-form-showcase.module';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,

    BarAndPanelShowcaseModule,
    GenericFormShowcaseModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {
}
