import {FormDefinition} from '../../src/app/generic-form/generic-form.data';


export const initForm = (formDef: FormDefinition , model: any)=>{

  cy.get('.angular-stuff-menu:contains("Edit Form")').click();
  cy.get('#form-def-textarea').clear().invoke('val',   JSON.stringify(formDef, null, 2)).type(' ');
  cy.get('#input-value-textarea').clear().invoke('val',   JSON.stringify(model, null, 2)).type(' ');
  cy.get('.angular-stuff-menu:contains("Apply Changes")').click();

};
