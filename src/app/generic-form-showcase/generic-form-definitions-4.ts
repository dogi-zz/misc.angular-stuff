import {FormDefinition} from '../generic-form/generic-form.data';


export const formDef4: FormDefinition = {

  some_number: {
    caption: 'Age 1', type: 'integer',
  },
  select_options: {
    type: 'selection',
    caption: 'SelectOptions',
    required: true,
    options: '{observable}' as any,
    help: 'simple required selection',
  },
  position: {
    type: 'object',
    caption: 'Position',
    help: 'After 1s the Position will be validated.',
    required: true,
    properties: {
      posX: {caption: 'PosX', type: 'integer', required: true},
      posY: {caption: 'PosY', type: 'integer', required: true},
    },
    validate: (value, item) => {
      return new Promise(res => setTimeout(res, 1000)).then(() => {
        return value?.posX === value?.posY ? 'The coordinates must not be equal' : null;
      });
    },
  },

};

export const formDef4Options = [
  {label: 'unknown', value: null},
  {label: 'Option 1', value: 'opt_1'},
  {label: 'Option 123', value: 123},
  {label: 'Option 3', value: 'foo'},
];

export const model4: any = {
  select_options: 'foo',
  position: {posX: 1, posY: 1}
};



