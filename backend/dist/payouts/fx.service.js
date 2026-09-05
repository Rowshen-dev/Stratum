"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var FxService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FxService = void 0;
const common_1 = require("@nestjs/common");
const FX_ENDPOINT = 'https://open.er-api.com/v6/latest/USD';
const CACHE_TTL_MS = 60 * 60 * 1000;
const FALLBACK_USD_RATES = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    UZS: 12900,
    KZT: 495,
};
let FxService = FxService_1 = class FxService {
    logger = new common_1.Logger(FxService_1.name);
    cache = null;
    inFlight = null;
    fallbackSnapshot() {
        return {
            base: 'USD',
            rates: { ...FALLBACK_USD_RATES },
            fetchedAt: Date.now(),
            stale: true,
        };
    }
    async fetchRates() {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);
            const res = await fetch(FX_ENDPOINT, { signal: controller.signal });
            clearTimeout(timeout);
            if (!res.ok)
                throw new Error(`FX API responded ${res.status}`);
            const body = await res.json();
            if (body?.result !== 'success' || !body?.rates) {
                throw new Error('Unexpected FX API payload');
            }
            return {
                base: 'USD',
                rates: body.rates,
                fetchedAt: Date.now(),
                stale: false,
            };
        }
        catch (err) {
            this.logger.warn(`Не удалось получить курсы, использую запасные: ${err.message}`);
            return this.fallbackSnapshot();
        }
    }
    async getSnapshot() {
        const fresh = this.cache &&
            !this.cache.stale &&
            Date.now() - this.cache.fetchedAt < CACHE_TTL_MS;
        if (fresh)
            return this.cache;
        if (!this.inFlight) {
            this.inFlight = this.fetchRates().finally(() => {
                this.inFlight = null;
            });
        }
        this.cache = await this.inFlight;
        return this.cache;
    }
    async getMidRate(from, to) {
        if (from === to)
            return { rate: 1, stale: false };
        const snapshot = await this.getSnapshot();
        const fromRate = snapshot.rates[from];
        const toRate = snapshot.rates[to];
        if (!fromRate || !toRate) {
            const fb = FALLBACK_USD_RATES;
            if (!fb[from] || !fb[to]) {
                throw new Error(`Курс для пары ${from}/${to} недоступен`);
            }
            return { rate: fb[to] / fb[from], stale: true };
        }
        return { rate: toRate / fromRate, stale: snapshot.stale };
    }
};
exports.FxService = FxService;
exports.FxService = FxService = FxService_1 = __decorate([
    (0, common_1.Injectable)()
], FxService);
//# sourceMappingURL=fx.service.js.map