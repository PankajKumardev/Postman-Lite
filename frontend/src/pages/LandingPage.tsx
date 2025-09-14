import { RequestBuilder } from "../components/RequestBuilder"

export const LandingPage = () => {
    return (
        <div className='space-y-6'>
            <div className="text-center space-y-2 pb-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    API Request Builder
                </h1>
                <p className="text-muted-foreground">
                    Test your APIs with our powerful and simple tool
                </p>
            </div>
            <RequestBuilder />
        </div>
    )
}