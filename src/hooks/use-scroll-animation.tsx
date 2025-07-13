import { useEffect, useRef, useState } from 'react';

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  delay?: number;
}

export function useScrollAnimation<T extends HTMLElement = HTMLDivElement>(options: UseScrollAnimationOptions = {}) {
  const { threshold = 0.1, rootMargin = '0px', delay = 0 } = options;
  const elementRef = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
          }, delay);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
      observer.disconnect();
    };
  }, [threshold, rootMargin, delay]);

  return { elementRef, isVisible };
}