import { Outlet } from 'react-router-dom';
import { UnifiedNavigation } from '../components/UnifiedNavigation';

const AppLayout = () => {
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
      </div>
    </div>
  );
};

export default AppLayout;
