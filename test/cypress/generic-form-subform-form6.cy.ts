/// <reference types="cypress" />

import {selectInputByCaption, selectObjectByCaption, shouldContainJsonItem} from '../../cypress/support/generic-form-helper';

describe('generic-form-subform', () => {

  beforeEach(() => {
    cy.visit('http://localhost:5000/#/form/form6');
  });

  it('Sumform Basics', () => {


    const selector = selectInputByCaption('Contitional Subform');
    cy.get(selector).should('exist');

    const object1 = selectObjectByCaption('Selective Form 1');
    cy.get(object1).should('not.exist');

    const selectorAge1 = `${object1} ${selectInputByCaption('Age 1')}`;
    cy.get(selectorAge1).should('not.exist');

    const selectorExtString = `${object1} ${selectInputByCaption('Extended String')}`;
    cy.get(selectorExtString).should('not.exist');

    const selectorAge2 = selectInputByCaption('Age 2');
    cy.get(selectorAge2).should('not.exist');

    cy.get(`${selector}`).then(withinSubject => {
      cy.get('input', {withinSubject}).clear().type('form-1 ');
      cy.get('.generic-form-input-select-option:contains("form-1"):first', {withinSubject}).click();

      cy.get(object1).should('exist');
      cy.get(selectorAge1).should('exist');
      cy.get(selectorExtString).should('not.exist');
      cy.get(selectorAge2).should('not.exist');
      cy.get('pre.model-result').should(shouldContainJsonItem("age1", null));

      cy.get(`${selectorAge1} input`).type('12').blur();
      cy.get('pre.model-result').should(shouldContainJsonItem("age1", 12));

      cy.get('input', {withinSubject}).clear().type('form-1 ');
      cy.get('.generic-form-input-select-option:contains("form-1-extended")', {withinSubject}).click();

      cy.get(selectorExtString).should('exist');

      cy.get('pre.model-result').should(shouldContainJsonItem("age1", 12));

      cy.get('input', {withinSubject}).clear().type('form-2');
      cy.get('.generic-form-input-select-option:contains("form-2")', {withinSubject}).click();
      cy.get(selectorAge1).should('not.exist');
      cy.get(selectorAge2).should('exist');

      cy.get(`${selectorAge2} input`).type('23').blur();
      cy.get('pre.model-result').should(shouldContainJsonItem("age2", 23));

      cy.get('input', {withinSubject}).clear().type('form-1 ');
      cy.get('.generic-form-input-select-option:contains("form-1-extended")', {withinSubject}).click();

      cy.get(selectorAge1).should('exist');
      cy.get(selectorAge2).should('not.exist');

      cy.get('pre.model-result').should(shouldContainJsonItem("age1", 12));
    });

  });



});
