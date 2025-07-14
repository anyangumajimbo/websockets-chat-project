import React, { useEffect, useState } from 'react';
import { useSocket } from './socket/socket';
import EmojiPicker from 'emoji-picker-react';

const ChatApp = () => {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [joined, setJoined] = useState(false);
  const [privateMessage, setPrivateMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const {
    isConnected,
    messages,
    users,
    typingUsers,
    connect,
    sendMessage,
    sendPrivateMessage,
    setTyping,
    sendReaction,
    socket,
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

  const handlePrivateSend = () => {
    if (privateMessage.trim() && selectedUser) {
      sendPrivateMessage(selectedUser.id, privateMessage);
      setPrivateMessage('');
    }
  };

  useEffect(() => {
    setTyping(message.length > 0);
  }, [message]);

  // ✅ Emit seen for all messages that are not system and not from self
  useEffect(() => {
    messages.forEach((msg) => {
      if (!msg.system && msg.sender !== username) {
        socket.emit('message_seen', { messageId: msg.id });
      }
    });
  }, [messages]);

  return (
    <div className="max-w-3xl mx-auto p-4">
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
        <>
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-600">
              {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </div>
            <div className="text-sm">
              Logged in as: <strong>{username}</strong>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {/* User list */}
            <div className="col-span-1 border p-2 bg-white rounded h-80 overflow-y-auto">
              <h3 className="font-bold mb-2">Users</h3>
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`block w-full text-left px-2 py-1 rounded ${
                    selectedUser?.id === user.id
                      ? 'bg-blue-100 font-semibold'
                      : ''
                  }`}
                >
                  {user.username}
                </button>
              ))}
            </div>

            {/* Chat window */}
            <div className="col-span-3 space-y-2">
              <div className="h-64 overflow-y-scroll border rounded p-2 bg-white">
                {messages.map((msg) => (
                  <div key={msg.id} className="mb-2">
                    <div className={msg.system ? 'italic text-gray-500' : ''}>
                      <strong>{msg.sender || ''}</strong>: {msg.message}
                      {msg.reaction && (
                        <span className="ml-2 text-lg">{msg.reaction}</span>
                      )}
                      {msg.seenBy?.length > 0 && (
                        <span className="ml-2 text-xs text-green-600">
                          Seen by: {msg.seenBy.join(', ')}
                        </span>
                      )}
                    </div>
                    {!msg.system && (
                      <div className="flex gap-2 text-sm mt-1">
                        <button onClick={() => sendReaction(msg.id, '❤️')}>❤️</button>
                        <button onClick={() => sendReaction(msg.id, '😂')}>😂</button>
                        <button onClick={() => sendReaction(msg.id, '👍')}>👍</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {typingUsers.length > 0 && (
                <div className="text-sm text-gray-500">
                  {typingUsers.join(', ')} typing...
                </div>
              )}

              {/* Public message input */}
              <div className="relative">
                <div className="flex gap-2">
                  <input
                    className="flex-grow p-2 border rounded"
                    type="text"
                    placeholder="Type a public message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  />
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="px-2 py-2 rounded text-black"
                  >
                    😊
                  </button>
                  <button
                    onClick={handleSend}
                    className="bg-green-600 text-white px-4 py-2 rounded"
                  >
                    Send
                  </button>
                </div>

                {showEmojiPicker && (
                  <div className="absolute z-10 mt-2">
                    <EmojiPicker
                      onEmojiClick={(emojiData) => {
                        setMessage((prev) => prev + emojiData.emoji);
                        setShowEmojiPicker(false);
                      }}
                      height={350}
                    />
                  </div>
                )}
              </div>

              {/* Private message input */}
              {selectedUser && (
                <div className="mt-4 border-t pt-2">
                  <h4 className="font-semibold">
                    Private chat with {selectedUser.username}
                  </h4>
                  <div className="flex gap-2 mt-2">
                    <input
                      className="flex-grow p-2 border rounded"
                      type="text"
                      placeholder="Type a private message"
                      value={privateMessage}
                      onChange={(e) => setPrivateMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handlePrivateSend()}
                    />
                    <button
                      onClick={handlePrivateSend}
                      className="bg-purple-600 text-white px-4 py-2 rounded"
                    >
                      Send Privately
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatApp;
