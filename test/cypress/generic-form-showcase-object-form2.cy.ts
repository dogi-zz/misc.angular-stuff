/// <reference types="cypress" />

import {initForm, inputNumber, inputText, selectAddButton, selectInputByCaption, selectRemoveButton, shouldContainJsonItem} from '../../cypress/support/generic-form-helper';

describe('generic-form-showcase-object', () => {

  beforeEach(() => {
    cy.visit('http://localhost:5000/#/form/form2');
  });

  it('Non Required Child', () => {

    // initForm({
    //   child_1: {
    //     caption: 'Child 1', type: 'object',
    //     properties: {
    //       posX: {
    //         caption: 'Pos X', type: 'integer',
    //         min: 0, help: 'validation > 0',
    //       },
    //       posY: {
    //         caption: 'Pos Y', type: 'integer',
    //         min: 0, help: 'validation > 0',
    //       },
    //     },
    //     help: 'none required nested object',
    //   },
    // }, {
    //   none: '123',
    // });

    const selector = selectInputByCaption('Child 1');
    cy.get(selector).should('exist');

    const selectorPosX = `${selector} ${selectInputByCaption('Pos X')}`;
    const selectorPosY = `${selector} ${selectInputByCaption('Pos Y')}`;
    cy.get(selectorPosX).should('not.exist');
    cy.get(selectorPosY).should('not.exist');

    cy.get('pre.model-result').should(shouldContainJsonItem('child_1', null));
    cy.getSettled(`${selector} ${selectAddButton()}`).click();

    cy.get('pre.model-result').should(shouldContainJsonItem('child_1', {
      'posX': null,
      'posY': null,
    }));
    cy.get(selectorPosX).should('exist');
    cy.get(selectorPosY).should('exist');

    inputNumber(selectorPosX, 12);
    cy.get('pre.model-result').should(shouldContainJsonItem('child_1', {
      'posX': 12,
      'posY': null,
    }));
    cy.getSettled(`${selector} ${selectRemoveButton()}`).click();

    cy.get('pre.model-result').should(shouldContainJsonItem('child_1', null));
    cy.get(selectorPosX).should('not.exist');
    cy.get(selectorPosY).should('not.exist');

  });

  it('Required Child', () => {

    const selector = selectInputByCaption('Child 2');
    cy.get(selector).should('exist');

    const selectorPosX = `${selector} ${selectInputByCaption('Pos X')}`;
    const selectorPosY = `${selector} ${selectInputByCaption('Pos Y')}`;
    cy.get(selectorPosX).should('exist');
    cy.get(selectorPosY).should('exist');
    cy.get(`${selector} ${selectRemoveButton()}`).should('not.exist');

    cy.get('pre.model-result').should(shouldContainJsonItem('child_2', {
      'posX': null,
      'posY': null,
    }));

    inputNumber(selectorPosX, 12);
    cy.get('pre.model-result').should(shouldContainJsonItem('child_2', {
      'posX': 12,
      'posY': null,
    }));

  });

  it('Non Required Child With start Value', () => {


    const selector = selectInputByCaption('Child 3');
    cy.get(selector).should('exist');

    const selectorPosX = `${selector} ${selectInputByCaption('Pos X')}`;
    const selectorPosY = `${selector} ${selectInputByCaption('Pos Y')}`;
    const selectorPosName = `${selector} ${selectInputByCaption('Name Wide')}`;
    cy.get(selectorPosX).should('exist');
    cy.get(selectorPosY).should('exist');
    cy.get(selectorPosName).should('exist');

    cy.getSettled(`${selectorPosX} input`).should('have.value', '-2')
    cy.getSettled(`${selectorPosY} input`).should('have.value', '')

    cy.get('pre.model-result').should(shouldContainJsonItem('child_3', {
      'posX': -2,
      'posY': null,
      'name_wide': null,
    }));

    inputNumber(selectorPosY, 12);
    cy.get('pre.model-result').should(shouldContainJsonItem('child_3', {
      'posX': -2,
      'posY': 12,
      'name_wide': null,
    }));

    inputText(selectorPosName, 'Test Value 1');
    cy.get('pre.model-result').should(shouldContainJsonItem('child_3', {
      'posX': -2,
      'posY': 12,
      'name_wide': 'Test Value 1',
    }));


    cy.getSettled(`${selector} ${selectRemoveButton()}`).click();

    cy.get('pre.model-result').should(shouldContainJsonItem('child_3', null));
    cy.get(selectorPosX).should('not.exist');
    cy.get(selectorPosY).should('not.exist');
    cy.get(selectorPosName).should('not.exist');


    cy.getSettled(`${selector} ${selectAddButton()}`).click();

    cy.get('pre.model-result').should(shouldContainJsonItem('child_3', {
      'posX': null,
      'posY': null,
      'name_wide': null,
    }));

    cy.get(selectorPosX).should('exist');
    cy.get(selectorPosY).should('exist');
    cy.get(selectorPosName).should('exist');

  });


  it('Inline Child', () => {

    initForm({
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
    }, {
      none: '123',
    });

    const selector = '.generic-form-control:contains("Inline Child Pos X")';
    cy.get(selector).should('exist');

    cy.get('pre.model-result').should(shouldContainJsonItem("child_4", {"posX": null,  "posY": null}));

    cy.getSettled(`${selector} input`).type('-1').blur();
    cy.get(`${selector}`).should('have.class', 'generic-form-error');

    cy.getSettled(`${selector} input`).type('{backspace}{backspace}5').blur();
    cy.get(`${selector}`).should('not.have.class', 'generic-form-error');

    cy.get('pre.model-result').should(shouldContainJsonItem("child_4", {"posX": 5,  "posY": null}));

  });

  // it('Inline Subform', () => {
  //
  //   initForm({
  //     subform1: {
  //       type: 'subform',
  //       inline: true,
  //       content: {
  //         s1_name: {
  //           caption: 'Subform Name', type: 'text',
  //         },
  //         s1_age: {
  //           caption: 'Subform Age', type: 'integer',
  //           min: 18,
  //           max: 99,
  //           help: '18 <= age <= 99',
  //         },
  //
  //       },
  //     },
  //   }, {
  //     none: '123',
  //   });
  //
  //   const selector1 = '.generic-form-control:contains("Subform Name")';
  //   const selector2 = '.generic-form-control:contains("Subform Age")';
  //   cy.get(selector1).should('exist');
  //   cy.get(selector2).should('exist');
  //
  //   cy.get('pre.model-result').should('contain', '"s1_name": null');
  //   cy.get('pre.model-result').should('contain', '"s1_age": null');
  //
  //   cy.getSettled(`${selector2} input`).type('-1').blur();
  //   cy.get(`${selector2}`).should('have.class', 'generic-form-error');
  //
  //   cy.getSettled(`${selector2} input`).type('{backspace}{backspace}57').blur();
  //   cy.get(`${selector2}`).should('not.have.class', 'generic-form-error');
  //
  //   cy.get('pre.model-result').should('contain', '"s1_name": null');
  //   cy.get('pre.model-result').should('contain', '"s1_age": 57');
  //
  //   cy.getSettled(`${selector1} input`).type('Max Mustermann').blur();
  //   cy.get(`${selector1}`).should('not.have.class', 'generic-form-error');
  //   cy.get(`${selector2}`).should('not.have.class', 'generic-form-error');
  //
  //   cy.get('pre.model-result').should('contain', '"s1_name": "Max Mustermann"');
  //   cy.get('pre.model-result').should('contain', '"s1_age": 57');
  //
  // });

});
