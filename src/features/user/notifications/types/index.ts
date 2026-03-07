export interface NotificationItem {
    id: number;
    type: "announcement" | "payment" | "schedule" | "document" | string;
    title: string;
    content: string;
    time: string;
    date: string;
    read: boolean;
}
