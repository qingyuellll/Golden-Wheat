import type { LucideIcon } from 'lucide-react'
import { Sprout } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Empty } from '@/components/ui/empty'

interface PlaceholderProps {
  title: string
  description: string
  icon?: LucideIcon
  /** 计划实现的功能点 */
  plan?: string[]
}

/** 占位页：未实现模块统一展示规划，避免空白路由 */
export function Placeholder({ title, description, icon: Icon = Sprout, plan }: PlaceholderProps) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={title} description={description} />
      <div className="card-border p-6">
        <Empty
          icon={<Icon size={20} strokeWidth={1.5} />}
          title={`${title} · 规划中`}
          description="该模块将在后续迭代中实现，基建已就绪"
        />
        {plan && plan.length > 0 && (
          <ul className="mx-auto mt-4 max-w-md space-y-1 text-sm text-muted">
            {plan.map((p) => (
              <li key={p} className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-primary" />
                {p}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
