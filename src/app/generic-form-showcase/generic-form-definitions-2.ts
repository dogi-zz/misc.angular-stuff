import {FormDefinition} from '../generic-form/generic-form.data';

export const formDef2: FormDefinition = {
  name_1: {
    caption: 'Name 1', type: 'text',
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
    required: true,
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
    help: 'required nested object',
  },
  child_3: {
    caption: 'Child 3', type: 'object',
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
      name_wide: {
        caption: 'Name Wide', type: 'text',
        layout: 'wide',
      },
    },
    help: 'none required nested object with init value',
  },
  child_4: {
    type: 'object',
    inline: true,
    properties: {
      posX: {
        caption: 'Inline Child Pos X', type: 'integer',
        min: 0, help: 'validation > 0',
      },
      posY: {
        caption: 'Inline Child Pos Y', type: 'integer',
        min: 0, help: 'validation > 0',
      },
    },
  },

};


export const model2: any = {
  extraData: 'foo',
  child_3: {
    posX: -2,
  },
};



