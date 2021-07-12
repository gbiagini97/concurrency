import { Detail } from "./detail.model";

export class Ticker extends Detail {
    symbol: string;
    name: string;
    industry: string;
    sector: string;
    similar: string;
    constructor(symbol?: string, name?: string, industry?: string, sector?: string, similar?: string, detail?: Detail) {
        super(detail.shares, detail.earningsPerDilutedShare);
        this.symbol = symbol;
        this.name = name;
        this.industry = industry;
        this.sector = sector;
        this.similar = similar;
    }
}