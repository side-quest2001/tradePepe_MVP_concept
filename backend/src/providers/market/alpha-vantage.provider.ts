import { env } from "../../config/env.js";
import type { EconomicIndicatorRowDto } from "../../types/community.types.js";
import type { EconomicIndicatorsProvider } from "./market-provider.types.js";

type AlphaVantageResponse = {
  data?: Array<{
    date?: string;
    value?: string;
  }>;
  Information?: string;
  Note?: string;
  "Error Message"?: string;
};

type IndicatorDefinition = {
  country: string;
  label: string;
  functionName: string;
  extraParams?: Record<string, string>;
};

const indicatorDefinitions: IndicatorDefinition[] = [
  {
    country: "United States",
    label: "Federal Funds Rate",
    functionName: "FEDERAL_FUNDS_RATE",
    extraParams: { interval: "monthly" }
  },
  {
    country: "United States",
    label: "CPI",
    functionName: "CPI",
    extraParams: { interval: "monthly" }
  },
  {
    country: "United States",
    label: "Treasury Yield (10Y)",
    functionName: "TREASURY_YIELD",
    extraParams: { interval: "monthly", maturity: "10year" }
  },
  {
    country: "United States",
    label: "Real GDP",
    functionName: "REAL_GDP",
    extraParams: { interval: "quarterly" }
  }
];

function normalizeSeriesValue(value: string | undefined) {
  if (!value) return "-";

  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return value;
  }

  if (Math.abs(numeric) >= 100) {
    return numeric.toFixed(0);
  }

  if (Math.abs(numeric) >= 10) {
    return numeric.toFixed(1);
  }

  return numeric.toFixed(2);
}

function getLatestFourValues(payload: AlphaVantageResponse) {
  if (payload.Note) {
    throw new Error(`Alpha Vantage rate limit: ${payload.Note}`);
  }

  if (payload.Information) {
    throw new Error(`Alpha Vantage info: ${payload.Information}`);
  }

  if (payload["Error Message"]) {
    throw new Error(`Alpha Vantage error: ${payload["Error Message"]}`);
  }

  const series = Array.isArray(payload.data) ? payload.data.slice(0, 4) : [];
  if (series.length === 0) {
    return null;
  }

  const [latest, second, third, fourth] = series;

  return {
    september: normalizeSeriesValue(fourth?.value),
    october: normalizeSeriesValue(third?.value),
    november: normalizeSeriesValue(second?.value),
    december: normalizeSeriesValue(latest?.value)
  };
}

export class AlphaVantageProvider implements EconomicIndicatorsProvider {
  async getEconomicIndicators(): Promise<EconomicIndicatorRowDto[] | null> {
    if (!env.ALPHA_VANTAGE_API_KEY) {
      return null;
    }

    const rows = await Promise.all(
      indicatorDefinitions.map(async (definition) => {
        const url = new URL("https://www.alphavantage.co/query");
        url.searchParams.set("function", definition.functionName);
        url.searchParams.set("apikey", env.ALPHA_VANTAGE_API_KEY);

        for (const [key, value] of Object.entries(definition.extraParams ?? {})) {
          url.searchParams.set(key, value);
        }

        const response = await fetch(url.toString(), {
          headers: {
            Accept: "application/json"
          }
        });

        if (!response.ok) {
          throw new Error(`Alpha Vantage request failed with ${response.status}`);
        }

        const payload = (await response.json()) as AlphaVantageResponse;
        const values = getLatestFourValues(payload);
        if (!values) {
          return null;
        }

        return {
          country: definition.country,
          indicator: definition.label,
          ...values
        } satisfies EconomicIndicatorRowDto;
      })
    );

    return rows.filter((row): row is EconomicIndicatorRowDto => row !== null);
  }
}
