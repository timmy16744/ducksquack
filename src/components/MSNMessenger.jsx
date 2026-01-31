import { useEffect, useRef } from 'react';

// Load the Web Components script once
let scriptLoaded = false;

export default function MSNMessenger({ isOpen, onClose }) {
  const containerRef = useRef(null);
  const windowRef = useRef(null);

  useEffect(() => {
    // Load the Web Components script if not already loaded
    if (!scriptLoaded) {
      const script = document.createElement('script');
      script.src = '/msn-messenger.js';
      script.async = true;
      document.head.appendChild(script);
      scriptLoaded = true;
    }
  }, []);

  useEffect(() => {
    if (isOpen && containerRef.current) {
      // Create the MSN window element
      const msnWindow = document.createElement('msn-messenger-window');
      windowRef.current = msnWindow;
      containerRef.current.appendChild(msnWindow);

      // Listen for close events
      const handleClose = () => {
        onClose();
      };
      msnWindow.addEventListener('close-window', handleClose);

      return () => {
        msnWindow.removeEventListener('close-window', handleClose);
        if (containerRef.current && msnWindow.parentNode === containerRef.current) {
          containerRef.current.removeChild(msnWindow);
        }
        windowRef.current = null;
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        left: '80px',
        top: '60px',
        zIndex: 1000,
      }}
    />
  );
}
