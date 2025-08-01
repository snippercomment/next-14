'use client';

import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // Scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 right-4 bg-black text-white px-4 py-2 rounded-full shadow-lg hover:bg-gray-800 transition-all duration-300 flex items-center gap-2 z-50"
          aria-label="Lên đầu trang"
        >
          <span className="text-sm font-medium">Lên đầu</span>
          <ChevronUp size={20} />
        </button>
      )}
    </>
  );
}