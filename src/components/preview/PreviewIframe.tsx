
import React, { useRef } from 'react';
import { cn } from '@/lib/utils';

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

  return (
    <div className="h-[400px]">
      <iframe
        ref={iframeRef}
        title="Preview"
        className="w-full h-full border-none"
        src={embedUrl || undefined}
        srcDoc={embedUrl ? undefined : html}
        sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
      />
    </div>
  );
};

export default PreviewIframe;
