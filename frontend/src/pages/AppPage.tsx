import { RequestBuilder } from "../components/RequestBuilder"

export const AppPage = () => {
    return (
        <div className='space-y-6'>
            <div className="text-center py-6">
                <h1 className="text-2xl font-bold text-foreground mb-2">API Testing</h1>
                <p className="text-muted-foreground">Build and test your HTTP requests</p>
            </div>
            <RequestBuilder />
        </div>
    )
}