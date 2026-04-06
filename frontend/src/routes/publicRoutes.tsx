import { Route } from "react-router-dom";
import { PublicOnlyRoute } from "@/features/shared/auth/guards";
import { lazyNamed, lazyDefault } from "./LazyWrapper";

// ── Lazy-loaded pages ────────────────────────────────────────────
const LandingPage = lazyNamed(
  () => import("@/features/landing/LandingPage"),
  "LandingPage",
);
const AboutPage = lazyNamed(
  () => import("@/features/landing/AboutPage"),
  "AboutPage",
);
const TeachersPage = lazyNamed(
  () => import("@/features/landing/TeachersPage"),
  "TeachersPage",
);
const ContactPage = lazyNamed(
  () => import("@/features/landing/ContactPage"),
  "ContactPage",
);
const LoginPage = lazyNamed(
  () => import("@/features/auth/LoginPage"),
  "LoginPage",
);
const ForgotPasswordPage = lazyNamed(
  () => import("@/features/auth/ForgotPasswordPage"),
  "ForgotPasswordPage",
);
const NotFound = lazyDefault(() => import("@/features/shared/errors/NotFound"));
const ForbiddenPage = lazyDefault(() => import("@/features/shared/errors/Forbidden"));

// ── Route definitions ────────────────────────────────────────────
export function publicRoutes() {
  return (
    <>
      {/* Landing / marketing pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/teachers" element={<TeachersPage />} />
      <Route path="/contact" element={<ContactPage />} />

      {/* Auth */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicOnlyRoute>
            <ForgotPasswordPage />
          </PublicOnlyRoute>
        }
      />

      {/* Error pages */}
      <Route path="/403" element={<ForbiddenPage />} />
      <Route path="*" element={<NotFound />} />
    </>
  );
}
