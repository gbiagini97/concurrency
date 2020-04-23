const fs = require('fs');
const spawner = require('child_process');

const source = "./tickers-list";
const dest = "./data.json";

const instances = 64;
let result = [];

loadTickerDetails();


function loadTickerDetails() {

    const tickersNameArray = fs.readFileSync(source).toString('utf-8').split("\n");
    const inputSize = tickersNameArray.length;
    var childProcessesFinished = 0;
    const children = [];

    let a = Math.round(inputSize / instances);
    
    for (let i = 0; i < inputSize; i += a) {
        const child = spawner.fork(`${__dirname}/load-worker.js`);
        
        children.push(child);

        const temparray = tickersNameArray.slice(i, a+i);
               
        child.send(temparray);
    }

    for(i in children) {
        children[i].on('message', (m) => {
            result = result.concat(m)
            childProcessesFinished++;
        });
    }

    if(childProcessesFinished === instances) {
        fs.writeFile(dest, JSON.stringify(result), (error) => {
            console.error(`Error: ${error}`);
        });
        process.exit();
    }
}

   
