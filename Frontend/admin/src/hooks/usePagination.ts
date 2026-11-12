import { useState, useCallback } from 'react'

interface UsePaginationReturn {
  page: number
  pageSize: number
  setPage: (p: number) => void
  reset: () => void
}

export function usePagination(initialPageSize = 10): UsePaginationReturn {
  const [page, setPage] = useState(1)
  const [pageSize] = useState(initialPageSize)

  const reset = useCallback(() => setPage(1), [])

  return { page, pageSize, setPage, reset }
}
