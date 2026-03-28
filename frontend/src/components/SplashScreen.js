import React, { useState, useEffect } from 'react';

const SplashScreen = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-50 px-4">
      <div
        className={`flex flex-col items-center transition-all duration-700 ease-out ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
      >
        {/* Icon */}
        <img src="/umbrellalogo.webp" alt="RainShield" className="w-24 h-24 rounded-2xl mb-8 shadow-elevated object-contain" />

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-surface-900 tracking-tight mb-3">
          RainShield
        </h1>

        {/* Subtitle */}
        <p className="text-surface-500 text-lg font-medium mb-10">
          Umbrella rental, simplified.
        </p>

        {/* Loading indicator */}
        <div className="flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse-soft" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse-soft" style={{ animationDelay: '200ms' }} />
          <span className="w-2 h-2 rounded-full bg-brand-300 animate-pulse-soft" style={{ animationDelay: '400ms' }} />
        </div>
      </div>

      {/* Footer */}
      <p className={`absolute bottom-8 text-xs text-surface-400 transition-all duration-700 delay-500 ${show ? 'opacity-100' : 'opacity-0'
        }`}>
        Made for CU Students
      </p>
    </div>
  );
};

export default SplashScreen;
