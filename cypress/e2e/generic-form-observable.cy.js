/// <reference types="cypress" />

describe('generic-form-observable', () => {

  beforeEach(() => {
    cy.visit('http://localhost:5000/?page=form&form=form3')
  })


  it('Selection - Sets Value', () => {
    cy.get('.form-by-def-control:contains("SelectOptions")').should('have.class', 'error')
    cy.get('.form-by-def-control:contains("SelectOptions") .form-by-def-error').should('exist')
    cy.get('.form-by-def-control:contains("SelectOptions")').then(withinSubject => {
      cy.get('pre.model-result').should('contain', '"select_options": null');
      cy.get('.form-by-def-error:contains("option error")', {withinSubject}).should('be.visible')
    });

    cy.get('.form-by-def-control:contains("Age 1")').then(withinSubject => {
      cy.get('.input-wrapper button:eq(0)', {withinSubject}).click();
      cy.get('pre.model-result').should('contain', '"some_number": 1');
      cy.get('pre.model-result').should('contain', '"select_options": null');
    });

    cy.get('button:contains("update")').click();
    cy.get('.form-by-def-control:contains("SelectOptions")').then(withinSubject => {
      cy.get('pre.model-result').should('contain', '"select_options": "foo"');
      cy.get('.form-by-def-error:contains("option error")', {withinSubject}).should('not.exist')
    });
    cy.get('.form-by-def-control:contains("SelectOptions")').should('not.have.class', 'error')

 })


})
