
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

    // Generate embed URLs for Stackblitz or Replit based on language
    if (language.id === 'html' || language.id === 'css' || language.id === 'javascript' || language.id === 'markdown') {
      // For web technologies, still use our custom preview
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
      // For other languages, use Replit or Stackblitz
      let embedSrc = '';
      
      // Choose platform based on language
      if (['python', 'java', 'c', 'cpp', 'csharp', 'go', 'rust'].includes(language.id)) {
        // Use Replit for these languages
        const replitTemplate = language.id === 'python' ? 'python' : 
                             language.id === 'java' ? 'java' :
                             language.id === 'c' ? 'c' :
                             language.id === 'cpp' ? 'cpp' :
                             language.id === 'csharp' ? 'csharp' :
                             language.id === 'go' ? 'go' : 'rust';
                             
        // Encode the code for the URL
        const encodedCode = encodeURIComponent(code);
        embedSrc = `https://replit.com/@replit/${replitTemplate}?lite=true&outputonly=1#main.${language.extension}`;
      } else if (['typescript', 'jsx', 'tsx'].includes(language.id)) {
        // Use Stackblitz for TypeScript and React
        const project = {
          files: {
            [language.id === 'typescript' ? 'index.ts' : 
              language.id === 'jsx' ? 'index.jsx' : 'index.tsx']: code,
            'package.json': JSON.stringify({
              name: "code-preview",
              version: "0.0.0",
              private: true,
              dependencies: {
                ...(language.id === 'jsx' || language.id === 'tsx' ? {
                  react: "^18.2.0",
                  "react-dom": "^18.2.0"
                } : {})
              }
            }, null, 2)
          },
          template: language.id === 'typescript' ? 'typescript' : 'react-ts'
        };
        
        const projectJson = encodeURIComponent(JSON.stringify(project));
        embedSrc = `https://stackblitz.com/edit?embed=1&file=${encodeURIComponent(
          language.id === 'typescript' ? 'index.ts' : 
          language.id === 'jsx' ? 'index.jsx' : 'index.tsx'
        )}&hideExplorer=1&hideNavigation=1&view=preview&project=${projectJson}`;
      } else if (['php', 'ruby', 'sql', 'dart', 'kotlin', 'swift'].includes(language.id)) {
        // Use Replit for these languages too
        const replitTemplate = language.id === 'php' ? 'php' : 
                             language.id === 'ruby' ? 'ruby' :
                             language.id === 'swift' ? 'swift' :
                             language.id === 'kotlin' ? 'kotlin' :
                             language.id === 'dart' ? 'dart' : 'sqlite';
                             
        // Encode the code for the URL
        const encodedCode = encodeURIComponent(code);
        embedSrc = `https://replit.com/@replit/${replitTemplate}?lite=true&outputonly=1#main.${language.extension}`;
      }
      
      setEmbedUrl(embedSrc);
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
            onClick={() => {
              if (html) {
                const newWindow = window.open('', '_blank');
                if (newWindow) {
                  newWindow.document.write(html);
                  newWindow.document.close();
                }
              } else if (embedUrl) {
                window.open(embedUrl, '_blank');
              }
            }}
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
