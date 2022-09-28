import {FormDefinition} from '../generic-form/generic-form.data';

export const formDef1: FormDefinition = {
  name_1: {
    caption: 'Name 1', type: 'text',
  },
  name_2: {
    caption: 'Name 2', type: 'text',
    required: true, layout: 'wide',
    help: 'required and wide',
  },
  gender: {
    type: 'selection',
    caption: 'Gender',
    required: true,
    options: [
      {label: 'unknown', value: false},
      {label: 'male', value: 1},
      {label: 'female', value: 2},
    ],
    help: 'simple required selection',
  },
  workState: {
    type: 'selection',
    caption: 'Work-State',
    options: [
      {label: 'unknown', value: null},
      {label: 'Employed', value: 'employed'},
      {label: 'Unemployed', value: 'unemployed'},
    ],
    help: 'none required selection',
  },
  age: {
    caption: 'Age', type: 'integer',
    min: 18,
    max: 99,
    help: '18 <= age <= 99',
  },
  weight_1: {
    caption: 'Weight 1', type: 'number',
    min: 0,
    max: 100,
    help: 'validation < 100',
  },
  weight_2: {
    caption: 'Weight 2', type: 'number',
    required: true,
    help: 'required non validated',
  },
  bool_1: {
    caption: 'Boolean 1', type: 'boolean',
  },
  bool_2: {
    caption: 'Boolean 2', type: 'boolean', required: true,
  },
  child_1: {
    caption: 'Child 1', type: 'object',
    properties: {
      posX: {
        caption: 'Pos X', type: 'integer',
        min: 0, help: 'validation > 0',
      },
      posY: {
        caption: 'Pos Y', type: 'integer',
        min: 0, help: 'validation > 0',
      },
    },
    help: 'none required nested object',
  },
  child_2: {
    caption: 'Child 2', type: 'object',
    required: false,
    properties: {
      posX: {
        caption: 'Pos X', type: 'integer',
        min: 0, help: 'validation > 0',
      },
      posY: {
        caption: 'Pos Y', type: 'integer',
        min: 0, help: 'validation > 0',
      },
    },
    help: 'none required nested object with init value',
  },
  array_1: {
    caption: 'Array 1', type: 'array',
    required: true,
    elements: {
      type: 'text',
    },
  },
  array_2: {
    caption: 'Array 2', type: 'array',
    elements: {
      type: 'text',
      layout: 'wide',
      required: true,
    },
    minLength: 3,
    maxLength: 4,
  },
};


export const model1: any = {
  extraData: 'foo',
  bool_1: true,
  child_2: {
    posX: -2,
  },
  workState: 'employed',
  array_2: ['element 1', null],
};




