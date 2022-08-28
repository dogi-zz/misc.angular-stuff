import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {InfoPanelComponent} from './info-panel.component';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [InfoPanelComponent],
  exports: [InfoPanelComponent],
})
export class InfoPanelModule {
}
