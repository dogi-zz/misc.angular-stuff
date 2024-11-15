import {FormDefinition} from '../../../libs/generic-form/generic-form-definition';

export const formDef5: FormDefinition = {
  child_1: {
    caption: 'Child', type: 'object',
    help: 'none required object',
    validate: null,
    properties: {
      name: {
        caption: 'Name', type: 'text',
        validate: null,
        help: 'required string array',
      },
      inner_child: {
        caption: 'Inner Child', type: 'object',
        help: 'none required object',
        validate: null,
        properties: {
          posX: {
            caption: 'Pos X', type: 'integer',
            validate: null,
          },
          posY: {
            caption: 'Pos Y', type: 'integer',
            validate: null,
          },
        },
      },
    },
  },
  string_array: {
    validate: null,
    caption: 'String Array', type: 'array',
    elements: {
      type: 'text',
      validate: null,
    },
    help: 'none required string array',
  },
  object_array: {
    caption: 'Object Array', type: 'array',
    validate: null,
    elements: {
      type: 'object',
      validate: null,
      properties: {
        num: {
          caption: 'Some Number', type: 'number',
          validate: null,
        },
        bool: {
          caption: 'Some Bool', type: 'boolean',
          validate: null,
        },
      },
    },
    help: 'none required object array',
  },


};

export const  validationFunctions5: { path: string, functionString: string, time?: number }[] = [
  {path: 'child_1', functionString: '// console.info(value, parent, inspector);' },
  {path: 'child_1.inner_child', functionString: '// console.info(value, parent, inspector);' },
  {path: 'child_1.inner_child.posX', functionString: '// console.info(value, parent, inspector);' },
  {path: 'child_1.inner_child.posY', functionString: '// console.info(value, parent, inspector);' },
  {path: 'child_1.name', functionString: '// console.info(value, parent, inspector);' },
  {path: 'string_array', functionString: '// console.info(value, parent, inspector);' },
  {path: 'object_array', functionString: '// console.info(value, parent, inspector);' },
  {path: 'object_array.#', functionString: '// console.info(value, parent, inspector);' },
  {path: 'object_array.#.bool', functionString: '// console.info(value, parent, inspector);' },
  {path: 'object_array.#.num', functionString: '// console.info(value, parent, inspector);' },
  {path: 'string_array', functionString: '// console.info(value, parent, inspector);' },
  {path: 'string_array.#', functionString: '// console.info(value, parent, inspector);' },
];



export const model5: any = {
  child_1: {
    name: 'Some Name',
    inner_child: {
      posX: 12,
      posY: 23,
    },
  },
  string_array: [
    'foo',
    'bar',
  ],
  object_array: [
    {num: 0, bool: true},
    {num: 1, bool: false},
  ],
};



