import {FormDefinition} from '../../libs/generic-form/generic-form-definition';


export const initForm = (formDef: FormDefinition, model: any) => {
  cy.get('button.toggle-button:contains("edit form")').click();
  cy.get('button.toggle-button:contains("edit input")').click();
  cy.get('json-editor').should((el: any) => {
    if (el.length !== 2) {
      throw new Error("No json-editor tag Found");
    }
    if (el[0].__component__.name !== 'form') {
      throw new Error("json-editor 'form' not found");
    }
    if (el[1].__component__.name !== 'model') {
      throw new Error("json-editor 'model' not found");
    }
    el[0].__component__.jsonStringChange.emit(JSON.stringify(formDef));
    el[1].__component__.jsonStringChange.emit(JSON.stringify(model));
  });
  cy.wait(100);
  cy.get('button.toggle-button:contains("edit form")').click();
  cy.get('button.toggle-button:contains("edit input")').click();
};


export const selectObjectByCaption = (caption: string) => {
  return `.generic-form-input-object:has(.generic-form-title:contains("${caption}"))`;
};

export const selectInputByCaption = (caption: string) => {
  return `.generic-form-control:has(.generic-form-title:contains("${caption}"))`;
};

export const selectAddButton = () => {
  return `.generic-form-add-button img`;
};

export const selectRemoveButton = () => {
  return `.generic-form-remove-button img`;
};

export const selectArrayAdd = () => {
  return `.generic-form-array-add img`;
};

export const selectArrayRemove = (idx: number) => {
  return `.generic-form-array-remove:eq(${idx}) img`;
};

export const inputText = (selector: string, value: string) => {
  cy.getSettled(`${selector} input`).clear().type(value).blur();
};

export const inputNumber = (selector: string, value: number) => {
  cy.getSettled(`${selector} input`).clear().type(`${value}`).blur();
};


export const shouldContainJsonItem = (name: string, item: any) => {
  return div => {
    const textDivJson = JSON.stringify(JSON.parse(div[0].textContent));
    console.info({textDivJson})
    const searchString = `${JSON.stringify(name)}:${JSON.stringify(item)}`;
    if (textDivJson.includes(searchString)) {
      return true;
    }
    throw new Error(`Could not find JSON part in result: SEARCH: ${searchString} RESULT: ${textDivJson}`);
  };
};

