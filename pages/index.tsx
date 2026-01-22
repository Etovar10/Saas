"use client"

import Link from 'next/link';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="floating-orb orb-one"></div>
      <div className="floating-orb orb-two"></div>
      <div className="floating-orb orb-three"></div>
      <div className="noise-overlay"></div>
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Navigation */}
        <nav className={`flex justify-between items-center mb-12 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <h1 className="text-3xl font-bold gradient-heading">
            IdeaGen
          </h1>
          <div>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="glass-pill hover:scale-105 transition-transform duration-300">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <div className="flex items-center gap-4">
                <Link 
                  href="/product" 
                  className="glass-pill hover:scale-105 transition-transform duration-300"
                >
                  Go to App
                </Link>
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="text-center py-24">
          <div className={`transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="tagline mb-6 inline-block">
              🚀 AI-Powered Business Ideas
            </span>
            <h2 className="text-6xl md:text-7xl font-bold gradient-heading mb-6 leading-tight">
              Generate Your Next
              <br />
              Big Business Idea
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              Harness the power of AI to discover innovative business opportunities tailored for the AI agent economy. Transform your entrepreneurial vision into reality.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="button-primary text-lg px-8 py-4">
                    Get Started Free
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/product">
                  <button className="button-primary text-lg px-8 py-4">
                    Generate Ideas Now
                  </button>
                </Link>
              </SignedIn>
              <a href="#features" className="button-secondary text-lg px-8 py-4">
                Learn More
              </a>
            </div>
          </div>

          {/* Feature Cards */}
          <div id="features" className={`grid md:grid-cols-3 gap-8 mt-24 transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="glass-panel idea-panel p-8 hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-2xl font-bold text-white mb-4">AI-Driven Insights</h3>
              <p className="text-gray-300">
                Leverage cutting-edge AI algorithms to analyze market trends and generate unique business ideas.
              </p>
            </div>
            
            <div className="glass-panel idea-panel p-8 hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold text-white mb-4">Instant Generation</h3>
              <p className="text-gray-300">
                Get personalized business ideas in seconds, not hours. Speed up your innovation process.
              </p>
            </div>
            
            <div className="glass-panel idea-panel p-8 hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-white mb-4">Market Focused</h3>
              <p className="text-gray-300">
                Ideas tailored specifically for the growing AI agent economy and digital marketplace.
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className={`mt-24 transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="glass-panel idea-panel p-12">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-4xl font-bold gradient-heading mb-2">10K+</div>
                  <div className="text-gray-300">Ideas Generated</div>
                </div>
                <div>
                  <div className="text-4xl font-bold gradient-heading mb-2">95%</div>
                  <div className="text-gray-300">Success Rate</div>
                </div>
                <div>
                  <div className="text-4xl font-bold gradient-heading mb-2">24/7</div>
                  <div className="text-gray-300">AI Available</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
