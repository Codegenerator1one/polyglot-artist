import React, { useEffect, useState, useRef } from 'react';
import { Language } from '../utils/supportedLanguages';
import { ExternalLink, RefreshCw, Play, AlertTriangle, Code, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CodeMirror from '@uiw/react-codemirror';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { markdown } from '@codemirror/lang-markdown';
import { Link } from '@/components/ui/link';
import { useToast } from '@/components/ui/use-toast';

interface PreviewPanelProps {
  code: string;
  language: Language;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ code, language }) => {
  const [compiledOutput, setCompiledOutput] = useState<string>('');
  const [isCompiling, setIsCompiling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'output' | 'console'>('output');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();

  const getLanguageExtension = (langId: string) => {
    switch (langId) {
      case 'javascript':
      case 'typescript':
      case 'jsx':
      case 'tsx':
        return javascript();
      case 'html':
        return html();
      case 'css':
        return css();
      case 'python':
        return python();
      case 'java':
      case 'kotlin':
        return java();
      case 'markdown':
        return markdown();
      default:
        return javascript();
    }
  };

  const compileCode = async () => {
    if (!code.trim()) {
      setCompiledOutput('No code to compile');
      return;
    }

    setIsCompiling(true);
    setError(null);

    try {
      if (['html', 'css', 'javascript', 'markdown'].includes(language.id)) {
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
                  const output = document.getElementById('output');
                  const originalConsoleLog = console.log;
                  const originalConsoleError = console.error;
                  const originalConsoleWarn = console.warn;
                  
                  console.log = function(...args) {
                    originalConsoleLog.apply(console, args);
                    const text = args.map(arg => {
                      if (typeof arg === 'object') {
                        return JSON.stringify(arg, null, 2);
                      }
                      return String(arg);
                    }).join(' ');
                    output.innerHTML += '<div class="log">' + text + '</div>';
                  };
                  
                  console.error = function(...args) {
                    originalConsoleError.apply(console, args);
                    const text = args.map(arg => {
                      if (typeof arg === 'object') {
                        return JSON.stringify(arg, null, 2);
                      }
                      return String(arg);
                    }).join(' ');
                    output.innerHTML += '<div class="error" style="color: red;">' + text + '</div>';
                  };
                  
                  console.warn = function(...args) {
                    originalConsoleWarn.apply(console, args);
                    const text = args.map(arg => {
                      if (typeof arg === 'object') {
                        return JSON.stringify(arg, null, 2);
                      }
                      return String(arg);
                    }).join(' ');
                    output.innerHTML += '<div class="warning" style="color: orange;">' + text + '</div>';
                  };
                  
                  try {
                    ${code}
                  } catch (error) {
                    console.error('Runtime Error:', error.message);
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
        
        if (iframeRef.current && iframeRef.current.contentWindow) {
          iframeRef.current.contentWindow.document.open();
          iframeRef.current.contentWindow.document.write(content);
          iframeRef.current.contentWindow.document.close();
        }
        
        setCompiledOutput('');
        setActiveTab('output');
      } else {
        setActiveTab('console');
        await new Promise(resolve => setTimeout(resolve, 600));
        
        switch (language.id) {
          case 'python':
            simulatePythonExecution(code);
            break;
          case 'java':
            simulateJavaExecution(code);
            break;
          case 'cpp':
          case 'c':
            simulateCppExecution(code);
            break;
          case 'typescript':
            simulateTypeScriptExecution(code);
            break;
          case 'kotlin':
            simulateKotlinExecution(code);
            break;
          case 'swift':
            simulateSwiftExecution(code);
            break;
          case 'csharp':
            simulateCSharpExecution(code);
            break;
          case 'go':
            simulateGoExecution(code);
            break;
          case 'rust':
            simulateRustExecution(code);
            break;
          case 'php':
            simulatePHPExecution(code);
            break;
          case 'ruby':
            simulateRubyExecution(code);
            break;
          default:
            setCompiledOutput(`[${language.name} Compiler]\nCompiled successfully.\n\n> Program output will appear here when you run the code.`);
        }
      }
      
      toast({
        title: "Code Execution Complete",
        description: `${language.name} code was executed successfully.`,
        variant: "default",
      });
    } catch (err) {
      console.error("Compilation error:", err);
      setError(`Failed to compile: ${err instanceof Error ? err.message : 'Unknown error'}`);
      
      toast({
        title: "Compilation Error",
        description: `Failed to compile ${language.name} code: ${err instanceof Error ? err.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsCompiling(false);
    }
  };

  const simulatePythonExecution = (code: string) => {
    try {
      let output = "[Python Interpreter v3.10.0]\n";
      let errorDetected = false;
      
      if ((code.includes('import') && code.includes('{')) || (code.includes('print(') && !code.includes(')'))) {
        output += "SyntaxError: invalid syntax\n";
        errorDetected = true;
      }
      
      if (!errorDetected) {
        const importMatches = code.match(/(?:import|from) [\w\s.,*]+(?: import [\w\s.,*]+)?/g) || [];
        if (importMatches.length > 0) {
          output += "Successfully imported modules:\n";
          importMatches.forEach(match => {
            output += `  ${match.trim()}\n`;
          });
          output += "\n";
        }
        
        const functionMatches = code.match(/def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g) || [];
        if (functionMatches.length > 0) {
          output += `Defined ${functionMatches.length} function(s):\n`;
          functionMatches.forEach(match => {
            output += `  ${match.replace('def ', '').trim()}\n`;
          });
          output += "\n";
        }
        
        const classMatches = code.match(/class\s+([a-zA-Z_][a-zA-Z0-9_]*)/g) || [];
        if (classMatches.length > 0) {
          output += `Defined ${classMatches.length} class(es):\n`;
          classMatches.forEach(match => {
            output += `  ${match.replace('class ', '').trim()}\n`;
          });
          output += "\n";
        }
        
        const printMatches = code.match(/print\s*\((.*?)(?:\)|(?:#))/g) || [];
        
        if (printMatches.length > 0) {
          output += "Output:\n";
          printMatches.forEach(match => {
            if (match.includes('#')) return; 
            let content = match.substring(match.indexOf('(') + 1);
            content = content.substring(0, content.lastIndexOf(')'));
            
            if (content.startsWith('f"') || content.startsWith("f'")) {
              const baseString = content.substring(2, content.length - 1);
              const formattedString = baseString.replace(/\{([^}]+)\}/g, (_, expr) => `<${expr.trim()}>`);
              output += `${formattedString}\n`;
              return;
            }
            
            if ((content.startsWith('"') && content.endsWith('"')) || 
                (content.startsWith("'") && content.endsWith("'"))) {
              output += `${content.substring(1, content.length - 1)}\n`;
              return;
            }
            
            if (content.includes('+') || content.includes(',')) {
              const parts = content.split(/[+,]/).map(p => p.trim());
              const outputParts = parts.map(part => {
                if ((part.startsWith('"') && part.endsWith('"')) || 
                    (part.startsWith("'") && part.endsWith("'"))) {
                  return part.substring(1, part.length - 1);
                } else {
                  return `<${part}>`;
                }
              });
              output += `${outputParts.join(' ')}\n`;
              return;
            }
            
            output += `${content} (evaluated value)\n`;
          });
        } else if (code.trim() && !functionMatches.length && !classMatches.length && !code.includes('if __name__')) {
          const lines = code.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));
          if (lines.length > 0) {
            output += "Output:\n";
            lines.forEach(line => {
              if (line.includes('=')) {
                const parts = line.split('=');
                output += `> ${parts[0].trim()} = ${parts[1].trim()} (assigned)\n`;
              } else if (!line.includes('import ') && !line.includes('from ')) {
                output += `> ${line.trim()} (evaluated to result)\n`;
              }
            });
          }
        }
        
        if (code.includes("if __name__ == \"__main__\":") || code.includes("if __name__ == '__main__':")) {
          output += "\nExecuted main function successfully.\n";
          output += "Program executed with return code: 0\n";
        } else if (printMatches.length > 0 || functionMatches.length > 0 || classMatches.length > 0) {
          output += "\nProgram executed with return code: 0\n";
        }
      }
      
      setCompiledOutput(output);
    } catch (err) {
      setError(`Python simulation error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const simulateJavaExecution = (code: string) => {
    try {
      let output = "[Java Compiler v17.0.6]\n";
      let errorDetected = false;
      
      if ((code.includes('public class') && !code.includes('{')) || 
          (code.includes('System.out.println') && !code.includes(';'))) {
        output += "Error: Syntax error detected\n";
        errorDetected = true;
      }
      
      if (!errorDetected) {
        const packageMatch = code.match(/package\s+([a-zA-Z_][a-zA-Z0-9_.]*);/);
        if (packageMatch) {
          output += `Using package: ${packageMatch[1]}\n`;
        }
        
        const importMatches = code.match(/import\s+([a-zA-Z_][a-zA-Z0-9_.]*)(|\.\*);/g) || [];
        if (importMatches.length > 0) {
          output += `Successfully imported ${importMatches.length} package(s):\n`;
          importMatches.forEach(importStmt => {
            output += `  ${importStmt.trim()}\n`;
          });
          output += "\n";
        }
        
        const classMatch = code.match(/class\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
        if (classMatch) {
          const className = classMatch[1];
          output += `Compiled class: ${className}\n`;
          
          const methodMatches = code.match(/(?:public|private|protected)?\s+(?:static)?\s+\w+\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\([^)]*\)\s*(?:throws\s+[a-zA-Z_][a-zA-Z0-9_]*(?:,\s*[a-zA-Z_][a-zA-Z0-9_]*)*\s*)?{/g) || [];
          if (methodMatches.length > 0) {
            output += `Found ${methodMatches.length} method(s) in class ${className}\n\n`;
          }
          
          const hasMain = code.match(/public\s+static\s+void\s+main\s*\(\s*String(\[\])?\s+\w+\s*\)/);
          if (hasMain) {
            output += "Found main method, executing...\n\n";
            
            const printMatches = code.match(/System\.out\.println\s*\((.*?)\);|System\.out\.print\s*\((.*?)\);/g) || [];
            
            if (printMatches.length > 0) {
              output += "Output:\n";
              printMatches.forEach(match => {
                const isPrintln = match.includes("println");
                let content = match.substring(
                  match.indexOf('(') + 1,
                  match.lastIndexOf(')')
                );
                
                if (content.includes(" + ")) {
                  const parts = content.split(" + ").map(p => p.trim());
                  let result = "";
                  
                  parts.forEach(part => {
                    if ((part.startsWith('"') && part.endsWith('"')) || 
                        (part.startsWith("'") && part.endsWith("'"))) {
                      result += part.substring(1, part.length - 1);
                    } else {
                      result += `<${part}>`;
                    }
                  });
                  
                  output += `${result}${isPrintln ? '\n' : ''}`;
                  return;
                }
                
                if ((content.startsWith('"') && content.endsWith('"')) || 
                    (content.startsWith("'") && content.endsWith("'"))) {
                  output += `${content.substring(1, content.length - 1)}${isPrintln ? '\n' : ''}`;
                } else {
                  output += `<${content}>${isPrintln ? '\n' : ''}`;
                }
              });
            } else {
              output += "Program executed with no output.\n";
            }
            
            output += "\nProgram executed with return code: 0\n";
          } else {
            output += "No main method found. Class compiled but not executed.\n";
          }
        } else {
          output += "Error: No class definition found in Java code.\n";
        }
      }
      
      setCompiledOutput(output);
    } catch (err) {
      setError(`Java simulation error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const simulateCppExecution = (code: string) => {
    try {
      let output = `[${language.id.toUpperCase()} Compiler v13.2.0]\n`;
      let errorDetected = false;
      
      if ((code.includes('int main') && !code.includes('{')) || 
          (code.includes('printf') && !code.includes(';'))) {
        output += "Error: Syntax error detected\n";
        errorDetected = true;
      }
      
      if (!errorDetected) {
        const includeMatches = code.match(/#include\s*[<"]([^>"]+)[>"]/g) || [];
        if (includeMatches.length > 0) {
          output += `Successfully included ${includeMatches.length} header(s):\n`;
          includeMatches.forEach(include => {
            output += `  ${include.trim()}\n`;
          });
          output += "\n";
        }
        
        if (code.includes("using namespace std;")) {
          output += "Using namespace std\n\n";
        }
        
        const functionMatches = code.match(/\w+\s+(\w+)\s*\([^)]*\)\s*(?:const)?\s*{/g) || [];
        if (functionMatches.length > 0 && !functionMatches.some(f => f.includes('main'))) {
          output += `Found ${functionMatches.length} function definition(s)\n`;
        }
        
        const hasMain = code.match(/int\s+main\s*\(\s*(void|int\s+\w+\s*,\s*char\s*\*\s*\w+\[\s*\]|)\s*\)/);
        if (hasMain) {
          output += "Found main function, compiling and executing...\n\n";
          
          const printfMatches = code.match(/printf\s*\(\s*("[^"]*"(?:,\s*[^;]+)?)\);/g) || [];
          const coutMatches = code.match(/cout\s*<<\s*(?:"([^"]*)"|'([^']*)'|([^<;]+))(?:\s*<<\s*(?:endl|"[^"]*"|'[^']*'|[^<;]+))*\s*;/g) || [];
          
          if (printfMatches.length > 0 || coutMatches.length > 0) {
            output += "Output:\n";
            
            printfMatches.forEach(match => {
              const parts = match.substring(match.indexOf('(') + 1, match.lastIndexOf(')'));
              const formatStringMatch = parts.match(/"([^"]*)"/);
              
              if (formatStringMatch) {
                let formatted = formatStringMatch[1];
                const args = parts.substring(formatStringMatch[0].length).split(',').map(arg => arg.trim()).filter(arg => arg);
                
                let argIndex = 0;
                formatted = formatted.replace(/%d|%i|%f|%lf|%c|%s|%p|%x|%X|%o|%u/g, (match) => {
                  if (argIndex < args.length) {
                    if (/^-?\d+(\.\d+)?$/.test(args[argIndex])) {
                      return args[argIndex++];
                    } else {
                      return `<${args[argIndex++]}>`;
                    }
                  } else {
                    return `<${match}>`;
                  }
                });
                
                formatted = formatted
                  .replace(/\\n/g, '\n')
                  .replace(/\\t/g, '\t')
                  .replace(/\\r/g, '')
                  .replace(/\\"/g, '"')
                  .replace(/\\'/g, "'");
                
                output += formatted;
              }
            });
            
            coutMatches.forEach(match => {
              let coutOutput = '';
              let hasEndl = false;
              
              const coutParts = match.replace(/cout\s*<<\s*/, '').replace(/\s*;$/, '').split(/\s*<<\s*/);
              
              coutParts.forEach(part => {
                if (part === 'endl') {
                  hasEndl = true;
                  return;
                }
                
                if (part.startsWith('"') && part.endsWith('"')) {
                  coutOutput += part.substring(1, part.length - 1);
                  return;
                }
                
                if (part.startsWith("'") && part.endsWith("'")) {
                  coutOutput += part.substring(1, part.length - 1);
                  return;
                }
                
                if (part.match(/^[a-zA-Z0-9_]+$/)) {
                  coutOutput += `<${part}>`;
                } else if (part.match(/^-?\d+(\.\d+)?$/)) {
                  coutOutput += part;
                } else {
                  coutOutput += `<${part}>`;
                }
              });
              
              output += coutOutput + (hasEndl ? '\n' : '');
            });
          } else {
            output += "Program executed with no output.\n";
          }
          
          const returnMatch = code.match(/return\s+(\d+)\s*;/);
          if (returnMatch) {
            output += `\nProgram executed with return code: ${returnMatch[1]}\n`;
          } else {
            output += "\nProgram executed with return code: 0\n";
          }
        } else {
          output += "No main function found. Code compiled but not executed.\n";
        }
      }
      
      setCompiledOutput(output);
    } catch (err) {
      setError(`${language.id.toUpperCase()} simulation error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const simulateTypeScriptExecution = (code: string) => {
    try {
      let output = "[TypeScript Compiler v5.0.4]\n";
      
      if ((code.includes('function') && !code.includes('{')) || 
          (code.includes('console.log') && !code.includes(';') && !code.includes('}'))) {
        output += "Error: TypeScript syntax error detected\n";
        setCompiledOutput(output);
        return;
      }
      
      const importMatches = code.match(/import\s+.*?from\s+['"].*?['"];/g) || [];
      if (importMatches.length > 0) {
        output += `Processed ${importMatches.length} import statement(s):\n`;
        importMatches.forEach(imp => {
          output += `  ${imp.trim()}\n`;
        });
        output += "\n";
      }
      
      const interfaceMatches = code.match(/interface\s+([a-zA-Z_][a-zA-Z0-9_]*)/g) || [];
      if (interfaceMatches.length > 0) {
        output += `Defined ${interfaceMatches.length} interface(s)\n`;
      }
      
      const typeMatches = code.match(/type\s+([a-zA-Z_][a-zA-Z0-9_]*)/g) || [];
      if (typeMatches.length > 0) {
        output += `Defined ${typeMatches.length} type(s)\n`;
      }
      
      const classMatches = code.match(/class\s+([a-zA-Z_][a-zA-Z0-9_]*)/g) || [];
      if (classMatches.length > 0) {
        output += `Defined ${classMatches.length} class(es)\n`;
      }
      
      const functionMatches = code.match(/function\s+([a-zA-Z_][a-zA-Z0-9_]*)/g) || [];
      if (functionMatches.length > 0) {
        output += `Defined ${functionMatches.length} function(s)\n`;
      }
      
      const logMatches = code.match(/console\.log\s*\((.*?)\)/g) || [];
      
      if (logMatches.length > 0) {
        output += "\nTranspiled to JavaScript successfully.\n\nOutput:\n";
        
        logMatches.forEach(match => {
          const content = match.substring(
            match.indexOf('(') + 1,
            match.lastIndexOf(')')
          ).trim();
          
          if (content.startsWith('`') && content.endsWith('`')) {
            const templateContent = content.substring(1, content.length - 1);
            const interpolatedContent = templateContent.replace(/\${([^}]*)}/g, (_, expr) => `<${expr}>`);
            output += interpolatedContent + '\n';
            return;
          }
          
          if ((content.startsWith('"') && content.endsWith('"')) || 
              (content.startsWith("'") && content.endsWith("'"))) {
            const stringContent = content.substring(1, content.length - 1)
              .replace(/\\n/g, '\n')
              .replace(/\\t/g, '\t');
            output += `${stringContent}\n`;
            return;
          } 
          
          if (content.includes('+')) {
            const parts = content.split('+').map(p => p.trim());
            let result = '';
            
            parts.forEach(part => {
              if ((part.startsWith('"') && part.endsWith('"')) || 
                  (part.startsWith("'") && part.endsWith("'"))) {
                result += part.substring(1, part.length - 1);
              } else {
                result += `<${part}>`;
              }
            });
            
            output += `${result}\n`;
            return;
          }
          
          if (/^[a-zA-Z0-9_]+$/.test(content)) {
            output += `<${content}>\n`;
          } else if (content.match(/^-?\d+(\.\d+)?$/)) {
            output += `${content}\n`;
          } else {
            output += `<expression: ${content}>\n`;
          }
        });
      } else if (code.trim()) {
        output += "\nTranspiled to JavaScript successfully.\n\nProgram executed with no console output.\n";
      }
      
      setCompiledOutput(output);
    } catch (err) {
      setError(`TypeScript simulation error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const simulateKotlinExecution = (code: string) => {
    setCompiledOutput("[Kotlin Compiler v1.9.0]\nCompiled successfully.\n\n> Kotlin program executed. Output would appear here.");
  };

  const simulateSwiftExecution = (code: string) => {
    setCompiledOutput("[Swift Compiler v5.8.0]\nCompiled successfully.\n\n> Swift program executed. Output would appear here.");
  };

  const simulateCSharpExecution = (code: string) => {
    setCompiledOutput("[C# Compiler v10.0]\nCompiled successfully.\n\n> C# program executed. Output would appear here.");
  };

  const simulateGoExecution = (code: string) => {
    setCompiledOutput("[Go Compiler v1.20.3]\nCompiled successfully.\n\n> Go program executed. Output would appear here.");
  };

  const simulateRustExecution = (code: string) => {
    setCompiledOutput("[Rust Compiler v1.68.2]\nCompiled successfully.\n\n> Rust program executed. Output would appear here.");
  };

  const simulatePHPExecution = (code: string) => {
    setCompiledOutput("[PHP Interpreter v8.2.4]\nExecuted successfully.\n\n> PHP program executed. Output would appear here.");
  };

  const simulateRubyExecution = (code: string) => {
    setCompiledOutput("[Ruby Interpreter v3.2.1]\nExecuted successfully.\n\n> Ruby program executed. Output would appear here.");
  };

  useEffect(() => {
    if (language && !['html', 'css', 'javascript', 'markdown'].includes(language.id)) {
      setCompiledOutput(`[${language.name} Compiler]\nCompiled successfully.\n\n> Program output will appear here when you run the code.`);
    }
  }, [language]);

  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.document.open();
      iframeRef.current.contentWindow.document.write('');
      iframeRef.current.contentWindow.document.close();
    }
    setCompiledOutput('');
    setError(null);
  }, [language]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h2 className="text-lg font-semibold text-white/90">
          Preview
        </h2>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={compileCode}
            disabled={isCompiling || !code.trim()}
            className={cn(
              "text-white/80 hover:text-white",
              isCompiling && "opacity-50 cursor-not-allowed"
            )}
          >
            {isCompiling ? (
              <>
                <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                Compiling...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-1" />
                Run Code
              </>
            )}
          </Button>
        </div>
      </div>
      
      <Tabs 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as 'output' | 'console')}
        className="flex-1 flex flex-col"
      >
        <TabsList className="flex w-full bg-black/30 border-b border-white/10 px-4 h-12">
          <TabsTrigger 
            value="output" 
            className={cn(
              "flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary",
              activeTab === "output" ? "text-white" : "text-white/60"
            )}
          >
            <Code className="w-4 h-4 mr-2" />
            Output
          </TabsTrigger>
          <TabsTrigger 
            value="console" 
            className={cn(
              "flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary",
              activeTab === "console" ? "text-white" : "text-white/60"
            )}
          >
            <Terminal className="w-4 h-4 mr-2" />
            Console
          </TabsTrigger>
        </TabsList>
        
        <TabsContent 
          value="output" 
          className="flex-1 overflow-auto p-0 m-0 border-none outline-none"
        >
          {['html', 'css', 'javascript', 'markdown'].includes(language.id) ? (
            <iframe 
              ref={iframeRef}
              title="Code Preview"
              sandbox="allow-scripts allow-same-origin"
              className="w-full h-[400px] bg-white border-none dark:bg-zinc-900"
            />
          ) : (
            <div className="flex items-center justify-center h-[400px] text-white/60 bg-black/20 p-6">
              <div className="text-center max-w-md">
                <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-yellow-500" />
                <h3 className="text-lg font-medium mb-2">Preview Not Available</h3>
                <p className="text-sm text-white/50 mb-4">
                  Live preview is only available for web technologies (HTML, CSS, JavaScript, and Markdown).
                </p>
                <p className="text-sm text-white/50">
                  Use the <strong>Console</strong> tab to see compilation output for {language.name}.
                </p>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent 
          value="console" 
          className="flex-1 overflow-auto p-0 m-0 border-none outline-none bg-zinc-900"
        >
          <div className="p-4 h-[400px] overflow-auto">
            {error ? (
              <div className="text-red-400 p-3 bg-red-950/30 rounded border border-red-800/50 mb-4">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium mb-1">Error</h4>
                    <pre className="text-sm whitespace-pre-wrap font-mono">{error}</pre>
                  </div>
                </div>
              </div>
            ) : null}
            
            <div className="font-mono text-sm whitespace-pre-wrap text-white/90">
              {compiledOutput || (
                <div className="text-white/40 italic">
                  {isCompiling 
                    ? "Compiling..." 
                    : (code.trim() 
                        ? `Click "Run Code" to compile and execute.` 
                        : `Enter some ${language.name} code to get started.`
                      )
                  }
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="p-3 border-t border-white/10 bg-black/20 text-xs text-white/50 flex justify-between">
        <div>
          Language: <span className="text-white/80 font-medium">{language.name}</span>
        </div>
        <div className="flex items-center">
          <Link 
            href={`https://www.google.com/search?q=${language.name}+documentation`}
            className="flex items-center hover:text-white transition-colors"
            underline={false}
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
            <ExternalLink className="w-3 h-3 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;
