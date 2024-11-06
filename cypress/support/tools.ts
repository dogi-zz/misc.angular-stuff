

export const genericFormGetJsonPart = (name: string, value: any)=>{
  const jsonString = JSON.stringify({[name] : value}, null, 2);
  const jsonStringLines = jsonString.split('\n');
  return jsonStringLines.slice(1, jsonStringLines.length -1).join('\n');
};

export const initFormData = (formDefinition: any, model: any)=>{
  cy.visit('http://localhost:5000/?page=form&form=edit');
  cy.get('#form-def-textarea').then(textArea => textArea.val(JSON.stringify(formDefinition, null, 2)));
  cy.get('#form-def-textarea').type(' ');
  cy.get('#input-value-textarea').then(textArea => textArea.val(JSON.stringify(model, null, 2)));
  cy.get('#input-value-textarea').type(' ');
  cy.get('#button-apply').click();

};
