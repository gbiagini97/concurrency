const fs = require('fs'),
    spawner = require('child_process'),
    _ = require('lodash'),
    apiKey = process.argv[2],
    instances = process.argv[3],
    source = process.argv[4],
    result = [];

loadTickerDetails();

function loadTickerDetails() {
    console.time('Process exited in');
    let counter = 0;
    const tickersNameArray = fs.readFileSync(source).toString('utf-8').split("\n"),
        chunk = _.round(_.divide(tickersNameArray.length, instances)),
        chucksCreated = _.chunk(tickersNameArray, chunk);

    chucksCreated.forEach(arrayChunk => {
        spawner.fork(`${__dirname}/load-worker.js`, [apiKey])
            .on('message', (response) => {
                counter++;
                result.push(response);
                writeFile(counter, _.size(chucksCreated));
            }).send(arrayChunk);
    });
}

function writeFile(counter, chuncksNumber) {
    if (counter === chuncksNumber) {
        fs.writeFileSync(`./export-${new Date().getTime()}`, JSON.stringify(_.flatten(result)), (error) => {
            console.assert(error, `Error: ${error}`);
        });
        console.timeEnd('Process exited in');
    }
}
