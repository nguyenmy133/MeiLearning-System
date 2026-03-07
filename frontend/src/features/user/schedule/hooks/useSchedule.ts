import { useQuery } from "@tanstack/react-query";
import { getMyClasses, getMySchedule, getTodaySessions } from "../services";

export const scheduleKeys = {
    all: ["user-schedule"] as const,
    classes: () => [...scheduleKeys.all, "classes"] as const,
    schedule: (start?: string, end?: string) => [...scheduleKeys.all, "range", start, end] as const,
    today: () => [...scheduleKeys.all, "today"] as const,
};

export function useMyClasses() {
    return useQuery({
        queryKey: scheduleKeys.classes(),
        queryFn: () => getMyClasses(),
    });
}

export function useMySchedule(startDate?: string, endDate?: string) {
    return useQuery({
        queryKey: scheduleKeys.schedule(startDate, endDate),
        queryFn: () => getMySchedule(startDate, endDate),
    });
}

export function useTodaySessions() {
    return useQuery({
        queryKey: scheduleKeys.today(),
        queryFn: () => getTodaySessions(),
    });
}
