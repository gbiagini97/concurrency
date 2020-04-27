const axios = require("axios");
const _ = require('lodash');

process.on('message', async (input) => {
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
    const functionToExecute = input.asyncFn.slice(input.asyncFn.indexOf("{") + 1, input.asyncFn.lastIndexOf("}"));
    const newFn = new AsyncFunction('messages', 'apiKey', 'axios', '_', functionToExecute);
    const response = await newFn(input.arrayChunk, ...input.args, axios, _);
    process.send(response);
    process.exit();
});