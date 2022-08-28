import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {GenericFormControlComponent} from './components/generic-form-control.component';
import {GenericFormFormComponent} from './components/generic-form-form.component';
import {GenericFormInputComponent} from './components/generic-form-input.component';
import {GenericFormComponent} from './generic-form.component';
import {FormModelValue} from './generic-form.data';
import {InputSelectionWidget} from './inputs/input-selection-widget';


export const UiConverters: { [type: string]: { toString?: (value: FormModelValue) => string, fromString: (str: string) => FormModelValue } } = {
  'text': {
    fromString: (value) => {
      return value?.length ? value : null;
    },
    toString: (val) => {
      return ((val ?? null) === null) ? '' : `${val}`;
    },
  },
  'number': {
    fromString: (str) => {
      if (!str || !str.match(/-?[0-9]*.?[0-9+]/)) {
        return null;
      }
      let num = parseFloat(str.replace(',', '.'));
      if (`${num}` !== str.replace(',', '.')) {
        num = NaN;
      }
      return (typeof num === 'number') ? num : null;
    },
    toString: (val) => {
      return ((val ?? null) === null || isNaN(val as any)) ? '' : `${val}`.replace('.', ',');
    },
  },
  'integer': {
    fromString: (str) => {
      if (!str?.length) {
        return null;
      }
      let num = parseInt(`${str}`, 10);
      if (`${num}` !== `${str}`) {
        num = NaN;
      }
      return (typeof num === 'number') ? num : null;
    },
    toString: (val) => {
      return ((val ?? null) === null || isNaN(val as any)) ? '' : `${val}`;
    },
  },
};

export const UiTexts = {
  objectSetToNull: 'remove object',
  objectCreate: 'create object',
  arraySetToNull: 'remove array',
  arrayCreate: 'create array',
  addToArray: '+',
  removeFromArray: '-',
};


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
