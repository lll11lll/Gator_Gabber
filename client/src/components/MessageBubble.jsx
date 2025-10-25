// creates div to display onto screen
export default function messageBubble({message, role}) {
    const isUser = role === 'user';
    return (
        <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', margin: '8px 0' }}>
            <div style={{ maxWidth: 640, padding: '10px 14px', borderRadius: 12, background: isUser ? '#2563eb' : '#e5e7eb', color: isUser ? 'white' : '#111827', whiteSpace: 'pre-wrap' }}>
                {message}
            </div>
        </div>
    );
}