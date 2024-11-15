import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {GridBuilderShowcaseComponent, HelloWorldWidgetComponent, ListWidgetComponent} from './grid-builder-showcase.component';
import {GridBuilderModule} from "../../../libs/grid-builder/grid-builder.module";
import {CommonComponentsModule} from "../common-components/common-components.module";
import {FormsModule} from "@angular/forms";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    CommonComponentsModule,

    GridBuilderModule,
  ],
  declarations: [
    HelloWorldWidgetComponent,
    ListWidgetComponent,

    GridBuilderShowcaseComponent,
  ],
  exports: [GridBuilderShowcaseComponent],
})
export class GridBuilderShowcaseModule {
}
