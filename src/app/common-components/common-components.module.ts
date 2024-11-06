import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {AppSplitButtonComponent} from './app-split-button.component';
import {AppToggleButtonComponent} from './app-toggle-button.component';
import {JsonEditorComponent} from './json-editor.component';
import {PrettyJsonPipe} from './pretty-json-pipe';
import {StayRightOfDirective} from './stay-right-of.directive';


@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    AppSplitButtonComponent,
    AppToggleButtonComponent,
    PrettyJsonPipe,
    StayRightOfDirective,
    JsonEditorComponent,
  ],
  exports: [
    AppSplitButtonComponent,
    AppToggleButtonComponent,
    PrettyJsonPipe,
    StayRightOfDirective,
    JsonEditorComponent,
  ],
})
export class CommonComponentsModule {

}
