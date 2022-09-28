/// <reference types="cypress" />

describe('generic-form-arrays', () => {

  beforeEach(() => {
    cy.visit('http://localhost:5000/?page=form&form=form4');
  });

  it.skip('Simple Required Array', () => {
    const selector = '.form-by-def-control:contains("Strings 1")';
    cy.get(selector).should('exist');

    cy.get(`${selector} .form-by-def-remove-button button`).should('not.exist');

    cy.get(`${selector} input`).should('have.length', 0);
    cy.get('pre.model-result').should('contain', [
      '"strings_1": []',
    ].join('\n  '));

    cy.get(`${selector} .form-by-def-input-array-add-button`).click();

    cy.get(`${selector} input`).should('have.length', 1);
    cy.get('pre.model-result').should('contain', [
      '"strings_1": [',
      '  null',
      ']'
    ].join('\n  '));

    cy.get(`${selector} .form-by-def-input-array-add-button`).click();

    cy.get(`${selector} input`).should('have.length', 2);
    cy.get('pre.model-result').should('contain', [
      '"strings_1": [',
      '  null,',
      '  null',
      ']'
    ].join('\n  '));

    cy.get(`${selector} input:eq(1)`).type('foo bar').blur();

    cy.get('pre.model-result').should('contain', [
      '"strings_1": [',
      '  null,',
      '  "foo bar"',
      ']'
    ].join('\n  '));

    cy.get(`${selector} .form-by-def-input-array-item:eq(0) .form-by-def-input-array-delete-button`).click();

    cy.get(`${selector} input`).should('have.length', 1);
    cy.get('pre.model-result').should('contain', [
      '"strings_1": [',
      '  "foo bar"',
      ']'
    ].join('\n  '));

  });

  it.only('Array with Min Value', () => {
    const selector = '.form-by-def-control:contains("Strings 2")';
    cy.get(selector).should('exist');
    cy.get(selector).should('have.class', 'error');

    cy.get(`${selector} input`).should('have.length', 2);
    cy.get('pre.model-result').should('contain', [
      '"strings_2": [',
      '  "element 1",',
      '  null',
      ']'
    ].join('\n  '));
    cy.get(`${selector} input:eq(0)`).should('have.value', 'element 1');

    cy.get(`${selector} .form-by-def-input-array-item:eq(0) .form-by-def-error`).should('not.exist');
    cy.get(`${selector} .form-by-def-input-array-item:eq(1) .form-by-def-error`).should('exist');

    cy.get(`${selector} input:eq(0)`).type('2').blur();

    cy.get(`${selector} input`).should('have.length', 2);
    cy.get('pre.model-result').should('contain', [
      '"strings_2": [',
      '  "element 12",',
      '  null',
      ']'
    ].join('\n  '));

    cy.get(`${selector} .form-by-def-input-array-add-button`).click();

    cy.get(selector).should('not.have.class', 'error');
    cy.get(`${selector} .form-by-def-input-array-item:eq(0) .form-by-def-error`).should('not.exist');
    cy.get(`${selector} .form-by-def-input-array-item:eq(1) .form-by-def-error`).should('exist');
    cy.get(`${selector} .form-by-def-input-array-item:eq(2) .form-by-def-error`).should('exist');

    cy.get(`${selector} .form-by-def-input-array-item:eq(1) input`).type('test')

    cy.get(selector).should('not.have.class', 'error');
    cy.get(`${selector} .form-by-def-input-array-item:eq(0) .form-by-def-error`).should('not.exist');
    cy.get(`${selector} .form-by-def-input-array-item:eq(1) .form-by-def-error`).should('not.exist');
    cy.get(`${selector} .form-by-def-input-array-item:eq(2) .form-by-def-error`).should('exist');


    cy.get(`${selector} .form-by-def-input-array-item:eq(0) .form-by-def-input-array-delete-button`).click();

    cy.get(selector).should('have.class', 'error');
    cy.get(`${selector} .form-by-def-input-array-item:eq(0) .form-by-def-error`).should('not.exist');
    cy.get(`${selector} .form-by-def-input-array-item:eq(1) .form-by-def-error`).should('exist');

    cy.get(`${selector} input`).should('have.length', 2);
    cy.get('pre.model-result').should('contain', [
      '"strings_2": [',
      '  "test",',
      '  null',
      ']'
    ].join('\n  '));

  });

});
