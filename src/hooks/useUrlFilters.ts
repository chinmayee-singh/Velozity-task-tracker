import { useEffect } from "react";
import { useTaskStore } from "../store/useTaskStore";

export function useUrlFilters() {
  const { filters } = useTaskStore();

  useEffect(() => {
    // Sync active filters to the URL so they can be shared/bookmarked
    const params = new URLSearchParams();
    
    if (filters.statuses.length) params.set("statuses", filters.statuses.join(","));
    if (filters.priorities.length) params.set("priorities", filters.priorities.join(","));
    if (filters.assigneeIds.length) params.set("assigneeIds", filters.assigneeIds.join(","));
    if (filters.dueDateFrom) params.set("from", filters.dueDateFrom);
    if (filters.dueDateTo) params.set("to", filters.dueDateTo);

    const queryString = params.toString();
    const newUrl = queryString 
      ? `${window.location.pathname}?${queryString}`
      : window.location.pathname;
      
    window.history.replaceState({}, "", newUrl);
  }, [filters]);
}