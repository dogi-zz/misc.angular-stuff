import {FormDefinition} from '../generic-form/generic-form.data';


export const formDef4: FormDefinition = {
  name_1: {
    caption: 'Name 1', type: 'text',
  },
  strings_1: {
    caption: 'Strings 1', type: 'array',
    required: true,
    elements: {
      type: 'text',
    },
    help: 'required string array',
  },
  strings_2: {
    caption: 'Strings 2', type: 'array',
    elements: {
      type: 'text',
      layout: 'wide',
      required: true,
    },
    minLength: 3,
    maxLength: 4,
    help: 'non required string min 3 max 4',
  },
  strings_3: {
    caption: 'Strings 3', type: 'array',
    elements: {
      type: 'text',
      layout: 'wide',
      required: true,
    },
    minLength: 2,
    maxLength: 4,
    help: 'wide strings',
  },
  objects_1: {
    caption: 'Objects 1', type: 'array',
    elements: {
      type: 'object',
      properties: {
        posX: {
          required: true,
          caption: 'Inline Child Pos X', type: 'integer',
          min: 0, help: 'validation > 0',
        },
        posY: {
          required: true,
          caption: 'Inline Child Pos Y', type: 'integer',
          min: 0, help: 'validation > 0',
        },
      },
    },
  },
  array_1: {
    caption: 'Arrays 1', type: 'array',
    help: 'Array of Arrays',
    elements: {
      type: 'array',
      elements: {
        type: 'text',
        layout: 'wide',
        required: true,
      },
      minLength: 2,
      maxLength: 4,
    },
  },
};


export const model4: any = {
  extraData: 'foo',
  name_1: 'Some Arrays',
  strings_2: ['element 1', null],
  strings_3: ['wide element 1', 'wide element 2'],
  objects_1: [{posX: 1}],
};



