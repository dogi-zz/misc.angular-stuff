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
  // child_count: {
  //   caption: 'Child Count', type: 'integer',
  //   min: 0, max: 5,
  // },
  // children: {
  //   caption: 'Children', type: 'array',
  //   condition: {path: 'child_count', condition: 'eq', value: 1},
  //   required: true, minLength: 1, maxLength: 1,
  //   elements: {
  //     type: 'object',
  //     required: true,
  //     properties: {
  //       name: {caption: 'Name', type: 'text', required: true},
  //       age: {caption: 'Age', type: 'integer', required: true},
  //     },
  //   },
  // },
  // childrenNames: {
  //   caption: 'Children Names', type: 'array',
  //   condition: {path: 'child_count', condition: 'eq', value: 2},
  //   required: true,  minLength: 2, maxLength: 2,
  //   elements: {
  //     type: 'text',
  //     required: true,
  //   },
  // },
  // showSubform: {
  //   caption: 'Show Subform', type: 'boolean', required: true,
  // },
  // subForm : {
  //   type: 'subform',
  //   inline: true,
  //   condition: {path: 'showSubform', condition: 'eq', value: true},
  //   content: {
  //     employed: {
  //       caption: 'Employed', type: 'boolean', required: true,
  //     },
  //     jobName: {
  //       condition: {path: 'employed', condition: 'eq', value: true},
  //       caption: 'Job Name', type: 'text', required: true,
  //     },
  //   },
  // },
};

export const model6: any = {
  // name: 'foo',
  // showSubform: false,
  employed: true,
};



