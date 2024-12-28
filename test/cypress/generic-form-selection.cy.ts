/// <reference types="cypress" />

import {initForm, selectInputByCaption} from '../../cypress/support/generic-form-helper';

describe('generic-form-selection', () => {

  beforeEach(() => {
    cy.visit('http://localhost:5000/#/form/form1');
  });

  it('Selection - Search', () => {
    const selector = selectInputByCaption('Gender');

    initForm({
      gender: {
        type: 'selection',
        caption: 'Gender',
        required: true,
        options: [
          {label: 'unknown', value: false},
          {label: 'male', value: 1},
          {label: 'female', value: 2},
        ],
        help: 'simple required selection',
      },
    }, {
      none: '123',
    });

    cy.get(`${selector}`).should('have.class', 'generic-form-error');
    cy.get(`${selector} .generic-form-error-message`).should('exist');
    cy.get(`${selector}`).then(withinSubject => {
      cy.get('pre.model-result').should('contain', '"gender":');

      cy.get('input', {withinSubject}).type('mal');
      cy.get('.generic-form-input-select-option:contains("female")', {withinSubject}).should('be.visible');
      cy.get('.generic-form-input-select-option:contains("male")', {withinSubject}).should('be.visible');
      cy.get('.generic-form-input-select-option:contains("unknown")', {withinSubject}).should('not.exist');

      cy.get('input', {withinSubject}).type('foo');
      cy.get('.generic-form-input-select-option:contains("female")', {withinSubject}).should('not.exist');
      cy.get('.generic-form-input-select-option:contains("male")', {withinSubject}).should('not.exist');
      cy.get('.generic-form-input-select-option:contains("unknown")', {withinSubject}).should('not.exist');
      cy.get('.generic-form-input-select-option.no-option', {withinSubject}).should('be.visible');

      cy.get('input', {withinSubject}).type('{backspace}{backspace}{backspace}');
      cy.get('.generic-form-input-select-option:contains("female")', {withinSubject}).should('be.visible');
      cy.get('.generic-form-input-select-option:contains("male")', {withinSubject}).should('be.visible');
      cy.get('.generic-form-input-select-option:contains("unknown")', {withinSubject}).should('not.exist');

      cy.get('input', {withinSubject}).type('{downArrow}{downArrow}');
      cy.get('.generic-form-input-select-option:contains("female")', {withinSubject}).should('have.class', 'hovered');

      cy.get('input', {withinSubject}).type('{enter}');
      cy.get('.generic-form-input-select-option', {withinSubject}).should('not.be.visible');
      cy.get('pre.model-result').should('contain', '"gender": 2');

    });
  });

});
