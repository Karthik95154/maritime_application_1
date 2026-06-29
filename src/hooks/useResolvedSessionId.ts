import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { backendApi } from "../api/backendApi";

export function useResolvedSessionId() {
  const params = useParams<{ sessionId?: string }>();
  const latestInspectionQuery = useQuery({
    queryKey: ["latest-inspection"],
    queryFn: backendApi.getLatestInspection,
    enabled: !params.sessionId,
  });

  return {
    sessionId: params.sessionId ?? latestInspectionQuery.data?.sessionId,
    latestInspectionQuery,
  };
}
