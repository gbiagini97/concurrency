const fs = require('fs');
const spawner = require('child_process');
const _ = require('lodash');
const source = "./tickers-list";

const apiKey = process.argv[2];
const instances = process.argv[3];


loadTickerDetails();


function loadTickerDetails() {
    const tickersNameArray = fs.readFileSync(source).toString('utf-8').split("\n");
    const chunk = _.round((_.divide(tickersNameArray.length, instances)));
    const result = [];
    let counter = 0;
    _.chunk(tickersNameArray, chunk).forEach(arrayChunk => {
        spawner.fork(`${__dirname}/load-worker.js`, [apiKey]).on('message', (response) => {
            result.push(...response);
        }).on('exit', () => {
            console.log(`COUNTER: ${counter}`)
            counter++;
        }).send(arrayChunk);
    });

    while (counter !== 5) {
        console.log(result);
        fs.writeFile(`export-${new Date().getTime()}`, JSON.stringify(result), (error) => {
            if (error) {
                console.error(`Error: ${error}`);
            }
        });
    }
}