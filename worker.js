process.on('message', async (input) => {
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
    const functionToExecute = input.asyncFn.slice(input.asyncFn.indexOf("{") + 1, input.asyncFn.lastIndexOf("}"));
    const arguments = input.asyncFn.split(/[()]/)[1].replace(/\s/g, '').split(',');
    const newFn = new AsyncFunction(arguments, ...input.libraries.map(library => library.variableName), functionToExecute);
    const response = await newFn(input.arrayChunk, ...input.args, ...input.libraries.map(library => {
        return new Function(`return ${library.libraryFunction}`)();
    }));
    process.send(response);
    process.exit();
});