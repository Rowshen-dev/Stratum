export declare class FxService {
    private readonly logger;
    private cache;
    private inFlight;
    private fallbackSnapshot;
    private fetchRates;
    private getSnapshot;
    getMidRate(from: string, to: string): Promise<{
        rate: number;
        stale: boolean;
    }>;
}
