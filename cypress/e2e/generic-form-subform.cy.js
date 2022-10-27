/// <reference types="cypress" />

describe('generic-form-subform', () => {

  beforeEach(() => {
    cy.visit('http://localhost:5000/?page=form&form=form2');
  });

  it('Non Required Child', () => {
    const selector = '.generic-form-control:contains("Child 1")';
    cy.get(selector).should('exist');

    cy.get(`${selector} .generic-form-add-button`).should('exist');
    cy.get('pre.model-result').should('contain', '"child_1": null,');

    cy.get(`${selector} .generic-form-add-button img:visible`).click();

    cy.get('pre.model-result').should('contain', [
      '"child_1": {',
      '  "posX": null,',
      '  "posY": null',
      '}',
    ].join('\n  '));

    const childSelector = '.generic-form-control:contains("Pos X")';

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

    cy.get(`${selector} .generic-form-remove-button img:visible`).click();
    cy.get('pre.model-result').should('contain', '"child_1": null,');

  });

  it('Required Child', () => {
    const selector = '.generic-form-control:contains("Child 2")';
    cy.get(selector).should('exist');

    cy.get(`${selector} .generic-form-remove-button button`).should('not.exist');
    cy.get('pre.model-result').should('contain', '"child_1": null,');

    cy.get('pre.model-result').should('contain', [
      '"child_2": {',
      '  "posX": null,',
      '  "posY": null',
      '}',
    ].join('\n  '));

  });

  it('Inline Child', () => {
    const selector = '.generic-form-control:contains("Inline Child Pos X")';
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

  it('Inline Subform', () => {
    const selector1 = '.generic-form-control:contains("Subform Name")';
    const selector2 = '.generic-form-control:contains("Subform Age")';
    cy.get(selector1).should('exist');
    cy.get(selector2).should('exist');

    cy.get('pre.model-result').should('contain', '"s1_name": null');
    cy.get('pre.model-result').should('contain', '"s1_age": null');

    cy.get(`${selector2} input`).type('-1').blur();
    cy.get(`${selector2}`).should('have.class', 'error');

    cy.get(`${selector2} input`).type('{backspace}{backspace}57').blur();
    cy.get(`${selector2}`).should('not.have.class', 'error');

    cy.get('pre.model-result').should('contain', '"s1_name": null');
    cy.get('pre.model-result').should('contain', '"s1_age": 57');

    cy.get(`${selector1} input`).type('Max Mustermann').blur();
    cy.get(`${selector1}`).should('not.have.class', 'error');
    cy.get(`${selector2}`).should('not.have.class', 'error');

    cy.get('pre.model-result').should('contain', '"s1_name": "Max Mustermann"');
    cy.get('pre.model-result').should('contain', '"s1_age": 57');

  });

});
