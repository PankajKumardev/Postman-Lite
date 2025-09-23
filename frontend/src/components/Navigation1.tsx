import { ThemeToggle } from './theme-toggle'

export const Navigation1 = () => {
    return (
        <div className="px-16 py-4">
            <div className="flex items-center justify-between">
                <div className="text-2xl font-medium text-gray-900 dark:text-blue-400">
                    Fetchly
                </div>
                <ThemeToggle />
            </div>
        </div>
    )
}