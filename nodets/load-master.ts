import { fork } from 'child_process';
import { readFile, writeFile } from 'fs';
import { cpus } from 'os';
import { join } from 'path';
import { promisify } from 'util';


main();

async function main() {
    console.info(`${new Date().toLocaleString()} - Process MASTER started with PID ${process.pid}`);
    const result = [];
    const children = [];

    try {

        const tickerNames: string[] = await (await promisify(readFile)(join('tickers-list'), { encoding: 'utf-8' })).split('\n');
        const chunkSize = Math.round(tickerNames.length / cpus().length);

        for (let i = 0; i < tickerNames.length; i += chunkSize) {

            const child = fork(join(__dirname, 'load-worker.ts'));

            console.info(`${new Date().toLocaleString()} - Process WORKER started with PID ${child.pid}`);

            children.push(child.pid);

            child.on('message', (m: string[]) => {
                result.push(...m);
            });

            child.on('close', async () => {
                children.pop();
            });

            child.on('error', async (error) => {
                throw error;
            });

            child.send(tickerNames.slice(i, chunkSize + i));

        }

        while (children.length);

        await promisify(writeFile)(join('data.json'), JSON.stringify(result));

    } catch (error) {
        console.error(`${new Date().toLocaleString()} - ${error}`);
        process.exit();
    }

}


