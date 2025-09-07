import { Outlet } from 'react-router-dom';
import { AuthPanel } from '../components/AuthPanel'
import { HistoryPanel } from '../components/HistoryPanel'

 const AppLayout = () => {
    return (
        <div className='min-h-dvh'>
            <div className='border-b'>
                <div className='max-w-6xl mx-auto px-6 py-3 flex items-center justify-between'>
                    <div className='font-semibold'>Postman Lite</div>
                    <AuthPanel />
                </div>
            </div>
            <div className='max-w-6xl mx-auto px-6 py-6 grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6'>
                <div>
                    <Outlet />
                </div>
                <div>
                    <HistoryPanel />
                </div>
            </div>
        </div>
    )
}

export default AppLayout;