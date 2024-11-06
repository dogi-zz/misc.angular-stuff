import {beforeEach, describe, expect, it} from '@jest/globals';
import {ValidationTexts} from '../../libs/generic-form/generic-form-commons';
import {FormDefinition} from '../../libs/generic-form/generic-form-definition';
import {GenericFormInstance} from '../../libs/generic-form/generic-form-instance';
import {fromUiItems} from './tools';


describe(__filename, () => {

  beforeEach(async () => {

  });


  it('Check and Validate Array', async () => {
    let formInstance: GenericFormInstance;
    let formDefinition: FormDefinition;

    formDefinition = {
      name: {caption: null, type: 'text'},
      array1: {
        type: 'array',
        caption: null,
        elements: {
          type: 'text',
        },
      },
      array2: {
        type: 'array',
        caption: null,
        required: true,
        elements: {
          type: 'object',
          properties: {
            posX: {caption: null, type: 'integer', required: true},
            posY: {caption: null, type: 'integer', required: true},
          },
        },
      },
    };

    formInstance = new GenericFormInstance(formDefinition, {});
    expect(fromUiItems(formInstance.uiItems)).toEqual({
      name: {path: 'name', type: 'input', inputType: 'text'},
      array1: {path: 'array1', type: 'array', required: false, canAdd: false, children: null},
      array2: {path: 'array2', type: 'array', required: true, canAdd: true, children: []},
    });
    expect(formInstance.outputModel).toEqual({name: null, array1: null, array2: []});
    expect(formInstance.outputErrors.value.export()).toEqual({});

    formInstance.setValue(['array2'], []);
    expect(formInstance.outputModel).toEqual({name: null, array1: null, array2: []});
    expect(formInstance.outputErrors.value.export()).toEqual({});

    // Primitive Data is set
    formInstance = new GenericFormInstance(formDefinition, {array1: ['test1', 'test2']});
    expect(fromUiItems(formInstance.uiItems)).toEqual({
      name: {path: 'name', type: 'input', inputType: 'text'},
      array1: {
        path: 'array1', type: 'array', required: false, canAdd: true, children: [
          {path: 'array1.0', type: 'input', inputType: 'text'},
          {path: 'array1.1', type: 'input', inputType: 'text'},
        ],
      },
      array2: {path: 'array2', type: 'array', required: true, canAdd: true, children: []},
    });
    expect(formInstance.outputModel).toEqual({name: null, array1: ['test1', 'test2'], array2: []});
    expect(formInstance.outputErrors.value.export()).toEqual({});
    expect(formInstance.valueMap.getValue(['name'])).toEqual(null);
    expect(formInstance.valueMap.getValue(['array1', 0])).toEqual('test1');
    expect(formInstance.valueMap.getValue(['array1', 1])).toEqual('test2');

    // Object Data is set

    formInstance = new GenericFormInstance(formDefinition, {array2: [{}, {posX: 12}]});
    expect(fromUiItems(formInstance.uiItems)).toEqual({
      name: {path: 'name', type: 'input', inputType: 'text'},
      array1: {path: 'array1', type: 'array', required: false, canAdd: false, children: null},
      array2: {
        path: 'array2', type: 'array', required: true, canAdd: true, children: [
          {
            path: 'array2.0', type: 'object', required: false, children: {
              posX: {path: 'array2.0.posX', type: 'input', inputType: 'integer'},
              posY: {path: 'array2.0.posY', type: 'input', inputType: 'integer'},
            },
          },
          {
            path: 'array2.1', type: 'object', required: false, children: {
              posX: {path: 'array2.1.posX', type: 'input', inputType: 'integer'},
              posY: {path: 'array2.1.posY', type: 'input', inputType: 'integer'},
            },
          },
        ],
      },
    });
    expect(formInstance.outputModel).toEqual({name: null, array1: null, array2: [{posX: null, posY: null}, {posX: 12, posY: null}]});
    expect(formInstance.outputErrors.value.export()).toEqual({
      'array2.0.posX': ValidationTexts.required,
      'array2.0.posY': ValidationTexts.required,
      'array2.1.posY': ValidationTexts.required,
    });
    expect(formInstance.valueMap.getValue(['name'])).toEqual(null);
    expect(formInstance.valueMap.getValue(['array1', 0])).toEqual(undefined);
    expect(formInstance.valueMap.getValue(['array1', 1])).toEqual(undefined);
    expect(formInstance.valueMap.getValue(['array2', 0, 'posX'])).toEqual(null);
    expect(formInstance.valueMap.getValue(['array2', 1, 'posX'])).toEqual(12);

    // Check min Length and Max Length

    formDefinition = {
      array1: {
        type: 'array',
        caption: null,
        elements: {
          type: 'text',
        },
        minLength: 2,
        maxLength: 4,
      },
    };

    formInstance = new GenericFormInstance(formDefinition, {});
    expect(fromUiItems(formInstance.uiItems)).toEqual({
      array1: {
        path: 'array1', type: 'array', required: false, canAdd: false, children: null,
      },
    });
    expect(formInstance.outputModel).toEqual({array1: null});
    expect(formInstance.outputErrors.value.export()).toEqual({});


    formInstance = new GenericFormInstance(formDefinition, {array1: []});
    expect(fromUiItems(formInstance.uiItems)).toEqual({
      array1: {
        path: 'array1', type: 'array', required: false, canAdd: true, children: [
          {path: 'array1.0', type: 'input', inputType: 'text'},
          {path: 'array1.1', type: 'input', inputType: 'text'},
        ],
      },
    });
    expect(formInstance.outputModel).toEqual({array1: [null, null]});
    expect(formInstance.outputErrors.value.export()).toEqual({});

    formInstance = new GenericFormInstance(formDefinition, {array1: ['test1', 'test2']});
    expect(fromUiItems(formInstance.uiItems)).toEqual({
      array1: {
        path: 'array1', type: 'array', required: false, canAdd: true, children: [
          {path: 'array1.0', type: 'input', inputType: 'text'},
          {path: 'array1.1', type: 'input', inputType: 'text'},
        ],
      },
    });
    expect(formInstance.outputModel).toEqual({array1: ['test1', 'test2']});
    expect(formInstance.outputErrors.value.export()).toEqual({});

    formInstance = new GenericFormInstance(formDefinition, {array1: ['test1', 'test2', 'test3']});
    expect(fromUiItems(formInstance.uiItems)).toEqual({
      array1: {
        path: 'array1', type: 'array', required: false, canAdd: true, children: [
          {path: 'array1.0', type: 'input', inputType: 'text'},
          {path: 'array1.1', type: 'input', inputType: 'text'},
          {path: 'array1.2', type: 'input', inputType: 'text'},
        ],
      },
    });
    expect(formInstance.outputModel).toEqual({array1: ['test1', 'test2', 'test3']});
    expect(formInstance.outputErrors.value.export()).toEqual({});

    formInstance = new GenericFormInstance(formDefinition, {array1: ['test1', 'test2', 'test3', 'test4']});
    expect(fromUiItems(formInstance.uiItems)).toEqual({
      array1: {
        path: 'array1', type: 'array', required: false, canAdd: false, children: [
          {path: 'array1.0', type: 'input', inputType: 'text'},
          {path: 'array1.1', type: 'input', inputType: 'text'},
          {path: 'array1.2', type: 'input', inputType: 'text'},
          {path: 'array1.3', type: 'input', inputType: 'text'},
        ],
      },
    });
    expect(formInstance.outputModel).toEqual({array1: ['test1', 'test2', 'test3', 'test4']});
    expect(formInstance.outputErrors.value.export()).toEqual({});

    formInstance = new GenericFormInstance(formDefinition, {array1: ['test1', 'test2', 'test3', 'test4', 'text5']});
    expect(fromUiItems(formInstance.uiItems)).toEqual({
      array1: {
        path: 'array1', type: 'array', required: false, canAdd: false, children: [
          {path: 'array1.0', type: 'input', inputType: 'text'},
          {path: 'array1.1', type: 'input', inputType: 'text'},
          {path: 'array1.2', type: 'input', inputType: 'text'},
          {path: 'array1.3', type: 'input', inputType: 'text'},
          {path: 'array1.4', type: 'input', inputType: 'text'},
        ],
      },
    });
    expect(formInstance.outputModel).toEqual({array1: ['test1', 'test2', 'test3', 'test4', 'text5']});
    expect(formInstance.outputErrors.value.export()).toEqual({
      'array1': ValidationTexts.arrayMax.replace('${}', '4'),
    });


    // Check Array of Arrays
    formDefinition = {
      arrays: {
        type: 'array',
        caption: null,
        elements: {
          type: 'array',
          elements: {
            type: 'text',
          },
          required: true,
          minLength: 1,
        },
        required: true,
        minLength: 2,
        maxLength: 4,
      },
    };

    formInstance = new GenericFormInstance(formDefinition, {});
    expect(fromUiItems(formInstance.uiItems)).toEqual({
      arrays: {
        path: 'arrays', type: 'array', required: true, canAdd: true, children: [
          {
            path: 'arrays.0', type: 'array', required: true, canAdd: true, children: [
              {path: 'arrays.0.0', type: 'input', inputType: 'text'},
            ],
          },
          {
            path: 'arrays.1', type: 'array', required: true, canAdd: true, children: [
              {path: 'arrays.1.0', type: 'input', inputType: 'text'},
            ],
          },
        ],
      },
    });
    expect(formInstance.outputModel).toEqual({arrays: [[null], [null]]});
    expect(formInstance.outputErrors.value.export()).toEqual({});
  });


  it('Set Value on Array', async () => {
    let formInstance: GenericFormInstance;
    let formDefinition: FormDefinition;

    formDefinition = {
      array1: {
        type: 'array',
        caption: null,
        elements: {
          type: 'text',
        },
        minLength: 2,
        maxLength: 4,
      },
      array2: {
        type: 'array',
        caption: null,
        required: true,
        elements: {
          type: 'object',
          properties: {
            posX: {caption: null, type: 'integer', required: true},
            posY: {caption: null, type: 'integer', required: true},
          },
        },
      },

    };


    formInstance = new GenericFormInstance(formDefinition, {});
    expect(fromUiItems(formInstance.uiItems)).toEqual({
      array1: {
        path: 'array1', type: 'array', required: false, canAdd: false, children: null,
      },
      array2: {
        path: 'array2', type: 'array', required: true, canAdd: true, children: [],
      },
    });


    expect(formInstance.outputModel).toEqual({array1: null, array2: []});
    expect(formInstance.outputErrors.value.export()).toEqual({});

    formInstance.setValue(['array1'], []);

    expect(formInstance.outputModel).toEqual({array1: [null, null], array2: []});
    expect(formInstance.outputErrors.value.export()).toEqual({});

    formInstance.setValue(['array1', 1], 'test1');

    expect(formInstance.outputModel).toEqual({array1: [null, 'test1'], array2: []});
    expect(formInstance.outputErrors.value.export()).toEqual({});

    formInstance.addToArray(['array2']);
    formInstance.setValue(['array2', 0], {});

    expect(formInstance.outputModel).toEqual({array1: [null, 'test1'], array2: [{posX: null, posY: null}]});
    expect(formInstance.outputErrors.value.export()).toEqual({
      'array2.0.posX': ValidationTexts.required,
      'array2.0.posY': ValidationTexts.required,
    });

    formInstance.setValue(['array2', 0, 'posY'], 3);

    expect(formInstance.outputModel).toEqual({array1: [null, 'test1'], array2: [{posX: null, posY: 3}]});
    expect(formInstance.outputErrors.value.export()).toEqual({
      'array2.0.posX': ValidationTexts.required,
    });

    formInstance.addToArray(['array1']);
    formInstance.addToArray(['array1']);
    formInstance.setValue(['array1', 3], '123');

    expect(formInstance.outputModel).toEqual({array1: [null, 'test1', null, '123'], array2: [{posX: null, posY: 3}]});
    expect(formInstance.outputErrors.value.export()).toEqual({
      'array2.0.posX': ValidationTexts.required,
    });

    formInstance.setValue(['array2'], []);

    expect(formInstance.outputModel).toEqual({array1: [null, 'test1', null, '123'], array2: []});
    expect(formInstance.outputErrors.value.export()).toEqual({});

  });

  it('Add/Remove Element from Array', async () => {
    let formInstance: GenericFormInstance;
    let formDefinition: FormDefinition;

    formDefinition = {
      array1: {
        type: 'array',
        caption: null,
        elements: {
          type: 'text',
        },
        minLength: 2,
        maxLength: 4,
      },
    };


    formInstance = new GenericFormInstance(formDefinition, {array1: ['test1']});
    expect(formInstance.outputModel).toEqual({array1: ['test1', null]});
    expect(formInstance.outputErrors.value.export()).toEqual({});

    formInstance.setValue(['array1', 1], 'test2');

    expect(formInstance.outputModel).toEqual({array1: ['test1', 'test2']});
    expect(formInstance.outputErrors.value.export()).toEqual({});

    formInstance.addToArray(['array1']);

    expect(formInstance.outputModel).toEqual({array1: ['test1', 'test2', null]});
    expect(formInstance.outputErrors.value.export()).toEqual({});

    formInstance.removeFromArray(['array1', 1]);

    expect(formInstance.outputModel).toEqual({array1: ['test1', null]});
    expect(formInstance.outputErrors.value.export()).toEqual({});

    formInstance = new GenericFormInstance(formDefinition, {array1: ['test1', 'test2', 'test3', 'test4', 'test5', 'test6']});
    expect(formInstance.outputModel).toEqual({array1: ['test1', 'test2', 'test3', 'test4', 'test5', 'test6']});
    expect(formInstance.outputErrors.value.export()).toEqual({
      'array1': ValidationTexts.arrayMax.replace('${}', '4'),
    });

    formInstance.removeFromArray(['array1', 1]);

    expect(formInstance.outputModel).toEqual({array1: ['test1', 'test3', 'test4', 'test5', 'test6']});
    expect(formInstance.outputErrors.value.export()).toEqual({
      'array1': ValidationTexts.arrayMax.replace('${}', '4'),
    });

    formInstance.setValue(['array1', 1], 'test31');
    formInstance.removeFromArray(['array1', 3]);

    expect(formInstance.outputModel).toEqual({array1: ['test1', 'test31', 'test4', 'test6']});
    expect(formInstance.outputErrors.value.export()).toEqual({});

    formInstance.removeFromArray(['array1', 0]);

    expect(formInstance.outputModel).toEqual({array1: ['test31', 'test4', 'test6']});
    expect(formInstance.outputErrors.value.export()).toEqual({});

    formInstance.removeFromArray(['array1', 0]);
    formInstance.removeFromArray(['array1', 0]);

    expect(formInstance.outputModel).toEqual({array1: ['test6', null]});
    expect(formInstance.outputErrors.value.export()).toEqual({});

  });


  it('Non Required Array', async () => {
    let formInstance: GenericFormInstance;
    let formDefinition: FormDefinition;

    formDefinition = {
      array1: {
        type: 'array',
        caption: null,
        required: false,
        elements: {
          type: 'text',
        },
      },
    };

    formInstance = new GenericFormInstance(formDefinition, {});
    expect(fromUiItems(formInstance.uiItems)).toEqual({
      array1: {path: 'array1', type: 'array', required: false, canAdd: false, children: null},
    });
    expect(formInstance.outputModel).toEqual({array1: null});
    expect(formInstance.outputErrors.value.export()).toEqual({});


    formDefinition = {
      array1: {
        type: 'array',
        caption: null,
        required: true,
        elements: {
          type: 'text',
        },
      },
    };

    formInstance = new GenericFormInstance(formDefinition, {});
    expect(fromUiItems(formInstance.uiItems)).toEqual({
      array1: {path: 'array1', type: 'array', required: true, canAdd: true, children: []},
    });
    expect(formInstance.outputModel).toEqual({array1: []});
    expect(formInstance.outputErrors.value.export()).toEqual({});


  });

  it('Complex Array Example', async () => {
    let formInstance: GenericFormInstance;
    let formDefinition: FormDefinition;

    formDefinition = {
      arr: {
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

    formInstance = new GenericFormInstance(formDefinition, {arr: [[{value: 123}, {value: 234}, null, {value: 345}], [{value: 456}]]});
    expect(formInstance.outputModel).toEqual({arr: [[{value: 123}, {value: 234}, null, {value: 345}], [{value: 456}]]});
    expect(formInstance.outputErrors.value.export()).toEqual({});

    formInstance.addToArray(['arr', 1]);

    expect(formInstance.outputModel).toEqual({arr: [[{value: 123}, {value: 234}, null, {value: 345}], [{value: 456}, null]]});
    expect(formInstance.outputErrors.value.export()).toEqual({});

    formInstance.addToArray(['arr']);

    expect(formInstance.outputModel).toEqual({arr: [[{value: 123}, {value: 234}, null, {value: 345}], [{value: 456}, null], []]});
    expect(formInstance.outputErrors.value.export()).toEqual({});


    formDefinition = {
      arr: {
        caption: 'Arrays 2', type: 'array',
        help: 'Array of Arrays with Object, inner Arrays are Required, objects are not required',
        elements: {
          type: 'array',
          required: true,
          minLength: 2,
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

    formInstance = new GenericFormInstance(formDefinition, {arr: [[{value: 123}, {value: 234}, null, {value: 345}], [{value: 456}]]});
    expect(formInstance.outputModel).toEqual({arr: [[{value: 123}, {value: 234}, null, {value: 345}], [{value: 456}, null]]});
    expect(formInstance.outputErrors.value.export()).toEqual({});

    formInstance.addToArray(['arr']);

    expect(formInstance.outputModel).toEqual({arr: [[{value: 123}, {value: 234}, null, {value: 345}], [{value: 456}, null], [null, null]]});
    expect(formInstance.outputErrors.value.export()).toEqual({});

  });



  it('Non Required Array', async () => {
    let formInstance: GenericFormInstance;
    let formDefinition: FormDefinition;

    formDefinition = {
      array1: {
        type: 'array',
        caption: null,
        required: false,
        elements: {
          type: 'text',
        },
      },
    };

    formInstance = new GenericFormInstance(formDefinition, {});
    expect(fromUiItems(formInstance.uiItems)).toEqual({
      array1: {path: 'array1', type: 'array', required: false, canAdd: false, children: null},
    });
    expect(formInstance.outputModel).toEqual({array1: null});
    expect(formInstance.outputErrors.value.export()).toEqual({});


    formDefinition = {
      array1: {
        type: 'array',
        caption: null,
        required: true,
        elements: {
          type: 'text',
        },
      },
    };

    formInstance = new GenericFormInstance(formDefinition, {});
    expect(fromUiItems(formInstance.uiItems)).toEqual({
      array1: {path: 'array1', type: 'array', required: true, canAdd: true, children: []},
    });
    expect(formInstance.outputModel).toEqual({array1: []});
    expect(formInstance.outputErrors.value.export()).toEqual({});


  });


  // it('Check and Validate Array with Subform', async () => {
  //
  //   let formInstance: GenericFormInstance;
  //   let formDefinition: FormDefinition;
  //
  //   const getValidationResult = (model: any) => {
  //     formInstance.setModel(model);
  //     return formInstance.errors.value;
  //   };
  //   const getOutputValue = (model: any) => {
  //     formInstance.setModel(model);
  //     return formInstance.outputModel;
  //   };
  //
  //   formDefinition = {
  //     array1: {
  //       type: 'array',
  //       caption: 'Object Array',
  //       required: true,
  //       elements: {
  //         type: 'object',
  //         properties: {
  //           sub1: {
  //             type: 'subform',
  //             inline: true,
  //             content: {
  //               posX: {caption: null, type: 'integer', required: true},
  //               posY: {caption: null, type: 'integer', required: true},
  //             },
  //           },
  //           sub2: {
  //             type: 'subform',
  //             inline: true,
  //             content: {
  //               cordX: {caption: null, type: 'integer', required: true},
  //               cordY: {caption: null, type: 'integer', required: true},
  //             },
  //           },
  //         },
  //       },
  //     },
  //
  //   };
  //
  //   formInstance = new GenericFormInstance(formDefinition);
  //
  //   expect(getOutputValue({})).toEqual({array1: []});
  //   expect(getOutputValue({array1: [null]})).toEqual({array1: [null]});
  //   expect(getOutputValue({array1: [123]})).toEqual({array1: [null]});
  //   expect(getOutputValue({array1: [[]]})).toEqual({array1: [null]});
  //   expect(getOutputValue({array1: [{}]})).toEqual({array1: [{cordX: null, cordY: null, posX: null, posY: null}]});
  //
  //   expect(getOutputValue({
  //     array1: [
  //       {cordX: 1, cordY: 2, posX: 3, posY: 4},
  //       {cordX: 5, cordY: 6, posX: 7, posY: 8},
  //     ],
  //   })).toEqual({
  //     array1: [
  //       {cordX: 1, cordY: 2, posX: 3, posY: 4},
  //       {cordX: 5, cordY: 6, posX: 7, posY: 8},
  //     ],
  //   });
  //
  //   expect(getValidationResult({})).toEqual({});
  //
  //   expect(getValidationResult({array1: []})).toEqual({});
  //
  //   expect(getValidationResult({array1: [123]})).toEqual({
  //     '.array1.0': ValidationTexts.typeError,
  //   });
  //
  //   expect(getValidationResult({array1: [{}]})).toEqual({
  //     '.array1.0.cordX': ValidationTexts.required,
  //     '.array1.0.cordY': ValidationTexts.required,
  //     '.array1.0.posX': ValidationTexts.required,
  //     '.array1.0.posY': ValidationTexts.required,
  //   });
  //
  //   expect(getValidationResult({array1: [{cordX: 1, cordY: {}, posY: false}]})).toEqual({
  //     '.array1.0.cordY': ValidationTexts.typeError,
  //     '.array1.0.posX': ValidationTexts.required,
  //     '.array1.0.posY': ValidationTexts.typeError,
  //   });
  //
  // });
  //
  // it('Check and Validate Array with Async Options', async () => {
  //   let formInstance: GenericFormInstance;
  //   let formDefinition: FormDefinition;
  //
  //   const getValidationResult = (model: any) => {
  //     formInstance.setModel(model);
  //     return formInstance.errors.value;
  //   };
  //   const getOutputValue = (model: any) => {
  //     formInstance.setModel(model);
  //     return formInstance.outputModel;
  //   };
  //
  //   const options1 = new BehaviorSubject<FormDefElementSelectOption[]>([]);
  //
  //   formDefinition = {
  //     array1: {
  //       type: 'array',
  //       caption: 'Object Array',
  //       required: true,
  //       elements: {
  //         type: 'selection',
  //         options: options1,
  //       },
  //     },
  //   };
  //   formInstance = new GenericFormInstance(formDefinition);
  //
  //   expect(getOutputValue({})).toEqual({array1: []});
  //   expect(getOutputValue({array1: true})).toEqual({array1: []});
  //   expect(getOutputValue({array1: 'foo'})).toEqual({array1: []});
  //   expect(getOutputValue({array1: null})).toEqual({array1: []});
  //
  //   expect(getValidationResult({})).toEqual({});
  //   expect(getValidationResult({array1: true})).toEqual({
  //     '.array1': ValidationTexts.typeError,
  //   });
  //   expect(getValidationResult({array1: 'foo'})).toEqual({
  //     '.array1': ValidationTexts.typeError,
  //   });
  //
  //
  //   formInstance.setModel({array1: ['foo']});
  //
  //   expect(formInstance.outputModel).toEqual({array1: [null]});
  //   expect(formInstance.errors.value).toEqual({
  //     '.array1.0': ValidationTexts.optionError,
  //   });
  //
  //   options1.next([
  //     {label: 'var1', value: 'foo'},
  //     {label: 'var2', value: 'bar'},
  //   ]);
  //
  //   expect(formInstance.outputModel).toEqual({array1: ['foo']});
  //   expect(formInstance.errors.value).toEqual({});
  //
  //
  // });
  //
  //
  // it('Check and Validate Array of Arrays', async () => {
  //   let formInstance: GenericFormInstance;
  //   let formDefinition: FormDefinition;
  //
  //   const getValidationResult = (model: any) => {
  //     formInstance.setModel(model);
  //     return formInstance.errors.value;
  //   };
  //   const getOutputValue = (model: any) => {
  //     formInstance.setModel(model);
  //     return formInstance.outputModel;
  //   };
  //
  //   const options1 = new BehaviorSubject<FormDefElementSelectOption[]>([]);
  //
  //   formDefinition = {
  //     array1: {
  //       type: 'array',
  //       caption: 'Object Array',
  //       required: true,
  //       minLength: 2,
  //       maxLength: 4,
  //       elements: {
  //         type: 'array',
  //         required: true,
  //         minLength: 1,
  //         maxLength: 1,
  //         elements: {
  //           type: 'selection',
  //           options: options1,
  //         },
  //       },
  //     },
  //   };
  //   formInstance = new GenericFormInstance(formDefinition);
  //
  //   expect(getOutputValue({})).toEqual({array1: [[null], [null]]});
  //   expect(getOutputValue({array1: true})).toEqual({array1: [[null], [null]]});
  //   expect(getOutputValue({array1: 'foo'})).toEqual({array1: [[null], [null]]});
  //   expect(getOutputValue({array1: null})).toEqual({array1: [[null], [null]]});
  //
  //   expect(getValidationResult({})).toEqual({  });
  //     // '.array1': ValidationTexts.arrayMin.replace('${}', '2'),
  //
  //   expect(getValidationResult({array1: true})).toEqual({
  //     '.array1': ValidationTexts.typeError,
  //   });
  //   expect(getValidationResult({array1: 'foo'})).toEqual({
  //     '.array1': ValidationTexts.typeError,
  //   });
  //   expect(getValidationResult({array1: []})).toEqual({});
  //   expect(getValidationResult({array1: [null, [], 1, 2, 3]})).toEqual({
  //     '.array1': ValidationTexts.arrayMax.replace('${}', '4'),
  //     '.array1.2': ValidationTexts.typeError,
  //     '.array1.3': ValidationTexts.typeError,
  //     '.array1.4': ValidationTexts.typeError,
  //   });
  //
  //
  //   formInstance.setModel({array1: [['foo'], ['bar'], [123]]});
  //
  //   expect(formInstance.outputModel).toEqual({array1: [[null], [null], [null]]});
  //   expect(formInstance.errors.value).toEqual({
  //     '.array1.0.0': ValidationTexts.optionError,
  //     '.array1.1.0': ValidationTexts.optionError,
  //     '.array1.2.0': ValidationTexts.optionError,
  //   });
  //
  //   options1.next([
  //     {label: 'var1', value: 'foo'},
  //     {label: 'var2', value: 'bar'},
  //   ]);
  //
  //   expect(formInstance.outputModel).toEqual({array1: [['foo'], ['bar'], [null]]});
  //   expect(formInstance.errors.value).toEqual({
  //     '.array1.2.0': ValidationTexts.optionError,
  //   });
  //
  // });
  //
  // it('Set Value on Array of Arrays', async () => {
  //   let formInstance: GenericFormInstance;
  //   let formDefinition: FormDefinition;
  //
  //   const options1 = new BehaviorSubject<FormDefElementSelectOption[]>([]);
  //
  //   formDefinition = {
  //     array1: {
  //       type: 'array',
  //       caption: 'Object Array',
  //       required: true,
  //       minLength: 2,
  //       maxLength: 4,
  //       elements: {
  //         type: 'array',
  //         required: true,
  //         minLength: 1,
  //         maxLength: 1,
  //         elements: {
  //           type: 'selection',
  //           options: options1,
  //         },
  //       },
  //     },
  //   };
  //   formInstance = new GenericFormInstance(formDefinition);
  //
  //   formInstance.setModel({});
  //   expect(formInstance.outputModel).toEqual({array1: [[null], [null]]});
  //   expect(formInstance.errors.value['.array1']).toEqual(undefined);
  //
  //   formInstance.setValue('.array1', 123);
  //   expect(formInstance.outputModel).toEqual({array1: []});
  //   expect(formInstance.errors.value['.array1']).toEqual(ValidationTexts.typeError);
  //
  //   formInstance.setValue('.array1', []);
  //   expect(formInstance.outputModel).toEqual({array1: [[null], [null]]});
  //   expect(formInstance.errors.value['.array1']).toEqual(undefined);
  //
  //   formInstance.addToArray('.array1', 'test');
  //   formInstance.addToArray('.array1', []);
  //
  //   expect(formInstance.outputModel).toEqual({array1: [[null], [null], [null], [null]]});
  //   expect(formInstance.errors.value['.array1']).toEqual(undefined);
  //   expect(formInstance.errors.value['.array1.2']).toEqual(ValidationTexts.typeError);
  //   expect(formInstance.errors.value['.array1.3']).toEqual(undefined);
  //
  //   formInstance.addToArray('.array1.3', null);
  //
  //   expect(formInstance.outputModel).toEqual({array1: [[null], [null], [null], [null, null]]});
  //   expect(formInstance.errors.value['.array1']).toEqual(undefined);
  //   expect(formInstance.errors.value['.array1.2']).toEqual(ValidationTexts.typeError);
  //   expect(formInstance.errors.value['.array1.3']).toEqual(ValidationTexts.arrayMax.replace('${}', '1'));
  //   expect(formInstance.errors.value['.array1.3.0']).toEqual(undefined);
  //   expect(formInstance.errors.value['.array1.3.1']).toEqual(undefined);
  //
  //
  //   formInstance.setValue('.array1.3.0', 'foo');
  //
  //   expect(formInstance.outputModel).toEqual({array1: [[null], [null], [null], [null, null]]});
  //   expect(formInstance.errors.value['.array1']).toEqual(undefined);
  //   expect(formInstance.errors.value['.array1.2']).toEqual(ValidationTexts.typeError);
  //   expect(formInstance.errors.value['.array1.3.0']).toEqual(ValidationTexts.optionError);
  //   expect(formInstance.errors.value['.array1.3.1']).toEqual(undefined);
  //
  //   options1.next([
  //     {label: 'var1', value: 'foo'},
  //     {label: 'var2', value: 'bar'},
  //   ]);
  //
  //   expect(formInstance.outputModel).toEqual({array1: [[null], [null], [null], ['foo', null]]});
  //   expect(formInstance.errors.value['.array1']).toEqual(undefined);
  //   expect(formInstance.errors.value['.array1.2']).toEqual(ValidationTexts.typeError);
  //   expect(formInstance.errors.value['.array1.3.0']).toEqual(undefined);
  //   expect(formInstance.errors.value['.array1.3.1']).toEqual(undefined);
  //
  //
  // });
  //
  //
  // it('Remove Value from Array', async () => {
  //   let formInstance: GenericFormInstance;
  //   let formDefinition: FormDefinition;
  //
  //   formDefinition = {
  //     array1: {
  //       type: 'array',
  //       caption: 'String Array',
  //       elements: {
  //         type: 'text',
  //       },
  //     },
  //     array2: {
  //       type: 'array',
  //       caption: 'Object Array',
  //       required: true,
  //       elements: {
  //         type: 'object',
  //         properties: {
  //           posX: {caption: null, type: 'integer', required: true},
  //           posY: {caption: null, type: 'integer', required: true},
  //         },
  //       },
  //     },
  //
  //   };
  //
  //   formInstance = new GenericFormInstance(formDefinition);
  //
  //   formInstance.setModel({array1: ['text 1', 'text 2', 'text 3'], array2: [{posX: 1, posY: 1}, {posX: 2, posY: 2}, {posX: 3, posY: 3}]});
  //   expect(formInstance.outputModel).toEqual({array1: ['text 1', 'text 2', 'text 3'], array2: [{posX: 1, posY: 1}, {posX: 2, posY: 2}, {posX: 3, posY: 3}]});
  //   expect(formInstance.errors.value).toEqual({});
  //
  //   formInstance.setValue('.array1.0', 'text 1/2');
  //   formInstance.setValue('.array1.2', 'text 3/2');
  //   expect(formInstance.outputModel).toEqual({array1: ['text 1/2', 'text 2', 'text 3/2'], array2: [{posX: 1, posY: 1}, {posX: 2, posY: 2}, {posX: 3, posY: 3}]});
  //   expect(formInstance.errors.value).toEqual({});
  //
  //   formInstance.deleteFromArray('.array1', 1);
  //
  //   expect(formInstance.outputModel).toEqual({array1: ['text 1/2', 'text 3/2'], array2: [{posX: 1, posY: 1}, {posX: 2, posY: 2}, {posX: 3, posY: 3}]});
  //   expect(formInstance.errors.value).toEqual({});
  //
  //   formInstance.setValue('.array1.1', 123);
  //   expect(formInstance.outputModel).toEqual({array1: ['text 1/2', null], array2: [{posX: 1, posY: 1}, {posX: 2, posY: 2}, {posX: 3, posY: 3}]});
  //   expect(formInstance.errors.value).toEqual({
  //     '.array1.1': ValidationTexts.typeError
  //   });
  //
  //
  //   formInstance.addToArray('.array1', 'text 4');
  //   formInstance.addToArray('.array1', 234);
  //
  //   expect(formInstance.outputModel).toEqual({array1: ['text 1/2', null, 'text 4', null], array2: [{posX: 1, posY: 1}, {posX: 2, posY: 2}, {posX: 3, posY: 3}]});
  //   expect(formInstance.errors.value).toEqual({
  //     '.array1.1': ValidationTexts.typeError,
  //     '.array1.3': ValidationTexts.typeError,
  //   });
  //
  //   formInstance.setValue('.array1.3', 'text 5');
  //
  //   expect(formInstance.outputModel).toEqual({array1: ['text 1/2', null, 'text 4', 'text 5'], array2: [{posX: 1, posY: 1}, {posX: 2, posY: 2}, {posX: 3, posY: 3}]});
  //   expect(formInstance.errors.value).toEqual({
  //     '.array1.1': ValidationTexts.typeError,
  //   });
  //
  //   formInstance.addToArray('.array1', true);
  //
  //   expect(formInstance.outputModel).toEqual({array1: ['text 1/2', null, 'text 4', 'text 5', null], array2: [{posX: 1, posY: 1}, {posX: 2, posY: 2}, {posX: 3, posY: 3}]});
  //   expect(formInstance.errors.value).toEqual({
  //     '.array1.1': ValidationTexts.typeError,
  //     '.array1.4': ValidationTexts.typeError,
  //   });
  //
  //   formInstance.deleteFromArray('.array1', 1);
  //
  //   expect(formInstance.outputModel).toEqual({array1: ['text 1/2', 'text 4', 'text 5', null], array2: [{posX: 1, posY: 1}, {posX: 2, posY: 2}, {posX: 3, posY: 3}]});
  //   expect(formInstance.errors.value).toEqual({
  //     '.array1.3': ValidationTexts.typeError,
  //   });
  //
  //   formInstance.addToArray('.array2', 4);
  //   formInstance.addToArray('.array2', {posX: 5, posY: 5});
  //
  //   expect(formInstance.outputModel).toEqual({array1: ['text 1/2', 'text 4', 'text 5', null], array2: [{posX: 1, posY: 1}, {posX: 2, posY: 2}, {posX: 3, posY: 3}, null, {posX: 5, posY: 5}]});
  //   expect(formInstance.errors.value).toEqual({
  //     '.array1.3': ValidationTexts.typeError,
  //     '.array2.3': ValidationTexts.typeError,
  //   });
  //
  //   formInstance.setValue('.array2.4.posY', 6);
  //
  //   expect(formInstance.outputModel).toEqual({array1: ['text 1/2', 'text 4', 'text 5', null], array2: [{posX: 1, posY: 1}, {posX: 2, posY: 2}, {posX: 3, posY: 3}, null, {posX: 5, posY: 6}]});
  //   expect(formInstance.errors.value).toEqual({
  //     '.array1.3': ValidationTexts.typeError,
  //     '.array2.3': ValidationTexts.typeError,
  //   });
  //
  //   formInstance.setValue('.array2.4.posX', 'test');
  //
  //   expect(formInstance.outputModel).toEqual({array1: ['text 1/2', 'text 4', 'text 5', null], array2: [{posX: 1, posY: 1}, {posX: 2, posY: 2}, {posX: 3, posY: 3}, null, {posX: null, posY: 6}]});
  //   expect(formInstance.errors.value).toEqual({
  //     '.array1.3': ValidationTexts.typeError,
  //     '.array2.3': ValidationTexts.typeError,
  //     '.array2.4.posX': ValidationTexts.typeError,
  //   });
  //
  //   formInstance.deleteFromArray('.array2', 2);
  //
  //   expect(formInstance.outputModel).toEqual({array1: ['text 1/2', 'text 4', 'text 5', null], array2: [{posX: 1, posY: 1}, {posX: 2, posY: 2}, null, {posX: null, posY: 6}]});
  //   expect(formInstance.errors.value).toEqual({
  //     '.array1.3': ValidationTexts.typeError,
  //     '.array2.2': ValidationTexts.typeError,
  //     '.array2.3.posX': ValidationTexts.typeError,
  //   });
  //
  // });


});
