import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/shared/auth/auth-context";

export default function ForbiddenPage() {
  const { homePath } = useAuth();

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">403 - Access denied</h1>
          <p className="text-sm text-muted-foreground">
            You do not have permission to open this page.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Button asChild variant="outline">
            <Link to="/">Go to homepage</Link>
          </Button>
          <Button asChild>
            <Link to={homePath}>Go to dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
