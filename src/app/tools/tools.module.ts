import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RemoveWrapperDirective} from './remove.wrapper.directive';
import {TypedTemplateDirective} from './typed-template.directive';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    RemoveWrapperDirective,
    TypedTemplateDirective,
  ],
  exports: [
    RemoveWrapperDirective,
    TypedTemplateDirective,
  ],
})
export class ToolsModule {
}
