/// <reference types="cypress" />

describe('generic-form-arrays', () => {

  beforeEach(() => {
    cy.visit('http://localhost:5000/?page=form&form=form3');
  });

  it('Simple Required Array', () => {
    const selector = '.generic-form-control:contains("Strings 1")';
    cy.get(selector).should('exist');

    cy.get(`${selector} .generic-form-remove-button button`).should('not.exist');
    cy.get(`${selector} .error`).should('not.exist');

    cy.get(`${selector} input`).should('have.length', 0);
    cy.get('pre.model-result').should('contain', [
      '"strings_1": []',
    ].join('\n  '));

    cy.getSettled(`${selector} .generic-form-input-array-add-button img`).click();

    cy.get(`${selector} input`).should('have.length', 1);
    cy.get('pre.model-result').should('contain', [
      '"strings_1": [',
      '  null',
      ']'
    ].join('\n  '));

    cy.getSettled(`${selector} .generic-form-input-array-add-button img`).click();

    cy.get(`${selector} input`).should('have.length', 2);
    cy.get('pre.model-result').should('contain', [
      '"strings_1": [',
      '  null,',
      '  null',
      ']'
    ].join('\n  '));

    cy.getSettled(`${selector} input:eq(1)`).type('foo bar').blur();

    cy.get('pre.model-result').should('contain', [
      '"strings_1": [',
      '  null,',
      '  "foo bar"',
      ']'
    ].join('\n  '));

    cy.getSettled(`${selector} .generic-form-input-array-item:eq(0) .generic-form-input-array-remove-button img`).click();

    cy.get(`${selector} input`).should('have.length', 1);
    cy.get('pre.model-result').should('contain', [
      '"strings_1": [',
      '  "foo bar"',
      ']'
    ].join('\n  '));

  });

  it('Array with Min/Max Value', () => {
    const selector = '.generic-form-control:contains("Strings 2")';

    cy.get(selector).should('exist');
    cy.get(selector).should('have.class', 'error');

    cy.getSettled(`${selector} input:eq(1)`).type('foo');

    cy.get(`${selector} input`).should('have.length', 2);
    cy.get('pre.model-result').should('contain', [
      '"strings_2": [',
      '  "element 1",',
      '  "foo"',
      ']'
    ].join('\n  '));
    cy.get(`${selector} input:eq(0)`).should('have.value', 'element 1');
    cy.get(`${selector} input:eq(1)`).should('have.value', 'foo');

    cy.get(selector).should('have.class', 'error');

    cy.getSettled(`${selector} .generic-form-input-array-add-button img`).click();

    cy.get(`${selector} input`).should('have.length', 3);
    cy.get('pre.model-result').should('contain', [
      '"strings_2": [',
      '  "element 1",',
      '  "foo",',
      '  null',
      ']'
    ].join('\n  '));

    cy.get(selector).should('not.have.class', 'error');

    cy.getSettled(`${selector} .generic-form-input-array-add-button img`).click();

    cy.get(`${selector} input`).should('have.length', 4);
    cy.get('pre.model-result').should('contain', [
      '"strings_2": [',
      '  "element 1",',
      '  "foo",',
      '  null,',
      '  null',
      ']'
    ].join('\n  '));

    cy.get(selector).should('not.have.class', 'error');

    cy.get(`${selector} .generic-form-input-array-add-button img`).should('not.exist');

  });

  it('Array with Required String', () => {
    const selector = '.generic-form-control:contains("Strings 3")';

    cy.get(selector).should('exist');
    cy.get(selector).should('not.have.class', 'error');

    cy.get(`${selector} input`).should('have.length', 2);
    cy.get('pre.model-result').should('contain', [
      '"strings_3": [',
      '  "wide element 1",',
      '  "wide element 2"',
      ']'
    ].join('\n  '));
    cy.get(`${selector} input:eq(0)`).should('have.value', 'wide element 1');
    cy.get(`${selector} input:eq(1)`).should('have.value', 'wide element 2');

    cy.get(`${selector} .generic-form-caption:visible:first .generic-form-error`).should('not.exist');
    cy.get(`${selector} .generic-form-input-array-item:eq(0) .generic-form-error`).should('not.exist');
    cy.get(`${selector} .generic-form-input-array-item:eq(1) .generic-form-error`).should('not.exist');

    cy.getSettled(`${selector} .generic-form-input-array-add-button img`).click();


    cy.get(`${selector} input`).should('have.length', 3);
    cy.get('pre.model-result').should('contain', [
      '"strings_3": [',
      '  "wide element 1",',
      '  "wide element 2",',
      '  null',
      ']'
    ].join('\n  '));

    cy.get(`${selector} .generic-form-caption:visible:first .generic-form-error`).should('not.exist');
    cy.get(`${selector} .generic-form-input-array-item:eq(0) .generic-form-error`).should('not.exist');
    cy.get(`${selector} .generic-form-input-array-item:eq(1) .generic-form-error`).should('not.exist');
    cy.get(`${selector} .generic-form-input-array-item:eq(2) .generic-form-error`).should('exist');

    cy.getSettled(`${selector} input:eq(0)`).type(' test');

    cy.get(`${selector} input`).should('have.length', 3);
    cy.get('pre.model-result').should('contain', [
      '"strings_3": [',
      '  "wide element 1 test",',
      '  "wide element 2",',
      '  null',
      ']'
    ].join('\n  '));

    cy.get(`${selector} .generic-form-caption:visible:first .generic-form-error`).should('not.exist');
    cy.get(`${selector} .generic-form-input-array-item:eq(0) .generic-form-error`).should('not.exist');
    cy.get(`${selector} .generic-form-input-array-item:eq(1) .generic-form-error`).should('not.exist');
    cy.get(`${selector} .generic-form-input-array-item:eq(2) .generic-form-error`).should('exist');


    cy.getSettled(`${selector} input:eq(2)`).type('test');

    cy.get('pre.model-result').should('contain', [
      '"strings_3": [',
      '  "wide element 1 test",',
      '  "wide element 2",',
      '  "test"',
      ']'
    ].join('\n  '));

    cy.get(`${selector} .generic-form-caption:visible:first .generic-form-error`).should('not.exist');
    cy.get(`${selector} .generic-form-input-array-item:eq(0) .generic-form-error`).should('not.exist');
    cy.get(`${selector} .generic-form-input-array-item:eq(1) .generic-form-error`).should('not.exist');
    cy.get(`${selector} .generic-form-input-array-item:eq(2) .generic-form-error`).should('not.exist');

  });

  it('Check Array Object', () => {
    const selector = '.generic-form-control:contains("Objects 1")';

    cy.get(selector).should('exist');
    cy.get(selector).should('not.have.class', 'error');

    cy.getSettled(`${selector} input:eq(1)`).type('foo');

    cy.get(`${selector} input`).should('have.length', 2);
    cy.get('pre.model-result').should('contain', [
      '"objects_1": [',
      '  {',
      '    "posX": 1,',
      '    "posY": null',
      '  }',
      ']'
    ].join('\n  '));

    cy.get(`${selector} .generic-form-input-array-item:eq(0) .generic-form-control:contains("Inline Child Pos X")`).should('not.have.class', 'error');
    cy.get(`${selector} .generic-form-input-array-item:eq(0) .generic-form-control:contains("Inline Child Pos Y")`).should('have.class', 'error');

    cy.getSettled(`${selector} .generic-form-input-array-item:eq(0) .generic-form-control:contains("Inline Child Pos Y")  input:eq(0)`).type('2');

    cy.get(`${selector} input`).should('have.length', 2);
    cy.get('pre.model-result').should('contain', [
      '"objects_1": [',
      '  {',
      '    "posX": 1,',
      '    "posY": 2',
      '  }',
      ']'
    ].join('\n  '));

    cy.get(`${selector} .generic-form-input-array-item:eq(0) .generic-form-control:contains("Inline Child Pos X")`).should('not.have.class', 'error');
    cy.get(`${selector} .generic-form-input-array-item:eq(0) .generic-form-control:contains("Inline Child Pos Y")`).should('not.have.class', 'error');

    cy.get(`${selector} .generic-form-input-array-item:eq(0) .generic-form-remove-button`).should('not.exist');

  });

  it('Add or Remove Non Required Array', () => {
    const selector = '.generic-form-control:contains("Arrays 1") .generic-form-input-array-item:eq(0)';

    cy.get(selector).should('exist');
    cy.get(selector).should('not.have.class', 'error');

    cy.get(`${selector} input`).should('have.length', 4);
    cy.get('pre.model-result').should('contain', [
      '"array_1": [',
      '  [',
      '    "text 1",',
      '    "text 2",',
      '    null,',
      '    "text 3"',
      '  ],',
      '  [',
      '    "text 4"',
      '  ]',
      ']'
    ].join('\n  '));
    cy.get(`${selector} .generic-form-remove-button`).should('be.visible');
    cy.get(`${selector} .generic-form-add-button`).should('not.exist');

    cy.getSettled(`${selector} .generic-form-remove-button img:visible`).click();

    cy.get(`${selector} input`).should('have.length', 0);
    cy.get('pre.model-result').should('contain', [
      '"array_1": [',
      '  null,',
      '  [',
      '    "text 4"',
      '  ]',
      ']'
    ].join('\n  '));
    cy.get(`${selector} .generic-form-remove-button`).should('not.exist');
    cy.get(`${selector} .generic-form-add-button`).should('be.visible');

    cy.getSettled(`${selector} .generic-form-add-button img:visible`).click();

    cy.get('pre.model-result').should('contain', [
      '"array_1": [',
      '  [],',
      '  [',
      '    "text 4"',
      '  ]',
      ']'
    ].join('\n  '));
    cy.get(`${selector} .generic-form-remove-button`).should('be.visible');
    cy.get(`${selector} .generic-form-add-button`).should('not.exist');

  });

  it('Add or Remove Non Required Object', () => {
    const selector = '.generic-form-control:contains("Arrays 2") .generic-form-input-array-item:eq(0)';

    cy.get(selector).should('exist');
    cy.get(selector).should('not.have.class', 'error');

    cy.get(`${selector} input`).should('have.length', 3);
    cy.get('pre.model-result').should('contain', [
      '"array_2": [',
      '  [',
      '    {',
      '      "value": 123',
      '    },',
      '    {',
      '      "value": 234',
      '    },',
      '    null,',
      '    {',
      '      "value": 345',
      '    }',
      '  ],',
      '  [',
      '    {',
      '      "value": 456',
      '    }',
      '  ]',
      ']'
    ].join('\n  '));

    cy.get(`${selector} .generic-form-input-array-item:eq(0) .generic-form-remove-button`).should('be.visible');
    cy.get(`${selector} .generic-form-input-array-item:eq(1) .generic-form-remove-button`).should('be.visible');
    cy.get(`${selector} .generic-form-input-array-item:eq(2) .generic-form-remove-button`).should('not.exist');
    cy.get(`${selector} .generic-form-input-array-item:eq(3) .generic-form-remove-button`).should('be.visible');

    cy.get(`${selector} .generic-form-input-array-item:eq(0) .generic-form-add-button`).should('not.exist');
    cy.get(`${selector} .generic-form-input-array-item:eq(1) .generic-form-add-button`).should('not.exist');
    cy.get(`${selector} .generic-form-input-array-item:eq(2) .generic-form-add-button`).should('be.visible');
    cy.get(`${selector} .generic-form-input-array-item:eq(3) .generic-form-add-button`).should('not.exist');


    cy.getSettled(`${selector} .generic-form-input-array-item:eq(1) .generic-form-input-array-remove-button img`).click();

    cy.get(`${selector} input`).should('have.length', 2);
    cy.get('pre.model-result').should('contain', [
      '"array_2": [',
      '  [',
      '    {',
      '      "value": 123',
      '    },',
      '    null,',
      '    {',
      '      "value": 345',
      '    }',
      '  ],',
      '  [',
      '    {',
      '      "value": 456',
      '    }',
      '  ]',
      ']'
    ].join('\n  '));

    cy.get(`${selector} .generic-form-input-array-item:eq(0) .generic-form-remove-button`).should('be.visible');
    cy.get(`${selector} .generic-form-input-array-item:eq(1) .generic-form-remove-button`).should('not.exist');
    cy.get(`${selector} .generic-form-input-array-item:eq(2) .generic-form-remove-button`).should('be.visible');

    cy.get(`${selector} .generic-form-input-array-item:eq(0) .generic-form-add-button`).should('not.exist');
    cy.get(`${selector} .generic-form-input-array-item:eq(1) .generic-form-add-button`).should('be.visible');
    cy.get(`${selector} .generic-form-input-array-item:eq(2) .generic-form-add-button`).should('not.exist');


    cy.getSettled(`${selector} .generic-form-input-array-item:eq(1) .generic-form-add-button img:visible`).click();

    cy.get(`${selector} input`).should('have.length', 3);
    cy.get('pre.model-result').should('contain', [
      '"array_2": [',
      '  [',
      '    {',
      '      "value": 123',
      '    },',
      '    {',
      '      "value": null',
      '    },',
      '    {',
      '      "value": 345',
      '    }',
      '  ],',
      '  [',
      '    {',
      '      "value": 456',
      '    }',
      '  ]',
      ']'
    ].join('\n  '));

    cy.get(`${selector} .generic-form-input-array-item:eq(1) .generic-form-remove-button`).should('be.visible');
    cy.get(`${selector} .generic-form-input-array-item:eq(1) .generic-form-add-button`).should('not.exist');

    cy.getSettled(`${selector} .generic-form-input-array-item:eq(1) input`).type('55');

    cy.get('pre.model-result').should('contain', [
      '"array_2": [',
      '  [',
      '    {',
      '      "value": 123',
      '    },',
      '    {',
      '      "value": 55',
      '    },',
      '    {',
      '      "value": 345',
      '    }',
      '  ],',
      '  [',
      '    {',
      '      "value": 456',
      '    }',
      '  ]',
      ']'
    ].join('\n  '));

    cy.get(`${selector} .generic-form-input-array-item:eq(0) .generic-form-remove-button`).should('be.visible');
    cy.get(`${selector} .generic-form-input-array-item:eq(0) .generic-form-add-button`).should('not.exist');
    cy.get(`${selector} .generic-form-input-array-item:eq(1) .generic-form-remove-button`).should('be.visible');
    cy.get(`${selector} .generic-form-input-array-item:eq(1) .generic-form-add-button`).should('not.exist');

    cy.getSettled(`${selector} .generic-form-input-array-item:eq(0) .generic-form-remove-button img:visible`).click();


    cy.get('pre.model-result').should('contain', [
      '"array_2": [',
      '  [',
      '    null,',
      '    {',
      '      "value": 55',
      '    },',
      '    {',
      '      "value": 345',
      '    }',
      '  ],',
      '  [',
      '    {',
      '      "value": 456',
      '    }',
      '  ]',
      ']'
    ].join('\n  '));

    cy.get(`${selector} .generic-form-input-array-item:eq(0) .generic-form-remove-button`).should('not.exist');
    cy.get(`${selector} .generic-form-input-array-item:eq(0) .generic-form-add-button`).should('be.visible');
    cy.get(`${selector} .generic-form-input-array-item:eq(1) .generic-form-remove-button`).should('be.visible');
    cy.get(`${selector} .generic-form-input-array-item:eq(1) .generic-form-add-button`).should('not.exist');

  });


});
