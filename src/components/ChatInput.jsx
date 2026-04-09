import { useState } from 'react';
import { Send } from 'lucide-react';

export default function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;
    onSend(text.trim());
    setText('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-3 px-4 py-3 bg-noir-card/80 backdrop-blur-md border-t border-noir-border"
    >
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Scrie un mesaj..."
        disabled={disabled}
        className="flex-1 bg-noir-dark border border-noir-border rounded-lg px-4 py-2.5 text-sm text-white placeholder-noir-muted focus:outline-none focus:border-noir-red/50 transition-colors font-sans"
      />
      <button
        type="submit"
        disabled={!text.trim() || disabled}
        className="flex items-center justify-center w-10 h-10 rounded-lg bg-noir-red hover:bg-noir-red-light disabled:bg-noir-border disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        <Send size={16} className="text-white" />
      </button>
    </form>
  );
}
