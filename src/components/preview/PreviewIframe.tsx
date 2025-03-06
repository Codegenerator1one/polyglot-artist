
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, RefreshCw } from 'lucide-react';
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

  const handleExternalOpen = () => {
    if (html) {
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(html);
        newWindow.document.close();
      }
    } else if (embedUrl) {
      window.open(embedUrl, '_blank');
    }
  };

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
