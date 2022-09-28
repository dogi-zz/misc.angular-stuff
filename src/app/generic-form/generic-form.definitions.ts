import {FormModelValue} from './generic-form.data';

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
  objectCreate: 'create object',
  arraySetToNull: 'remove array',
  arrayCreate: 'create array',
  addToArray: '+',
  removeFromArray: '-',
};
