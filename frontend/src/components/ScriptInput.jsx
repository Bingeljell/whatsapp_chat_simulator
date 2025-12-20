import React, { useState, useRef } from 'react';
import mammoth from 'mammoth'; // Import mammoth.js
import EmojiPicker from 'emoji-picker-react';

function ScriptInput({ participants, onScriptParsed }) {
  const [script, setScript] = useState('');
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef(null);

  const parseScript = (rawScript) => {
    const lines = rawScript.split('\n').filter(line => line.trim() !== '');
    const parsedMessages = [];
    let hasError = false;

    for (const line of lines) {
      const parts = line.split(':');
      if (parts.length < 2) {
        setError(`Invalid line format: "${line}". Expected "Sender: Message"`);
        hasError = true;
        break;
      }

      const sender = parts[0].trim();
      const message = parts.slice(1).join(':').trim();

      if (!participants.includes(sender)) {
        setError(`Invalid sender "${sender}" in line: "${line}". Sender must be one of: ${participants.join(', ')}`);
        hasError = true;
        break;
      }
      if (!message) {
        setError(`Message cannot be empty for sender "${sender}" in line: "${line}".`);
        hasError = true;
        break;
      }

      parsedMessages.push({ sender, message });
    }

    if (hasError) {
      onScriptParsed([]); // Clear any previous valid script
      return;
    } else {
      setError('');
      onScriptParsed(parsedMessages);
    }
  };

  const handleScriptChange = (event) => {
    const rawScript = event.target.value;
    setScript(rawScript);
    setCursorPosition(event.target.selectionStart);
    setFileName(''); // Clear file name if user starts typing manually
  };

  const handleTextareaClick = (event) => {
    setCursorPosition(event.target.selectionStart);
  };

  const onEmojiClick = (emojiObject) => {
    const emoji = emojiObject.emoji;
    const newScript = script.substring(0, cursorPosition) + emoji + script.substring(cursorPosition);
    setScript(newScript);
    setCursorPosition(cursorPosition + emoji.length);
    setShowEmojiPicker(false); // Close picker after selecting emoji

    // Manually set cursor position after updating script
    if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.selectionStart = cursorPosition + emoji.length;
        textareaRef.current.selectionEnd = cursorPosition + emoji.length;
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setError(''); // Clear previous errors

    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        setScript(text);
        parseScript(text);
      };
      reader.onerror = () => {
        setError('Failed to read text file.');
      };
      reader.readAsText(file);
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        mammoth.extractRawText({ arrayBuffer: e.target.result })
          .then((result) => {
            setScript(result.value); // The raw text
            parseScript(result.value);
            if (result.messages.length) {
              // Optionally display mammoth warnings/errors
              console.warn(result.messages);
            }
          })
          .catch((mammothError) => {
            setError(`Failed to parse .docx file: ${mammothError.message}`);
          });
      };
      reader.onerror = () => {
        setError('Failed to read .docx file.');
      };
      reader.readAsArrayBuffer(file);
    } else {
      setError('Unsupported file type. Please upload a .txt or .docx file.');
    }
  };

  const handleSubmit = () => {
    // The script is parsed and validated on each change.
    // This button could trigger the animation or further processing.
    // For now, it just re-parses to ensure latest state is reflected.
    parseScript(script);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <h2 className="text-xl font-semibold mb-3">Enter Chat Script</h2>

      <div className="relative">
        <textarea
          ref={textareaRef}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-3 h-48 resize-y"
          placeholder="Enter your chat script here.&#10;Format: Sender: Message&#10;Example:&#10;Alice: Hi there!&#10;Bob: Hello Alice!"
          value={script}
          onChange={handleScriptChange}
          onClick={handleTextareaClick}
          onKeyUp={handleTextareaClick} // Also update cursor on key up
        ></textarea>
        {/* Toolbar below textarea */}
        <div className="flex justify-end mb-3 relative">
          <button
            onClick={() => setShowEmojiPicker(prev => !prev)}
            className="p-2 bg-gray-100 rounded-full text-sm hover:bg-gray-200 focus:outline-none transition-colors duration-200"
            title="Toggle Emoji Picker"
          >
            Add Emoji 😊
          </button>
          {showEmojiPicker && (
            <div className="absolute z-50 bottom-full right-0 mb-2"> {/* Position above the button */}
              <EmojiPicker onEmojiClick={onEmojiClick} />
            </div>
          )}
        </div>
      </div>

      <div className="mb-3">
        <label htmlFor="file-upload" className="block text-gray-700 text-sm font-bold mb-2">
          Or upload a file (.txt, .docx):
        </label>
        <div className="flex items-center">
          <input
            id="file-upload"
            type="file"
            accept=".txt,.docx"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-whatsapp-green-light file:text-white
              hover:file:bg-whatsapp-green-dark cursor-pointer"
          />
          {fileName && <span className="ml-2 text-sm text-gray-600">{fileName}</span>}
        </div>
      </div>
      
      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
      
      <button
        onClick={handleSubmit}
        className="bg-whatsapp-green-light text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline hover:bg-whatsapp-green-dark transition-colors duration-200"
      >
        Process Script
      </button>
    </div>
  );
}

export default ScriptInput;
