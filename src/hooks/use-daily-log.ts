import { useQuery } from "@tanstack/react-query";

export function useDailyLog(dateStr: string) {
  return useQuery({
    queryKey: ["daily-log", dateStr],
    queryFn: async () => {
      const res = await fetch(`/api/daily-log?date=${dateStr}`);
      if (!res.ok) throw new Error("Failed to fetch daily log");
      return res.json();
    },
  });
}
