const axios = require('axios');
const _ = require('lodash');
const apiKey = process.argv[2];

process.on('message', async (message) => {
    const tickers = [];
    for (const [i, tickerName] of message.entries()) {
        const tickerDetails = await createTicker(tickerName.replace(/\s/g, ''));
        if (tickerDetails && _.isEmpty(tickerDetails)) {
            tickers.push(_.pick(tickerDetails, _.identity));
        }
    }
    process.send(tickers);
    process.exit();
});


function getTickerDetail(tickerName) {
    return axios.get(`https://api.polygon.io/v1/meta/symbols/${tickerName}/company?apiKey=${apiKey}`)
}

function getStockFinancial(tickerName) {
    return axios.get(`https://api.polygon.io/v2/reference/financials/${tickerName}?apiKey=${apiKey}`)
}


async function createTicker(tickerName) {
    try {
        axios.interceptors.response.use((response) => {
            return response && response.data ? response.data : response;
        });

        return await axios.all([getTickerDetail(tickerName), getStockFinancial(tickerName)])
            .then(axios.spread((ticketDetail, stockFinancial) => {
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
        console.error(error.message);
    }
}