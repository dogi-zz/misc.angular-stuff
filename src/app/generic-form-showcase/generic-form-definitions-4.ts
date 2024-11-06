import {FormDefinition} from '../../../libs/generic-form/generic-form-definition';


export const formDef4: FormDefinition = {

  select_options: {
    type: 'selection',
    caption: 'SelectOptions',
    required: true,
    options: null,
    help: 'simple required selection',
  },
  // position: {
  //   type: 'object',
  //   caption: 'Position',
  //   help: 'After 1s the Position will be validated.',
  //   required: true,
  //   properties: {
  //     posX: {caption: 'PosX', type: 'integer', required: true},
  //     posY: {caption: 'PosY', type: 'integer', required: true},
  //   },
  //   // validate: (value, item) => {
  //   //   return new Promise(res => setTimeout(res, 1000)).then(() => {
  //   //     return value?.posX === value?.posY ? 'The coordinates must not be equal' : null;
  //   //   });
  //   // },
  // },

};


export const model4: any = {
  select_options: 'foo',
  position: {posX: 1, posY: 1},
};

//
// const funcString = `
// return new Promise(res => setTimeout(res, 1000)).then(() => {
//   return value?.posX === value?.posY ? "The coordinates must not be equal" : null;
// });
// `;
// export const validationFunctions4: { path: string, functionString: string }[] = [
//   {path: 'position', functionString: funcString.trim()},
// ];
//
//
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

export const asyncOptions4: { path: string, options: string[] }[] = [
  {path: 'select_options', options: [
      JSON.stringify([]),
      JSON.stringify(formDef4Options1),
      JSON.stringify(formDef4Options2),
    ]},
];
