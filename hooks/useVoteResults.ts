// hooks/useVoteResults.ts
import { useState, useCallback } from "react";
import { api } from "@/services/api";

export interface NormalizedResults {
  total: number;
  _updatedAt: number;
  [option: string]: number | string;
}

export function useVoteResults() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<NormalizedResults | null>(null);

  const fetchResults = useCallback(async (sessionId: number) => {
    try {
      setLoading(true);
      const response = await api.get(`/votes_session/${sessionId}/results?t=${Date.now()}`);
      const { totalVotos, resultado } = response.data;

      const normalized: NormalizedResults = {
        total: totalVotos ?? 0,
        _updatedAt: Date.now(),
      };

      if (resultado && typeof resultado === "object") {
        for (const [opt, votos] of Object.entries(resultado)) {
          normalized[opt] = votos as number;
        }
      }

      setResults(normalized);
      return normalized;
    } catch (err) {
      console.error("Erro ao buscar resultados:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, fetchResults };
}
