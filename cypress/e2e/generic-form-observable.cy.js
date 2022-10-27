/// <reference types="cypress" />

describe('generic-form-observable', () => {

  beforeEach(() => {
    cy.visit('http://localhost:5000/?page=form&form=form4');
  });

  it('Selection - Sets Value', () => {
    cy.get('.generic-form-control:contains("SelectOptions")').should('have.class', 'error');
    cy.get('.generic-form-control:contains("SelectOptions") .generic-form-error').should('exist');
    cy.get('.generic-form-control:contains("SelectOptions")').then(withinSubject => {
      cy.get('pre.model-result').should('contain', '"select_options": null');
      cy.get('.generic-form-error:contains("option error")', {withinSubject}).should('be.visible');
    });

    cy.get('.generic-form-control:contains("Age 1")').then(withinSubject => {
      cy.get('.input-wrapper button:eq(0)', {withinSubject}).click();
      cy.get('pre.model-result').should('contain', '"some_number": 1');
      cy.get('pre.model-result').should('contain', '"select_options": null');
    });

    cy.get('button:contains("update")').click();
    cy.get('.generic-form-control:contains("SelectOptions")').then(withinSubject => {
      cy.get('pre.model-result').should('contain', '"select_options": "foo"');
      cy.get('.generic-form-error:contains("option error")', {withinSubject}).should('not.exist');
    });
    cy.get('.generic-form-control:contains("SelectOptions")').should('not.have.class', 'error');

 });

});
