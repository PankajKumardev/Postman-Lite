import { HistoryPanel } from '../components/HistoryPanel';

export const HistoryPage = () => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Request History</h1>
          <p className="text-muted-foreground">
            View and manage your request history. Click on any request to view
            details or replay it
          </p>
        </div>
      </div>

      <div>
        <HistoryPanel />
      </div>
    </div>
  );
};
