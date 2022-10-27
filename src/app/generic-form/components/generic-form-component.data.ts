// tslint:disable:no-any

import {BehaviorSubject, Observable} from 'rxjs';
import {FormDefElementCaption, FormDefElementSelectOption, FormDefinition, FormDefInline} from '../generic-form.data';

export type ButtonType = 'CreateObject' | 'RemoveObject' | 'CreateArray' | 'RemoveArray' | 'AddToArray' | 'RemoveFromArray';

export type ControlDef = {
  key: string,
  path: string,
  calculatedCaption?: string,
  element?: FormDefElementCaption,
  elementInline?: FormDefInline,
  elementInlineProperties: FormDefinition

  hover?: 'delete' | 'add';

  value$: BehaviorSubject<any>,
  valueIsString?: boolean,
  valueIsEmpty?: boolean,

  arrayMinMax?: [number, number],
  arrayElements?: (ControlDef & { hover?: 'delete' | 'add' })[],
  addToArrayButtonControl?: ButtonControl;
  removeFromArrayButtonControls?: ButtonControl[];
};

export type WidgetControl = {
  value: any,
  onFocus: () => void,
  onBlur: () => void,
  onInput: (value: any) => void,
  options?: FormDefElementSelectOption[] | Promise<FormDefElementSelectOption[]> | Observable<FormDefElementSelectOption[]>;
  required?: boolean;
  min?: number;
  max?: number;
};

export type ButtonControl = {
  action: () => void,
  mouseEnter: () => void,
  mouseLeave: () => void,
};

export type ElementLayoutPosition = 'BeforeControl' | 'AfterControl' | 'BeforeInput' | 'AfterInput' | 'InsidePanel';
export type ButtonLayoutPosition = 'BeforeInput' | 'AfterInput' | 'InsidePanel';

export type ElementLayout = {
  title: ElementLayoutPosition,
  help: ElementLayoutPosition,
  error: ElementLayoutPosition,
  arrayError: ElementLayoutPosition,
  removeButtonPosition: ButtonLayoutPosition,
};
