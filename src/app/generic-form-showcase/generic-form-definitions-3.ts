import {FormDefinition} from '../generic-form/generic-form.data';

export const formDef3: FormDefinition = {
  some_number: {
    caption: 'Age 1', type: 'integer'
  },
  select_options: {
    type: 'selection',
    caption: 'SelectOptions',
    required: true,
    options: '{observable}' as any,
    help: 'simple required selection',
  },
};

export const formDef3Options = [
  {label: 'unknown', value: null},
  {label: 'Option 1', value: 'opt_1'},
  {label: 'Option 123', value: 123},
  {label: 'Option 3', value: 'foo'},
];

export const model3: any = {
  select_options: 'foo',
};




