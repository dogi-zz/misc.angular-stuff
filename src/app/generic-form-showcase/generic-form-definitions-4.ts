import {FormDefinition} from '../generic-form/generic-form.data';
import {BehaviorSubject} from "rxjs";


export const formDef4: FormDefinition = {

  some_number: {
    caption: 'Age 1', type: 'integer',
  },
  select_options: {
    type: 'selection',
    caption: 'SelectOptions',
    required: true,
    options: null,
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


export const model4: any = {
  select_options: 'foo',
  position: {posX: 1, posY: 1},
};




export const formDef4Options1 = [
  {label: 'unknown', value: null},
  {label: 'Option 1', value: 'opt_1'},
  {label: 'Option 123', value: 123},
  {label: 'Option 3', value: 'foo'},
];

export const formDef4Options2 = [
  {label: 'unknown', value: null},
  {label: 'Option 1', value: 'opt_1'},
  {label: 'Option 234', value: 234},
];

export const  optionObservables4 : {path: string, jsonString: string}[] = [
  {path: 'select_options', jsonString: JSON.stringify([])},
  {path: 'select_options', jsonString: JSON.stringify(formDef4Options1)},
  {path: 'select_options', jsonString: JSON.stringify(formDef4Options2)},
]
