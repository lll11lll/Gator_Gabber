// HANDLES API CALL TO SEND MESSAGE
export async function sendMessage(message) {
    const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'},
        body: JSON.stringify({message})
    });
    if (!res.ok) {
        throw new Error(`API error: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    return data.response || '';
}