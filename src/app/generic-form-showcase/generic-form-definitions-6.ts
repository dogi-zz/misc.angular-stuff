import {FormDefinition} from '../../../libs/generic-form/generic-form-definition';

export const formDef6: FormDefinition = {
  name: {
    caption: 'Name', type: 'text',
  },
  subForm: {
    type: 'subform',
    caption: 'Personal Data',
    help: 'Some Structured Data',
    content: {
      age: {caption: 'Age', help: 'just some value', type: 'integer', required: true, min: 10},
      weight: {caption: 'Weight', help: 'just some value', type: 'number'},
      employed: {caption: 'Employed', help: 'just some value', type: 'boolean'},
    },
  },
  subformType: {
    caption: 'Contitional Subform', type: 'selection',
    options: [
      {label: 'unknown', value: null},
      {label: 'form-1', value: 'form1'},
      {label: 'form-1-extended', value: 'form1-e'},
      {label: 'form-2 (inline)', value: 'form2'},
    ],
  },
  selectiveForm1: {
    type: 'subform',
    caption: 'Selective Form 1',
    help: 'Some Structured Data 1',
    condition: {path: 'subformType', condition: "in", value: ['form1', 'form1-e']},
    content: {
      age1: {caption: 'Age 1', type: 'integer', required: true},
      weight1: {caption: 'Weight 1', type: 'number'},
      employed1: {caption: 'Employed 1', type: 'boolean'},
      extended1: {
        caption: 'Extended String', type: 'text', layout: 'wide', required: true,
        condition: {path: '-.subformType', condition: "eq", value: 'form1-e'},
      },
    },
  },
  selectiveForm2: {
    type: 'subform',
    inline: true,
    condition: {path: 'subformType', condition: "eq", value: 'form2'},
    content: {
      age2: {caption: 'Age 2', type: 'integer', required: true},
      weight2: {caption: 'Weight 2', type: 'number'},
      employed2: {caption: 'Employed 2', type: 'boolean'},
    },
  },

};

export const model6: any = {
  // name: 'foo',
  // showSubform: false,
  employed: true,
};



