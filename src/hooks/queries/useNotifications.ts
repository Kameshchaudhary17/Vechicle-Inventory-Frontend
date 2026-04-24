import { useQuery } from "@tanstack/react-query";
import { notificationApi } from "../../services/api/notificationApi";

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationApi.get(),
    refetchInterval: 60_000
  });
}
