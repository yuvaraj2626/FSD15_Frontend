import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { commentsAPI } from '../services/api';
import './CommentPanel.css';

/**
 * CommentPanel
 * -----------
 * Props:
 *   complaintId  — MongoDB ObjectId of the complaint
 *   complaintStatus — current status string (e.g. 'OPEN', 'CLOSED')
 */
const CommentPanel = ({ complaintId, complaintStatus }) => {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [sendError, setSendError] = useState('');
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    /* ── Fetch comments ── */
    const fetchComments = useCallback(async () => {
        try {
            const res = await commentsAPI.getByComplaintId(complaintId);
            setComments(res.data.comments || []);
        } catch (err) {
            console.error('Failed to load comments:', err);
        } finally {
            setLoading(false);
        }
    }, [complaintId]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    /* ── Auto-scroll to bottom on new messages ── */
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [comments]);

    /* ── Auto-grow textarea ── */
    const handleTextareaChange = (e) => {
        setMessage(e.target.value);
        setSendError('');
        const ta = e.target;
        ta.style.height = 'auto';
        ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
    };

    /* ── Send message ── */
    const handleSend = async () => {
        const trimmed = message.trim();
        if (!trimmed) return;

        setSending(true);
        setSendError('');
        try {
            const res = await commentsAPI.addComment(complaintId, { message: trimmed });
            setComments(prev => [...prev, res.data.comment]);
            setMessage('');
            // Reset textarea height
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        } catch (err) {
            console.error('Failed to send comment:', err);
            setSendError(err.response?.data?.message || 'Failed to send message. Try again.');
        } finally {
            setSending(false);
        }
    };

    /* ── Send on Enter (Shift+Enter adds newline) ── */
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    /* ── Format timestamp ── */
    const formatTime = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDateSeparator = (dateStr) => {
        const d = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        if (d.toDateString() === today.toDateString()) return 'Today';
        if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    /* ── Group messages by date for separators ── */
    const renderMessages = () => {
        const elements = [];
        let lastDate = null;

        comments.forEach((c, idx) => {
            const msgDate = new Date(c.createdAt).toDateString();
            if (msgDate !== lastDate) {
                lastDate = msgDate;
                elements.push(
                    <div key={`sep-${idx}`} className="chat-date-sep">
                        {formatDateSeparator(c.createdAt)}
                    </div>
                );
            }

            // Determine if this message is "mine" (sent by the current logged-in user)
            const isMine = c.senderId?._id === user?._id || c.senderId === user?._id;
            const senderRole = c.senderRole || (c.senderId?.role) || 'USER';
            const senderName = c.senderId?.name || 'Unknown';
            const initial = senderName.charAt(0).toUpperCase();

            // Visually: USER role messages on left, SUPPORT on right
            const isSupport = senderRole === 'SUPPORT';
            const msgClass = isSupport ? 'msg-support' : 'msg-user';

            elements.push(
                <div key={c._id || idx} className={`chat-message ${msgClass}`}>
                    <div className="msg-meta">
                        {!isSupport && (
                            <div className="msg-avatar">{initial}</div>
                        )}
                        <span className="msg-sender-name">
                            {isMine ? 'You' : senderName}
                        </span>
                        <span className={`msg-role-tag`}>
                            {senderRole === 'SUPPORT' ? '🛡 Support' : '👤 User'}
                        </span>
                        {isSupport && (
                            <div className="msg-avatar">{initial}</div>
                        )}
                    </div>
                    <div className="msg-bubble">
                        {c.message || c.text}
                    </div>
                    <span className="msg-time">{formatTime(c.createdAt)}</span>
                </div>
            );
        });

        return elements;
    };

    return (
        <div className="comment-panel">
            <div className="comment-panel-header">
                <div className="comment-panel-title">
                    💬 Conversation
                    <span className="comment-count-badge">{comments.length}</span>
                </div>
            </div>

            <div className="chat-window">
                {/* ── Message history ── */}
                <div className="chat-messages">
                    {loading ? (
                        <div className="chat-loading">
                            <div className="spinner" />
                            <span>Loading messages…</span>
                        </div>
                    ) : comments.length === 0 ? (
                        <div className="chat-empty">
                            <div className="chat-empty-icon">💬</div>
                            <p>No messages yet. Start the conversation!</p>
                        </div>
                    ) : (
                        renderMessages()
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* ── Input bar ── */}
                <div className="chat-input-bar">
                    <textarea
                        ref={textareaRef}
                        className="chat-textarea"
                        id={`comment-input-${complaintId}`}
                        placeholder={`Write a message… (Enter to send, Shift+Enter for new line)`}
                        value={message}
                        onChange={handleTextareaChange}
                        onKeyDown={handleKeyDown}
                        disabled={sending}
                        rows={1}
                    />
                    <button
                        className="chat-send-btn"
                        id={`comment-send-${complaintId}`}
                        onClick={handleSend}
                        disabled={sending || !message.trim()}
                        title="Send message"
                        aria-label="Send message"
                    >
                        {sending ? '⏳' : '➤'}
                    </button>
                </div>

                {/* ── Send error ── */}
                {sendError && (
                    <div className="chat-send-error">⚠ {sendError}</div>
                )}
            </div>
        </div>
    );
};

export default CommentPanel;
