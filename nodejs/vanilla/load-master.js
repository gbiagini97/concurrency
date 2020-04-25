const fs = require('fs');
const spawner = require('child_process');

const source = "./tickers-list";
const dest = "./data.json";

const instances = 128;
const children = [];
let childProcessesFinished = 0;
let result = [];

loadTickerDetails();


function loadTickerDetails() {

    const tickersNameArray = fs.readFileSync(source).toString('utf-8').split("\n");
    const inputSize = tickersNameArray.length;

    let a = Math.round(inputSize / instances);
    
    for (let i = 0; i < inputSize; i += a) {
        const child = spawner.fork(`${__dirname}/load-worker.js`);
        
        children.push(child);

        const temparray = tickersNameArray.slice(i, a+i);
               
        child.send(temparray);
    }

    for (i in children) {
        children[i].on('message', (m) => {
            result = result.concat(m)
            childProcessesFinished++;

            if (childProcessesFinished === instances) {
                console.log("writing");
                console.log(result.length)
                fs.writeFile(dest, JSON.stringify(result), (error) => {
                    console.error(`Error: ${error}`);
                });
            }
        });
    }

    
}
