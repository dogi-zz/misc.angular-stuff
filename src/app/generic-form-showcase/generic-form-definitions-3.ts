import {FormDefinition} from '../generic-form/generic-form.data';

export const formDef3: FormDefinition = {
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
    help: 'Array of Required objects',
    elements: {
      type: 'object',
      required: true,
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
    help: 'Array (size 2-4) of Arrays with Text, inner Arrays are not Required, texts are not required',
    elements: {
      type: 'array',
      required: false,
      elements: {
        type: 'text',
        layout: 'wide',
        required: false,
      },
      minLength: 2,
      maxLength: 4,
    },
    required: true,
  },
  array_2: {
    caption: 'Arrays 2', type: 'array',
    help: 'Array of Arrays with Object, inner Arrays are Required, objects are not required',
    elements: {
      type: 'array',
      required: true,
      elements: {
        type: 'object',
        properties: {
          value: {
            caption: 'Value',
            type: 'number',
          },
        },
      },
    },
  },
};


export const model3: any = {
  extraData: 'foo',
  name_1: 'Some Arrays',
  strings_2: ['element 1', null],
  strings_3: ['wide element 1', 'wide element 2'],
  objects_1: [{posX: 1}],
  array_1: [['text 1', 'text 2', null, 'text 3'], ['text 4']],
  array_2: [[{value: 123}, {value: 234}, null, {value: 345}], [{value: 456}]],
};




