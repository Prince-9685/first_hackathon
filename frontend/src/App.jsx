import React, { useEffect, useState } from 'react';
import Lenis from '@studio-freight/lenis';
import { Hero } from './components/Hero';
import { Dashboard } from './components/Dashboard';

function App() {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    // Basic smooth scrolling setup for the landing page
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    })

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy();
    }
  }, [])

  return (
    <div className="min-h-screen w-full font-sans antialiased text-white selection:bg-primary/30">
      {!entered ? (
        <Hero onEnter={() => setEntered(true)} />
      ) : (
        <Dashboard />
      )}
    </div>
  );
}

export default App;
