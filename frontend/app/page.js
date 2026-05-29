'use client';

import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function loadMessages() {
    try {
      const res = await fetch(`${API_URL}/api/messages`);
      if (!res.ok) throw new Error('Failed to load');
      setMessages(await res.json());
      setError('');
    } catch (err) {
      setError('Không tải được tin nhắn. Backend đã chạy chưa?');
    }
  }

  useEffect(() => {
    loadMessages();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!author.trim() || !content.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, content }),
      });
      if (!res.ok) throw new Error('Failed');
      setContent('');
      await loadMessages();
    } catch (err) {
      setError('Gửi tin nhắn thất bại.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <h1>📓 Guestbook</h1>
      <p className="subtitle">
        Next.js + Node.js + MySQL — bản demo siêu nhỏ để thử deploy.
      </p>

      <form onSubmit={handleSubmit} className="card form">
        <input
          type="text"
          placeholder="Tên của bạn"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          maxLength={100}
        />
        <textarea
          placeholder="Để lại lời nhắn..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          maxLength={1000}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Đang gửi...' : 'Gửi'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      <ul className="messages">
        {messages.map((m) => (
          <li key={m.id} className="card">
            <strong>{m.author}</strong>
            <p>{m.content}</p>
            <small>{new Date(m.created_at).toLocaleString('vi-VN')}</small>
          </li>
        ))}
        {messages.length === 0 && !error && (
          <p className="empty">Chưa có lời nhắn nào. Hãy là người đầu tiên!</p>
        )}
      </ul>
    </main>
  );
}
