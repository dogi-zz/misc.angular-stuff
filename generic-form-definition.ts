import {Observable} from 'rxjs';
import {GenericFormModelInspector} from "./tools/generic-form-model-inspector";
//import {FormDefElementInArray, FormDefElementInObject, FormDefElementNotInline, FormModelValue} from './generic-form.data';

// ==== FORM VALUE ====

export type FormModelValue = string | number | boolean | FormModelObject | FormModelArray;
export type FormModelObject = { [key: string]: FormModelValue; }
export type FormModelArray = FormModelValue[];


// ==== FORM DEFINITION ====


export const FormDefPrimitiveTypes = ['text', 'number', 'integer', 'selection', 'boolean'];

export type FormDefinition = {
  [name: string]:
    (FormDefPrimitive & FormDefBaseElementCaption & FormDefBaseConditionElement) |
    (FormDefObject & FormDefBaseConditionElement & (FormDefBaseElementCaption | FormDefBaseElementInline)) |
    (FormDefSubform & FormDefBaseConditionElement & (FormDefBaseElementCaption | FormDefBaseElementInline)) |
    (FormDefArray & FormDefBaseElementCaption),
};

export type FormDefPrimitive = FormDefElementText | FormDefElementNumber | FormDefElementInteger | FormDefElementSelect | FormDefElementBoolean;
export type FormDefElement = FormDefPrimitive | FormDefObject | FormDefArray;
export type FormDefObjectElement = FormDefPrimitive | FormDefObject | FormDefArray  | FormDefSubform;


// ==== MIXINS ====

export type FormDefBaseElementCaption = {
  caption: string;
  help?: string;
  inline?: false;
};
export type FormDefBaseElementInline = {
  inline: true;
};


export type FormDefCondition = { path: string, condition?: 'eq' | 'ne', value: any } |  { path: string, condition: 'in' | 'not-in', value: any[] };
export type FormDefBaseConditionElement = {
  condition?: FormDefCondition;
};

export type FormDefValidationElement = {
  validate?: (value: any, parent: any, inspector: GenericFormModelInspector) => Promise<(string | null)> | (string | null);
};

export const asFormDefBaseConditionElement = (obj: any) => obj as FormDefBaseConditionElement;
export const asFormDefBaseElementInline = (obj: any) => obj as FormDefBaseElementInline;
export const getCaption = (def: FormDefObjectElement) => (def as any).caption || (def as any).help ? {caption: (def as any).caption, help: (def as any).help} : undefined;

// ==== BASIC ELEMENT TYPES ====


export type FormDefElementText = FormDefValidationElement & {
  type: 'text',
  layout?: 'wide' | 'default',
  required?: boolean;
};

export type FormDefElementNumber = FormDefValidationElement & {
  type: 'number',
  min?: number,
  max?: number,
  required?: boolean;
};

export type FormDefElementInteger = FormDefValidationElement & {
  type: 'integer',
  min?: number,
  max?: number,
  required?: boolean;
};

export type FormDefElementBoolean = FormDefValidationElement & {
  type: 'boolean',
  required?: boolean;
};

export type FormDefElementSelectOption = { label: string, value: FormModelValue };
export type FormDefElementSelect = FormDefValidationElement & {
  type: 'selection',
  options: FormDefElementSelectOption[] | Promise<FormDefElementSelectOption[]> | Observable<FormDefElementSelectOption[]>,
  required?: boolean;
};

export type FormDefObject = FormDefValidationElement & {
  type: 'object',
  properties: FormDefinition,
  required?: boolean;
};


export type FormDefArray = FormDefValidationElement & {
  type: 'array',

  elements: FormDefPrimitive | FormDefObject | FormDefArray,
  minLength?: number;
  maxLength?: number;
  required?: boolean;
};

export type FormDefSubform = FormDefBaseConditionElement & {
  type: 'subform',
  content: FormDefinition,
};

