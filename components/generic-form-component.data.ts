// tslint:disable:no-any

import {BehaviorSubject, Observable} from 'rxjs';
import {FormDefElementSelectOption, FormDefPrimitiveType} from "../generic-form-definition";
import {Path} from "../tools/generic-form-path";

export type ButtonType = 'CreateObject' | 'RemoveObject' | 'CreateArray' | 'RemoveArray' | 'AddToArray' | 'RemoveFromArray';

export type ControlDef = {
  // key: string,
  // path: string,
  // calculatedCaption?: string,
  // element?: FormDefElementNotInline,
  // elementInline?: FormDefElementInline,
  // elementInlineProperties: FormDefinition
  //
  // hover?: 'delete' | 'add';
  // visible?: boolean;
  //
  // value$: BehaviorSubject<any>,
  // valueIsString?: boolean,
  // valueIsEmpty?: boolean,
  //
  // arrayMinMax?: [number, number],
  // arrayElements?: (ControlDef & { hover?: 'delete' | 'add' })[],
  // addToArrayButtonControl?: ButtonControl;
  // removeFromArrayButtonControls?: ButtonControl[];
};

export type WidgetControl = {
  onFocus: () => void,
  onBlur: () => void,
  onInput: (value: any) => void,
  def: FormDefPrimitiveType;
  path: Path;
  // required?: boolean;
  // min?: number;
  // max?: number;
};

export type ButtonControl = {
  action: () => void,
  mouseEnter: () => void,
  mouseLeave: () => void,
};

// export type ElementLayoutPosition = 'BeforeControl' | 'AfterControl' | 'BeforeInput' | 'AfterInput' | 'InsidePanel';
// export type ButtonLayoutPosition = 'BeforeInput' | 'AfterInput' | 'InsidePanel';
//
// export type ElementLayout = {
//   title: ElementLayoutPosition,
//   help: ElementLayoutPosition,
//   error: ElementLayoutPosition,
//   arrayError: ElementLayoutPosition,
//   removeButtonPosition: ButtonLayoutPosition,
// };
