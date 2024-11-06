import {beforeEach, describe, expect, it} from '@jest/globals';
import {ValidationTexts} from '../../libs/generic-form/generic-form-commons';
import {FormDefinition} from '../../libs/generic-form/generic-form-definition';
import {GenericFormInstance} from '../../libs/generic-form/generic-form-instance';
import {fromUiItems} from './tools';
/* eslint  prefer-const: 0 */


describe(__filename, () => {

  beforeEach(async () => {

  });


  it('Check and Validate Objects', async () => {
    let formInstance: GenericFormInstance;
    let formDefinition: FormDefinition;


    formDefinition = {
      name: {caption: null, type: 'text'},
      position: {
        type: 'object',
        caption: null,
        required: true,
        properties: {
          posX: {caption: null, type: 'integer', required: true},
          posY: {caption: null, type: 'integer', required: true},
        },
      },
    };

    formInstance = new GenericFormInstance(formDefinition, {});
    expect(fromUiItems(formInstance.uiItems)).toEqual({
      name: {path: 'name', type: 'input', inputType: 'text'},
      position: {
        path: 'position', type: 'object', required: true, children: {
          posX: {path: 'position.posX', type: 'input', inputType: 'integer'},
          posY: {path: 'position.posY', type: 'input', inputType: 'integer'},
        },
      },
    });

    expect(formInstance.outputModel).toEqual({name: null, position: {posX: null, posY: null}});
    expect(formInstance.outputErrors.value.export()).toEqual({
      'position.posX': ValidationTexts.required,
      'position.posY': ValidationTexts.required,
    });

    formInstance = new GenericFormInstance(formDefinition, {name: 123, position: {posX: 12, posY: '13'}});
    expect(formInstance.outputModel).toEqual({name: null, position: {posX: 12, posY: null}});
    expect(formInstance.outputErrors.value.export()).toEqual({
      'name': ValidationTexts.typeError,
      'position.posY': ValidationTexts.typeError,
    });

    formInstance = new GenericFormInstance(formDefinition, {name: 'foo', position: []});
    expect(formInstance.outputModel).toEqual({name: 'foo', position: {posX: null, posY: null}});
    expect(formInstance.outputErrors.value.export()).toEqual({
      'position': ValidationTexts.typeError,
      'position.posX': ValidationTexts.required,
      'position.posY': ValidationTexts.required,
    });

    formInstance = new GenericFormInstance(formDefinition, {name: 'foo', position: ''});
    expect(formInstance.outputModel).toEqual({name: 'foo', position: {posX: null, posY: null}});
    expect(formInstance.outputErrors.value.export()).toEqual({
      'position': ValidationTexts.typeError,
      'position.posX': ValidationTexts.required,
      'position.posY': ValidationTexts.required,
    });

    formInstance = new GenericFormInstance(formDefinition, {name: 'foo', position: {}});
    expect(formInstance.outputModel).toEqual({name: 'foo', position: {posX: null, posY: null}});
    expect(formInstance.outputErrors.value.export()).toEqual({
      'position.posX': ValidationTexts.required,
      'position.posY': ValidationTexts.required,
    });

    formInstance = new GenericFormInstance(formDefinition, {name: 'foo', position: {posX: 12, posY: 23}});
    expect(formInstance.outputModel).toEqual({name: 'foo', position: {posX: 12, posY: 23}});
    expect(formInstance.outputErrors.value.export()).toEqual({});


    formDefinition = {
      name: {caption: null, type: 'text'},
      position: {
        type: 'object',
        caption: null,
        required: false,
        properties: {
          posX: {caption: null, type: 'integer', required: true},
          posY: {caption: null, type: 'integer', required: true},
        },
      },
    };

    formInstance = new GenericFormInstance(formDefinition, {name: [], position: []});

    expect(fromUiItems(formInstance.uiItems)).toEqual({
      name: {path: 'name', type: 'input', inputType: 'text'},
      position: {
        path: 'position', type: 'object', required: false, children: {},
      },
    });

    expect(formInstance.outputModel).toEqual({name: null, position: null});
    expect(formInstance.outputErrors.value.export()).toEqual({
      'name': ValidationTexts.typeError,
      'position': ValidationTexts.typeError,
    });
    expect(formInstance.valueMap.getValue(['position', 'posX'])).toEqual(undefined);
    expect(formInstance.valueMap.getValue(['position', 'posY'])).toEqual(undefined);

    formInstance = new GenericFormInstance(formDefinition, {});
    expect(formInstance.outputModel).toEqual({name: null, position: null});
    expect(formInstance.outputErrors.value.export()).toEqual({});

    formInstance = new GenericFormInstance(formDefinition, {});
    expect(formInstance.outputModel).toEqual({name: null, position: null});
    expect(formInstance.outputErrors.value.export()).toEqual({});

    formInstance = new GenericFormInstance(formDefinition, {position: {}});
    expect(formInstance.outputModel).toEqual({name: null, position: {posX: null, posY: null}});
    expect(formInstance.outputErrors.value.export()).toEqual({
      'position.posX': ValidationTexts.required,
      'position.posY': ValidationTexts.required,
    });
    expect(fromUiItems(formInstance.uiItems)).toEqual({
      name: {path: 'name', type: 'input', inputType: 'text'},
      position: {
        path: 'position', type: 'object', required: false, children: {
          posX: {path: 'position.posX', type: 'input', inputType: 'integer'},
          posY: {path: 'position.posY', type: 'input', inputType: 'integer'},
        },
      },
    });

    formInstance = new GenericFormInstance(formDefinition, {position: {posX: 12, posY: 23}});
    expect(formInstance.outputModel).toEqual({name: null, position: {posX: 12, posY: 23}});
    expect(formInstance.outputErrors.value.export()).toEqual({});

    expect(formInstance.valueMap.getValue(['position', 'posX'])).toEqual(12);
    expect(formInstance.valueMap.getValue(['position', 'posY'])).toEqual(23);


  });


  it('Set Value on  Objects', async () => {
    let formInstance: GenericFormInstance;
    let formDefinition: FormDefinition;

    formDefinition = {
      name: {caption: null, type: 'text'},
      position: {
        type: 'object',
        caption: null,
        required: true,
        properties: {
          posX: {caption: null, type: 'integer', required: true},
          posY: {caption: null, type: 'integer', required: true},
        },
      },
    };

    formInstance = new GenericFormInstance(formDefinition, {});

    expect(fromUiItems(formInstance.uiItems)).toEqual({
      name: {path: 'name', type: 'input', inputType: 'text'},
      position: {
        path: 'position', type: 'object', required: true, children: {
          posX: {path: 'position.posX', type: 'input', inputType: 'integer'},
          posY: {path: 'position.posY', type: 'input', inputType: 'integer'},
        },
      },
    });

    expect(formInstance.outputModel).toEqual({name: null, position: {posX: null, posY: null}});
    expect(formInstance.outputErrors.value.export()).toEqual({
      'position.posX': ValidationTexts.required,
      'position.posY': ValidationTexts.required,
    });

    formInstance.setValue(['position'], {});
    expect(formInstance.outputModel).toEqual({name: null, position: {posX: null, posY: null}});
    expect(formInstance.outputErrors.value.export()).toEqual({
      'position.posX': ValidationTexts.required,
      'position.posY': ValidationTexts.required,
    });

    formInstance.setValue(['position', 'posX'], 'foo');
    expect(formInstance.outputModel).toEqual({name: null, position: {posX: null, posY: null}});
    expect(formInstance.outputErrors.value.export()).toEqual({
      'position.posX': ValidationTexts.typeError,
      'position.posY': ValidationTexts.required,
    });

    formInstance.setValue(['position', 'posX'], 0);
    expect(formInstance.outputModel).toEqual({name: null, position: {posX: 0, posY: null}});
    expect(formInstance.outputErrors.value.export()).toEqual({
      'position.posY': ValidationTexts.required,
    });

  });


  it('Set Value on Empty inline Object', async () => {
    let formInstance: GenericFormInstance;
    let formDefinition: FormDefinition;


    formDefinition = {
      name: {caption: null, type: 'text'},
      position: {
        type: 'object',
        inline: true,
        properties: {
          posX: {caption: null, type: 'integer', required: true},
          posY: {caption: null, type: 'integer', required: true},
        },
      },
    };

    formInstance = new GenericFormInstance(formDefinition, {});

    expect(fromUiItems(formInstance.uiItems)).toEqual({
      name: {path: 'name', type: 'input', inputType: 'text'},
      posX: {path: 'position.posX', type: 'input', inputType: 'integer'},
      posY: {path: 'position.posY', type: 'input', inputType: 'integer'},
    });


    expect(formInstance.outputModel).toEqual({name: null, position: {posX: null, posY: null}});
    expect(formInstance.outputErrors.value.export()).toEqual({
      'position.posX': ValidationTexts.required,
      'position.posY': ValidationTexts.required,
    });

    formInstance.setValue(['position', 'posX'], 'foo');

    expect(formInstance.outputModel).toEqual({name: null, position: {posX: null, posY: null}});
    expect(formInstance.outputErrors.value.export()).toEqual({
      'position.posX': ValidationTexts.typeError,
      'position.posY': ValidationTexts.required,
    });

    formInstance.setValue(['position', 'posX'], 0);
    expect(formInstance.outputModel).toEqual({name: null, position: {posX: 0, posY: null}});
    expect(formInstance.outputErrors.value.export()).toEqual({
      'position.posY': ValidationTexts.required,
    });
  });

  it('Delete Object', async () => {
    let formInstance: GenericFormInstance;
    let formDefinition: FormDefinition;

    formDefinition = {
      position: {
        type: 'object',
        caption: null,
        properties: {
          posX: {caption: null, type: 'integer', required: true},
          posY: {caption: null, type: 'integer', required: true},
        },
      },
    };

    formInstance = new GenericFormInstance(formDefinition, {position: {posX: 2, posY: 3}});

    expect(fromUiItems(formInstance.uiItems)).toEqual({
      position: {
        path: 'position', type: 'object', required: false, children: {
          posX: {path: 'position.posX', type: 'input', inputType: 'integer'},
          posY: {path: 'position.posY', type: 'input', inputType: 'integer'},
        },
      },
    });

    expect(formInstance.outputModel).toEqual({position: {posX: 2, posY: 3}});
    expect(formInstance.outputErrors.value.export()).toEqual({});

    formInstance.setValue(['position'], {});
    expect(formInstance.outputModel).toEqual({position: {posX: null, posY: null}});
    expect(formInstance.outputErrors.value.export()).toEqual({
      'position.posX': ValidationTexts.required,
      'position.posY': ValidationTexts.required,
    });

    formInstance.setValue(['position'], null);
    expect(formInstance.outputModel).toEqual({position: null});
    expect(formInstance.outputErrors.value.export()).toEqual({});

    formInstance.setValue(['position'], {});
    expect(formInstance.outputModel).toEqual({position: {posX: null, posY: null}});
    expect(formInstance.outputErrors.value.export()).toEqual({
      'position.posX': ValidationTexts.required,
      'position.posY': ValidationTexts.required,
    });


  });


});
