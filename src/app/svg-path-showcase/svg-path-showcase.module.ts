import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {SliderModule} from '../slider/slider.module';
import {SvgPathShowcaseComponent} from './svg-path-showcase.component';

@NgModule({
  imports: [
    CommonModule,

    SliderModule,
  ],
  declarations: [SvgPathShowcaseComponent],
  exports: [SvgPathShowcaseComponent],
})
export class SvgPathShowcaseModule {
}
