/// <reference types="cypress" />

import {selectAddButton, selectArrayAdd, selectArrayRemove, selectInputByCaption, selectRemoveButton, shouldContainJsonItem} from "../../cypress/support/generic-form-helper";

describe('generic-form-arrays', () => {

  beforeEach(() => {
    cy.visit('http://localhost:5000/#/form/form3');
  });

  it('Simple Required Array', () => {
    const selector = selectInputByCaption('Strings 1');
    cy.get(selector).should('exist');

    cy.get(`${selector} ${selectRemoveButton()}`).should('not.exist');

    cy.get(`${selector} input`).should('have.length', 0);
    cy.get('pre.model-result').should(shouldContainJsonItem('strings_1', []));

    cy.getSettled(`${selector} ${selectArrayAdd()}`).click();

    cy.get(`${selector} input`).should('have.length', 1);
    cy.get('pre.model-result').should(shouldContainJsonItem('strings_1', [null]));

    cy.getSettled(`${selector} ${selectArrayAdd()}`).click();

    cy.get(`${selector} input`).should('have.length', 2);
    cy.get('pre.model-result').should(shouldContainJsonItem('strings_1', [null, null]));

    cy.getSettled(`${selector} input:eq(1)`).type('foo bar').blur();

    cy.get(`${selector} input`).should('have.length', 2);
    cy.get('pre.model-result').should(shouldContainJsonItem('strings_1', [null, 'foo bar']));

    cy.getSettled(`${selector} ${selectArrayAdd()}`).click();

    cy.get(`${selector} input`).should('have.length', 3);
    cy.get('pre.model-result').should(shouldContainJsonItem('strings_1', [null, 'foo bar', null]));

    cy.getSettled(`${selector} ${selectArrayRemove(0)}`).click();

    cy.get(`${selector} input`).should('have.length', 2);
    cy.get('pre.model-result').should(shouldContainJsonItem('strings_1', ['foo bar', null]));

  });

  it('Non required strings min 3 max 4', () => {

    const selector = selectInputByCaption('Strings 2');
    cy.get(selector).should('exist');

    cy.get(`${selector} ${selectAddButton()}`).should('not.exist');
    cy.get(`${selector} ${selectRemoveButton()}`).should('exist');
    cy.get(`${selector} ${selectArrayAdd()}`).should('exist');

    cy.get(`${selector} input`).should('have.length', 3);
    cy.get('pre.model-result').should(shouldContainJsonItem('strings_2', ['element 1', null, null]));

    cy.getSettled(`${selector} input:eq(1)`).type('foo').blur();

    cy.get(`${selector} input`).should('have.length', 3);
    cy.get('pre.model-result').should(shouldContainJsonItem('strings_2', ['element 1', 'foo', null]));

    cy.getSettled(`${selector} ${selectArrayAdd()}`).click();

    cy.get(`${selector} ${selectArrayAdd()}`).should('not.exist');
    cy.get(`${selector} input`).should('have.length', 4);
    cy.get('pre.model-result').should(shouldContainJsonItem('strings_2', ['element 1', 'foo', null, null]));

    cy.getSettled(`${selector} ${selectArrayRemove(0)}`).click();

    cy.get(`${selector} ${selectArrayAdd()}`).should('exist');
    cy.get(`${selector} input`).should('have.length', 3);
    cy.get('pre.model-result').should(shouldContainJsonItem('strings_2', ['foo', null, null]));

    cy.getSettled(`${selector} ${selectArrayRemove(1)}`).click();

    cy.get(`${selector} ${selectArrayAdd()}`).should('exist');
    cy.get(`${selector} input`).should('have.length', 3);
    cy.get('pre.model-result').should(shouldContainJsonItem('strings_2', ['foo', null, null]));

    cy.getSettled(`${selector} ${selectRemoveButton()}`).click();

    cy.get(`${selector} input`).should('not.exist');

    cy.get(`${selector} ${selectAddButton()}`).should('exist');
    cy.get(`${selector} ${selectRemoveButton()}`).should('not.exist');
    cy.get(`${selector} ${selectArrayAdd()}`).should('not.exist');
    cy.get(`${selector} input`).should('not.exist');

    cy.getSettled(`${selector} ${selectAddButton()}`).click();

    cy.get(`${selector} ${selectAddButton()}`).should('not.exist');
    cy.get(`${selector} ${selectRemoveButton()}`).should('exist');
    cy.get(`${selector} ${selectArrayAdd()}`).should('exist');

    cy.get(`${selector} input`).should('have.length', 3);
    cy.get('pre.model-result').should(shouldContainJsonItem('strings_2', [null, null, null]));

  });

  it('Array with Required String', () => {
    const selector = selectInputByCaption('Strings 3');
    cy.get(selector).should('exist');

    cy.get(`${selector} ${selectAddButton()}`).should('not.exist');
    cy.get(`${selector} ${selectRemoveButton()}`).should('exist');
    cy.get(`${selector} ${selectArrayAdd()}`).should('exist');

    cy.get(`${selector} input`).should('have.length', 2);
    cy.get('pre.model-result').should(shouldContainJsonItem('strings_3', ['wide element 1', 'wide element 2']));
    cy.get(`${selector} input:eq(0)`).should('have.value', 'wide element 1');
    cy.get(`${selector} input:eq(1)`).should('have.value', 'wide element 2');

    cy.get(`${selector} .generic-form-error-message`).should('not.exist');

    cy.getSettled(`${selector} ${selectArrayAdd()}`).click();


    cy.get(`${selector} input`).should('have.length', 3);
    cy.get('pre.model-result').should(shouldContainJsonItem('strings_3', ['wide element 1', 'wide element 2', null]));
    cy.get(`${selector} input:eq(0)`).should('have.value', 'wide element 1');
    cy.get(`${selector} input:eq(1)`).should('have.value', 'wide element 2');
    cy.get(`${selector} .generic-form-error-message`).should('exist');

    cy.getSettled(`${selector} input:eq(0)`).type(' test').blur();

    cy.get(`${selector} input`).should('have.length', 3);
    cy.get('pre.model-result').should(shouldContainJsonItem('strings_3', ['wide element 1 test', 'wide element 2', null]));
    cy.get(`${selector} .generic-form-error-message`).should('exist');

    cy.getSettled(`${selector} input:eq(2)`).type('new value').blur();

    cy.get(`${selector} input`).should('have.length', 3);
    cy.get('pre.model-result').should(shouldContainJsonItem('strings_3', ['wide element 1 test', 'wide element 2', 'new value']));
    cy.get(`${selector} .generic-form-error-message`).should('not.exist');

  });

  it('Check Array Object', () => {
    const selector = selectInputByCaption('Objects 1');
    cy.get(selector).should('exist');

    cy.get(`${selector} ${selectAddButton()}`).should('not.exist');
    cy.get(`${selector} ${selectRemoveButton()}`).should('exist');
    cy.get(`${selector} ${selectArrayAdd()}`).should('exist');

    cy.get('pre.model-result').should(shouldContainJsonItem('objects_1', [{posX: 1, posY: null}]));

    cy.get(`${selector} .generic-form-input-object:eq(0) ${selectInputByCaption('Child Pos X')} .generic-form-error-message`).should('not.exist');
    cy.get(`${selector} .generic-form-input-object:eq(0) ${selectInputByCaption('Child Pos Y')} .generic-form-error-message`).should('exist');

  });


});
