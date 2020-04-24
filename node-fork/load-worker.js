const https = require('https');
const apiKey = "*************************";
tickers = [];

process.on('message', async (m) => {
    
    for (const [i, tickerName] of m.entries()) {
        const tickerDetails = await mergeResults(tickerName.replace(/ /g, "."));
        if (tickerDetails) {
            tickers.push(tickerDetails);
        }
    }
    
    process.send(tickers);
    process.exit();
});



async function mergeResults(tickerName) {
    let tickerDetails = await retrieveTickerDetails(tickerName);
    const stockFinancials = await retrieveStockFinancials(tickerName);

    return new Promise((resolve, reject) => {

        if (tickerDetails && stockFinancials) {
            tickerDetails.shares = stockFinancials.shares;
            tickerDetails.earningsPerDilutedShare = stockFinancials.earningsPerDilutedShare;
            resolve(tickerDetails);
        } else {
            resolve();
        }

        reject(new Error("Error"))
    }).catch(
        //console.log(`Error retrieving data for ${tickerName}`)
        );
}

function retrieveStockFinancials(tickerName) {
    return new Promise((resolve, reject) => {
        let ticker = {};

        const options = {
            host: 'api.polygon.io',
            path: `/v2/reference/financials/${tickerName}?apiKey=${apiKey}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                const tickerJSON = JSON.parse(data);

                if (tickerJSON && tickerJSON.results && tickerJSON.results[0] && tickerJSON.results[0].shares && tickerJSON.results[0].earningsPerDilutedShare) {
                    ticker.shares = tickerJSON.results[0].shares;
                    ticker.earningsPerDilutedShare = tickerJSON.results[0].earningsPerDilutedShare;
                    resolve(ticker);
                } else {
                    resolve();
                }
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        req.end();
    });
}

function retrieveTickerDetails(tickerName) {

    return new Promise((resolve, reject) => {

        let ticker = {};

        const options = {
            host: 'api.polygon.io',
            path: `/v1/meta/symbols/${tickerName}/company?apiKey=${apiKey}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                const tickerJSON = JSON.parse(data);
                if (tickerJSON.name) {
                    ticker.symbol = tickerName;
                    ticker.name = tickerJSON.name;
                    ticker.industry = tickerJSON.industry;
                    ticker.sector = tickerJSON.sector;
                    ticker.similar = tickerJSON.similar;
                    resolve(ticker);
                } else {
                    resolve();
                }
            });
        });
        req.on('error', (e) => {
            reject(e);
        });
        req.end();
    });
}
