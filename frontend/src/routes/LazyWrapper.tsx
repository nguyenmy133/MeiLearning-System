import { lazy, Suspense, type ComponentType } from "react";
import { FeatureErrorBoundary } from "@/components/shared/feature-error-boundary";

/**
 * Loading fallback shown while a lazy-loaded page chunk is being downloaded.
 * Keeps it minimal so the layout shell (sidebar, header) stays visible.
 */
function PageLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Đang tải...</p>
      </div>
    </div>
  );
}

/**
 * Wraps a lazily-imported **named-export** component inside `<Suspense>`.
 *
 * React.lazy() expects a module with `default` export, so we re-map
 * the named export at the module boundary.
 *
 * @example
 * ```ts
 * const AdminDashboard = lazyNamed(
 *   () => import("@/features/admin/dashboard/pages/AdminDashboard"),
 *   "AdminDashboard",
 * );
 * // Then use as: <Route element={<AdminDashboard />} />
 * ```
 */
export function lazyNamed<
  Module extends Record<string, ComponentType<any>>,
  Key extends keyof Module & string,
>(factory: () => Promise<Module>, name: Key) {
  const LazyComponent = lazy(() =>
    factory().then((mod) => ({ default: mod[name] })),
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function SuspenseWrapper(props: any) {
    return (
      <FeatureErrorBoundary>
        <Suspense fallback={<PageLoadingFallback />}>
          <LazyComponent {...props} />
        </Suspense>
      </FeatureErrorBoundary>
    );
  }

  SuspenseWrapper.displayName = `Lazy(${name})`;
  return SuspenseWrapper;
}

/**
 * Wraps a lazily-imported **default-export** component inside `<Suspense>`.
 *
 * @example
 * ```ts
 * const NotFound = lazyDefault(() => import("@/features/shared/errors/NotFound"));
 * ```
 */
export function lazyDefault(
  factory: () => Promise<{ default: ComponentType<any> }>,
) {
  const LazyComponent = lazy(factory);

  function SuspenseWrapper(props: Record<string, unknown>) {
    return (
      <FeatureErrorBoundary>
        <Suspense fallback={<PageLoadingFallback />}>
          <LazyComponent {...props} />
        </Suspense>
      </FeatureErrorBoundary>
    );
  }

  SuspenseWrapper.displayName = "Lazy(Default)";
  return SuspenseWrapper;
}
