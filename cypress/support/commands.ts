/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }
// tslint:disable-next-line:no-namespace
import Chainable = Cypress.Chainable;

declare namespace Cypress {

  interface Chainable {

    getSettled(selector: string, attacheTime?: number, tries?: number): Chainable<Element>;

  }
}


Cypress.Commands.add('getSettled', (selector: string, attacheTime: number, tries: number) => {
  const start = new Date().getTime();
  // tslint:disable-next-line:no-parameter-reassignment
  attacheTime = attacheTime || 200;
  // tslint:disable-next-line:no-parameter-reassignment
  tries = tries || 40;
  // tslint:disable-next-line:no-any
  return new Cypress.Promise<any>((resolve, reject) => {
    const trySettle = (tryCount) => {
      const el = Cypress.$(selector);
      setTimeout(() => {
        if (Cypress.dom.isAttached(el) && el.length === 1) {
          resolve(el);
        } else if (tryCount > tries) {
          if (el.length > 1) {
            resolve(`Element settled but too many ${selector} was ${el.length}`);
          } else if (el.length) {
            resolve(`Element not settled ${selector}`);
          } else {
            resolve(`Element not found ${selector}`);
          }
        } else {
          trySettle(tryCount + 1);
        }
      }, attacheTime);
    };
    trySettle(1);
    // tslint:disable-next-line:no-any
  }) as any;
});
