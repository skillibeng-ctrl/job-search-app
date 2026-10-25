// src/hooks/useJobFilters.js
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { useMemo, useCallback } from "react";

export function useJobFilters() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const filters = useMemo(() => ({
    q: params.get("q") || "",
    loc: params.get("loc") || "",
    remote: params.get("remote") === "true",
    seniority: params.get("seniority") || "",
    minSalary: params.get("minSalary") || "",
    postedWithin: params.get("postedWithin") || "",
    page: parseInt(params.get("page") || "1", 10),
    sort: params.get("sort") || "relevance",
  }), [params]);

  const setFilters = useCallback((updates) => {
    const next = new URLSearchParams(params.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === "" || value === false || value == null) next.delete(key);
      else next.set(key, String(value));
    });
    if (!("page" in updates)) next.set("page", "1");
    navigate(`${location.pathname}?${next.toString()}`, { replace: true });
  }, [params, navigate, location.pathname]);

  return { filters, setFilters };
}