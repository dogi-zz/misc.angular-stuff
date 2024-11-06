// @ts-ignore
import { defineConfig } from 'cypress';

// tslint:disable-next-line:no-default-export
export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5000',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    specPattern: 'test/**/*.cy.{js,jsx,ts,js.ts,tsx}',
  },
});
