// utils/normalizeResults.ts

export interface NormalizedResults {
  total: number;
  totalVotos?: number;
  resultado?: Record<string, number>;
  _updatedAt: number;
  [option: string]: number | string | Record<string, number> | undefined;
}

/**
 * Normaliza a estrutura de resultados vinda da API.
 * - Garante números em vez de strings
 * - Aceita votos tanto em `resultado` quanto em chaves diretas (`zz`, `vv`)
 * - Adiciona `_updatedAt` como timestamp
 */
export function normalizeResults(raw?: any): NormalizedResults | undefined {
  if (!raw) return undefined;

  const normalized: NormalizedResults = {
    total: Number(raw.totalVotos ?? raw.total ?? 0),
    totalVotos: raw.totalVotos ? Number(raw.totalVotos) : undefined,
    _updatedAt: raw._updatedAt ? Number(raw._updatedAt) : Date.now(),
  };

  // Caso votes estejam dentro de "resultado"
  if (raw.resultado && typeof raw.resultado === "object" && Object.keys(raw.resultado).length > 0) {
    normalized.resultado = {};
    for (const [opt, votos] of Object.entries(raw.resultado)) {
      normalized.resultado[opt] = Number(votos);
      normalized[opt] = Number(votos);
    }
  } else {
    // Caso votes venham como chaves diretas
    for (const [opt, votos] of Object.entries(raw)) {
      if (!["total", "totalVotos", "_updatedAt", "resultado"].includes(opt)) {
        normalized[opt] = Number(votos);
      }
    }
  }

  return normalized;
}
