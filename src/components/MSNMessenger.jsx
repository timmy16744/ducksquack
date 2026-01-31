import { useEffect, useRef, useState } from 'react';

// Track script loading state
let scriptLoadPromise = null;

function loadMSNScript() {
  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise((resolve) => {
    // Check if already loaded
    if (customElements.get('msn-messenger-window')) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = '/msn-messenger.js';
    script.async = true;
    script.onload = () => {
      // Wait for custom element to be defined
      customElements.whenDefined('msn-messenger-window').then(resolve);
    };
    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}

export default function MSNMessenger({ isOpen, onClose }) {
  const containerRef = useRef(null);
  const windowRef = useRef(null);
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    loadMSNScript().then(() => setScriptReady(true));
  }, []);

  useEffect(() => {
    if (isOpen && containerRef.current && scriptReady) {
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
  }, [isOpen, onClose, scriptReady]);

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        left: '0',
        top: '0',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1000,
      }}
      className="msn-messenger-container"
    />
  );
}
