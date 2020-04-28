const master = require("./master.js");
const fs = require('fs');
const axios = require('axios');
const _ = require('lodash');

main();



async function main() {
    const source = './tickers-list';
    const tickersNameArray = fs.readFileSync(source).toString('utf-8').split("\n");
    const apiKey = '_snJhIopMdb2NuWK_ILFpOEgGAZ8U_EZ0rtS65';
    master.setLibraries([{
        variableName: 'axios',
        libraryFunction: axios.toString()
    }, {
        variableName: '_',
        libraryFunction: _.toString()
    }]);
    master.parallelizer([tickersNameArray, apiKey], brutale, 2);
}

async function brutale(messages, apiKey) {
    const tickers = [];
    for (const tickerName of messages) {
        const tickerDetails = await createTicker(tickerName.replace(/\s/g, ''), axios);
        if (tickerDetails && _.size(tickerDetails)) {
            console.log(tickerDetails);
            tickers.push(tickerDetails);
        }
    }
    return tickers;

    function getTickerDetail(tickerName) {
        return axios.get(`https://api.polygon.io/v1/meta/symbols/${tickerName}/company?apiKey=${apiKey}`)
    }

    function getStockFinancial(tickerName) {
        return axios.get(`https://api.polygon.io/v2/reference/financials/${tickerName}?apiKey=${apiKey}`)
    }

    async function createTicker(tickerName, apikey) {
        try {
            axios.interceptors.response.use((response) => {
                return response && response.data ? response.data : response;
            });

            return await axios.all([getTickerDetail(tickerName, apikey), getStockFinancial(tickerName, apikey)]).then(axios.spread((ticketDetail, stockFinancial) => {
                console.log(ticketDetail)
                return {
                    symbol: _.get(ticketDetail, 'symbol'),
                    name: _.get(ticketDetail, 'name'),
                    industry: _.get(ticketDetail, 'industry'),
                    sector: _.get(ticketDetail, 'sector'),
                    similar: _.get(ticketDetail, 'similar'),
                    shares: _.get(stockFinancial, 'results[0].shares'),
                    ticker: _.get(stockFinancial, 'results[0].earningsPerDilutedShare')
                };
            }));
        } catch (error) {
            // console.error(`${tickerName}: ${error.message}`);
        }
    }

}