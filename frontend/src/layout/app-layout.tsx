import { Outlet } from 'react-router-dom';
import { UnifiedNavigation } from '../components/UnifiedNavigation';
import { HistoryPanel } from '../components/HistoryPanel';
import { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { History, X } from 'lucide-react';

const AppLayout = () => {
  const [showHistory, setShowHistory] = useState(false); // Default to hidden

  useEffect(() => {
    const handler = (event: Event) => {
      const custom = event as CustomEvent<{ open?: boolean }>;
      if (typeof custom.detail?.open === 'boolean') {
        setShowHistory(custom.detail.open);
      } else {
        setShowHistory((prev) => !prev);
      }
    };

    window.addEventListener('postman-lite:history-panel', handler);
    return () => {
      window.removeEventListener('postman-lite:history-panel', handler);
    };
  }, []);

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <UnifiedNavigation variant="app" />
      <div className="flex-1 overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-full mx-auto px-4 lg:px-8">
            <Outlet />
          </div>
        </div>

        {/* History Sidebar - now an overlay */}
        <div
          className={`fixed top-0 right-0 h-full pt-16 z-40 transition-transform duration-300 ease-in-out ${
            showHistory ? 'translate-x-0' : 'translate-x-full'
          } w-80 border-l border-border/50 bg-card/30 backdrop-blur-sm`}
        >
          <div className="p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg flex items-center">
                <History className="mr-2 h-5 w-5" />
                History
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              <HistoryPanel />
            </div>
          </div>
        </div>

        {/* Toggle Button for History */}
        <Button
          onClick={() => setShowHistory(!showHistory)}
          className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 z-50"
          size="icon"
        >
          {showHistory ? (
            <X className="h-5 w-5" />
          ) : (
            <History className="h-5 w-5" />
          )}
          <span className="sr-only">
            {showHistory ? 'Close history' : 'Open history'}
          </span>
        </Button>
      </div>
    </div>
  );
};

export default AppLayout;
