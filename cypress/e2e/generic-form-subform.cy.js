/// <reference types="cypress" />

describe('generic-form-subform', () => {

  beforeEach(() => {
    cy.visit('http://localhost:5000/?page=form&form=form2');
  });

  it('Non Required Child', () => {
    const selector = '.form-by-def-control:contains("Child 1")';
    cy.get(selector).should('exist');

    cy.get(`${selector} .form-by-def-add-button`).should('exist');
    cy.get('pre.model-result').should('contain', '"child_1": null,');

    cy.get(`${selector} .form-by-def-add-button button`).click();

    cy.get('pre.model-result').should('contain', [
      '"child_1": {',
      '  "posX": null,',
      '  "posY": null',
      '}',
    ].join('\n  '));

    const childSelector = '.form-by-def-control:contains("Pos X")';

    cy.get(`${selector} ${childSelector} input`).type('-1').blur();
    cy.get(`${selector} ${childSelector}`).should('have.class', 'error');

    cy.get(`${selector} ${childSelector} input`).type('{backspace}{backspace}5').blur();
    cy.get(`${selector} ${childSelector}`).should('not.have.class', 'error');

    cy.get('pre.model-result').should('contain', [
      '"child_1": {',
      '  "posX": 5,',
      '  "posY": null',
      '}',
    ].join('\n  '));

    cy.get(`${selector} .form-by-def-remove-button button`).click()
    cy.get('pre.model-result').should('contain', '"child_1": null,');

  });


  it('Required Child', () => {
    const selector = '.form-by-def-control:contains("Child 2")';
    cy.get(selector).should('exist');

    cy.get(`${selector} .form-by-def-remove-button button`).should('not.exist')
    cy.get('pre.model-result').should('contain', '"child_1": null,');

    cy.get('pre.model-result').should('contain', [
      '"child_2": {',
      '  "posX": null,',
      '  "posY": null',
      '}',
    ].join('\n  '));

  });


  it('Inline Child', () => {
    const selector = '.form-by-def-control:contains("Inline Child Pos X")';
    cy.get(selector).should('exist');

    cy.get('pre.model-result').should('contain', [
      '"child_4": {',
      '  "posX": null,',
      '  "posY": null',
      '}',
    ].join('\n  '));

    cy.get(`${selector} input`).type('-1').blur();
    cy.get(`${selector}`).should('have.class', 'error');

    cy.get(`${selector} input`).type('{backspace}{backspace}5').blur();
    cy.get(`${selector}`).should('not.have.class', 'error');

    cy.get('pre.model-result').should('contain', [
      '"child_4": {',
      '  "posX": 5,',
      '  "posY": null',
      '}',
    ].join('\n  '));


  });




});
