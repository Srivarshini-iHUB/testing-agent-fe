import React, { useEffect, useRef } from "react";

export const IframeReport = ({ html }) => {
  const iframeRef = useRef(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.onload = () => {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
          const iframeHeight = iframeDoc.documentElement.scrollHeight;
          iframe.style.height = iframeHeight + "px"; // ✅ auto fit height
        } catch (e) {
          console.error("Error resizing iframe:", e);
        }
      };
    }
  }, [html]);

  return (
    <iframe
      ref={iframeRef}
      title="Jest Report"
      srcDoc={html}
      className="w-full border rounded-lg bg-white"
      sandbox="allow-same-origin allow-scripts"
    />
  );
};
