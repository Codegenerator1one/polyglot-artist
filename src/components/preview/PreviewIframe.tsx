
import React, { useRef, useEffect } from 'react';

interface PreviewIframeProps {
  html: string;
  embedUrl: string | null;
  onRefresh: () => void;
  isRefreshing: boolean;
}

const PreviewIframe: React.FC<PreviewIframeProps> = ({ 
  html, 
  embedUrl, 
  onRefresh,
  isRefreshing
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Force the iframe to update when content changes
    if (iframeRef.current) {
      if (embedUrl) {
        iframeRef.current.src = embedUrl;
      } else if (html) {
        const iframe = iframeRef.current;
        iframe.srcdoc = html;
      }
    }
  }, [html, embedUrl, isRefreshing]);

  return (
    <div className="h-[400px]">
      <iframe
        ref={iframeRef}
        title="Preview"
        className="w-full h-full border-none"
        sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
      />
    </div>
  );
};

export default PreviewIframe;
