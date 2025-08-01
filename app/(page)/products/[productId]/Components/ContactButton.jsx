'use client';

import { useState, useRef, useEffect } from 'react';
import { Headphones, MessageCircle, Phone } from 'lucide-react';

export default function ContactButton() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50" ref={dropdownRef}>
      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-[200px] mb-2">
          {/* Chat với nhân viên */}
          <button className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors">
            <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-pink-600" />
            </div>
            <span className="text-gray-700 text-sm">Chat với nhân viên</span>
          </button>

          {/* Liên hệ Zalo */}
          <button className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <div className="w-5 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                Z
              </div>
            </div>
            <span className="text-gray-700 text-sm">Liên hệ Zalo</span>
          </button>
        </div>
      )}

      {/* Main Contact Button */}
      <button
        onClick={toggleDropdown}
        className="bg-red-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-red-700 transition-all duration-300 flex items-center gap-2"
        aria-label="Liên hệ"
      >
        <Headphones size={20} />
        <span className="text-sm font-medium">Liên hệ</span>
      </button>
    </div>
  );
}