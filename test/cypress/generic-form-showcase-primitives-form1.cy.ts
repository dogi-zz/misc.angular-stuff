/// <reference types="cypress" />

import {inputText, selectInputByCaption, shouldContainJsonItem} from '../../cypress/support/generic-form-helper';

describe('generic-form-showcase-primitives', () => {

  beforeEach(() => {
    cy.visit('http://localhost:5000/#/form/form1');
  });

  it('Input String - simple', () => {
    const selector = selectInputByCaption('Name 1');
    cy.get(selector).should('exist');

    cy.get('pre.model-result').should(shouldContainJsonItem('name_1', 'My Name'));
    inputText(selector, 'Test Value 1');
    cy.get('pre.model-result').should(shouldContainJsonItem('name_1', 'Test Value 1'));
  });

  it('Input String - required', () => {
    const selector = selectInputByCaption('Name 2');
    cy.get(selector).should('exist');

    cy.get(selector).should('have.class', 'generic-form-error');
    cy.get(`${selector} .generic-form-error-message`).should('contain', 'this is required');
    cy.get('pre.model-result').should(shouldContainJsonItem('name_2', null));

    cy.getSettled(`${selector} input`).type('Test Value 2');
    cy.get(selector).should('not.have.class', 'generic-form-error');

    cy.get(`${selector} input`).blur();
    cy.get('pre.model-result').should(shouldContainJsonItem('name_2', 'Test Value 2'));
  });

  it('Selection - required', () => {
    const selector = selectInputByCaption('Gender');
    cy.get(selector).should('exist');

    cy.get(`${selector}`).should('have.class', 'generic-form-error');
    cy.get(`${selector} .generic-form-error-message`).should('contain', 'this is required');
    cy.get('pre.model-result').should(shouldContainJsonItem('gender', null));

    cy.getSettled(`${selector} input`).click();
    cy.getSettled(`${selector} .generic-form-input-select-option:contains("female")`).click();
    cy.get('pre.model-result').should(shouldContainJsonItem('gender', 2));

    cy.getSettled(`${selector} input`).click();
    cy.getSettled(`${selector} .generic-form-input-select-option:contains("unknown")`).click();
    cy.get('pre.model-result').should(shouldContainJsonItem('gender', false));
  });

  it('Selection - Open Close', () => {
    const selector = selectInputByCaption('Gender');
    cy.get(selector).should('exist');

    cy.get(`${selector}`).should('have.class', 'generic-form-error');
    cy.get(`${selector} .generic-form-error-message`).should('contain', 'this is required');
    cy.get('pre.model-result').should(shouldContainJsonItem('gender', null));

    cy.getSettled(`${selector} input`).click();
    cy.get(`${selector} .generic-form-input-select-option`).should('be.visible');

    cy.getSettled(`${selector} .input-wrapper button`).click();
    cy.get(`${selector} .generic-form-input-select-option`).should('not.be.visible');

    cy.get(`${selector}`).should('have.class', 'generic-form-error');
    cy.get(`${selector} .generic-form-error-message`).should('contain', 'this is required');
    cy.get('pre.model-result').should(shouldContainJsonItem('gender', null));
  });

  it('Integer - type', () => {
    const selector = selectInputByCaption('Age');
    cy.get(selector).should('exist');

    cy.get(`${selector}`).should('not.have.class', 'generic-form-error');
    cy.get('pre.model-result').should(shouldContainJsonItem('age', null));

    cy.getSettled(`${selector} input`).type('3');
    cy.get(`${selector}`).should('have.class', 'generic-form-error');
    cy.get(`${selector} .generic-form-error-message`).should('contain', 'The value has to be at least 18');

    cy.getSettled(`${selector} input`).type('0');
    cy.get(`${selector}`).should('not.have.class', 'generic-form-error');
    cy.get(`${selector} .generic-form-error-message`).should('not.exist');

    cy.getSettled(`${selector} input`).type('0');
    cy.get(`${selector}`).should('have.class', 'generic-form-error');
    cy.get(`${selector} .generic-form-error-message`).should('contain', 'The value has to be at most 99');

    cy.getSettled(`${selector} input`).type('{backspace}');
    cy.get(`${selector}`).should('not.have.class', 'generic-form-error');
    cy.get(`${selector} .generic-form-error-message`).should('not.exist');

    cy.get(`${selector} input`).blur();

    cy.get(`${selector}`).should('not.have.class', 'generic-form-error');
    cy.get(`${selector} .generic-form-error-message`).should('not.exist');
    cy.get('pre.model-result').should(shouldContainJsonItem('age', 30));

    cy.getSettled(`${selector} .input-wrapper button:eq(0)`).click();
    cy.getSettled(`${selector} .input-wrapper button:eq(0)`).click();

    cy.get('pre.model-result').should(shouldContainJsonItem('age', 32));

    cy.getSettled(`${selector} .input-wrapper button:eq(1)`).click();

    cy.getSettled(`${selector} input`).type('{backspace}{backspace}17').blur();

    cy.get(`${selector}`).should('have.class', 'generic-form-error');
    cy.get(`${selector} .generic-form-error-message`).should('contain', 'The value has to be at least 18');
    cy.get('pre.model-result').should(shouldContainJsonItem('age', 17));

    cy.getSettled(`${selector} .input-wrapper button:eq(0)`).click();
    cy.get(`${selector} .generic-form-error-message`).should('not.exist');
    cy.get('pre.model-result').should(shouldContainJsonItem('age', 18));

    cy.getSettled(`${selector} .input-wrapper button:eq(0)`).click();
    cy.get(`${selector} .generic-form-error-message`).should('not.exist');
    cy.get('pre.model-result').should(shouldContainJsonItem('age', 19));

    cy.getSettled(`${selector} .input-wrapper button:eq(1)`).click();
    cy.getSettled(`${selector} .input-wrapper button:eq(1)`).click();
    cy.get(`${selector} .generic-form-error-message`).should('not.exist');
    cy.get('pre.model-result').should(shouldContainJsonItem('age', 18));

  });

  it('Float - non required', () => {
    const selector = selectInputByCaption('Weight 1');
    cy.get(selector).should('exist');

    cy.get(`${selector}`).should('not.have.class', 'generic-form-error');
    cy.get('pre.model-result').should(shouldContainJsonItem('weight_1', null));

    cy.getSettled(`${selector} input`).type('79');
    cy.get(`${selector}`).should('not.have.class', 'generic-form-error');
    cy.get(`${selector} .generic-form-error-message`).should('not.exist');

    cy.get(`${selector} input`).blur();
    cy.get('pre.model-result').should(shouldContainJsonItem('weight_1', 79));

    cy.getSettled(`${selector} input`).type('0');
    cy.get(`${selector}`).should('have.class', 'generic-form-error');
    cy.get(`${selector} .generic-form-error-message`).should('contain', 'The value has to be at most 100');

    cy.getSettled(`${selector} input`).type('{backspace}');
    cy.get(`${selector}`).should('not.have.class', 'generic-form-error');
    cy.get(`${selector} .generic-form-error-message`).should('not.exist');

    cy.getSettled(`${selector} input`).type('.1');
    cy.get(`${selector}`).should('not.have.class', 'generic-form-error');
    cy.get(`${selector} .generic-form-error-message`).should('not.exist');

    cy.get(`${selector} input`).blur();
    cy.get('pre.model-result').should(shouldContainJsonItem('weight_1', 79.1));

    cy.getSettled(`${selector} input`).type('{backspace}{backspace}{backspace}{backspace}-1');
    cy.get(`${selector}`).should('have.class', 'generic-form-error');
    cy.get(`${selector} .generic-form-error-message`).should('contain', 'The value has to be at least 0');

    cy.get(`${selector} input`).blur();
    cy.get('pre.model-result').should(shouldContainJsonItem('weight_1', -1));
    cy.get(`${selector}`).should('have.class', 'generic-form-error');
    cy.get(`${selector} .generic-form-error-message`).should('contain', 'The value has to be at least 0');

  });


  it('Float - required', () => {
    const selector = selectInputByCaption('Weight 2');
    cy.get(selector).should('exist');

    cy.get(`${selector}`).should('have.class', 'generic-form-error');
    cy.get(`${selector} .generic-form-error-message`).should('contain', 'this is required');
    cy.get('pre.model-result').should(shouldContainJsonItem('weight_2', null));

    cy.getSettled(`${selector} input`).type('57');
    cy.get(`${selector}`).should('not.have.class', 'generic-form-error');
    cy.get(`${selector} .generic-form-error-message`).should('not.exist');

    cy.get(`${selector} input`).blur();
    cy.get('pre.model-result').should(shouldContainJsonItem('weight_2', 57));
  });


  it('Boolean - non required', () => {
    const selector = selectInputByCaption('Boolean 1');
    cy.get(selector).should('exist');

    cy.get(`${selector}`).should('not.have.class', 'generic-form-error');
    cy.get('pre.model-result').should(shouldContainJsonItem('bool_1', true));

    cy.getSettled(`${selector} .generic-form-input .input-switch`).click();
    cy.get(`${selector}`).should('not.have.class', 'generic-form-error');
    cy.get(`${selector} .generic-form-error-message`).should('not.exist');
    cy.get('pre.model-result').should(shouldContainJsonItem('bool_1', false));

    cy.getSettled(`${selector} .generic-form-input .input-switch`).click();
    cy.get(`${selector}`).should('not.have.class', 'generic-form-error');
    cy.get(`${selector} .generic-form-error-message`).should('not.exist');
    cy.get('pre.model-result').should(shouldContainJsonItem('bool_1', null));

    cy.getSettled(`${selector} .generic-form-input .input-switch`).click();
    cy.get(`${selector}`).should('not.have.class', 'generic-form-error');
    cy.get(`${selector} .generic-form-error-message`).should('not.exist');
    cy.get('pre.model-result').should(shouldContainJsonItem('bool_1', true));

  });



  it('Boolean - required', () => {
    const selector = selectInputByCaption('Boolean 2');
    cy.get(selector).should('exist');

    cy.get(`${selector}`).should('have.class', 'generic-form-error');
    cy.get(`${selector} .generic-form-error-message`).should('contain', 'this is required');
    cy.get('pre.model-result').should(shouldContainJsonItem('bool_2', null));

    cy.getSettled(`${selector} .generic-form-input .input-switch`).click();
    cy.get(`${selector}`).should('not.have.class', 'generic-form-error');
    cy.get(`${selector} .generic-form-error-message`).should('not.exist');
    cy.get('pre.model-result').should(shouldContainJsonItem('bool_2', true));

    cy.getSettled(`${selector} .generic-form-input .input-switch`).click();
    cy.get(`${selector}`).should('not.have.class', 'generic-form-error');
    cy.get(`${selector} .generic-form-error-message`).should('not.exist');
    cy.get('pre.model-result').should(shouldContainJsonItem('bool_2', false));

    cy.getSettled(`${selector} .generic-form-input .input-switch`).click();
    cy.get(`${selector}`).should('not.have.class', 'generic-form-error');
    cy.get(`${selector} .generic-form-error-message`).should('not.exist');
    cy.get('pre.model-result').should(shouldContainJsonItem('bool_2', true));
  });


});
