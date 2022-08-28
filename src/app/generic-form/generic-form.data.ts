import {Observable} from 'rxjs';

export type FormModelValue = string | number | boolean | FormModel | FormModelValue[];

export interface FormModel {
  [key: string]: FormModelValue;
}

export type FormValidationResultValue = string | {type: 'object', value: FormValidationResult} | {type: 'array', error?: string, value: FormValidationResultValue[]};

export interface FormValidationResult {
  [key: string]: FormValidationResultValue;
}

// Form Definition

export type FormDefinition = { [name: string]: (FormDefElement & FormDefBaseElementCaption) | FormDefInlineObject };

export type FormDefElement =
  FormDefElementText | FormDefElementNumber | FormDefElementInteger | FormDefElementSelect | FormDefElementBoolean
  | FormDefObject | FormDefInlineObject | FormDefArray;

// Element Types

export type FormDefBaseElement = {
  required?: boolean;
};

export type FormDefBaseElementCaption = {
  caption: string;
  help?: string;
};

export type FormDefElementText = FormDefBaseElement & {
  type: 'text',
  layout?: 'wide' | 'default',
};

export type FormDefElementNumber = FormDefBaseElement & {
  type: 'number',
  min?: number,
  max?: number,
};

export type FormDefElementInteger = FormDefBaseElement & {
  type: 'integer',
  min?: number,
  max?: number,
};

export type FormDefElementBoolean = FormDefBaseElement & {
  type: 'boolean',
};

export type FormDefElementSelectOption = { label: string, value: FormModelValue };
export type FormDefElementSelect = FormDefBaseElement & {
  type: 'selection',
  options: FormDefElementSelectOption[] | Promise<FormDefElementSelectOption[]> | Observable<FormDefElementSelectOption[]>,
};


export type FormDefObject = FormDefBaseElement & {
  type: 'object',
  inline?:false;
  properties: FormDefinition,
};

export type FormDefInlineObject = FormDefBaseElement & {
  type: 'object',
  inline:true;
  properties: FormDefinition,
};


export type FormDefArray = FormDefBaseElement & {
  type: 'array',

  elements: FormDefElement,
  minLength?: number;
  maxLength?: number;
};


// Constants

export const ValidationTexts = {
  required: 'this is required',
  typeError: 'type error',
  optionError: 'option error',
  numberMin: 'The value has to be at least ${}',
  numberMax: 'The value has to be at most ${}',
  arrayMin: 'The array has a minimum of ${} elements',
  arrayMax: 'The array has a maximum of ${} elements',
};
