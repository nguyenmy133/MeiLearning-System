import { LucideIcon } from "lucide-react";

export interface PendingTask {
    id: number;
    type: "leave" | "exam" | "absent";
    label: string;
    sub: string;
    href: string;
    icon: LucideIcon;
    badgeClass: string;
    urgent: boolean;
}
