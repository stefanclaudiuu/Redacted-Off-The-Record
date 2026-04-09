export default function ChatBubble({ message, isUser, characterName }) {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in`}>
      <div className={`
        max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-3
        ${isUser
          ? 'bg-noir-red text-white rounded-br-sm'
          : 'bg-noir-card border border-noir-border text-noir-text rounded-bl-sm'
        }
      `}>
        {!isUser && (
          <span className="block text-[10px] font-mono text-noir-red-light uppercase tracking-widest mb-1">
            {characterName}
          </span>
        )}
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
        <span className={`
          block text-[10px] mt-1.5 font-mono
          ${isUser ? 'text-white/50 text-right' : 'text-noir-muted'}
        `}>
          {new Date(message.timestamp).toLocaleTimeString('ro-RO', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  );
}
