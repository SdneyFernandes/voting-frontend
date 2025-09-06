import { useState, useCallback } from "react";
import { api } from "@/services/api";
import { normalizeResults, NormalizedResults } from "@/utils/normalizeResults";

export function useVoteResults() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<NormalizedResults | null>(null);

  const fetchResults = useCallback(async (sessionId: number) => {
    try {
      setLoading(true);
      const response = await api.get(`/votes_session/${sessionId}/results?t=${Date.now()}`);
      const normalized = normalizeResults(response.data);

      setResults(normalized || null);
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
