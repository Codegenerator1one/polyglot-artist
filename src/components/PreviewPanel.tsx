
import React, { useEffect, useState, useRef } from 'react';
import { Language } from '../utils/supportedLanguages';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PreviewPanelProps {
  code: string;
  language: Language;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ code, language }) => {
  const [html, setHtml] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!code) {
      setEmbedUrl(null);
      setHtml('');
      return;
    }

    // For web technologies (HTML, CSS, JS, Markdown), use our custom preview
    if (language.id === 'html' || language.id === 'css' || language.id === 'javascript' || language.id === 'markdown') {
      let content = '';
      
      if (language.id === 'html') {
        content = code;
      } else if (language.id === 'css') {
        content = `
          <html>
            <head>
              <style>${code}</style>
            </head>
            <body>
              <div id="preview-container">
                <h1>CSS Preview</h1>
                <p>This is a paragraph with some <a href="#">links</a> and <strong>formatting</strong>.</p>
                <div class="box">A sample box element</div>
                <button>A sample button</button>
                <ul>
                  <li>List item 1</li>
                  <li>List item 2</li>
                  <li>List item 3</li>
                </ul>
              </div>
            </body>
          </html>
        `;
      } else if (language.id === 'javascript') {
        content = `
          <html>
            <head>
              <style>
                body { font-family: system-ui, sans-serif; padding: 20px; }
                #output { 
                  min-height: 100px; 
                  border: 1px solid #ddd; 
                  border-radius: 4px; 
                  padding: 12px; 
                  margin-top: 12px;
                  background: #f5f5f5;
                  white-space: pre-wrap;
                }
                h3 { margin-top: 0; }
              </style>
            </head>
            <body>
              <h3>JavaScript Console Output:</h3>
              <div id="output"></div>
              <script>
                // Capture console.log output
                const output = document.getElementById('output');
                const originalConsoleLog = console.log;
                console.log = function(...args) {
                  originalConsoleLog.apply(console, args);
                  const text = args.map(arg => {
                    if (typeof arg === 'object') {
                      return JSON.stringify(arg, null, 2);
                    }
                    return String(arg);
                  }).join(' ');
                  output.textContent += text + '\\n';
                };
                
                // Run the user code
                try {
                  ${code}
                } catch (error) {
                  console.log('Error:', error.message);
                }
              </script>
            </body>
          </html>
        `;
      } else if (language.id === 'markdown') {
        content = `
          <html>
            <head>
              <style>
                body { font-family: system-ui, sans-serif; padding: 20px; line-height: 1.6; }
                code { background: #f5f5f5; padding: 2px 4px; border-radius: 3px; }
                pre { background: #f5f5f5; padding: 12px; border-radius: 4px; overflow-x: auto; }
                blockquote { border-left: 4px solid #ddd; margin-left: 0; padding-left: 16px; color: #555; }
                img { max-width: 100%; }
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid #ddd; padding: 8px; }
                th { background-color: #f5f5f5; }
              </style>
              <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
            </head>
            <body>
              <div id="content"></div>
              <script>
                document.getElementById('content').innerHTML = marked.parse(\`${code.replace(/`/g, '\\`')}\`);
              </script>
            </body>
          </html>
        `;
      }
      
      setHtml(content);
      setEmbedUrl(null);
    } else {
      // For other languages, use alternative services that don't require API keys
      let compilerUrl = '';
      
      // Map our language IDs to online compiler services
      switch (language.id) {
        case 'python':
          compilerUrl = `https://trinket.io/embed/python3/a054c8a9a5?runOption=run&start=result&showInstructions=false`;
          break;
        case 'java':
          compilerUrl = `https://paiza.io/en/projects/new?language=java`;
          break;
        case 'cpp':
          compilerUrl = `https://godbolt.org/z/cP8MsrEoK`;
          break;
        case 'c':
          compilerUrl = `https://godbolt.org/z/aT3K1EMPc`;
          break;
        case 'csharp':
          compilerUrl = `https://dotnetfiddle.net/`;
          break;
        case 'php':
          compilerUrl = `https://3v4l.org/`;
          break;
        case 'ruby':
          compilerUrl = `https://paiza.io/en/projects/new?language=ruby`;
          break;
        case 'typescript':
          compilerUrl = `https://www.typescriptlang.org/play`;
          break;
        case 'jsx':
        case 'tsx':
          compilerUrl = `https://codesandbox.io/s/react-new`;
          break;
        case 'go':
          compilerUrl = `https://go.dev/play/`;
          break;
        case 'rust':
          compilerUrl = `https://play.rust-lang.org/`;
          break;
        case 'kotlin':
          compilerUrl = `https://play.kotlinlang.org/`;
          break;
        case 'swift':
          compilerUrl = `https://swiftfiddle.com/`;
          break;
        case 'dart':
          compilerUrl = `https://dartpad.dev/`;
          break;
        case 'sql':
          compilerUrl = `https://sqliteonline.com/`;
          break;
        default:
          // Default to TypeScript playground for unsupported languages
          compilerUrl = `https://www.typescriptlang.org/play`;
      }
      
      setEmbedUrl(compilerUrl);
      setHtml('');
    }
  }, [code, language]);

  const handleRefresh = () => {
    if (!iframeRef.current || (!html && !embedUrl)) return;
    
    setIsRefreshing(true);
    
    // Force refresh the iframe
    const iframe = iframeRef.current;
    iframe.src = 'about:blank';
    
    setTimeout(() => {
      if (iframe.contentWindow) {
        if (html) {
          iframe.contentWindow.document.open();
          iframe.contentWindow.document.write(html);
          iframe.contentWindow.document.close();
        } else if (embedUrl) {
          iframe.src = embedUrl;
        }
      }
      setIsRefreshing(false);
    }, 100);
  };

  const openExternalPreview = () => {
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

  // Show loading message while we set up the preview
  if (!code) {
    return (
      <div className="w-full h-[400px] rounded-md border border-border/50 bg-secondary/20 flex items-center justify-center text-muted-foreground animate-scale-in">
        <p>Generate code to see preview</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-md overflow-hidden border border-border/50 bg-background animate-scale-in">
      <div className="flex items-center justify-between bg-secondary/50 px-4 py-2 border-b border-border/50">
        <span className="text-sm font-medium">Preview</span>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8 px-2 text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={openExternalPreview}
            className="h-8 px-2 text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>
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
    </div>
  );
};

export default PreviewPanel;
