import { get } from "https";
import { Detail } from "./model/detail.model";
import { FinancialResponse } from "./model/financial-response.model";
import { TickerResponse } from "./model/ticker-response.model";
import { Ticker } from "./model/ticker.model";

const apiKey = '_snJhIopMdb2NuWK_ILFpOEgGAZ8U_EZ0rtS65';

process.on('message', async (m: string[]) => {
    try {
        const tickers = [];
        for await (const tickerName of m) {
            const tickerDetails = await retrieveTickerDetail(tickerName.replace(/ /g, "."));
            console.log(tickerDetails);
            if (tickerDetails) tickers.push(tickerDetails);
        }
        process.send(tickers);
        process.exit();
    } catch (error) {
        throw error;
    }
});

async function retrieveStockFinancial(tickerName: string) {
    try {
        const financialResponse: FinancialResponse = await wrapGetHttpCall(`https://api.polygon.io/v2/reference/financials/${tickerName}?apiKey=${apiKey}`);
        return financialResponse?.results[0] ? new Detail(financialResponse.results[0].shares, financialResponse?.results[0].earningsPerDilutedShare) : undefined;
    } catch (error) {
        throw error;
    }
}

async function retrieveTickerDetail(tickerName: string) {
    try {
        const tickerResponse: TickerResponse = await wrapGetHttpCall(`https://api.polygon.io/v1/meta/symbols/${tickerName}/company?apiKey=${apiKey}`);
        return (tickerResponse as any).error || !tickerResponse ?
            undefined :
            await (async () => {
                const financialDetails: Detail = await retrieveStockFinancial(tickerName);
                return financialDetails ?
                    new Ticker(tickerName, tickerResponse.name, tickerResponse.industry, tickerResponse.sector, tickerResponse.similar, financialDetails) : undefined;
            })();
    } catch (error) {
        throw error;
    }
}

function wrapGetHttpCall(url: string) {
    return new Promise<any>((resolve) => {
        get(url, res => {
            let data = '';
            res.on('data', chunk => { data += chunk });
            res.on('end', () => {
                resolve(JSON.parse(data));
            });
        })
    })
}