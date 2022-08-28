import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {GenericFormModule} from '../generic-form/generic-form.module';
import {SplitBarModule} from '../split-bar/split-bar.module';
import {GenericFormShowcaseComponent} from './generic-form-showcase.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,

    GenericFormModule,
    SplitBarModule,
  ],
  declarations: [GenericFormShowcaseComponent],
  exports: [GenericFormShowcaseComponent],
})
export class GenericFormShowcaseModule {
}
