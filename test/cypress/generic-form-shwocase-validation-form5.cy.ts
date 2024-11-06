/// <reference types="cypress" />

import {selectInputByCaption} from "../../cypress/support/generic-form-helper";

const setValidationFunction = (path: string, code: string) => {
  cy.get('generic-form-showcase').then(el => console.info(el, (el[0] as any)._component_.setValidationFunction(path, code)));
}

describe('generic-form-observable', () => {

  beforeEach(() => {
    cy.visit('http://localhost:5000/#/form/form5');
  });

  it('Selection - Sets Value', () => {
    let selector = selectInputByCaption('Child');
    cy.get(selector).should('exist');

    cy.get(`.generic-form-error-message`).should('not.exist');

    // Sync Messages
    // cy.get('.function[function_path="child_1"] .code input').then(input => input.val('return "some error"'));

    selector = `${selectInputByCaption('Child')}`;
    setValidationFunction('child_1', 'return "some error"');
    cy.get(selector).should('have.class', 'generic-form-error');
    setValidationFunction('child_1', '// nothing');
    cy.get(selector).should('not.have.class', 'generic-form-error');


    selector = `${selectInputByCaption('Child')} ${selectInputByCaption('Name')}`;
    setValidationFunction('child_1.name', 'return "some error"');
    cy.get(selector).should('have.class', 'generic-form-error');
    setValidationFunction('child_1.name', '// nothing');
    cy.get(selector).should('not.have.class', 'generic-form-error');

    selector = `${selectInputByCaption('Child')} ${selectInputByCaption('Inner Child')}`;
    setValidationFunction('child_1.inner_child', 'return "some error"');
    cy.get(selector).should('have.class', 'generic-form-error');
    setValidationFunction('child_1.inner_child', '// nothing');
    cy.get(selector).should('not.have.class', 'generic-form-error');

    selector = `${selectInputByCaption('Child')} ${selectInputByCaption('Inner Child')} ${selectInputByCaption('Pos X')}`;
    setValidationFunction('child_1.inner_child.posX', 'return "some error"');
    cy.get(selector).should('have.class', 'generic-form-error');
    setValidationFunction('child_1.inner_child.posX', '// nothing');
    cy.get(selector).should('not.have.class', 'generic-form-error');

    selector = `${selectInputByCaption('String Array')}`;
    setValidationFunction('string_array', 'return "some error"');
    cy.get(selector).should('have.class', 'generic-form-error');
    setValidationFunction('string_array', '// nothing');
    cy.get(selector).should('not.have.class', 'generic-form-error');

    let selector1 = `${selectInputByCaption('String Array')} .generic-form-control:eq(0)`;
    let selector2 = `${selectInputByCaption('String Array')} .generic-form-control:eq(1)`;
    setValidationFunction('string_array.#', 'return "some error"');
    cy.get(selector1).should('have.class', 'generic-form-error');
    cy.get(selector2).should('have.class', 'generic-form-error');
    setValidationFunction('string_array.#', 'return value === "bar" ? "no bar" : null');
    cy.get(selector1).should('not.have.class', 'generic-form-error');
    cy.get(selector2).should('have.class', 'generic-form-error');
    setValidationFunction('string_array.#', '// nothing');
    cy.get(selector1).should('not.have.class', 'generic-form-error');
    cy.get(selector2).should('not.have.class', 'generic-form-error');


    selector1 = `${selectInputByCaption('Object Array')} .generic-form-control:has(generic-form-input-object):eq(0)`;
    selector2 = `${selectInputByCaption('Object Array')} .generic-form-control:has(generic-form-input-object):eq(1)`;
    setValidationFunction('object_array.#', 'return value.num > 0 ? "only zero" : null');
    cy.get(selector1).should('not.have.class', 'generic-form-error');
    cy.get(selector2).should('have.class', 'generic-form-error');
    setValidationFunction('object_array.#', '// nothing');
    cy.get(selector1).should('not.have.class', 'generic-form-error');
    cy.get(selector2).should('not.have.class', 'generic-form-error');


  });


});
