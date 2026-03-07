import { cn } from "@/lib/utils";

interface SectionDividerProps {
  type?: "wave" | "tilt" | "curve" | "steps";
  position?: "top" | "bottom";
  className?: string; // Để truyền màu nền trùng với section kế tiếp, ví dụ: fill-background hoặc fill-accent
  flipped?: boolean; // Lật ngược (flip) theo trục horizontal
}

export function SectionDivider({
  type = "wave",
  position = "bottom",
  className,
  flipped = false,
}: SectionDividerProps) {
  const isTop = position === "top";

  return (
    <div
      className={cn(
        "absolute left-0 w-full overflow-hidden leading-zero",
        isTop ? "top-0" : "bottom-0",
        flipped && "scale-x-[-1]" 
      )}
      style={{
        lineHeight: 0,
        transform: isTop ? "rotate(180deg)" : "rotate(0deg)",
      }}
    >
      <svg
        data-name="Layer 1"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className={cn("relative block w-full h-[60px] md:h-[100px]", className)}
      >
        {type === "wave" && (
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
          />
        )}
        {type === "tilt" && (
          <path
            d="M1200 120L0 16.48V0h1200v120z"
          />
        )}
        {type === "curve" && (
          <path
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
          />
        )}
        {type === "steps" && (
          <path
            d="M1200,0H0V120H281.94C572.9,116.24,602.45,3.86,602.45,3.86h0S632,116.24,923,120h277Z"
          />
        )}
      </svg>
    </div>
  );
}
