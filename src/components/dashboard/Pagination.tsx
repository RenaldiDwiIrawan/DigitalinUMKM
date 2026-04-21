import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-8 py-4 bg-white/40 backdrop-blur-md rounded-2xl border border-white/20">
      <Button
        variant="ghost"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="rounded-xl"
      >
        <ChevronLeft className="w-4 h-4 mr-2" /> Prev
      </Button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
        <Button
          key={page}
          variant={currentPage === page ? "default" : "ghost"}
          onClick={() => onPageChange(page)}
          className={`w-10 h-10 rounded-xl font-bold ${currentPage === page ? "bg-primary shadow-lg shadow-primary/20" : ""}`}
        >
          {page}
        </Button>
      ))}

      <Button
        variant="ghost"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="rounded-xl"
      >
        Next <ChevronRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}
