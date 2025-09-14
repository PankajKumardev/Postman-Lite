import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Zap, Shield, Code, Gauge, ArrowRight, Check, Star, Users, Globe, Rocket } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ThemeToggle } from '../components/theme-toggle'

export const HomePage = () => {
    const navigate = useNavigate()
    
    return (
        <div className="min-h-screen bg-background">
            {/* Navigation */}
            <nav className="relative z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                                <Zap className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Postman Lite
                            </span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <ThemeToggle />
                            <Button
                                variant="ghost"
                                onClick={() => navigate('/login')}
                                className="hover:bg-muted/50"
                            >
                                Sign In
                            </Button>
                            <Button
                                onClick={() => navigate('/app')}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                            >
                                Get Started
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="space-y-20 pb-20">
                {/* Hero Section */}
                <section className="pt-20 pb-16">
                    <div className="max-w-7xl mx-auto px-6 text-center">
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                                    <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                                        Test APIs
                                    </span>
                                    <br />
                                    <span className="text-foreground">Like a Pro</span>
                                </h1>
                                <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                                    The lightweight, modern API testing tool that makes HTTP requests simple, beautiful, and powerful. 
                                    Perfect for developers who want enterprise functionality without the complexity.
                                </p>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
                                <Button 
                                    size="lg" 
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg transition-all duration-200 transform hover:scale-105 px-8 py-4 text-lg"
                                    onClick={() => navigate('/app')}
                                >
                                    <Zap className="mr-2 h-6 w-6" />
                                    Start Testing APIs
                                    <ArrowRight className="ml-2 h-6 w-6" />
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="lg"
                                    className="border-2 hover:bg-muted/50 transition-all duration-200 px-8 py-4 text-lg"
                                    onClick={() => navigate('/login')}
                                >
                                    <Users className="mr-2 h-5 w-5" />
                                    Sign Up Free
                                </Button>
                            </div>
                            
                            <div className="pt-8">
                                <p className="text-sm text-muted-foreground mb-4">Trusted by developers worldwide</p>
                                <div className="flex items-center justify-center space-x-8 opacity-60">
                                    <div className="flex items-center space-x-1">
                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                        <span className="ml-2 text-sm font-medium">5.0</span>
                                    </div>
                                    <div className="h-4 w-px bg-border" />
                                    <div className="flex items-center space-x-2">
                                        <Users className="h-4 w-4" />
                                        <span className="text-sm font-medium">10,000+ Developers</span>
                                    </div>
                                    <div className="h-4 w-px bg-border" />
                                    <div className="flex items-center space-x-2">
                                        <Globe className="h-4 w-4" />
                                        <span className="text-sm font-medium">50+ Countries</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Postman Lite?</h2>
                            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                                Everything you need for API testing, nothing you don't. Built for modern developers.
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-border/50 bg-card/50 backdrop-blur-sm">
                                <CardContent className="p-8 text-center space-y-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                                        <Zap className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-xl font-semibold">Lightning Fast</h3>
                                    <p className="text-muted-foreground">
                                        Send HTTP requests instantly with our optimized engine. No delays, no complexity, just pure speed.
                                    </p>
                                    <ul className="text-sm text-muted-foreground space-y-2 text-left">
                                        <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Instant request execution</li>
                                        <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Real-time response preview</li>
                                        <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Optimized for performance</li>
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-border/50 bg-card/50 backdrop-blur-sm">
                                <CardContent className="p-8 text-center space-y-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                                        <Shield className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-xl font-semibold">Secure & Private</h3>
                                    <p className="text-muted-foreground">
                                        Your API keys and requests stay secure. Built with privacy and security as top priorities.
                                    </p>
                                    <ul className="text-sm text-muted-foreground space-y-2 text-left">
                                        <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />End-to-end encryption</li>
                                        <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />No data collection</li>
                                        <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Local storage option</li>
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-border/50 bg-card/50 backdrop-blur-sm">
                                <CardContent className="p-8 text-center space-y-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                                        <Code className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-xl font-semibold">Developer Friendly</h3>
                                    <p className="text-muted-foreground">
                                        Clean interface, powerful features. Everything a developer needs, nothing they don't.
                                    </p>
                                    <ul className="text-sm text-muted-foreground space-y-2 text-left">
                                        <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Intuitive interface</li>
                                        <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />JSON syntax highlighting</li>
                                        <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" />Request history</li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20">
                    <div className="max-w-4xl mx-auto px-6 text-center">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-white">
                            <Rocket className="w-16 h-16 mx-auto mb-6" />
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Testing?</h2>
                            <p className="text-xl mb-8 opacity-90">
                                Join thousands of developers who trust Postman Lite for their API testing needs. 
                                Start your free account today and experience the difference.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button 
                                    size="lg"
                                    className="bg-card text-primary hover:bg-accent shadow-lg px-8 py-4 text-lg font-semibold"
                                    onClick={() => navigate('/app')}
                                >
                                    <Zap className="mr-2 h-6 w-6" />
                                    Get Started Free
                                </Button>
                                <Button 
                                    size="lg"
                                    variant="outline"
                                    className="border-border text-foreground hover:bg-accent/10 px-8 py-4 text-lg"
                                    onClick={() => navigate('/login')}
                                >
                                    Sign Up Now
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Footer */}
            <footer className="border-t border-border/40 bg-background/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-indigo-600 rounded flex items-center justify-center">
                                    <Zap className="w-4 h-4 text-white" />
                                </div>
                                <span className="font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    Postman Lite
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                The modern API testing tool for developers who value simplicity and power.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Product</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
                                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
                                <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
                                <li><a href="#" className="hover:text-foreground transition-colors">Changelog</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Company</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Support</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                                <li><a href="#" className="hover:text-foreground transition-colors">Community</a></li>
                                <li><a href="#" className="hover:text-foreground transition-colors">Status</a></li>
                                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-border/40 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-sm text-muted-foreground">
                            © 2024 Postman Lite. All rights reserved.
                        </p>
                        <div className="flex space-x-6 mt-4 md:mt-0">
                            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms</a>
                            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</a>
                            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Cookies</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}