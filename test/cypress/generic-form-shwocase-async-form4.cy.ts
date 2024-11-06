/// <reference types="cypress" />

import {selectInputByCaption, shouldContainJsonItem} from "../../cypress/support/generic-form-helper";

describe('generic-form-observable', () => {

  beforeEach(() => {
    cy.visit('http://localhost:5000/#/form/form4');
  });

  it('Selection - Sets Value', () => {
    const selector = selectInputByCaption('SelectOptions');
    cy.get(selector).should('exist');


    cy.get(selector).should('have.class', 'generic-form-error');
    cy.get(`${selector} .generic-form-error-message`).should('exist');

    cy.get(`${selector}`).then(withinSubject => {
      cy.get('pre.model-result').should(shouldContainJsonItem('select_options', null));
      cy.get('input', {withinSubject}).should('have.value', '');

      // cy.get('input', {withinSubject}).focus().wait(20);
      // cy.get('.generic-form-input-select-option.no-option').should('exist');
      // cy.get('input', {withinSubject}).blur().wait(20);

      cy.get('.option[option_path="select_options"] .option-value:eq(1)').click();

      cy.get('pre.model-result').should(shouldContainJsonItem('select_options', 'foo'));
      cy.get('input', {withinSubject}).should('have.value', 'Option 3');

      cy.get(selector).should('not.have.class', 'generic-form-error');
      cy.get(`${selector} .generic-form-error-message`).should('not.exist');

      cy.get('input', {withinSubject}).focus().wait(20);
      cy.get('.generic-form-input-select-option.no-option', {withinSubject}).should('not.exist');
      cy.get('.generic-form-input-select-option:contains("unknown")', {withinSubject}).should('exist');
      cy.get('.generic-form-input-select-option:contains("Option 1")', {withinSubject}).should('exist');
      cy.get('.generic-form-input-select-option:contains("Option 234")', {withinSubject}).should('not.exist');
      cy.get('.generic-form-input-select-option:contains("Option 123")', {withinSubject}).should('exist');
      cy.get('.generic-form-input-select-option:contains("Option 3")', {withinSubject}).should('exist');
      cy.get('input', {withinSubject}).blur().wait(20);


      cy.get('.option[option_path="select_options"] .option-value:eq(2)').click();

      cy.get('pre.model-result').should(shouldContainJsonItem('select_options', null));
      cy.get('input', {withinSubject}).should('have.value', 'unknown');

      cy.get(selector).should('have.class', 'generic-form-error');
      cy.get(`${selector} .generic-form-error-message`).should('exist');

      cy.get('input', {withinSubject}).focus().wait(20);
      cy.get('.generic-form-input-select-option.no-option', {withinSubject}).should('not.exist');
      cy.get('.generic-form-input-select-option:contains("unknown")', {withinSubject}).should('exist');
      cy.get('.generic-form-input-select-option:contains("Option 1")', {withinSubject}).should('exist');
      cy.get('.generic-form-input-select-option:contains("Option 234")', {withinSubject}).should('exist');
      cy.get('.generic-form-input-select-option:contains("Option 123")', {withinSubject}).should('not.exist');
      cy.get('.generic-form-input-select-option:contains("Option 3")', {withinSubject}).should('not.exist');

      cy.get('.generic-form-input-select-option:contains("Option 1")', {withinSubject}).click().wait(20);

      cy.get('pre.model-result').should(shouldContainJsonItem('select_options', 'opt_1'));
      cy.get('input', {withinSubject}).should('have.value', 'Option 1');

      cy.get(selector).should('not.have.class', 'generic-form-error');
      cy.get(`${selector} .generic-form-error-message`).should('not.exist');


      cy.get('.option[option_path="select_options"] .option-value:eq(2)').click();

      cy.get('pre.model-result').should(shouldContainJsonItem('select_options', 'opt_1'));
      cy.get('input', {withinSubject}).should('have.value', 'Option 1');

      cy.get(selector).should('not.have.class', 'generic-form-error');
      cy.get(`${selector} .generic-form-error-message`).should('not.exist');


      cy.get('.option[option_path="select_options"] .option-value:eq(0)').click();

      cy.get('pre.model-result').should(shouldContainJsonItem('select_options', null));
      cy.get('input', {withinSubject}).should('have.value', '');

      cy.get(selector).should('have.class', 'generic-form-error');
      cy.get(`${selector} .generic-form-error-message`).should('exist');

      cy.get('.option[option_path="select_options"] .option-value:eq(1)').click();

      cy.get('pre.model-result').should(shouldContainJsonItem('select_options', 'opt_1'));
      cy.get('input', {withinSubject}).should('have.value', 'Option 1');

      cy.get(selector).should('not.have.class', 'generic-form-error');
      cy.get(`${selector} .generic-form-error-message`).should('not.exist');

    });


  });

  

});
