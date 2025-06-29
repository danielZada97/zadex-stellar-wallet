
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Shield, TrendingUp, Users, ArrowRight, Moon, Sun } from "lucide-react";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="text-6xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
              ZADEX
            </div>
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 rounded-lg blur opacity-30 animate-pulse"></div>
          </div>
          <div className="text-cyan-300 text-xl mb-4 animate-fade-in">Loading Zadex Interface...</div>
          <div className="w-64 h-2 bg-slate-700 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${isDark ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' : 'bg-gradient-to-br from-slate-100 via-purple-100 to-slate-100'}`}>
      {/* Header */}
      <header className="relative z-10 p-6">
        <nav className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Zap className="h-8 w-8 text-cyan-400 animate-pulse" />
              <div className="absolute -inset-1 bg-cyan-400 rounded-full blur opacity-30"></div>
            </div>
            <span className={`text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent`}>
              ZADEX
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDark(!isDark)}
              className={`${isDark ? 'text-cyan-400 hover:text-cyan-300' : 'text-purple-600 hover:text-purple-700'}`}
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Link to="/login">
              <Button variant="outline" className={`border-cyan-400 ${isDark ? 'text-cyan-400 hover:bg-cyan-400/10' : 'text-purple-600 hover:bg-purple-100'}`}>
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="relative mb-8">
            <h1 className={`text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-fade-in`}>
              Your Futuristic
              <br />
              Digital Wallet
            </h1>
            <div className="absolute -inset-4 bg-gradient-to-r from-cyan-400/20 via-purple-400/20 to-pink-400/20 rounded-2xl blur-xl"></div>
          </div>
          
          <p className={`text-xl md:text-2xl mb-12 max-w-3xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-600'} animate-fade-in`}>
            Experience the next generation of financial technology with real-time currency exchange, 
            advanced security, and intuitive design.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/register">
              <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white px-8 py-4 text-lg group">
                Launch Zadex
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/demo">
              <Button size="lg" variant="outline" className={`border-cyan-400 px-8 py-4 text-lg ${isDark ? 'text-cyan-400 hover:bg-cyan-400/10' : 'text-purple-600 hover:bg-purple-100'}`}>
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <h2 className={`text-4xl font-bold text-center mb-16 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Powered by Advanced Technology
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Shield,
                title: "Military-Grade Security",
                description: "Advanced encryption and multi-layer security protocols protect your digital assets."
              },
              {
                icon: TrendingUp,
                title: "Real-Time Exchange",
                description: "Live currency conversion with up-to-the-second exchange rates and market data."
              },
              {
                icon: Users,
                title: "Instant Transfers",
                description: "Send money to anyone, anywhere, instantly with minimal fees and maximum speed."
              },
              {
                icon: Zap,
                title: "Smart Alerts",
                description: "AI-powered notifications for rate changes, transactions, and market opportunities."
              }
            ].map((feature, index) => (
              <Card key={index} className={`${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white/50 border-slate-200'} backdrop-blur-sm hover:scale-105 transition-all duration-300 group`}>
                <CardContent className="p-6 text-center">
                  <div className="relative mb-4 inline-block">
                    <feature.icon className={`h-12 w-12 ${isDark ? 'text-cyan-400' : 'text-purple-600'} group-hover:scale-110 transition-transform`} />
                    <div className={`absolute -inset-2 ${isDark ? 'bg-cyan-400/20' : 'bg-purple-600/20'} rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                  </div>
                  <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {feature.title}
                  </h3>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative">
            <Card className={`${isDark ? 'bg-gradient-to-r from-slate-800/50 to-purple-800/50 border-slate-700' : 'bg-gradient-to-r from-white/50 to-purple-100/50 border-slate-200'} backdrop-blur-sm p-12`}>
              <CardContent>
                <h2 className={`text-4xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Ready to Enter the Future?
                </h2>
                <p className={`text-xl mb-8 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Join thousands of users who have already upgraded to the next generation of digital finance.
                </p>
                <Link to="/register">
                  <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white px-12 py-4 text-lg">
                    Start Your Journey
                  </Button>
                </Link>
              </CardContent>
            </Card>
            <div className="absolute -inset-4 bg-gradient-to-r from-cyan-400/20 via-purple-400/20 to-pink-400/20 rounded-2xl blur-xl -z-10"></div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`${isDark ? 'bg-slate-900/50' : 'bg-slate-100/50'} backdrop-blur-sm py-12`}>
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Zap className="h-6 w-6 text-cyan-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              ZADEX
            </span>
          </div>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Zadex — Your Futuristic Digital Wallet
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
