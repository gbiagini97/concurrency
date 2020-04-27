const _ = require('lodash');
const libraries = require("./master.js");

process.on('message', async (input) => {
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
    const functionToExecute = input.asyncFn.slice(input.asyncFn.indexOf("{") + 1, input.asyncFn.lastIndexOf("}"));
    const newFn = new AsyncFunction('messages', 'apiKey', ...libraries.libraries.map(library => library.variableName), functionToExecute);
    const response = await newFn(input.arrayChunk, ...input.args, ...libraries.libraries.map(library => library.libraryFunction));
    process.send(response);
    process.exit();
});