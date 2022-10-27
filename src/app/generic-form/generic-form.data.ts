import {Observable} from 'rxjs';

export type FormModelValue = string | number | boolean | FormModel | FormModelValue[];

export interface FormModel {
  [key: string]: FormModelValue;
}

export interface FormValidationResult {
  [key: string]: string;
}

// Form Definition

export type FormDefinition = { [name: string]: FormDefElementCaption | FormDefInline };

export type FormDefElement =
  FormDefElementText | FormDefElementNumber | FormDefElementInteger | FormDefElementSelect | FormDefElementBoolean  | FormDefArray |
  FormDefObject | FormDefSubform;

export type FormDefElementCaption = FormDefElement & FormDefBaseElementCaption;

export type FormDefInline =  (FormDefObject | FormDefSubform) & FormDefBaseInlineElement;




// Element Types

export type FormDefBaseElementCaption = {
  required?: boolean;
  caption: string;
  help?: string;
  inline?: false;
};

export type FormDefBaseInlineElement  = {
  inline: true;
};

export type FormDefElementText =  {
  type: 'text',
  layout?: 'wide' | 'default',
};

export type FormDefElementNumber =  {
  type: 'number',
  min?: number,
  max?: number,
};

export type FormDefElementInteger =  {
  type: 'integer',
  min?: number,
  max?: number,
};

export type FormDefElementBoolean =  {
  type: 'boolean',
};

export type FormDefElementSelectOption = { label: string, value: FormModelValue };
export type FormDefElementSelect =  {
  type: 'selection',
  options: FormDefElementSelectOption[] | Promise<FormDefElementSelectOption[]> | Observable<FormDefElementSelectOption[]>,
};


export type FormDefArray =  {
  type: 'array',

  elements: FormDefElement & {required?: boolean},
  minLength?: number;
  maxLength?: number;
};



export type FormDefObject =  {
  type: 'object',
  properties: FormDefinition,
};

export type FormDefSubform =   {
  type: 'subform',
  content: FormDefinition,
  options?: FormDefElementSelectOption[] | Promise<FormDefElementSelectOption[]> | Observable<FormDefElementSelectOption[]>,
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
