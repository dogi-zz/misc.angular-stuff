/// <reference types="cypress" />

import {initForm} from "../support/generic-form-helper";

describe('generic-form-subform', () => {

  beforeEach(() => {
    cy.visit('http://localhost:5000/?page=form&form=form2');
  });

  it('Non Required Child', () => {

    initForm({
      child_1: {
        caption: 'Child 1', type: 'object',
        properties: {
          posX: {
            caption: 'Pos X', type: 'integer',
            min: 0, help: 'validation > 0',
          },
          posY: {
            caption: 'Pos Y', type: 'integer',
            min: 0, help: 'validation > 0',
          },
        },
        help: 'none required nested object',
      },
    }, {
      none: '123',
    });

    const selector = '.generic-form-control:contains("Child 1")';
    cy.get(selector).should('exist');

    cy.get(`${selector} .generic-form-add-button`).should('exist');
    cy.get('pre.model-result').should('contain', '"child_1": null');

    cy.getSettled(`${selector} .generic-form-add-button img:visible`).click();

    cy.get('pre.model-result').should('contain', [
      '"child_1": {',
      '  "posX": null,',
      '  "posY": null',
      '}',
    ].join('\n  '));

    const childSelector = '.generic-form-control:contains("Pos X")';

    cy.getSettled(`${selector} ${childSelector} input`).type('-1').blur();
    cy.get(`${selector} ${childSelector}`).should('have.class', 'error');

    cy.getSettled(`${selector} ${childSelector} input`).type('{backspace}{backspace}5').blur();
    cy.get(`${selector} ${childSelector}`).should('not.have.class', 'error');

    cy.get('pre.model-result').should('contain', [
      '"child_1": {',
      '  "posX": 5,',
      '  "posY": null',
      '}',
    ].join('\n  '));

    cy.getSettled(`${selector} .generic-form-remove-button img:visible`).click();
    cy.get('pre.model-result').should('contain', '"child_1": null');

  });

  it('Required Child', () => {

    initForm({
      child_2: {
        caption: 'Child 2', type: 'object',
        required: true,
        properties: {
          posX: {
            caption: 'Pos X', type: 'integer',
            min: 0, help: 'validation > 0',
          },
          posY: {
            caption: 'Pos Y', type: 'integer',
            min: 0, help: 'validation > 0',
          },
        },
        help: 'required nested object',
      },
    }, {
      none: '123',
    });

    const selector = '.generic-form-control:contains("Child 2")';
    cy.get(selector).should('exist');

    cy.get(`${selector} .generic-form-remove-button button`).should('not.exist');

    cy.get('pre.model-result').should('contain', [
      '"child_2": {',
      '  "posX": null,',
      '  "posY": null',
      '}',
    ].join('\n  '));

  });

  it('Inline Child', () => {

    initForm({
      child_4: {
        type: 'object',
        inline: true,
        properties: {
          posX: {
            caption: 'Inline Child Pos X', type: 'integer',
            min: 0, help: 'validation > 0',
          },
          posY: {
            caption: 'Inline Child Pos Y', type: 'integer',
            min: 0, help: 'validation > 0',
          },
        },
      },
    }, {
      none: '123',
    });


    const selector = '.generic-form-control:contains("Inline Child Pos X")';
    cy.get(selector).should('exist');

    cy.get('pre.model-result').should('contain', [
      '"child_4": {',
      '  "posX": null,',
      '  "posY": null',
      '}',
    ].join('\n  '));

    cy.getSettled(`${selector} input`).type('-1').blur();
    cy.get(`${selector}`).should('have.class', 'error');

    cy.getSettled(`${selector} input`).type('{backspace}{backspace}5').blur();
    cy.get(`${selector}`).should('not.have.class', 'error');

    cy.get('pre.model-result').should('contain', [
      '"child_4": {',
      '  "posX": 5,',
      '  "posY": null',
      '}',
    ].join('\n  '));

  });

  it.only('Inline Subform', () => {

    initForm({
      subform1: {
        type: 'subform',
        inline: true,
        content: {
          s1_name: {
            caption: 'Subform Name', type: 'text',
          },
          s1_age: {
            caption: 'Subform Age', type: 'integer',
            min: 18,
            max: 99,
            help: '18 <= age <= 99',
          },

        },
      },
    }, {
      none: '123',
    });


    const selector1 = '.generic-form-control:contains("Subform Name")';
    const selector2 = '.generic-form-control:contains("Subform Age")';
    cy.get(selector1).should('exist');
    cy.get(selector2).should('exist');

    cy.get('pre.model-result').should('contain', '"s1_name": null');
    cy.get('pre.model-result').should('contain', '"s1_age": null');

    cy.getSettled(`${selector2} input`).type('-1').blur();
    cy.get(`${selector2}`).should('have.class', 'error');

    cy.getSettled(`${selector2} input`).type('{backspace}{backspace}57').blur();
    cy.get(`${selector2}`).should('not.have.class', 'error');

    cy.get('pre.model-result').should('contain', '"s1_name": null');
    cy.get('pre.model-result').should('contain', '"s1_age": 57');

    cy.getSettled(`${selector1} input`).type('Max Mustermann').blur();
    cy.get(`${selector1}`).should('not.have.class', 'error');
    cy.get(`${selector2}`).should('not.have.class', 'error');

    cy.get('pre.model-result').should('contain', '"s1_name": "Max Mustermann"');
    cy.get('pre.model-result').should('contain', '"s1_age": 57');

  });

});
