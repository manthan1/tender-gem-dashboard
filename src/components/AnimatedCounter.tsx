import React, { useEffect, useState } from 'react';

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  className?: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ 
  end, 
  duration = 2000, 
  suffix = '', 
  className = '' 
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationId: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * end));

      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [end, duration]);

  const formatNumber = (num: number) => {
    if (num >= 100000) {
      return `${Math.floor(num / 1000)},${String(num % 1000).padStart(3, '0')}`;
    } else if (num >= 1000) {
      return `${Math.floor(num / 1000)},${String(num % 1000).padStart(3, '0')}`;
    }
    return num.toString();
  };

  return (
    <span className={className}>
      {formatNumber(count)}{suffix}
    </span>
  );
};

export default AnimatedCounter;