import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Zap, Shield, Code, Gauge } from 'lucide-react'

export const Hero = () => {
    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-6 py-12">
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                        <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                            Test APIs
                        </span>
                        <br />
                        <span className="text-foreground">with ease</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        A lightweight, modern API testing tool that makes HTTP requests simple and beautiful. 
                        Perfect for developers who want powerful functionality without the complexity.
                    </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                    <Button 
                        size="lg" 
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg transition-all duration-200 transform hover:scale-105"
                    >
                        <Zap className="mr-2 h-5 w-5" />
                        Start Testing APIs
                    </Button>
                    <Button 
                        variant="outline" 
                        size="lg"
                        className="border-2 hover:bg-muted/50 transition-all duration-200"
                    >
                        <Code className="mr-2 h-4 w-4" />
                        View Documentation
                    </Button>
                </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-6 text-center space-y-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold">Lightning Fast</h3>
                        <p className="text-sm text-muted-foreground">
                            Send HTTP requests instantly with our optimized engine. No delays, no complexity.
                        </p>
                    </CardContent>
                </Card>

                <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-6 text-center space-y-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold">Secure & Private</h3>
                        <p className="text-sm text-muted-foreground">
                            Your API keys and requests stay secure. Built with privacy and security first.
                        </p>
                    </CardContent>
                </Card>

                <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-6 text-center space-y-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                            <Gauge className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold">Developer Friendly</h3>
                        <p className="text-sm text-muted-foreground">
                            Clean interface, powerful features. Everything a developer needs, nothing they don't.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}