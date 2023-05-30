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

    cy.getSettled('.generic-form-control:contains("Age 1") .input-wrapper button:eq(0)').click();
    cy.get('pre.model-result').should('contain', '"some_number": 1');
    cy.get('pre.model-result').should('contain', '"select_options": null');

    cy.getSettled('.optionsSet:eq(1) button').click();
    cy.get('.generic-form-control:contains("SelectOptions")').then(withinSubject => {
      cy.get('pre.model-result').should('contain', '"select_options": "foo"');
      cy.get('.generic-form-error:contains("option error")', {withinSubject}).should('not.exist');
    });
    cy.get('.generic-form-control:contains("SelectOptions")').should('not.have.class', 'error');

 });

  it('Object - Async Validation', () => {

    cy.get('.generic-form-caption:contains("Position")').should('have.class', 'error');

    cy.get('pre.model-result').should('contain', '"posX": 1');
    cy.get('pre.model-result').should('contain', '"posY": 1');

    cy.getSettled('.generic-form-control:contains("PosX") .input-wrapper button:eq(0)').click();
    cy.get('pre.model-result').should('contain', '"posX": 2');

    cy.get('.generic-form-caption:contains("Position")').should('not.have.class', 'error');

    cy.getSettled('.generic-form-control:contains("PosX") .input-wrapper button:eq(1)').click();
    cy.get('pre.model-result').should('contain', '"posX": 1');

    cy.get('.generic-form-caption:contains("Position")').should('not.have.class', 'error');
    cy.wait(1000)
    cy.get('.generic-form-caption:contains("Position")').should('have.class', 'error');

  });


});
