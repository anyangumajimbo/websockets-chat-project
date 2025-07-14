import React, { useEffect, useState } from 'react';
import { useSocket } from './socket/socket';

const ChatApp = () => {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [joined, setJoined] = useState(false);

  const {
    isConnected,
    messages,
    users,
    typingUsers,
    connect,
    sendMessage,
    setTyping,
  } = useSocket();

  const handleJoin = () => {
    if (username.trim()) {
      connect(username);
      setJoined(true);
    }
  };

  const handleSend = () => {
    if (message.trim()) {
      sendMessage(message);
      setMessage('');
    }
  };

  useEffect(() => {
    if (message.length > 0) {
      setTyping(true);
    } else {
      setTyping(false);
    }
  }, [message]);

  return (
    <div className="max-w-2xl mx-auto p-4">
      {!joined ? (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Join Chat</h2>
          <input
            className="w-full p-2 border rounded"
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button
            onClick={handleJoin}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Join
          </button>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-bold mb-4">Chat Room</h2>
          <div className="mb-2 text-sm text-gray-500">
            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </div>

          <div className="mb-4">
            <strong>Online:</strong> {users.map(u => u.username).join(', ')}
          </div>

          <div className="h-64 overflow-y-scroll border rounded p-2 mb-4 bg-white">
            {messages.map((msg) => (
              <div key={msg.id} className={`${msg.system ? 'italic text-gray-500' : ''}`}>
                <strong>{msg.sender || ''}</strong>: {msg.message}
              </div>
            ))}
          </div>

          {typingUsers.length > 0 && (
            <div className="text-sm text-gray-500 mb-2">
              {typingUsers.join(', ')} typing...
            </div>
          )}

          <div className="flex gap-2">
            <input
              className="flex-grow p-2 border rounded"
              type="text"
              placeholder="Type your message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button
              onClick={handleSend}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatApp;
