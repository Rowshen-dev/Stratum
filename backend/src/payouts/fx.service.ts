import { Injectable, Logger } from '@nestjs/common';

/**
 * Курсы валют для коридоров Запад → Центральная Азия.
 *
 * Источник — open.er-api.com (бесплатный, без ключа).
 * Ответ кэшируется на час: курсы там обновляются раз в сутки,
 * дёргать их на каждый запрос смысла нет.
 *
 * Если источник недоступен, отдаём запасные курсы, чтобы
 * котировка не падала. Флаг stale в ответе показывает,
 * что курс не свежий.
 */

const FX_ENDPOINT = 'https://open.er-api.com/v6/latest/USD';
const CACHE_TTL_MS = 60 * 60 * 1000;

// Запасные курсы к USD. Обновлять руками при заметном расхождении.
const FALLBACK_USD_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  UZS: 12900,
  KZT: 495,
};

interface RatesSnapshot {
  base: 'USD';
  rates: Record<string, number>;
  fetchedAt: number;
  stale: boolean;
}

@Injectable()
export class FxService {
  private readonly logger = new Logger(FxService.name);
  private cache: RatesSnapshot | null = null;
  private inFlight: Promise<RatesSnapshot> | null = null;

  private fallbackSnapshot(): RatesSnapshot {
    return {
      base: 'USD',
      rates: { ...FALLBACK_USD_RATES },
      fetchedAt: Date.now(),
      stale: true,
    };
  }

  private async fetchRates(): Promise<RatesSnapshot> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(FX_ENDPOINT, { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) throw new Error(`FX API responded ${res.status}`);

      const body: any = await res.json();
      if (body?.result !== 'success' || !body?.rates) {
        throw new Error('Unexpected FX API payload');
      }

      return {
        base: 'USD',
        rates: body.rates,
        fetchedAt: Date.now(),
        stale: false,
      };
    } catch (err) {
      this.logger.warn(
        `Не удалось получить курсы, использую запасные: ${(err as Error).message}`,
      );
      return this.fallbackSnapshot();
    }
  }

  private async getSnapshot(): Promise<RatesSnapshot> {
    const fresh =
      this.cache &&
      !this.cache.stale &&
      Date.now() - this.cache.fetchedAt < CACHE_TTL_MS;

    if (fresh) return this.cache as RatesSnapshot;

    // Не даём параллельным запросам дублировать поход в API
    if (!this.inFlight) {
      this.inFlight = this.fetchRates().finally(() => {
        this.inFlight = null;
      });
    }

    this.cache = await this.inFlight;
    return this.cache;
  }

  /** Средний рыночный курс из одной валюты в другую. */
  async getMidRate(from: string, to: string): Promise<{ rate: number; stale: boolean }> {
    if (from === to) return { rate: 1, stale: false };

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
}
