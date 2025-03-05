
import React, { useEffect, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { markdown } from '@codemirror/lang-markdown';
import { Language } from '../utils/supportedLanguages';
import { Button } from '@/components/ui/button';
import { Copy, Check, Code } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface CodeEditorProps {
  code: string;
  language: Language;
  onCodeChange: (code: string) => void;
  isReadOnly?: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  language,
  onCodeChange,
  isReadOnly = false,
}) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [languageExtension, setLanguageExtension] = useState<any>(javascript());

  useEffect(() => {
    // Set the appropriate language extension based on the selected language
    switch (language.id) {
      case 'javascript':
      case 'typescript':
      case 'jsx':
      case 'tsx':
        setLanguageExtension(javascript());
        break;
      case 'html':
        setLanguageExtension(html());
        break;
      case 'css':
        setLanguageExtension(css());
        break;
      case 'python':
        setLanguageExtension(python());
        break;
      case 'java':
      case 'kotlin':
        setLanguageExtension(java());
        break;
      case 'markdown':
        setLanguageExtension(markdown());
        break;
      default:
        setLanguageExtension(javascript());
    }
  }, [language]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast({
      title: "Code copied",
      description: "The code has been copied to your clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full rounded-md overflow-hidden animate-blur-in border border-border/50 bg-background shadow-sm">
      <div className="flex items-center justify-between bg-secondary/50 px-4 py-2 border-b border-border/50">
        <div className="flex items-center space-x-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: language.color }}
          />
          <span className="text-sm font-medium">{language.name}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-8 px-2 text-muted-foreground hover:text-foreground"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
      <div className={cn(
        "transition-opacity duration-300",
        code ? "opacity-100" : "opacity-70"
      )}>
        {code ? (
          <CodeMirror
            value={code}
            height="400px"
            theme={vscodeDark}
            extensions={[languageExtension]}
            onChange={onCodeChange}
            readOnly={isReadOnly}
            basicSetup={{
              lineNumbers: true,
              highlightActiveLineGutter: true,
              highlightSpecialChars: true,
              foldGutter: true,
              drawSelection: true,
              dropCursor: true,
              allowMultipleSelections: true,
              indentOnInput: true,
              syntaxHighlighting: true,
              bracketMatching: true,
              closeBrackets: true,
              autocompletion: true,
              rectangularSelection: true,
              crosshairCursor: true,
              highlightActiveLine: true,
              highlightSelectionMatches: true,
              closeBracketsKeymap: true,
              searchKeymap: true,
              foldKeymap: true,
              completionKeymap: true,
              lintKeymap: true,
            }}
          />
        ) : (
          <div className="h-[400px] flex flex-col items-center justify-center text-muted-foreground">
            <Code className="h-12 w-12 mb-2 opacity-20" />
            <p>Generated code will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeEditor;
