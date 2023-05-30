/// <reference types="cypress" />

import {genericFormGetJsonPart} from '../support/tools';

describe('generic-form-basic-arrays', () => {

  beforeEach(() => {
    cy.visit('http://localhost:5000/?page=form&form=form1');
  });

  it('Required String Array', () => {
    const selector = '.generic-form-control:contains("Array 1")';
    cy.get(selector).should('exist');

    cy.get(`${selector} .generic-form-remove-button button`).should('not.exist');
    cy.get(`${selector} .error`).should('not.exist');

    cy.get(`${selector} input`).should('have.length', 0);
    cy.get('pre.model-result').should('contain', genericFormGetJsonPart('array_1', []));

    cy.getSettled(`${selector} .generic-form-input-array-add-button img`).click();

    cy.get(`${selector} input`).should('have.length', 1);
    cy.get('pre.model-result').should('contain', genericFormGetJsonPart('array_1', [
      null
    ]));

    cy.getSettled(`${selector} .generic-form-input-array-add-button img`).click();

    cy.get(`${selector} input`).should('have.length', 2);
    cy.get('pre.model-result').should('contain', genericFormGetJsonPart('array_1', [
      null,
      null,
    ]));

    cy.getSettled(`${selector} input:eq(1)`).type('foo bar').blur();

    cy.get('pre.model-result').should('contain', genericFormGetJsonPart('array_1', [
      null,
      'foo bar'
    ]));

    cy.getSettled(`${selector} .generic-form-input-array-item:eq(0) .generic-form-input-array-remove-button img`).click();

    cy.get(`${selector} input`).should('have.length', 1);
    cy.get('pre.model-result').should('contain', genericFormGetJsonPart('array_1', [
      'foo bar'
    ]));

  });

  it('Non - Required String Array', () => {
    const selector = '.generic-form-control:contains("Array 2")';

    cy.get(selector).should('exist');

    cy.get(`${selector} .generic-form-remove-button button`).should('not.exist');
    cy.get(`${selector} .error`).should('not.exist');

    cy.get(`${selector} input`).should('not.exist');
    cy.get('pre.model-result').should('contain', genericFormGetJsonPart('array_2', null));

    cy.getSettled(`${selector} .generic-form-add-button img:visible`).click();

    cy.get(`${selector} input`).should('have.length', 0);
    cy.get('pre.model-result').should('contain', genericFormGetJsonPart('array_2', []));

    cy.getSettled(`${selector} .generic-form-input-array-add-button img`).click();

    cy.get(`${selector} input`).should('have.length', 1);
    cy.get('pre.model-result').should('contain', genericFormGetJsonPart('array_2', [
      null
    ]));

    cy.getSettled(`${selector} .generic-form-input-array-add-button img`).click();

    cy.get(`${selector} input`).should('have.length', 2);
    cy.get('pre.model-result').should('contain', genericFormGetJsonPart('array_2', [
      null,
      null
    ]));

    cy.getSettled(`${selector} input:eq(0)`).type('foo bar').blur();

    cy.get('pre.model-result').should('contain', genericFormGetJsonPart('array_2', [
      'foo bar',
      null,
    ]));

    cy.getSettled(`${selector} .generic-form-remove-button img:visible`).click();

    cy.get(`${selector} input`).should('not.exist');
    cy.get('pre.model-result').should('contain', genericFormGetJsonPart('array_2',null));

  });

  it('Array with Min Value', () => {
    const selector = '.generic-form-control:contains("Array 3")';
    cy.get(selector).should('exist');
    cy.get(selector).should('not.have.class', 'error');

    cy.get(`${selector} input`).should('have.length', 3);
    cy.get('pre.model-result').should('contain',genericFormGetJsonPart('array_3', [
      'element 1',
      null,
      null
    ])  );
    cy.get(`${selector} input:eq(0)`).should('have.value', 'element 1');

    cy.get(`${selector} .generic-form-caption:visible:first .generic-form-error`).should('not.exist');
    cy.get(`${selector} .generic-form-input-array-item:eq(0) .generic-form-error`).should('not.exist');
    cy.get(`${selector} .generic-form-input-array-item:eq(1) .generic-form-error`).should('exist');
    cy.get(`${selector} .generic-form-input-array-item:eq(2) .generic-form-error`).should('exist');

    cy.getSettled(`${selector} input:eq(0)`).type('2').blur();

    cy.get(`${selector} input`).should('have.length', 2);
    cy.get('pre.model-result').should('contain', genericFormGetJsonPart('array_3', [
      'element 12',
      null,
      null
    ]));

    cy.get(selector).should('not.have.class', 'error');
    cy.get(`${selector} .generic-form-caption:visible:first .generic-form-error`).should('not.exist');
    cy.get(`${selector} .generic-form-input-array-item:eq(0) .generic-form-error`).should('not.exist');
    cy.get(`${selector} .generic-form-input-array-item:eq(1) .generic-form-error`).should('exist');
    cy.get(`${selector} .generic-form-input-array-item:eq(2) .generic-form-error`).should('exist');

    cy.get(`${selector} input`).should('have.length', 3);
    cy.getSettled(`${selector} input:eq(1)`).type('test');

    cy.get(selector).should('not.have.class', 'error');
    cy.get(`${selector} .generic-form-caption:visible:first .generic-form-error`).should('not.exist');
    cy.get(`${selector} .generic-form-input-array-item:eq(0) .generic-form-error`).should('not.exist');
    cy.get(`${selector} .generic-form-input-array-item:eq(1) .generic-form-error`).should('not.exist');
    cy.get(`${selector} .generic-form-input-array-item:eq(2) .generic-form-error`).should('exist');

    cy.getSettled(`${selector} .generic-form-input-array-item:eq(0) .generic-form-input-array-remove-button img`).click();

    cy.get(selector).should('have.class', 'error');
    cy.get(`${selector} .generic-form-caption:visible:first .generic-form-error`).should('exist');
    cy.get(`${selector} .generic-form-input-array-item:eq(0) .generic-form-error`).should('not.exist');
    cy.get(`${selector} .generic-form-input-array-item:eq(1) .generic-form-error`).should('exist');
    cy.get(`${selector} .generic-form-input-array-item:eq(2)`).should('not.exist');

    cy.get(`${selector} input`).should('have.length', 2);
    cy.get('pre.model-result').should('contain', genericFormGetJsonPart('array_3', [
      'test',
      null,
    ]));

  });

});
