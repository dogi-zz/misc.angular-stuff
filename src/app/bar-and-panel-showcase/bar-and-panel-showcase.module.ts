import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {InfoPanelModule} from '../info-panel/info-panel.module';
import {SplitBarModule} from '../split-bar/split-bar.module';
import {BarAndPanelShowcaseComponent} from './bar-and-panel-showcase.component';

@NgModule({
  imports: [
    CommonModule,

    SplitBarModule,
    InfoPanelModule,
  ],
  declarations: [BarAndPanelShowcaseComponent],
  exports: [BarAndPanelShowcaseComponent],
})
export class BarAndPanelShowcaseModule {
}
