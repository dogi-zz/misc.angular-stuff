import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {GenericFormButtonComponent} from './components/generic-form-button.component';
import {GenericFormCaptionComponent} from './components/generic-form-caption.component';
import {GenericFormFormComponent} from './components/generic-form-form.component';
import {GenericFormInputArrayComponent} from './components/generic-form-input-array.component';
import {GenericFormInputObjectComponent} from './components/generic-form-input-object.component';
import {GenericFormInputPrimitiveComponent} from './components/generic-form-input-primitive.component';
import {GenericFormComponent} from './generic-form.component';
import {InputBooleanWidget} from './inputs/input-boolean-widget';
import {InputIntegerWidget} from './inputs/input-integer-widget';
import {InputNumberWidget} from './inputs/input-number-widget';
import {InputSelectionWidget} from './inputs/input-selection-widget';
import {InputTextWidget} from './inputs/input-text-widget';
import {GenericFormUiElementComponent} from "./components/generic-form-ui-element.component";


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
  ],
  declarations: [
    // GenericFormInputComponent,
    GenericFormFormComponent,
    GenericFormUiElementComponent,
    GenericFormInputPrimitiveComponent,
    GenericFormInputObjectComponent,
    GenericFormInputArrayComponent,
    // GenericFormControlComponent,

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
