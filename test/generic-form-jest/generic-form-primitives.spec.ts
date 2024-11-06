import {beforeEach, describe, expect, it} from '@jest/globals';
import {ValidationTexts} from '../../libs/generic-form/generic-form-commons';
import {FormDefinition} from '../../libs/generic-form/generic-form-definition';
import {GenericFormInstance} from '../../libs/generic-form/generic-form-instance';
import {fromUiItems} from "./tools";
/* eslint  prefer-const: 0 */


describe(__filename, () => {

  beforeEach(async () => {

  });

  it('Check Primitive Data', async () => {
    let formInstance: GenericFormInstance;
    let formDefinition: FormDefinition;

    formDefinition = {
      name: {caption: null, type: 'text'},
      age: {caption: null, type: 'integer'},
      weight: {caption: null, type: 'number'},
      employed: {caption: null, type: 'boolean'},
    };

    formInstance = new GenericFormInstance(formDefinition, {});

    expect(formInstance.outputModel).toEqual({name: null, age: null, weight: null, employed: null});

    formInstance = new GenericFormInstance(formDefinition, {name: 'foo', age: 23, weight: 73.5, employed: false});

    expect(formInstance.outputModel).toEqual({name: 'foo', age: 23, weight: 73.5, employed: false});
    expect(formInstance.outputErrors.value.export()).toEqual({});

    formInstance.setValue(['name'], 123);
    expect(formInstance.outputModel).toEqual({name: null, age: 23, weight: 73.5, employed: false});
    expect(formInstance.outputErrors.value.export()).toEqual({
      'name': ValidationTexts.typeError,
    });

    formInstance.setValue(['name'], 'bar');
    expect(formInstance.outputModel).toEqual({name: 'bar', age: 23, weight: 73.5, employed: false});
    expect(formInstance.outputErrors.value.export()).toEqual({});
  });


  it('Check Primitive Data Text', async () => {
    let formInstance: GenericFormInstance;
    let formDefinition: FormDefinition;

    formDefinition = {
      name: {caption: null, type: 'text'},
    };

    formInstance = new GenericFormInstance(formDefinition, {});
    expect(formInstance.outputModel).toEqual({name: null});
    expect(formInstance.outputErrors.value.export()).toEqual({});

    formInstance = new GenericFormInstance(formDefinition, {name: 'foo'});
    expect(formInstance.outputModel).toEqual({name: 'foo'});
    expect(formInstance.outputErrors.value.export()).toEqual({});

    formInstance = new GenericFormInstance(formDefinition, {name: 123});
    expect(formInstance.outputModel).toEqual({name: null});
    expect(formInstance.outputErrors.value.export()).toEqual({
      'name': ValidationTexts.typeError,
    });

    formDefinition = {
      name: {caption: null, type: 'text', required: true},
    };
    expect(fromUiItems(formInstance.uiItems)).toEqual({
      name: {path: 'name', type: 'input', inputType: 'text'},
    });

    formInstance = new GenericFormInstance(formDefinition, {name: 'foo'});
    expect(formInstance.outputModel).toEqual({name: 'foo'});
    expect(formInstance.outputErrors.value.export()).toEqual({});

    formInstance = new GenericFormInstance(formDefinition, {});
    expect(formInstance.outputModel).toEqual({name: null});
    expect(formInstance.outputErrors.value.export()).toEqual({
      'name': ValidationTexts.required,
    });

    formInstance = new GenericFormInstance(formDefinition, {name: null});
    expect(formInstance.outputModel).toEqual({name: null});
    expect(formInstance.outputErrors.value.export()).toEqual({
      'name': ValidationTexts.required,
    });

    formInstance = new GenericFormInstance(formDefinition, {name: 123});
    expect(formInstance.outputModel).toEqual({name: null});
    expect(formInstance.outputErrors.value.export()).toEqual({
      'name': ValidationTexts.typeError,
    });

  });

  // TODO: Validierungen für Integer
  // TODO: Validierungen für Number
  // TODO: Validierungen für Selection
  // TODO: Validierungen für Boolean

  //
  // it.only('Check Primitive Data with INput', async () => {
  //   let formInstance: GenericFormInstanceNew;
  //   let formDefinition: FormDefinition;
  //
  //   formDefinition = {
  //     name: {caption: null, type: 'text'},
  //     age: {caption: null, type: 'integer'},
  //     weight: {caption: null, type: 'number'},
  //     employed: {caption: null, type: 'boolean'},
  //   };
  //
  //   formInstance = new GenericFormInstanceNew(formDefinition, {name: 'Steffen', age: 'Steffen', nix: 123});
  //
  //   expect(formInstance.inputsByPath.length).toEqual(4);
  //   expect(formInstance.inputsByPath[0]).toEqual({path: ['name'], def: {caption: null, type: 'text'}, conditions: [], originalValue: 'Steffen'});
  //   expect(formInstance.inputsByPath[1]).toEqual({path: ['age'], def: {caption: null, type: 'integer'}, conditions: [], originalValue: 'Steffen'});
  //   expect(formInstance.inputsByPath[2]).toEqual({path: ['weight'], def: {caption: null, type: 'number'}, conditions: []});
  //   expect(formInstance.inputsByPath[3]).toEqual({path: ['employed'], def: {caption: null, type: 'boolean'}, conditions: []});
  //
  //
  //   formDefinition = {
  //     testBool: {caption: null, type: 'boolean', required: true},
  //     name: {caption: null, type: 'text', required: true, condition: {path: 'testBool', value: true}},
  //   };
  //
  //   formInstance = new GenericFormInstanceNew(formDefinition, {});
  //
  //   expect(formInstance.inputsByPath.length).toEqual(2);
  //   expect(formInstance.inputsByPath[0]).toEqual({path: ['testBool'], def: formDefinition[`testBool`], conditions: []});
  //   expect(formInstance.inputsByPath[1]).toEqual({path: ['name'], def: formDefinition[`name`], conditions: [{path: 'testBool', value: true}]});
  //
  // });
  //
  // it('Check One Object', async () => {
  //   let formInstance: GenericFormInstanceNew;
  //   let formDefinition: FormDefinition;
  //
  //   formDefinition = {
  //     name: {caption: null, type: 'text'},
  //     child: {
  //       caption: null, type: 'object', condition: {path: 'name', value: 'steffen'}, properties: {
  //         weight: {caption: null, type: 'number', condition: {path: '-.name', value: 'steffen2'}},
  //         employed: {caption: null, type: 'boolean'},
  //       },
  //     },
  //   };
  //
  //   formInstance = new GenericFormInstanceNew(formDefinition, {});
  //
  //   expect(formInstance.inputsByPath.length).toEqual(4);
  //   expect(formInstance.inputsByPath[0]).toEqual({path: ['name'], def: {caption: null, type: 'text'}, conditions: []});
  //   expect(formInstance.inputsByPath[1]).toEqual({path: ['child'], def: formDefinition[`child`], conditions: [{path: 'name', value: 'steffen'}]});
  //   expect(formInstance.inputsByPath[2]).toEqual({path: ['child', 'weight'], def: formDefinition[`child`][`properties`][`weight`], conditions: [{path: 'name', value: 'steffen'}, {path: 'name', value: 'steffen2'}]});
  //   expect(formInstance.inputsByPath[3]).toEqual({path: ['child', 'employed'], def: {caption: null, type: 'boolean'}, conditions: [{path: 'name', value: 'steffen'}]});
  //
  // });
  //
  //
  // it('Check Name Resolution nested Objects', async () => {
  //   let formInstance: GenericFormInstanceNew;
  //   let formDefinition: FormDefinition;
  //
  //   formDefinition = {
  //     name: {caption: null, type: 'text'},
  //     child: {
  //       caption: null, type: 'object', properties: {
  //         weight: {caption: null, type: 'number', condition: {path: '-.name', value: 'steffen'}},
  //         employed: {caption: null, type: 'boolean'},
  //       },
  //     },
  //     child2: {
  //       caption: null, type: 'object', condition: {path: 'child.employed', value: true}, properties: {
  //         child: {
  //           caption: null, type: 'object', properties: {
  //             weight: {caption: null, type: 'number', condition: {path: '-.child2.jobCount', condition: 'ne', value: 0}},
  //             employed: {caption: null, type: 'boolean'},
  //             name: {caption: null, type: 'text'},
  //           }
  //         },
  //         child2: {
  //           caption: null, type: 'object', properties: {
  //             child: {
  //               caption: null, type: 'object', condition: {path: '-.child.employed', value: true}, properties: {
  //                 name: {caption: null, type: 'text'},
  //                 jobCount: {caption: null, type: 'number'},
  //                 jobDescription: {caption: null, type: 'text', condition: {path: 'jobCount', condition: 'ne', value: 0}},
  //               }
  //             },
  //           }
  //         },
  //       },
  //     },
  //   };
  //
  //   formInstance = new GenericFormInstanceNew(formDefinition, {});
  //
  //   expect(formInstance.inputsByPath.length).toEqual(14);
  //   expect({...formInstance.inputsByPath[0], def: undefined}).toEqual({path: ['name'], conditions: []});
  //   expect({...formInstance.inputsByPath[1], def: undefined}).toEqual({path: ['child'], conditions: []});
  //   expect({...formInstance.inputsByPath[2], def: undefined}).toEqual({path: ['child', 'weight'], conditions: [{path: 'name', value: 'steffen'}]});
  //   expect({...formInstance.inputsByPath[3], def: undefined}).toEqual({path: ['child', 'employed'], conditions: []});
  //
  //   expect({...formInstance.inputsByPath[4], def: undefined}).toEqual({path: ['child2'], conditions: [{path: 'child.employed', value: true}]});
  //   expect({...formInstance.inputsByPath[5], def: undefined}).toEqual({path: ['child2', 'child'], conditions: [{path: 'child.employed', value: true}]});
  //   expect({...formInstance.inputsByPath[6], def: undefined}).toEqual({path: ['child2', 'child', 'weight'], conditions: [{path: 'child.employed', value: true}, {path: 'child2.child2.jobCount', condition: 'ne', value: 0}]});
  //   expect({...formInstance.inputsByPath[7], def: undefined}).toEqual({path: ['child2', 'child', 'employed'], conditions: [{path: 'child.employed', value: true}]});
  //   expect({...formInstance.inputsByPath[8], def: undefined}).toEqual({path: ['child2', 'child', 'name'], conditions: [{path: 'child.employed', value: true}]});
  //
  //   expect({...formInstance.inputsByPath[9], def: undefined}).toEqual({path: ['child2', 'child2'], conditions: [{path: 'child.employed', value: true}]});
  //
  //   expect({...formInstance.inputsByPath[10], def: undefined}).toEqual({path: ['child2', 'child2', 'child'], conditions: [{path: 'child.employed', value: true}, {path: 'child2.child.employed', value: true}]});
  //   expect({...formInstance.inputsByPath[11], def: undefined}).toEqual({path: ['child2', 'child2', 'child', 'name'], conditions: [{path: 'child.employed', value: true}, {path: 'child2.child.employed', value: true}]});
  //   expect({...formInstance.inputsByPath[12], def: undefined}).toEqual({path: ['child2', 'child2', 'child', 'jobCount'], conditions: [{path: 'child.employed', value: true}, {path: 'child2.child.employed', value: true}]});
  //   expect({...formInstance.inputsByPath[13], def: undefined}).toEqual({
  //     path: ['child2', 'child2', 'child', 'jobDescription'],
  //     conditions: [{path: 'child.employed', value: true}, {path: 'child2.child.employed', value: true}, {path: 'child2.child2.child.jobCount', condition: 'ne', value: 0}]
  //   });
  //
  // });
  //
  // it.skip('Validate Primitive Data', async () => {
  //   let formInstance: GenericFormInstance;
  //   let formDefinition: FormDefinition;
  //
  //   const getValidationResult = (model: any) => {
  //     formInstance.setModel(model);
  //     return formInstance.errors.value;
  //   };
  //
  //
  //   formDefinition = {
  //     name_1: {caption: null, type: 'text'},
  //     name_2: {caption: null, type: 'text', required: true},
  //     age_1: {caption: null, type: 'integer'},
  //     age_2: {caption: null, type: 'integer', required: true},
  //     weight_1: {caption: null, type: 'number'},
  //     weight_2: {caption: null, type: 'number', required: true},
  //     employed_1: {caption: null, type: 'boolean'},
  //     employed_2: {caption: null, type: 'boolean', required: true},
  //   };
  //   formInstance = new GenericFormInstance(formDefinition);
  //
  //
  //   expect(getValidationResult({})).toEqual({
  //     '.name_2': ValidationTexts.required,
  //     '.age_2': ValidationTexts.required,
  //     '.weight_2': ValidationTexts.required,
  //     '.employed_2': ValidationTexts.required,
  //   });
  //   expect(getValidationResult({name_1: 123, name_2: 'test'})).toEqual({
  //     '.name_1': ValidationTexts.typeError,
  //     '.age_2': ValidationTexts.required,
  //     '.weight_2': ValidationTexts.required,
  //     '.employed_2': ValidationTexts.required,
  //   });
  //   expect(getValidationResult({age_1: 123, age_2: 'test'})).toEqual({
  //     '.name_2': ValidationTexts.required,
  //     '.age_2': ValidationTexts.typeError,
  //     '.weight_2': ValidationTexts.required,
  //     '.employed_2': ValidationTexts.required,
  //   });
  //   expect(getValidationResult({age_1: true})).toEqual({
  //     '.name_2': ValidationTexts.required,
  //     '.age_1': ValidationTexts.typeError,
  //     '.age_2': ValidationTexts.required,
  //     '.weight_2': ValidationTexts.required,
  //     '.employed_2': ValidationTexts.required,
  //   });
  //   expect(getValidationResult({age_1: NaN})).toEqual({
  //     '.name_2': ValidationTexts.required,
  //     '.age_1': ValidationTexts.NaN,
  //     '.age_2': ValidationTexts.required,
  //     '.weight_2': ValidationTexts.required,
  //     '.employed_2': ValidationTexts.required,
  //   });
  //   expect(getValidationResult({age_1: Infinity})).toEqual({
  //     '.name_2': ValidationTexts.required,
  //     '.age_1': ValidationTexts.NaN,
  //     '.age_2': ValidationTexts.required,
  //     '.weight_2': ValidationTexts.required,
  //     '.employed_2': ValidationTexts.required,
  //   });
  //   expect(getValidationResult({weight_1: false})).toEqual({
  //     '.name_2': ValidationTexts.required,
  //     '.age_2': ValidationTexts.required,
  //     '.weight_1': ValidationTexts.typeError,
  //     '.weight_2': ValidationTexts.required,
  //     '.employed_2': ValidationTexts.required,
  //   });
  //   expect(getValidationResult({employed_1: 0})).toEqual({
  //     '.name_2': ValidationTexts.required,
  //     '.age_2': ValidationTexts.required,
  //     '.weight_2': ValidationTexts.required,
  //     '.employed_1': ValidationTexts.typeError,
  //     '.employed_2': ValidationTexts.required,
  //   });
  //
  // });
  //
  //

});
