import { Hero } from "../components/hero"
import { RequestBuilder } from "../components/RequestBuilder"

export const LandingPage = () => {
    return (
        <div className='p-6 max-w-6xl mx-auto space-y-6'>
            <Hero />
            <RequestBuilder />
        </div>
    )
}