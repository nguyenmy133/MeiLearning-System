import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Cuộn lên top mượt mà khi đổi route
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant", // Dùng instant để tránh bị "nháy" hoặc trôi chậm khó chịu
    });
  }, [pathname]);

  return null;
}
