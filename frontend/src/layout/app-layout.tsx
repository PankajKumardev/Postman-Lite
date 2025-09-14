import { Outlet } from 'react-router-dom';
import { Navigation } from '../components/navigation'
import { HistoryPanel } from '../components/HistoryPanel'
import { useState } from 'react'
import { Button } from '../components/ui/button'
import { History, X } from 'lucide-react'

 const AppLayout = () => {
    const [showHistory, setShowHistory] = useState(true)
    
    return (
        <div className='min-h-dvh bg-background flex flex-col'>
            <Navigation />
            <div className='flex flex-1 overflow-hidden'>
                {/* Main Content */}
                <div className='flex-1 p-6 overflow-auto'>
                    <div className='max-w-5xl mx-auto'>
                        <Outlet />
                    </div>
                </div>
                
                {/* History Sidebar */}
                <div className={`${showHistory ? 'w-80' : 'w-0'} transition-all duration-300 border-l border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden`}>
                    {showHistory && (
                        <div className='p-4 h-full flex flex-col'>
                            <div className='flex items-center justify-between mb-4'>
                                <h2 className='font-semibold text-lg flex items-center'>
                                    <History className='mr-2 h-5 w-5' />
                                    History
                                </h2>
                                <Button
                                    onClick={() => setShowHistory(false)}
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 md:hidden"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className='flex-1 overflow-hidden'>
                                <HistoryPanel />
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Toggle Button for Mobile */}
                {!showHistory && (
                    <Button
                        onClick={() => setShowHistory(true)}
                        className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 z-50"
                        size="icon"
                    >
                        <History className="h-5 w-5 text-white" />
                    </Button>
                )}
            </div>
        </div>
    )
}

export default AppLayout;