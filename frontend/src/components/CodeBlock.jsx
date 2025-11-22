import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

const CodeBlock = ({ content }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(extractCode(content));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const extractCode = (text) => {
    const codeMatch = text.match(/```[\w]*\n([\s\S]*?)```/);
    return codeMatch ? codeMatch[1].trim() : text;
  };

  const isCodeBlock = content.includes('```');

  if (isCodeBlock) {
    const parts = content.split(/(```[\w]*\n[\s\S]*?```)/g);

    return (
      <div className="space-y-4">
        {parts.map((part, index) => {
          if (part.startsWith('```')) {
            const languageMatch = part.match(/```([\w]*)\n/);
            const language = languageMatch ? languageMatch[1] : '';
            const code = part.replace(/```[\w]*\n/, '').replace(/```$/, '').trim();

            return (
              <div key={index} className="relative">
                <div className="flex items-center justify-between bg-gray-800 px-4 py-2 rounded-t-lg border border-gray-700 border-b-0">
                  <span className="text-xs text-gray-400 font-mono">
                    {language || 'code'}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center space-x-1 text-xs text-gray-400 hover:text-white transition"
                  >
                    {copied ? (
                      <>
                        <Check size={14} />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="code-block rounded-t-none !mt-0">
                  <code className="text-green-400">{code}</code>
                </pre>
              </div>
            );
          } else if (part.trim()) {
            return (
              <div key={index} className="text-gray-300 whitespace-pre-wrap">
                {part}
              </div>
            );
          }
          return null;
        })}
      </div>
    );
  }

  return <div className="text-gray-300 whitespace-pre-wrap">{content}</div>;
};

export default CodeBlock;