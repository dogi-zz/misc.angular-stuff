import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {GenericFormControlComponent} from './components/generic-form-control.component';
import {GenericFormFormComponent} from './components/generic-form-form.component';
import {GenericFormInputComponent} from './components/generic-form-input.component';
import {GenericFormComponent} from './generic-form.component';
import {InputSelectionWidget} from './inputs/input-selection-widget';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
  ],
  declarations: [
    GenericFormInputComponent,
    GenericFormFormComponent,
    GenericFormControlComponent,
    InputSelectionWidget,

    GenericFormComponent,
  ],
  exports: [GenericFormComponent],
})
export class GenericFormModule {
}
