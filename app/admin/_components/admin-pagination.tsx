import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AdminPagination({
  basePath,
  page,
  totalPages,
  query,
}: {
  basePath: string;
  page: number;
  totalPages: number;
  query: Record<string, string | undefined>;
}) {
  const makeHref = (targetPage: number) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    params.set("page", String(targetPage));
    return `${basePath}?${params.toString()}`;
  };

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-zinc-500">
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <Button asChild variant="outline" size="sm" disabled={page <= 1}>
          <Link href={makeHref(Math.max(1, page - 1))}>Previous</Link>
        </Button>
        <Button asChild variant="outline" size="sm" disabled={page >= totalPages}>
          <Link href={makeHref(Math.min(totalPages, page + 1))}>Next</Link>
        </Button>
      </div>
    </div>
  );
}
