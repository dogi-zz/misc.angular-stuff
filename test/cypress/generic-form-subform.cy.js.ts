/// <reference types="cypress" />

import {initForm} from '../../cypress/support/generic-form-helper';

describe('generic-form-subform', () => {

  beforeEach(() => {
    cy.visit('http://localhost:5000/?page=form&form=form2');
  });

  it('Inline Form non required', () => {

    initForm({
      child_1: {
        type: 'subform', inline: true,
        content: {
          posX: {
            caption: 'Pos X', type: 'integer',
            min: 0, help: 'validation > 0',
          },
          posY: {
            caption: 'Pos Y', type: 'integer',
            min: 0, help: 'validation > 0',
          },
        },
      },
    }, {
      posX: 123,
    });


    const selector1 = '.generic-form-control:contains("Pos X")';
    cy.get(selector1).should('exist');

    const selector2 = '.generic-form-control:contains("Pos Y")';
    cy.get(selector2).should('exist');

    cy.get(`${selector1}`).should('not.have.class', 'generic-form-error');
    cy.get(`${selector1} input`).should('have.value', '123');

    cy.get(`${selector2}`).should('not.have.class', 'generic-form-error');
    cy.get(`${selector2} input`).should('have.value', '');

    cy.get('pre.model-result').should('contain', [
      '{',
      '  "posX": 123,',
      '  "posY": null',
      '}',
    ].join('\n'));


    cy.getSettled(`${selector2} input`).type('234');
    cy.get(`${selector2}`).should('not.have.class', 'generic-form-error');
    cy.get(`${selector2} input`).should('have.value', '234');

    cy.get('pre.model-result').should('contain', [
      '{',
      '  "posX": 123,',
      '  "posY": 234',
      '}',
    ].join('\n'));


  });

  it('Inline Form required', () => {

    initForm({
      child_1: {
        type: 'subform', inline: true,
        content: {
          posX: {
            caption: 'Pos X', type: 'integer', required: true,
            min: 0, help: 'validation > 0',
          },
          posY: {
            caption: 'Pos Y', type: 'integer', required: true,
            min: 0, help: 'validation > 0',
          },
        },
      },
    }, {
      posX: 123,
    });


    const selector1 = '.generic-form-control:contains("Pos X")';
    cy.get(selector1).should('exist');

    const selector2 = '.generic-form-control:contains("Pos Y")';
    cy.get(selector2).should('exist');

    cy.get(`${selector1}`).should('not.have.class', 'generic-form-error');
    cy.get(`${selector1} input`).should('have.value', '123');

    cy.get(`${selector2}`).should('have.class', 'generic-form-error');
    cy.get(`${selector2} input`).should('have.value', '');

    cy.get('.form-invalid').should('exist');

    cy.get('pre.model-result').should('contain', [
      '{',
      '  "posX": 123,',
      '  "posY": null',
      '}',
    ].join('\n'));


    cy.getSettled(`${selector2} input`).type('234');
    cy.get(`${selector2}`).should('not.have.class', 'generic-form-error');
    cy.get(`${selector2} input`).should('have.value', '234');

    cy.get('.form-invalid').should('not.exist');

    cy.get('pre.model-result').should('contain', [
      '{',
      '  "posX": 123,',
      '  "posY": 234',
      '}',
    ].join('\n'));


  });

  it('Inline Form contitional required', () => {

    initForm({
      num: {type: 'integer', caption: 'CheckNum'},
      child_1: {
        type: 'subform', inline: true,
        content: {
          posX: {
            caption: 'Pos X', type: 'integer', required: true,
            min: 0, help: 'validation > 0',
          },
          posY: {
            caption: 'Pos Y', type: 'integer', required: true,
            min: 0, help: 'validation > 0',
            condition: {path: 'num', condition: 'eq', value: 15},
          },
        },
      },
    }, {
      posX: 123,
    });


    const selectorNum = '.generic-form-control:contains("CheckNum")';
    cy.get(selectorNum).should('exist');

    const selector1 = '.generic-form-control:contains("Pos X")';
    cy.get(selector1).should('exist');

    const selector2 = '.generic-form-control:contains("Pos Y")';
    cy.get(selector2).should('not.exist');

    cy.get(`${selector1}`).should('not.have.class', 'generic-form-error');
    cy.get(`${selector1} input`).should('have.value', '123');

    cy.get('.form-invalid').should('not.exist');


    cy.get('pre.model-result').should('contain', [
      '{',
      '  "num": null,',
      '  "posX": 123',
      '}',
    ].join('\n'));

    cy.getSettled(`${selectorNum} input`).type('15').blur();
    cy.get(selector2).should('exist');

    cy.get(`${selector2}`).should('have.class', 'generic-form-error');
    cy.get(`${selector2} input`).should('have.value', '');

    cy.get('.form-invalid').should('exist');

    cy.get('pre.model-result').should('contain', [
      '{',
      '  "num": 15,',
      '  "posX": 123,',
      '  "posY": null',
      '}',
    ].join('\n'));


    cy.getSettled(`${selector2} input`).type('234');
    cy.get(`${selector2}`).should('not.have.class', 'generic-form-error');
    cy.get(`${selector2} input`).should('have.value', '234');

    cy.get('.form-invalid').should('not.exist');

    cy.get('pre.model-result').should('contain', [
      '{',
      '  "num": 15,',
      '  "posX": 123,',
      '  "posY": 234',
      '}',
    ].join('\n'));


  });

 it.only('Not Inline Form contitional required', () => {

    initForm({
      num: {type: 'integer', caption: 'CheckNum'},
      child_1: {
        type: 'subform', caption: 'Subform',
        content: {
          posX: {
            caption: 'Pos X', type: 'integer', required: true,
            min: 0, help: 'validation > 0',
          },
          posY: {
            caption: 'Pos Y', type: 'integer', required: true,
            min: 0, help: 'validation > 0',
            condition: {path: 'num', condition: 'eq', value: 15},
          },
        },
      },
    }, {
      posX: 123,
    });


    const selectorNum = '.generic-form-control:contains("CheckNum")';
    cy.get(selectorNum).should('exist');

    const selector1 = '.generic-form-control:contains("Pos X")';
    cy.get(selector1).should('exist');

    const selector2 = '.generic-form-control:contains("Pos Y")';
    cy.get(selector2).should('not.exist');

    cy.get(`${selector1}`).should('not.have.class', 'generic-form-error');
    cy.get(`${selector1} input`).should('have.value', '123');

    cy.get('.form-invalid').should('not.exist');


    cy.get('pre.model-result').should('contain', [
      '{',
      '  "num": null,',
      '  "posX": 123',
      '}',
    ].join('\n'));

    cy.getSettled(`${selectorNum} input`).type('15').blur();
    cy.get(selector2).should('exist');

    cy.get(`${selector2}`).should('have.class', 'generic-form-error');
    cy.get(`${selector2} input`).should('have.value', '');

    cy.get('.form-invalid').should('exist');

    cy.get('pre.model-result').should('contain', [
      '{',
      '  "num": 15,',
      '  "posX": 123,',
      '  "posY": null',
      '}',
    ].join('\n'));


    cy.getSettled(`${selector2} input`).type('234');
    cy.get(`${selector2}`).should('not.have.class', 'generic-form-error');
    cy.get(`${selector2} input`).should('have.value', '234');

    cy.get('.form-invalid').should('not.exist');

    cy.get('pre.model-result').should('contain', [
      '{',
      '  "num": 15,',
      '  "posX": 123,',
      '  "posY": 234',
      '}',
    ].join('\n'));


  });


});
