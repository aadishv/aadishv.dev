import React, { useState, useRef, useEffect, useCallback } from "react";

interface MarkdownToken {
  type: string;
  start: number;
  end: number;
  content: string;
}

function parseMarkdown(text: string): MarkdownToken[] {
  const tokens: MarkdownToken[] = [];
  const lines = text.split('\n');
  let offset = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Headers
    const headerMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headerMatch) {
      tokens.push({
        type: `header-${headerMatch[1].length}`,
        start: offset,
        end: offset + line.length,
        content: line
      });
    }

    // Bold **text**
    let boldRegex = /\*\*(.*?)\*\*/g;
    let match;
    while ((match = boldRegex.exec(line)) !== null) {
      tokens.push({
        type: 'bold',
        start: offset + match.index,
        end: offset + match.index + match[0].length,
        content: match[0]
      });
    }

    
    // Italic *text*
    let italicRegex = /\*((?!\*)[^*]+)\*/g;
    while ((match = italicRegex.exec(line)) !== null) {
      tokens.push({
        type: 'italic',
        start: offset + match.index,
        end: offset + match.index + match[0].length,
        content: match[0]
      });
    }
    
    // Code `text`
    let codeRegex = /`([^`]+)`/g;
    while ((match = codeRegex.exec(line)) !== null) {
      tokens.push({
        type: 'code',
        start: offset + match.index,
        end: offset + match.index + match[0].length,
        content: match[0]
      });
    }
    
    // Links [text](url)
    let linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    while ((match = linkRegex.exec(line)) !== null) {
      tokens.push({
        type: 'link',
        start: offset + match.index,
        end: offset + match.index + match[0].length,
        content: match[0]
      });
    }
    
    offset += line.length + 1; // +1 for newline
  }
  
  return tokens;
}

function getTokenAtPosition(tokens: MarkdownToken[], position: number): MarkdownToken | null {
  return tokens.find(token => position >= token.start && position < token.end) || null;
}

function renderStyledText(text: string, tokens: MarkdownToken[]): React.ReactNode[] {
  if (!text) return [];
  
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  
  // Sort tokens by start position
  const sortedTokens = [...tokens].sort((a, b) => a.start - b.start);
  
  for (let i = 0; i < sortedTokens.length; i++) {
    const token = sortedTokens[i];
    
    // Add text before token
    if (token.start > lastIndex) {
      const beforeText = text.slice(lastIndex, token.start);
      elements.push(
        <span key={`text-${lastIndex}`} className="whitespace-pre-wrap">
          {beforeText}
        </span>
      );
    }
    
    // Add styled token
    const tokenText = text.slice(token.start, token.end);
    let className = "";
    
    switch (token.type) {
      case 'header-1':
        className = "text-3xl font-bold text-blue-400";
        break;
      case 'header-2':
        className = "text-2xl font-bold text-blue-300";
        break;
      case 'header-3':
        className = "text-xl font-bold text-blue-200";
        break;
      case 'header-4':
        className = "text-lg font-bold text-blue-100";
        break;
      case 'header-5':
        className = "font-bold text-blue-50";
        break;
      case 'header-6':
        className = "font-bold text-gray-300";
        break;
      case 'bold':
        className = "font-bold text-yellow-300";
        break;
      case 'italic':
        className = "italic text-green-300";
        break;
      case 'code':
        className = "bg-gray-800 text-pink-300 px-1 rounded";
        break;
      case 'link':
        className = "text-cyan-400 underline";
        break;
      default:
        className = "";
    }
    
    elements.push(
      <span key={`token-${token.start}`} className={`whitespace-pre-wrap ${className}`}>
        {tokenText}
      </span>
    );
    
    lastIndex = token.end;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex);
    elements.push(
      <span key={`text-${lastIndex}`} className="whitespace-pre-wrap">
        {remainingText}
      </span>
    );
  }
  
  return elements;
}

function App() {
  const [value, setValue] = useState("");
  const [tokens, setTokens] = useState<MarkdownToken[]>([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const updateTokens = useCallback((text: string) => {
    const newTokens = parseMarkdown(text);
    setTokens(newTokens);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    updateTokens(newValue);
  };

  const handleSelectionChange = () => {
    if (textareaRef.current) {
      setCursorPosition(textareaRef.current.selectionStart);
    }
  };

  useEffect(() => {
    updateTokens(value);
  }, [value, updateTokens]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.addEventListener('selectionchange', handleSelectionChange);
      textarea.addEventListener('keyup', handleSelectionChange);
      textarea.addEventListener('mouseup', handleSelectionChange);
      
      return () => {
        textarea.removeEventListener('selectionchange', handleSelectionChange);
        textarea.removeEventListener('keyup', handleSelectionChange);
        textarea.removeEventListener('mouseup', handleSelectionChange);
      };
    }
  }, []);

  const styledElements = renderStyledText(value, tokens);

  return (
    <div className="fixed inset-0 bg-background flex items-stretch">
      <div className="relative w-full h-full">
        <textarea
          ref={textareaRef}
          className="absolute inset-0 w-full h-full resize-none outline-none border-none bg-transparent font-mono text-base p-6 text-transparent caret-white z-10"
          style={{ 
            minHeight: "100vh",
            lineHeight: "1.5",
            letterSpacing: "0"
          }}
          value={value}
          onChange={handleChange}
          onSelect={handleSelectionChange}
          spellCheck={false}
          autoFocus
          aria-label="Markdown Editor"
        />
        <div
          ref={overlayRef}
          className="absolute inset-0 w-full h-full font-mono text-base p-6 pointer-events-none z-0 overflow-hidden"
          style={{ 
            minHeight: "100vh",
            lineHeight: "1.5",
            letterSpacing: "0",
            whiteSpace: "pre-wrap",
            wordWrap: "break-word"
          }}
          aria-hidden="true"
        >
          {styledElements}
        </div>
      </div>
    </div>
  );
}

export { App };