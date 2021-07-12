import { fork } from 'child_process';
import { readFile, writeFile } from 'fs';
import { cpus } from 'os';
import { join } from 'path';
import { promisify } from 'util';


main();

async function main() {
    console.info(`${new Date().toLocaleString()} - Process MASTER started with PID ${process.pid}`);

    const result = [];

    try {

        const tickerNames: string[] = await (await promisify(readFile)(join('tickers-list'), { encoding: 'utf-8' })).split('\n');

        const chunkSize = Math.round(tickerNames.length / cpus().length);

        let started = 0;

        let finished = 0;

        for (let i = 0; i < tickerNames.length; i += chunkSize) {

            const child = fork(join(__dirname, 'worker.ts'));

            started++;

            console.info(`${new Date().toLocaleString()} - Process WORKER started with PID ${child.pid}`);

            child.on('message', (m: string[]) => {
                result.push(...m);
            });

            child.on('close', async () => {
                finished++;
                console.info(`${new Date().toLocaleString()} - Process WORKER with PID ${child.pid} exited`);
                if (finished === started) {
                    await promisify(writeFile)(join('data.json'), JSON.stringify(result));
                    console.info(`${new Date().toLocaleString()} - Process MASTER with PID ${process.pid} exited`);
                }
            });

            child.on('error', async (error) => {
                throw error;
            });

            child.send(tickerNames.slice(i, chunkSize + i));
        }
    } catch (error) {
        console.error(`${new Date().toLocaleString()} - ${error}`);
        process.exit(1);
    }
}


