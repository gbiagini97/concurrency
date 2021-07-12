export class Detail {
    shares: number;
    earningsPerDilutedShare: number;
    constructor(shares?, earningsPerDilutedShare?) {
        this.shares = shares;
        this.earningsPerDilutedShare = earningsPerDilutedShare;
    }
}