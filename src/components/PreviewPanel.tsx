
import React, { useEffect, useState } from 'react';
import { Language } from '../utils/supportedLanguages';
import PreviewHeader from './preview/PreviewHeader';
import PreviewIframe from './preview/PreviewIframe';
import { generatePreviewHTML, generateEmbedUrl } from '@/utils/previewUtils';

interface PreviewPanelProps {
  code: string;
  language: Language;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ code, language }) => {
  const [html, setHtml] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!code) {
      setEmbedUrl(null);
      setHtml('');
      return;
    }

    // Generate preview content based on language
    if (['html', 'css', 'javascript', 'markdown'].includes(language.id)) {
      // For web technologies, use our custom preview
      setHtml(generatePreviewHTML(code, language.id));
      setEmbedUrl(null);
    } else {
      // For other languages, use Replit or Stackblitz
      setEmbedUrl(generateEmbedUrl(code, language.id));
      setHtml('');
    }
  }, [code, language]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    
    setTimeout(() => {
      // Re-trigger the preview generation to force refresh
      if (['html', 'css', 'javascript', 'markdown'].includes(language.id)) {
        setHtml(generatePreviewHTML(code, language.id));
      } else {
        // For external embeds, we'll recreate the URL to force refresh
        setEmbedUrl(null);
        setTimeout(() => {
          setEmbedUrl(generateEmbedUrl(code, language.id));
        }, 50);
      }
      setIsRefreshing(false);
    }, 100);
  };

  const handleOpenExternal = () => {
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

  if (!code) {
    return (
      <div className="w-full h-[400px] rounded-md border border-border/50 bg-secondary/20 flex items-center justify-center text-muted-foreground animate-scale-in">
        <p>Generate code to see preview</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-md overflow-hidden border border-border/50 bg-background animate-scale-in">
      <PreviewHeader 
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        onOpenExternal={handleOpenExternal}
      />
      <PreviewIframe
        html={html}
        embedUrl={embedUrl}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />
    </div>
  );
};

export default PreviewPanel;
