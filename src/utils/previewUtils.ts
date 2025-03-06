
/**
 * Generates HTML content for previewing different types of code
 */
export const generatePreviewHTML = (code: string, languageId: string): string => {
  let content = '';
  
  if (languageId === 'html') {
    content = code;
  } else if (languageId === 'css') {
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
  } else if (languageId === 'javascript') {
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
  } else if (languageId === 'markdown') {
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

  return content;
};

/**
 * Generates embed URLs for external code preview platforms
 */
export const generateEmbedUrl = (code: string, languageId: string): string => {
  let embedSrc = '';
  
  // Choose platform based on language
  if (['python', 'java', 'c', 'cpp', 'csharp', 'go', 'rust'].includes(languageId)) {
    // Use Replit for these languages
    const replitTemplate = languageId === 'python' ? 'python-3' : 
                         languageId === 'java' ? 'java-lts' :
                         languageId === 'c' ? 'c' :
                         languageId === 'cpp' ? 'cpp' :
                         languageId === 'csharp' ? 'csharp' :
                         languageId === 'go' ? 'go' : 'rust';
                         
    // Create a Base64 encoded version of the code for Replit
    const encodedCode = btoa(encodeURIComponent(code));
    embedSrc = `https://replit.com/@replit/${replitTemplate}?embed=true&code=${encodedCode}`;
  } else if (['typescript', 'jsx', 'tsx'].includes(languageId)) {
    // Use Stackblitz for TypeScript and React
    const project = {
      files: {
        [languageId === 'typescript' ? 'index.ts' : 
          languageId === 'jsx' ? 'index.jsx' : 'index.tsx']: code,
        'package.json': JSON.stringify({
          name: "code-preview",
          version: "0.0.0",
          private: true,
          dependencies: {
            ...(languageId === 'jsx' || languageId === 'tsx' ? {
              react: "^18.2.0",
              "react-dom": "^18.2.0"
            } : {})
          }
        }, null, 2)
      },
      template: languageId === 'typescript' ? 'typescript' : 'react-ts'
    };
    
    const projectJson = encodeURIComponent(JSON.stringify(project));
    embedSrc = `https://stackblitz.com/edit?embed=1&file=${encodeURIComponent(
      languageId === 'typescript' ? 'index.ts' : 
      languageId === 'jsx' ? 'index.jsx' : 'index.tsx'
    )}&hideExplorer=1&hideNavigation=1&view=preview&project=${projectJson}`;
  } else if (['php', 'ruby', 'sql', 'dart', 'kotlin', 'swift'].includes(languageId)) {
    // Use Replit for these languages too
    const replitTemplate = languageId === 'php' ? 'php' : 
                         languageId === 'ruby' ? 'ruby' :
                         languageId === 'swift' ? 'swift' :
                         languageId === 'kotlin' ? 'kotlin' :
                         languageId === 'dart' ? 'dart' : 'sqlite';
                         
    // Create a Base64 encoded version of the code for Replit
    const encodedCode = btoa(encodeURIComponent(code));
    embedSrc = `https://replit.com/@replit/${replitTemplate}?embed=true&code=${encodedCode}`;
  }
  
  return embedSrc;
};
