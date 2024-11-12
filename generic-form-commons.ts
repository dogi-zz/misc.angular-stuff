import {FormModelValue} from "./generic-form-definition";

export type UiConverter = { toString?: (value: FormModelValue) => string, fromString: (str: string) => FormModelValue };

export const UiConverters: { [type: string]: UiConverter } = {
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
      const num = parseFloat(str.replace(',', '.'));
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
  arraySetToNull: 'remove array',
  arrayCreate: 'create array',
  addToArray: '+',
  removeFromArray: '-',
};


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
