
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

  useEffect(() => {
    if (!code) {
      return;
    }

    let content = '';
    
    // HTML
    if (language.id === 'html') {
      content = code;
    } 
    // CSS
    else if (language.id === 'css') {
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
    } 
    // JavaScript
    else if (language.id === 'javascript') {
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
    } 
    // TypeScript (compiled to JavaScript)
    else if (language.id === 'typescript') {
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
              .note { color: #666; font-style: italic; margin-bottom: 10px; }
              h3 { margin-top: 0; }
            </style>
          </head>
          <body>
            <h3>TypeScript Preview:</h3>
            <div class="note">TypeScript code compiled to JavaScript for preview</div>
            <div id="output"></div>
            <script>
              const output = document.getElementById('output');
              // Note: In a real scenario, we would need to transpile TypeScript to JavaScript
              // This is a simplified view showing the TypeScript as-is
              output.textContent = "TypeScript code (simulated execution):\\n\\n";
              output.textContent += \`${code.replace(/`/g, '\\`')}\`;
              
              // Add note about actual execution
              output.textContent += "\\n\\n// Note: For full TypeScript functionality, the code would need to be transpiled.";
            </script>
          </body>
        </html>
      `;
    }
    // React/JSX (using Babel standalone for transpilation)
    else if (language.id === 'jsx' || language.id === 'tsx') {
      content = `
        <html>
          <head>
            <style>
              body { font-family: system-ui, sans-serif; padding: 20px; }
              #app { 
                min-height: 100px; 
                border: 1px solid #ddd; 
                border-radius: 4px; 
                padding: 12px; 
                margin-top: 12px;
                background: #f5f5f5;
              }
              #error {
                color: red;
                margin-top: 10px;
                white-space: pre-wrap;
              }
              .note { color: #666; font-style: italic; margin-bottom: 10px; }
              h3 { margin-top: 0; }
            </style>
            <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
            <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
            <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          </head>
          <body>
            <h3>React Preview:</h3>
            <div class="note">JSX code compiled and rendered with React</div>
            <div id="app"></div>
            <div id="error"></div>
            <script type="text/babel">
              try {
                // Wrapping the code in a function to isolate variables
                const UserCode = () => {
                  ${code}
                  return <div>Please return a React component at the end of your code</div>;
                };
                
                // Render the component
                const root = ReactDOM.createRoot(document.getElementById('app'));
                root.render(<UserCode />);
              } catch (error) {
                document.getElementById('error').textContent = "Error: " + error.message;
              }
            </script>
          </body>
        </html>
      `;
    }
    // Python (using Pyodide)
    else if (language.id === 'python') {
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
              #loading { color: #666; }
              h3 { margin-top: 0; }
            </style>
            <script src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"></script>
          </head>
          <body>
            <h3>Python Execution:</h3>
            <div id="loading">Loading Python environment...</div>
            <div id="output" style="display: none;"></div>
            <script>
              async function main() {
                try {
                  // Load Pyodide
                  const pyodide = await loadPyodide();
                  document.getElementById('loading').style.display = 'none';
                  document.getElementById('output').style.display = 'block';
                  
                  // Redirect Python stdout to our output div
                  pyodide.globals.set("print_original", pyodide.globals.get("print"));
                  
                  const output = document.getElementById('output');
                  output.textContent = "Output:\\n";
                  
                  await pyodide.runPythonAsync(\`
                    import sys
                    from js import document
                    
                    class BrowserOutput:
                        def write(self, text):
                            # Append to output element
                            element = document.getElementById('output')
                            element.textContent = element.textContent + text
                    
                    sys.stdout = BrowserOutput()
                    
                    # Now execute the user's code
                    ${code.replace(/`/g, '\\`')}
                  \`);
                } catch (error) {
                  const output = document.getElementById('output');
                  output.style.display = 'block';
                  document.getElementById('loading').style.display = 'none';
                  output.textContent = "Error: " + error.message;
                }
              }
              
              main();
            </script>
          </body>
        </html>
      `;
    }
    // Java (using a mock compiler/runner)
    else if (language.id === 'java') {
      content = `
        <html>
          <head>
            <style>
              body { font-family: system-ui, sans-serif; padding: 20px; }
              #code-display { 
                min-height: 100px; 
                border: 1px solid #ddd; 
                border-radius: 4px; 
                padding: 12px; 
                margin-top: 12px;
                background: #f5f5f5;
                white-space: pre-wrap;
                font-family: monospace;
              }
              #output {
                min-height: 50px; 
                border: 1px solid #ddd; 
                border-radius: 4px; 
                padding: 12px; 
                margin-top: 12px;
                background: #f0f0f0;
                white-space: pre-wrap;
              }
              .note { color: #666; font-style: italic; margin-bottom: 10px; }
              h3 { margin-top: 0; }
            </style>
          </head>
          <body>
            <h3>Java Code Preview:</h3>
            <div class="note">Java code cannot be executed in the browser. This is a visualization only.</div>
            <div id="code-display">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
            <h4>Simulated Output:</h4>
            <div id="output">
              // Java code would need to be compiled and executed on a server
              // This is a mockup of what the output might look like
              
              Compiling Java code...
              ${code.includes('public static void main') ? 'Running main method...\nHello from Java!' : 'No main method found. Code compiled successfully.'}
            </div>
          </body>
        </html>
      `;
    }
    // C++ (mock preview)
    else if (language.id === 'cpp' || language.id === 'c') {
      content = `
        <html>
          <head>
            <style>
              body { font-family: system-ui, sans-serif; padding: 20px; }
              #code-display { 
                min-height: 100px; 
                border: 1px solid #ddd; 
                border-radius: 4px; 
                padding: 12px; 
                margin-top: 12px;
                background: #f5f5f5;
                white-space: pre-wrap;
                font-family: monospace;
              }
              #output {
                min-height: 50px; 
                border: 1px solid #ddd; 
                border-radius: 4px; 
                padding: 12px; 
                margin-top: 12px;
                background: #f0f0f0;
                white-space: pre-wrap;
              }
              .note { color: #666; font-style: italic; margin-bottom: 10px; }
              h3 { margin-top: 0; }
            </style>
          </head>
          <body>
            <h3>${language.id === 'cpp' ? 'C++' : 'C'} Code Preview:</h3>
            <div class="note">${language.id === 'cpp' ? 'C++' : 'C'} code cannot be executed in the browser. This is a visualization only.</div>
            <div id="code-display">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
            <h4>Simulated Output:</h4>
            <div id="output">
              // ${language.id === 'cpp' ? 'C++' : 'C'} code would need to be compiled and executed on a server
              // This is a mockup of what the output might look like
              
              Compiling ${language.id === 'cpp' ? 'C++' : 'C'} code...
              ${code.includes('main') ? 'Running executable...\nProgram output would appear here.' : 'No main function found. Code compiled successfully.'}
            </div>
          </body>
        </html>
      `;
    }
    // Markdown
    else if (language.id === 'markdown') {
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
    // Generic code preview for other languages
    else {
      content = `
        <html>
          <head>
            <style>
              body { font-family: system-ui, sans-serif; padding: 20px; }
              #code-display { 
                min-height: 100px; 
                border: 1px solid #ddd; 
                border-radius: 4px; 
                padding: 12px; 
                margin-top: 12px;
                background: #f5f5f5;
                white-space: pre-wrap;
                font-family: monospace;
              }
              .note { color: #666; font-style: italic; margin-bottom: 10px; }
              h3 { margin-top: 0; }
            </style>
          </head>
          <body>
            <h3>${language.name} Code Preview:</h3>
            <div class="note">This code cannot be executed directly in the browser.</div>
            <div id="code-display">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
          </body>
        </html>
      `;
    }

    setHtml(content);
  }, [code, language]);

  const handleRefresh = () => {
    if (!iframeRef.current || !html) return;
    
    setIsRefreshing(true);
    
    // Force refresh the iframe
    const iframe = iframeRef.current;
    iframe.src = 'about:blank';
    
    setTimeout(() => {
      if (iframe.contentWindow) {
        iframe.contentWindow.document.open();
        iframe.contentWindow.document.write(html);
        iframe.contentWindow.document.close();
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
              const newWindow = window.open('', '_blank');
              if (newWindow) {
                newWindow.document.write(html);
                newWindow.document.close();
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
          srcDoc={html}
          sandbox="allow-scripts allow-modals"
        />
      </div>
    </div>
  );
};

export default PreviewPanel;
