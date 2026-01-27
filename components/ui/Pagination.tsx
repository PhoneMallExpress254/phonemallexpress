"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    basePath?: string;
    onPageChange?: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
    const searchParams = useSearchParams();
    const pathname = usePathname();

    if (totalPages <= 1) return null;

    const createPageUrl = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", page.toString());
        return `${basePath || pathname}?${params.toString()}`;
    };

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginTop: "var(--spacing-xl)" }}>
            <Link
                href={currentPage > 1 ? createPageUrl(currentPage - 1) : "#"}
                aria-disabled={currentPage <= 1}
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--secondary)",
                    color: currentPage <= 1 ? "var(--muted-foreground)" : "var(--foreground)",
                    pointerEvents: currentPage <= 1 ? "none" : "auto",
                    opacity: currentPage <= 1 ? 0.5 : 1,
                    transition: "all 0.2s"
                }}
            >
                <ChevronLeft size={16} />
            </Link>

            <div style={{ display: "flex", gap: "4px" }}>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Simple logic to show a window of pages around current page could be added here
                    // For now, simple logic or just showing few pages
                    let p = i + 1;
                    if (totalPages > 5) {
                        if (currentPage > 3) {
                            p = currentPage - 2 + i;
                        }
                        if (p > totalPages) p = i + 1; // Fallback or handle edge logic
                        // Actually let's implement a simpler sliding window logic
                    }

                    return p;
                }).map((_, i) => {
                    // Better sliding window logic
                    let p = i + 1;
                    if (totalPages > 5) {
                        if (currentPage <= 3) {
                            p = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                            p = totalPages - 4 + i;
                        } else {
                            p = currentPage - 2 + i;
                        }
                    }

                    return (
                        <Link
                            key={p}
                            href={createPageUrl(p)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "36px",
                                height: "36px",
                                borderRadius: "8px",
                                border: p === currentPage ? "1px solid var(--accent)" : "1px solid var(--border)",
                                backgroundColor: p === currentPage ? "var(--accent)" : "var(--secondary)",
                                color: p === currentPage ? "var(--accent-foreground)" : "var(--foreground)",
                                fontWeight: 700,
                                fontSize: "13px",
                                transition: "all 0.2s"
                            }}
                        >
                            {p}
                        </Link>
                    )
                })}
            </div>

            <Link
                href={currentPage < totalPages ? createPageUrl(currentPage + 1) : "#"}
                aria-disabled={currentPage >= totalPages}
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--secondary)",
                    color: currentPage >= totalPages ? "var(--muted-foreground)" : "var(--foreground)",
                    pointerEvents: currentPage >= totalPages ? "none" : "auto",
                    opacity: currentPage >= totalPages ? 0.5 : 1,
                    transition: "all 0.2s"
                }}
            >
                <ChevronRight size={16} />
            </Link>
        </div>
    );
}
