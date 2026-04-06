import type { EconomicIndicatorRowDto, FlashNewsDto } from "../../types/community.types.js";

export interface FlashNewsProvider {
  getFlashNews(): Promise<FlashNewsDto[] | null>;
}

export interface EconomicIndicatorsProvider {
  getEconomicIndicators(): Promise<EconomicIndicatorRowDto[] | null>;
}
