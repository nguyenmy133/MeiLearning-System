import { useQuery } from "@tanstack/react-query";
import { notificationService } from "../services/notificationService";

export const useNotifications = () => {
    return useQuery({
        queryKey: ["user", "notifications"],
        queryFn: () => notificationService.getNotifications(),
    });
};
