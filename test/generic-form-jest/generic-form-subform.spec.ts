/* eslint  prefer-const: 0 */
import {beforeEach, describe, expect} from "@jest/globals";
import {GenericFormInstance} from "../../libs/generic-form/generic-form-instance";
import {FormDefinition} from "../../libs/generic-form/generic-form-definition";
import {fromUiItems} from "./tools";
import {ValidationTexts} from "../../libs/generic-form/generic-form-commons";

describe(__filename, () => {

  beforeEach(async () => {

  });


  it('Subform - Layout-Subform', async () => {
    let formInstance: GenericFormInstance;
    let formDefinition: FormDefinition;


    formDefinition = {
      name: {caption: null, type: 'text'},
      subForm: {
        type: 'subform',
        caption: 'structure',
        help: 'Some Structured Data',
        content: {
          age: {caption: null, type: 'integer'},
          weight: {caption: null, type: 'number'},
          employed: {caption: null, type: 'boolean'},
        },
      },
    };


    formInstance = new GenericFormInstance(formDefinition, {});
    expect(fromUiItems(formInstance.uiItems)).toEqual({
      name: {path: 'name', type: 'input', inputType: 'text'},
      subForm: {
        path: 'subForm', type: 'object', required: true,
        caption: {caption: 'structure', help: 'Some Structured Data'},
        children: {
          age: {path: 'age', type: 'input', inputType: 'integer'},
          weight: {path: 'weight', type: 'input', inputType: 'number'},
          employed: {path: 'employed', type: 'input', inputType: 'boolean'},
        },
      },
    });
  });


  it('Subform - Selection-Subform', async () => {
    let formInstance: GenericFormInstance;
    let formDefinition: FormDefinition;


    formDefinition = {
      subformType: {caption: null, type: 'integer'},
      subForm1: {
        type: 'subform',
        caption: 'structure',
        help: 'Some Structured Data 1',
        condition: {path: 'subformType', condition: "eq", value: 1},
        content: {
          age1: {caption: null, type: 'integer'},
          weight1: {caption: null, type: 'number'},
          employed1: {caption: null, type: 'boolean'},
        },
      },
      subForm2: {
        type: 'subform',
        inline: true,
        condition: {path: 'subformType', condition: "eq", value: 2},
        content: {
          age2: {caption: null, type: 'integer'},
          weight2: {caption: null, type: 'number'},
          employed2: {caption: null, type: 'boolean'},
        },
      },
    };


    formInstance = new GenericFormInstance(formDefinition, {});
    expect(fromUiItems(formInstance.uiItems)).toEqual({
      subformType: {path: 'subformType', type: 'input', inputType: 'integer'},
    });
    expect(formInstance.outputModel).toEqual({subformType: null});
    expect(formInstance.outputErrors.value.export()).toEqual({});

    formInstance = new GenericFormInstance(formDefinition, {subformType: 1});
    expect(fromUiItems(formInstance.uiItems)).toEqual({
      subformType: {path: 'subformType', type: 'input', inputType: 'integer'},
      subForm1: {
        path: 'subForm1', type: 'object', required: true,
        caption: {caption: 'structure', help: 'Some Structured Data 1'},
        children: {
          age1: {path: 'age1', type: 'input', inputType: 'integer'},
          weight1: {path: 'weight1', type: 'input', inputType: 'number'},
          employed1: {path: 'employed1', type: 'input', inputType: 'boolean'},
        },
      },
    });
    expect(formInstance.outputModel).toEqual({subformType: 1, age1: null, weight1: null, employed1: null});
    expect(formInstance.outputErrors.value.export()).toEqual({});

    formInstance = new GenericFormInstance(formDefinition, {subformType: 2, age1: 12, weight1: 12.5, employed1: false});
    expect(fromUiItems(formInstance.uiItems)).toEqual({
      subformType: {path: 'subformType', type: 'input', inputType: 'integer'},
      age2: {path: 'age2', type: 'input', inputType: 'integer'},
      weight2: {path: 'weight2', type: 'input', inputType: 'number'},
      employed2: {path: 'employed2', type: 'input', inputType: 'boolean'},
    });
    expect(formInstance.outputModel).toEqual({subformType: 2, age2: null, weight2: null, employed2: null});
    expect(formInstance.outputErrors.value.export()).toEqual({});


    formInstance = new GenericFormInstance(formDefinition, {subformType: 2, age2: 12, weight1: 12.5, employed1: false});
    expect(fromUiItems(formInstance.uiItems)).toEqual({
      subformType: {path: 'subformType', type: 'input', inputType: 'integer'},
      age2: {path: 'age2', type: 'input', inputType: 'integer'},
      weight2: {path: 'weight2', type: 'input', inputType: 'number'},
      employed2: {path: 'employed2', type: 'input', inputType: 'boolean'},
    });
    expect(formInstance.outputModel).toEqual({subformType: 2, age2: 12, weight2: null, employed2: null});
    expect(formInstance.outputErrors.value.export()).toEqual({});


  });

  it('Subform - Selection with validation', async () => {
    let formInstance: GenericFormInstance;
    let formDefinition: FormDefinition;


    formDefinition = {
      subformType: {caption: null, type: 'integer'},
      subForm1: {
        type: 'subform',
        caption: 'structure',
        help: 'Some Structured Data 1',
        condition: {path: 'subformType', condition: "eq", value: 1},
        content: {
          age1: {caption: null, type: 'integer', required: true},
          weight1: {caption: null, type: 'number'},
          employed1: {caption: null, type: 'boolean'},
        },
      },
      subForm2: {
        type: 'subform',
        inline: true,
        condition: {path: 'subformType', condition: "eq", value: 2},
        content: {
          age2: {caption: null, type: 'integer', required: true},
          weight2: {caption: null, type: 'number'},
          employed2: {caption: null, type: 'boolean'},
        },
      },
    };


    formInstance = new GenericFormInstance(formDefinition, {weight1: 12.5, weight2: 13.7});
    expect(fromUiItems(formInstance.uiItems)).toEqual({
      subformType: {path: 'subformType', type: 'input', inputType: 'integer'},
    });
    expect(formInstance.outputModel).toEqual({subformType: null});
    expect(formInstance.outputErrors.value.export()).toEqual({});

    formInstance = new GenericFormInstance(formDefinition, {subformType: 1, weight1: 12.5, weight2: 13.7});
    expect(fromUiItems(formInstance.uiItems)).toEqual({
      subformType: {path: 'subformType', type: 'input', inputType: 'integer'},
      subForm1: {
        path: 'subForm1', type: 'object', required: true,
        caption: {caption: 'structure', help: 'Some Structured Data 1'},
        children: {
          age1: {path: 'age1', type: 'input', inputType: 'integer'},
          weight1: {path: 'weight1', type: 'input', inputType: 'number'},
          employed1: {path: 'employed1', type: 'input', inputType: 'boolean'},
        },
      },
    });
    expect(formInstance.outputModel).toEqual({subformType: 1, age1: null, weight1: 12.5, employed1: null});
    expect(formInstance.outputErrors.value.export()).toEqual({
      'age1': ValidationTexts.required,
    });

    formInstance = new GenericFormInstance(formDefinition, {subformType: 2, weight1: 12.5, weight2: 13.7});
    expect(fromUiItems(formInstance.uiItems)).toEqual({
      subformType: {path: 'subformType', type: 'input', inputType: 'integer'},
      age2: {path: 'age2', type: 'input', inputType: 'integer'},
      weight2: {path: 'weight2', type: 'input', inputType: 'number'},
      employed2: {path: 'employed2', type: 'input', inputType: 'boolean'},
    });
    expect(formInstance.outputModel).toEqual({subformType: 2, age2: null, weight2: 13.7, employed2: null});
    expect(formInstance.outputErrors.value.export()).toEqual({
      'age2': ValidationTexts.required,
    });


  });

  it('Subform - Selection in Array 1', async () => {
    let formInstance: GenericFormInstance;
    let formDefinition: FormDefinition;


    formDefinition = {
      data: {
        type: "array",
        caption: null,
        required: true,
        elements: {
          type: 'object',
          required: true,
          properties: {
            subformType: {caption: null, type: 'integer'},
            subForm1: {
              type: 'subform',
              caption: 'structure',
              help: 'Some Structured Data 1',
              condition: {path: 'subformType', condition: "eq", value: 1},
              content: {
                age1: {caption: null, type: 'integer', required: true},
                weight1: {caption: null, type: 'number'},
                employed1: {caption: null, type: 'boolean'},
              },
            },
            subForm2: {
              type: 'subform',
              inline: true,
              condition: {path: 'subformType', condition: "eq", value: 2},
              content: {
                age2: {caption: null, type: 'integer', required: true},
                weight2: {caption: null, type: 'number'},
                employed2: {caption: null, type: 'boolean'},
              },
            },
          },
        },
      },
    };


    formInstance = new GenericFormInstance(formDefinition, {});
    expect(fromUiItems(formInstance.uiItems)).toEqual({
      data: {path: 'data', type: 'array', required: true, canAdd: true, children: []},
    });
    expect(formInstance.outputModel).toEqual({data: []});
    expect(formInstance.outputErrors.value.export()).toEqual({});

    formInstance = new GenericFormInstance(formDefinition, {data: [null, null]});
    expect(fromUiItems(formInstance.uiItems)).toEqual({
      data: {
        path: 'data', type: 'array', required: true, canAdd: true, children: [
          {
            path: 'data.0', type: 'object', required: true, children: {
              subformType: {path: 'data.0.subformType', type: 'input', inputType: 'integer'},
            },
          },
          {
            path: 'data.1', type: 'object', required: true, children: {
              subformType: {path: 'data.1.subformType', type: 'input', inputType: 'integer'},
            },
          },
        ],
      },
    });
    expect(formInstance.outputModel).toEqual({
      data: [
        {subformType: null},
        {subformType: null},
      ]
    });
    expect(formInstance.outputErrors.value.export()).toEqual({});

    formInstance.setValue(['data', 0, 'subformType'], 1);
    formInstance.setValue(['data', 1, 'subformType'], 2);

    expect(fromUiItems(formInstance.uiItems)).toEqual({
      data: {
        path: 'data', type: 'array', required: true, canAdd: true, children: [
          {
            path: 'data.0', type: 'object', required: true, children: {
              subformType: {path: 'data.0.subformType', type: 'input', inputType: 'integer'},
              subForm1: {
                path: 'data.0.subForm1', type: 'object', required: true,
                caption: {caption: 'structure', help: 'Some Structured Data 1'},
                children: {
                  age1: {path: 'data.0.age1', type: 'input', inputType: 'integer'},
                  weight1: {path: 'data.0.weight1', type: 'input', inputType: 'number'},
                  employed1: {path: 'data.0.employed1', type: 'input', inputType: 'boolean'},
                },
              },
            },
          },
          {
            path: 'data.1', type: 'object', required: true, children: {
              subformType: {path: 'data.1.subformType', type: 'input', inputType: 'integer'},
              age2: {path: 'data.1.age2', type: 'input', inputType: 'integer'},
              weight2: {path: 'data.1.weight2', type: 'input', inputType: 'number'},
              employed2: {path: 'data.1.employed2', type: 'input', inputType: 'boolean'},
            },
          },
        ],
      },
    });
    expect(formInstance.outputModel).toEqual({
      data: [
        {subformType: 1, age1: null, weight1: null, employed1: null},
        {subformType: 2, age2: null, weight2: null, employed2: null},
      ],
    });
    expect(formInstance.outputErrors.value.export()).toEqual({
      'data.0.age1': 'this is required',
      'data.1.age2': 'this is required',
    });

  });


  it('Subform - Selection in Array 2', async () => {
    let formInstance: GenericFormInstance;
    let formDefinition: FormDefinition;


    formDefinition = {
      subformType: {caption: null, type: 'integer'},
      data: {
        type: "array",
        caption: null,
        required: true,
        elements: {
          type: 'object',
          required: true,
          properties: {
            subForm1: {
              type: 'subform',
              caption: 'structure',
              help: 'Some Structured Data 1',
              condition: {path: '-.-.subformType', condition: "eq", value: 1},
              content: {
                age1: {caption: null, type: 'integer', required: true},
                weight1: {caption: null, type: 'number'},
                employed1: {caption: null, type: 'boolean'},
              },
            },
            subForm2: {
              type: 'subform',
              inline: true,
              condition: {path: '-.-.subformType', condition: "eq", value: 2},
              content: {
                age2: {caption: null, type: 'integer', required: true},
                weight2: {caption: null, type: 'number'},
                employed2: {caption: null, type: 'boolean'},
              },
            },
          },
        },
      },
    };


    formInstance = new GenericFormInstance(formDefinition, {});
    expect(fromUiItems(formInstance.uiItems)).toEqual({
      subformType: {path: 'subformType', type: 'input', inputType: 'integer'},
      data: {path: 'data', type: 'array', required: true, canAdd: true, children: []},
    });
    expect(formInstance.outputModel).toEqual({subformType: null, data: []});
    expect(formInstance.outputErrors.value.export()).toEqual({});

    formInstance = new GenericFormInstance(formDefinition, {data: [null, null]});
    expect(fromUiItems(formInstance.uiItems)).toEqual({
      subformType: {path: 'subformType', type: 'input', inputType: 'integer'},
      data: {
        path: 'data', type: 'array', required: true, canAdd: true, children: [
          {
            path: 'data.0', type: 'object', required: true, children: {},
          },
          {
            path: 'data.1', type: 'object', required: true, children: {},
          },
        ],
      },
    });
    expect(formInstance.outputModel).toEqual({
      subformType: null,
      data: [
        {},
        {},
      ],
    });
    expect(formInstance.outputErrors.value.export()).toEqual({});

    formInstance.setValue(['subformType'], 1);

    expect(fromUiItems(formInstance.uiItems)).toEqual({
      subformType: {path: 'subformType', type: 'input', inputType: 'integer'},
      data: {
        path: 'data', type: 'array', required: true, canAdd: true, children: [
          {
            path: 'data.0', type: 'object', required: true, children: {
              subForm1: {
                path: 'data.0.subForm1', type: 'object', required: true,
                caption: {caption: 'structure', help: 'Some Structured Data 1'},
                children: {
                  age1: {path: 'data.0.age1', type: 'input', inputType: 'integer'},
                  weight1: {path: 'data.0.weight1', type: 'input', inputType: 'number'},
                  employed1: {path: 'data.0.employed1', type: 'input', inputType: 'boolean'},
                },
              },
            },
          },
          {
            path: 'data.1', type: 'object', required: true, children: {
              subForm1: {
                path: 'data.1.subForm1', type: 'object', required: true,
                caption: {caption: 'structure', help: 'Some Structured Data 1'},
                children: {
                  age1: {path: 'data.1.age1', type: 'input', inputType: 'integer'},
                  weight1: {path: 'data.1.weight1', type: 'input', inputType: 'number'},
                  employed1: {path: 'data.1.employed1', type: 'input', inputType: 'boolean'},
                },
              },
            },
          },
        ],
      },
    });
    expect(formInstance.outputModel).toEqual({
      subformType: 1,
      data: [
        {age1: null, weight1: null, employed1: null},
        {age1: null, weight1: null, employed1: null},
      ],
    });
    expect(formInstance.outputErrors.value.export()).toEqual({
      'data.0.age1': 'this is required',
      'data.1.age1': 'this is required',
    });

  });


});
