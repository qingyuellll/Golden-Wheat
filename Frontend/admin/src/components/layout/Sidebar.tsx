import { NavLink } from 'react-router-dom'
import { Wheat } from 'lucide-react'
import { NAV_GROUPS } from './nav-config'
import { cn } from '@/lib/utils'

/** 左侧导航：纯白背景，选中态浅粉底 + 深绿文字，留白克制 */
export function Sidebar() {
  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-line bg-surface">
      <div className="flex h-16 items-center gap-3 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary">
          <Wheat size={18} strokeWidth={1.5} className="text-accent" />
        </div>
        <div className="leading-tight">
          <p className="font-serif text-base text-ink">麦子熟了</p>
          <p className="text-xs text-muted">管理端</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="mb-6">
            <p className="px-3 pb-2 text-xs text-muted">{group.title}</p>
            <ul className="flex flex-col gap-1">
              {group.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors duration-300 ease-plant',
                        isActive
                          ? 'nav-active'
                          : 'text-ink hover:bg-primary-soft hover:text-primary',
                      )
                    }
                  >
                    <item.icon size={18} strokeWidth={1.5} />
                    <span className="flex-1">{item.label}</span>
                    {!item.ready && (
                      <span className="rounded-sm bg-primary-soft/60 px-1.5 py-0.5 text-xs text-muted">
                        待建
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-line px-6 py-4">
        <p className="text-xs text-muted">v0.1</p>
      </div>
    </aside>
  )
}
