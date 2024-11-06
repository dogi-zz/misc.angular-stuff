import {execSync} from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import {ConstructorDeclaration, MethodDeclaration, Project, PropertyDeclaration, SyntaxKind} from 'ts-morph';


const file = process.argv[2];
const isFile = fs.statSync(file).isFile();
if (fs.statSync(file).isFile()) {
  if (!file.endsWith('.ts') || path.resolve(file) === path.resolve(process.argv[1])) {
    console.error("File is no .ts");
    process.exit(1);
  }
}
const isDir = fs.statSync(file).isDirectory();

if (!isFile && !isDir) {
  if (!file.endsWith('.ts') || path.resolve(file) === path.resolve(process.argv[1])) {
    console.error("File is no dir or file");
    process.exit(1);
  }
}

const filePath = path.resolve(file);
console.info({file, filePath});

const esLintExecutable = './node_modules/.bin/eslint';

if (fs.existsSync(esLintExecutable)) {
  console.info("Perform eslint --fix ...");
  try {
    execSync('./node_modules/.bin/eslint --fix src/app/generic-form-showcase/generic-form-showcase.component.ts', {stdio: 'inherit'});
    console.info("Perform eslint --fix ... success");
  } catch (e) {
    console.info("Perform eslint --fix ... some error");
  }
}
//
// console.info(result.stdout?.length);


const project = new Project({
  tsConfigFilePath: "./tsconfig.json",
});

// Durchsucht jede Datei im Projekt
//project.addSourceFilesAtPaths("src/**/*.ts");
project.addSourceFilesAtPaths(file);

project.getSourceFiles().forEach(sourceFile => {
  if (isFile && sourceFile.getFilePath() !== filePath) {
    return;
  }
  if (isDir && !sourceFile.getFilePath().startsWith(`${filePath}/`)) {
    return;
  }
  sourceFile.getClasses().forEach(classDeclaration => {
    console.info(`processing ${sourceFile.getFilePath()}`);
    classDeclaration.getMembers().forEach(member => {
      const accessibilityModifiers = [SyntaxKind.PublicKeyword, SyntaxKind.PrivateKeyword, SyntaxKind.ProtectedKeyword];
      if (member instanceof MethodDeclaration || member instanceof PropertyDeclaration) {
        if (!accessibilityModifiers.some(m => member.hasModifier(m))) {
          console.info(`add public to ${classDeclaration.getName()}.${member.getName()}`);
          member.toggleModifier("public", true);
        }
      }
      if (member instanceof ConstructorDeclaration) {
        if (!accessibilityModifiers.some(m => member.hasModifier(m))) {
          console.info(`add public to ${classDeclaration.getName()}.constructor`);
          member.toggleModifier("public", true);
        }
      }
    });
  });

  sourceFile.saveSync();
});

