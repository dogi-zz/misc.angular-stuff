/// <reference types="cypress" />

import {genericFormGetJsonPart} from '../support/tools';

describe('generic-form-showcase-conditions', () => {

  beforeEach(() => {
    cy.visit('http://localhost:5000/?page=form&form=form5');
  });

  it('Child Count Switch', () => {
    const selectorChildCount = '.generic-form-control:contains("Child Count")';
    cy.get(selectorChildCount).should('exist');

    cy.get('pre.model-result').should('contain', genericFormGetJsonPart('child_count', null));
    cy.get('.form-valid').should('exist');

    // 1 Child leads to Object Array

    cy.getSettled(`${selectorChildCount} input`).type('1').blur();

    cy.get('pre.model-result').should('contain', genericFormGetJsonPart('child_count', 1));
    cy.get('pre.model-result').should('contain', genericFormGetJsonPart('children', [{name: null, age: null}]));
    cy.get('.form-invalid').should('exist');

    const selectorChild1 = '.generic-form-content:contains("Children") .generic-form-input-array-item:contains("1.")';
    const selectorChildName = `${selectorChild1} .generic-form-control:contains("Name")`;
    const selectorChildAge = `${selectorChild1} .generic-form-control:contains("Age")`;

    cy.get(selectorChildName).should('exist');
    cy.get(selectorChildAge).should('exist');
    cy.get(selectorChildName).should('have.class', 'error');
    cy.get(selectorChildAge).should('have.class', 'error');

    // Enter Child Data
    cy.getSettled(`${selectorChildName} input`,).type('Test Child 1').blur();
    cy.getSettled(`${selectorChildAge} input`,).type('12').blur();
    cy.get(selectorChildName).should('not.have.class', 'error');
    cy.get(selectorChildAge).should('not.have.class', 'error');

    // Form is now Valid
    cy.get('pre.model-result').should('contain', genericFormGetJsonPart('child_count', 1));
    cy.get('pre.model-result').should('contain', genericFormGetJsonPart('children', [{name: 'Test Child 1', age: 12}]));
    cy.get('.form-valid').should('exist');

    // 2 Children leads to String Array

    cy.getSettled(`${selectorChildCount} input`).clear().type('2').blur();

    cy.get(selectorChildName).should('not.exist');
    cy.get(selectorChildAge).should('not.exist');

    cy.get('pre.model-result').should('contain', genericFormGetJsonPart('child_count', 2));
    cy.get('pre.model-result').should('contain', genericFormGetJsonPart('childrenNames', [null, null]));
    cy.get('.form-invalid').should('exist');

    const selectorChildrenNames = '.generic-form-content:contains("Children Names")';
    const selectorChildrenNames0 = `${selectorChildrenNames} .generic-form-input-array-item:eq(0)`;
    const selectorChildrenNames1 = `${selectorChildrenNames} .generic-form-input-array-item:eq(1)`;

    cy.get(selectorChildrenNames0).should('exist');
    cy.get(selectorChildrenNames1).should('exist');
    cy.get(selectorChildrenNames0).should('have.class', 'error');
    cy.get(selectorChildrenNames1).should('have.class', 'error');

    cy.getSettled(`${selectorChildrenNames0} input`,).type('Name 1').blur();
    cy.getSettled(`${selectorChildrenNames1} input`,).type('Name 2').blur();
    cy.get(selectorChildrenNames0).should('not.have.class', 'error');
    cy.get(selectorChildrenNames1).should('not.have.class', 'error');

    cy.get('pre.model-result').should('contain', genericFormGetJsonPart('childrenNames', ['Name 1', 'Name 2']));
    cy.get('.form-valid').should('exist');

    // Back to One Child

    cy.getSettled(`${selectorChildCount} .input-wrapper button:eq(1)`).click();

    cy.get(selectorChildName).should('exist');
    cy.get(selectorChildAge).should('exist');
    cy.get(selectorChildName).should('not.have.class', 'error');
    cy.get(selectorChildAge).should('not.have.class', 'error');


    cy.get('pre.model-result').should('contain', genericFormGetJsonPart('child_count', 1));
    cy.get('pre.model-result').should('contain', genericFormGetJsonPart('children', [{name: 'Test Child 1', age: 12}]));
    cy.get('.form-valid').should('exist');

  });

});
