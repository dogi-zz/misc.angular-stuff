import {FormDefinition} from '../../../libs/generic-form/generic-form-definition';

export const formDef2: FormDefinition = {
  child_1: {
    caption: 'Child 1', type: 'object',
    help: 'none required object',
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
  },
  child_2: {
    caption: 'Child 2', type: 'object',
    help: 'required object',
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
  },
  child_3: {
    caption: 'Child 3', type: 'object',
    help: 'none required nested object with init value',
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



