import { Detail } from "./detail.model";

export class TickerResponse {
    name: string;
    industry: string;
    sector: string;
    similar: string;
    constructor(name?, industry?, sector?, similar?) {
        this.name = name;
        this.industry = industry;
        this.sector = sector;
        this.similar = similar;
    }
}