const spawner = require('child_process');
const _ = require('lodash');


function parallelizer(args, executor, instances) {
    if (args && args.length && executor && _.isFunction(executor)) {
        const promises = [];
        const source = _.head(args);
        const chunk = _.round(_.divide(source.length, instances));
        const options = {
            arrayChunk: [],
            asyncFn: executor.toString(),
            args: _.tail(args)
        };
        for (arrayChunk of _.chunk(source, chunk)) {
            options.arrayChunk = arrayChunk
            promises.push(new Promise((resolve) => {
                spawner.fork(`${__dirname}/worker.js`).on('message', (response) => {
                    resolve(response);
                }).send(options);
            }).catch(error => {
                // console.log(error)
            }));
        };
        return Promise.all(promises);
    }
}

module.exports = {
    parallelizer: parallelizer,
};