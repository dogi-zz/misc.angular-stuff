/// <reference types="cypress" />

describe('generic-form-basics', () => {

  beforeEach(() => {
    cy.visit('http://localhost:5000/?page=form&form=form1')
  })

  it('Selection - Search', () => {
    cy.get('.form-by-def-control:contains("Gender")').should('have.class', 'error')
    cy.get('.form-by-def-control:contains("Gender") .form-by-def-error').should('exist')
    cy.get('.form-by-def-control:contains("Gender")').then(withinSubject => {
      cy.get('pre.model-result').not('contain', '"gender":' );

      cy.get('input', {withinSubject}).type('mal');
      cy.get('.form-by-def-input-select-option:contains("female")', {withinSubject}).should('be.visible')
      cy.get('.form-by-def-input-select-option:contains("male")', {withinSubject}).should('be.visible')
      cy.get('.form-by-def-input-select-option:contains("unknown")', {withinSubject}).should('not.exist')

      cy.get('input', {withinSubject}).type('foo');
      cy.get('.form-by-def-input-select-option:contains("female")', {withinSubject}).should('not.exist')
      cy.get('.form-by-def-input-select-option:contains("male")', {withinSubject}).should('not.exist')
      cy.get('.form-by-def-input-select-option:contains("unknown")', {withinSubject}).should('not.exist')
      cy.get('.form-by-def-input-select-option.no-option', {withinSubject}).should('be.visible')

      cy.get('input', {withinSubject}).type('{backspace}{backspace}{backspace}');
      cy.get('.form-by-def-input-select-option:contains("female")', {withinSubject}).should('be.visible')
      cy.get('.form-by-def-input-select-option:contains("male")', {withinSubject}).should('be.visible')
      cy.get('.form-by-def-input-select-option:contains("unknown")', {withinSubject}).should('not.exist')

      cy.get('input', {withinSubject}).type('{downArrow}{downArrow}');
      cy.get('.form-by-def-input-select-option:contains("female")', {withinSubject}).should('have.class', 'hovered')

      cy.get('input', {withinSubject}).type('{enter}');
      cy.get('.form-by-def-input-select-option', {withinSubject}).should('not.exist')
      cy.get('pre.model-result').not('contain', '"gender": 2' );

    });
  })

})
