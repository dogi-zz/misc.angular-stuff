/// <reference types="cypress" />

describe('generic-form-basics', () => {

  beforeEach(() => {
    cy.visit('http://localhost:5000/?page=form&form=form1');
  });

  it('Input String - simple', () => {
    const selector = '.form-by-def-control:contains("Name 1")';
    cy.get(selector).should('exist');

    cy.get('pre.model-result').should('contain', '"name_1": null');
    cy.get(`${selector} input`).type('Test Value 1').blur();
    cy.get('pre.model-result').should('contain', '"name_1": "Test Value 1",');
  });

  it('Input String - required', () => {
    const selector = '.form-by-def-control:contains("Name 2")';
    cy.get(selector).should('exist');

    cy.get(selector).should('have.class', 'error');
    cy.get(`${selector} .form-by-def-error`).should('contain', 'this is required');
    cy.get('pre.model-result').should('contain', '"name_2": null');

    cy.get(`${selector} input`,).type('Test Value 2');
    cy.get(selector).should('not.have.class', 'error');

    cy.get(`${selector} input`).blur();
    cy.get('pre.model-result').should('contain', '"name_2": "Test Value 2",');
  });

  it('Selection - required', () => {
    const selector = '.form-by-def-control:contains("Gender")';
    cy.get(selector).should('exist');

    cy.get(`${selector}`).should('have.class', 'error');
    cy.get(`${selector} .form-by-def-error`).should('contain', 'this is required');
    cy.get('pre.model-result').should('contain', '"gender": null');

    cy.get(`${selector} input`).click();
    cy.get(`${selector} .form-by-def-input-select-option:contains("female")`).click();
    cy.get('pre.model-result').should('contain', '"gender": 2');

    cy.get(`${selector} input`).click();
    cy.get(`${selector} .form-by-def-input-select-option:contains("unknown")`).click();
    cy.get('pre.model-result').should('contain', '"gender": false');
  });

  it('Selection - Open Close', () => {
    const selector = '.form-by-def-control:contains("Gender")';
    cy.get(selector).should('exist');

    cy.get(`${selector}`).should('have.class', 'error');
    cy.get(`${selector} .form-by-def-error`).should('contain', 'this is required');
    cy.get('pre.model-result').should('contain', '"gender": null');

    cy.get(`${selector} input`).click();
    cy.get(`${selector} .form-by-def-input-select-option`).should('be.visible');

    cy.get(`${selector} .input-wrapper button`).click();
    cy.get(`${selector} .form-by-def-input-select-option`).should('not.exist');

    cy.get(`${selector}`).should('have.class', 'error');
    cy.get(`${selector} .form-by-def-error`).should('contain', 'this is required');
    cy.get('pre.model-result').should('contain', '"gender": null');
  });

  it('Integer - type', () => {
    const selector = '.form-by-def-control:contains("Age")';
    cy.get(selector).should('exist');

    cy.get(`${selector}`).should('not.have.class', 'error');
    cy.get('pre.model-result').should('contain', '"age": null');

    cy.get(`${selector} input`).type('3');
    cy.get(`${selector}`).should('have.class', 'error');
    cy.get(`${selector} .form-by-def-error`).should('contain', 'The value has to be at least 18');

    cy.get(`${selector} input`).type('0');
    cy.get(`${selector}`).should('not.have.class', 'error');
    cy.get(`${selector} .form-by-def-error`).should('not.exist');

    cy.get(`${selector} input`).type('0');
    cy.get(`${selector}`).should('have.class', 'error');
    cy.get(`${selector} .form-by-def-error`).should('contain', 'The value has to be at most 99');

    cy.get(`${selector} input`).type('{backspace}');
    cy.get(`${selector}`).should('not.have.class', 'error');
    cy.get(`${selector} .form-by-def-error`).should('not.exist');

    cy.get('pre.model-result').should('contain', '"age": null');
    cy.get(`${selector} input`).blur();

    cy.get(`${selector}`).should('not.have.class', 'error');
    cy.get(`${selector} .form-by-def-error`).should('not.exist');
    cy.get('pre.model-result').should('contain', '"age": 30');

    cy.get(`${selector} .input-wrapper button:eq(0)`).click();
    cy.get(`${selector} .input-wrapper button:eq(0)`).click();

    cy.get('pre.model-result').should('contain', '"age": 32');

    cy.get(`${selector} .input-wrapper button:eq(1)`).click();

    cy.get(`${selector} input`).type('{backspace}{backspace}17').blur();

    cy.get(`${selector}`).should('have.class', 'error');
    cy.get(`${selector} .form-by-def-error`).should('contain', 'The value has to be at least 18');
    cy.get('pre.model-result').should('contain', '"age": 17');

    cy.get(`${selector} .input-wrapper button:eq(0)`).click();
    cy.get(`${selector} .form-by-def-error`).should('not.exist');
    cy.get('pre.model-result').should('contain', '"age": 18');

    cy.get(`${selector} .input-wrapper button:eq(0)`).click();
    cy.get(`${selector} .form-by-def-error`).should('not.exist');
    cy.get('pre.model-result').should('contain', '"age": 19');

    cy.get(`${selector} .input-wrapper button:eq(1)`).click();
    cy.get(`${selector} .input-wrapper button:eq(1)`).click();
    cy.get(`${selector} .form-by-def-error`).should('not.exist');
    cy.get('pre.model-result').should('contain', '"age": 18');

  });

  it('Float - non required', () => {
    const selector = '.form-by-def-control:contains("Weight 1")';
    cy.get(selector).should('exist');

    cy.get(`${selector}`).should('not.have.class', 'error');
    cy.get('pre.model-result').should('contain', '"weight_1": null');

    cy.get(`${selector} input`).type('79');
    cy.get(`${selector}`).should('not.have.class', 'error');
    cy.get(`${selector} .form-by-def-error`).should('not.exist');

    cy.get(`${selector} input`).blur();
    cy.get('pre.model-result').should('contain', '"weight_1": 79');

    cy.get(`${selector} input`).type('0');
    cy.get(`${selector}`).should('have.class', 'error');
    cy.get(`${selector} .form-by-def-error`).should('contain', 'The value has to be at most 100');

    cy.get(`${selector} input`).type('{backspace}');
    cy.get(`${selector}`).should('not.have.class', 'error');
    cy.get(`${selector} .form-by-def-error`).should('not.exist');

    cy.get(`${selector} input`).type('.1');
    cy.get(`${selector}`).should('not.have.class', 'error');
    cy.get(`${selector} .form-by-def-error`).should('not.exist');

    cy.get(`${selector} input`).blur();
    cy.get('pre.model-result').should('contain', '"weight_1": 79.1');

    cy.get(`${selector} input`).type('{backspace}{backspace}{backspace}{backspace}-1');
    cy.get(`${selector}`).should('have.class', 'error');
    cy.get(`${selector} .form-by-def-error`).should('contain', 'The value has to be at least 0');

    cy.get(`${selector} input`).blur();
    cy.get('pre.model-result').should('contain', '"weight_1": -1');
    cy.get(`${selector}`).should('have.class', 'error');
    cy.get(`${selector} .form-by-def-error`).should('contain', 'The value has to be at least 0');

  });


  it('Float - required', () => {
    const selector = '.form-by-def-control:contains("Weight 2")';
    cy.get(selector).should('exist');

    cy.get(`${selector}`).should('have.class', 'error');
    cy.get(`${selector} .form-by-def-error`).should('contain', 'this is required');
    cy.get('pre.model-result').should('contain', '"weight_2": null');

    cy.get(`${selector} input`).type('57');
    cy.get(`${selector}`).should('not.have.class', 'error');
    cy.get(`${selector} .form-by-def-error`).should('not.exist');

    cy.get(`${selector} input`).blur();
    cy.get('pre.model-result').should('contain', '"weight_2": 57');
  });


  it('Boolean - non required', () => {
    const selector = '.form-by-def-control:contains("Boolean 1")';
    cy.get(selector).should('exist');

    cy.get(`${selector}`).should('not.have.class', 'error');
    cy.get('pre.model-result').should('contain', '"bool_1": true');

    cy.get(`${selector} .form-by-def-input`).click();
    cy.get(`${selector}`).should('not.have.class', 'error');
    cy.get(`${selector} .form-by-def-error`).should('not.exist');
    cy.get('pre.model-result').should('contain', '"bool_1": false');

    cy.get(`${selector} .form-by-def-input`).click();
    cy.get(`${selector}`).should('not.have.class', 'error');
    cy.get(`${selector} .form-by-def-error`).should('not.exist');
    cy.get('pre.model-result').should('contain', '"bool_1": null');

    cy.get(`${selector} .form-by-def-input`).click();
    cy.get(`${selector}`).should('not.have.class', 'error');
    cy.get(`${selector} .form-by-def-error`).should('not.exist');
    cy.get('pre.model-result').should('contain', '"bool_1": true');

  });



  it('Boolean - required', () => {
    const selector = '.form-by-def-control:contains("Boolean 2")';
    cy.get(selector).should('exist');

    cy.get(`${selector}`).should('have.class', 'error');
    cy.get(`${selector} .form-by-def-error`).should('contain', 'this is required');
    cy.get('pre.model-result').should('contain', '"bool_2": null');

    cy.get(`${selector} .form-by-def-input`).click();
    cy.get(`${selector}`).should('not.have.class', 'error');
    cy.get(`${selector} .form-by-def-error`).should('not.exist');
    cy.get('pre.model-result').should('contain', '"bool_2": true');

    cy.get(`${selector} .form-by-def-input`).click();
    cy.get(`${selector}`).should('not.have.class', 'error');
    cy.get(`${selector} .form-by-def-error`).should('not.exist');
    cy.get('pre.model-result').should('contain', '"bool_2": false');

    cy.get(`${selector} .form-by-def-input`).click();
    cy.get(`${selector}`).should('not.have.class', 'error');
    cy.get(`${selector} .form-by-def-error`).should('not.exist');
    cy.get('pre.model-result').should('contain', '"bool_2": true');
  });


});
