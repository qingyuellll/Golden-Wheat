import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'

export interface PaginationProps {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  className,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const pages: number[] = []
  const start = Math.max(1, page - 2)
  const end = Math.min(totalPages, page + 2)
  for (let i = start; i <= end; i++) pages.push(i)

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 px-1 py-3 text-sm text-muted',
        className,
      )}
    >
      <span>
        共 <span className="text-ink">{total}</span> 条
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="上一页"
        >
          <ChevronLeft size={16} strokeWidth={1.5} />
        </Button>
        {start > 1 && (
          <>
            <PageBtn n={1} active={page === 1} onClick={onPageChange} />
            {start > 2 && <span className="px-1">…</span>}
          </>
        )}
        {pages.map((p) => (
          <PageBtn key={p} n={p} active={page === p} onClick={onPageChange} />
        ))}
        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="px-1">…</span>}
            <PageBtn n={totalPages} active={page === totalPages} onClick={onPageChange} />
          </>
        )}
        <Button
          variant="outline"
          size="icon-sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="下一页"
        >
          <ChevronRight size={16} strokeWidth={1.5} />
        </Button>
      </div>
    </div>
  )
}

function PageBtn({
  n,
  active,
  onClick,
}: {
  n: number
  active: boolean
  onClick: (p: number) => void
}) {
  return (
    <button
      onClick={() => onClick(n)}
      className={cn(
        'h-8 min-w-8 rounded-md px-2 text-sm transition-all duration-300',
        active
          ? 'bg-primary text-surface'
          : 'border border-line bg-surface text-ink hover:bg-primary-soft hover:text-primary',
      )}
    >
      {n}
    </button>
  )
}
