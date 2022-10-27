import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {ToolsModule} from '../tools/tools.module';
import {GenericFormCaptionComponent} from './components/generic-form-caption.component';
import {GenericFormControlComponent} from './components/generic-form-control.component';
import {GenericFormFormComponent} from './components/generic-form-form.component';
import {GenericFormInputComponent} from './components/generic-form-input.component';
import {GenericFormComponent} from './generic-form.component';
import {InputBooleanWidget} from './inputs/input-boolean-widget';
import {InputIntegerWidget} from './inputs/input-integer-widget';
import {InputNumberWidget} from './inputs/input-number-widget';
import {InputSelectionWidget} from './inputs/input-selection-widget';
import {InputTextWidget} from './inputs/input-text-widget';
import {GenericFormButtonComponent} from "./components/generic-form-button.component";


@NgModule({
  imports: [
    CommonModule,
    FormsModule,

    ToolsModule,
  ],
  declarations: [
    GenericFormInputComponent,
    GenericFormFormComponent,
    GenericFormControlComponent,

    InputSelectionWidget,
    InputBooleanWidget,
    InputIntegerWidget,
    InputNumberWidget,
    InputTextWidget,

    GenericFormComponent,
    GenericFormCaptionComponent,
    GenericFormButtonComponent,
  ],
  exports: [GenericFormComponent],
})
export class GenericFormModule {
}
