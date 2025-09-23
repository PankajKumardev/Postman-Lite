import { Moon, Sun } from 'lucide-react'
import { useTheme } from './theme-provider'
import { Switch } from './ui/switch'
import { cn } from '../lib/utils'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const isDark = theme === 'dark'

  return (
    <div className="relative inline-flex items-center">
      <Switch
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
        className={cn(
          'peer',
          isDark
            ? 'bg-zinc-600'
            : 'bg-zinc-300',
        )}
        aria-label="Toggle theme"
      />
      <Sun className="pointer-events-none absolute left-[6px] top-1/2 h-[14px] w-[14px] -translate-y-1/2 text-zinc-700 opacity-100 transition-opacity peer-data-[state=checked]:opacity-0 dark:text-zinc-50" />
      <Moon className="pointer-events-none absolute right-[6px] top-1/2 h-[14px] w-[14px] -translate-y-1/2 text-zinc-500 opacity-0 transition-opacity peer-data-[state=checked]:opacity-100 dark:text-zinc-50" />
    </div>
  )
}