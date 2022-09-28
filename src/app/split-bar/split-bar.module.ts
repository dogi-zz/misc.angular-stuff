import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {SplitBarComponent} from './split-bar.component';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [SplitBarComponent],
  exports: [SplitBarComponent],
})
export class SplitBarModule {
}
