import {Observable} from 'rxjs';

export type FormModelValue = string | number | boolean | FormModel | FormModelValue[];

export interface FormModel {
  [key: string]: FormModelValue;
}

export interface FormValidationResult {
  [key: string]: string;
}

// Form Definition

export type FormDefinition = { [name: string]: FormDefElementNotInline | FormDefElementInline };


export type FormDefBaseElementCaption = {
  caption: string;
  help?: string;
  inline?: false;
};

export type FormDefBaseElementRequired = {
  required?: boolean;
};


export type FormDefElement =
  FormDefElementText | FormDefElementNumber | FormDefElementInteger | FormDefElementSelect | FormDefElementBoolean | FormDefArray |
  FormDefObject | FormDefSubform;

export type FormDefElementNotInline =
  ((FormDefElementText | FormDefElementNumber | FormDefElementInteger | FormDefElementSelect | FormDefElementBoolean) & FormDefBaseElementCaption & FormDefBaseElementRequired) |
  ((FormDefArray | FormDefObject) & FormDefBaseElementCaption & FormDefBaseElementRequired) |
  (FormDefSubform & FormDefBaseElementCaption)
  ;

export type FormDefElementInline = (FormDefObject | FormDefSubform) & FormDefBaseInlineElement;


// Element Types


export type FormDefBaseInlineElement = {
  inline: true;
};

export type FormDefCondition = { path: string, condition?: 'eq' | 'ne', value: any };

export type FormDefBaseConditionElement = {
  condition?: FormDefCondition;
};

export type FormDefBaseValidationElement = FormDefBaseConditionElement & {
  validate?: (value: any, item: any) => Promise<(string | null)> | (string | null);
};


export type FormDefElementText = FormDefBaseValidationElement & {
  type: 'text',
  layout?: 'wide' | 'default',
};

export type FormDefElementNumber = FormDefBaseValidationElement & {
  type: 'number',
  min?: number,
  max?: number,
};

export type FormDefElementInteger = FormDefBaseValidationElement & {
  type: 'integer',
  min?: number,
  max?: number,
};

export type FormDefElementBoolean = FormDefBaseValidationElement & {
  type: 'boolean',
};

export type FormDefElementSelectOption = { label: string, value: FormModelValue };
export type FormDefElementSelect = FormDefBaseValidationElement & {
  type: 'selection',
  options: FormDefElementSelectOption[] | Promise<FormDefElementSelectOption[]> | Observable<FormDefElementSelectOption[]>,
};


export type FormDefArray = FormDefBaseValidationElement & {
  type: 'array',

  elements: FormDefElement & { required?: boolean },
  minLength?: number;
  maxLength?: number;
};


export type FormDefObject = FormDefBaseValidationElement & {
  type: 'object',
  properties: FormDefinition,
};

export type FormDefSubform = FormDefBaseConditionElement & {
  type: 'subform',
  content: FormDefinition,
};


// Constants

export const ValidationTexts = {
  required: 'this is required',
  typeError: 'type error',
  optionError: 'option error',
  NaN: 'this is not a valid number',
  numberMin: 'The value has to be at least ${}',
  numberMax: 'The value has to be at most ${}',
  arrayMin: 'The array has a minimum of ${} elements',
  arrayMax: 'The array has a maximum of ${} elements',
};
