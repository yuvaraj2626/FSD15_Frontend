import React, { useState, useRef } from 'react';
import { complaintsAPI } from '../services/api';

const ComplaintForm = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Technical',
        priority: 'Medium'
    });
    const [attachment, setAttachment] = useState(null);
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) {
            setAttachment(null);
            setPreview(null);
            return;
        }

        // 5 MB client-side guard
        if (file.size > 5 * 1024 * 1024) {
            setError('File size must not exceed 5 MB.');
            e.target.value = '';
            return;
        }

        setAttachment(file);
        setError('');

        // Show image preview for image files
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
        }
    };

    const clearFile = () => {
        setAttachment(null);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let payload;

            if (attachment) {
                // Use FormData so multer can parse the file
                payload = new FormData();
                payload.append('title', formData.title);
                payload.append('description', formData.description);
                payload.append('category', formData.category);
                payload.append('priority', formData.priority);
                payload.append('attachment', attachment);
            } else {
                payload = formData;
            }

            await complaintsAPI.create(payload);

            // Reset form
            setFormData({ title: '', description: '', category: 'Technical', priority: 'Medium' });
            clearFile();
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create complaint');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {error && (
                <div className="alert alert-error mb-3">
                    <span>⚠️</span>
                    {error}
                </div>
            )}

            <div className="form-group">
                <label className="form-label">Title</label>
                <input
                    type="text"
                    name="title"
                    className="form-input"
                    placeholder="Brief description of your complaint"
                    value={formData.title}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                    name="description"
                    className="form-textarea"
                    placeholder="Provide detailed information about your complaint"
                    value={formData.description}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label className="form-label">Category</label>
                <select
                    name="category"
                    className="form-select"
                    value={formData.category}
                    onChange={handleChange}
                >
                    <option value="Technical">Technical</option>
                    <option value="Billing">Billing</option>
                    <option value="Service">Service</option>
                    <option value="Product">Product</option>
                    <option value="Other">Other</option>
                </select>
            </div>

            <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                    name="priority"
                    className="form-select"
                    value={formData.priority}
                    onChange={handleChange}
                >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                </select>
            </div>

            {/* ── Attachment Upload ── */}
            <div className="form-group">
                <label className="form-label">Attachment <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(optional · max 5 MB)</span></label>

                <div className="attachment-upload-area" onClick={() => fileInputRef.current?.click()}>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.txt"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        id="attachment-input"
                    />
                    {!attachment ? (
                        <div className="attachment-placeholder">
                            <span className="attachment-icon">📎</span>
                            <span className="attachment-hint">Click to attach a file</span>
                            <span className="attachment-sub">Images, PDF, DOC, TXT</span>
                        </div>
                    ) : (
                        <div className="attachment-selected" onClick={(e) => e.stopPropagation()}>
                            {preview ? (
                                <img src={preview} alt="preview" className="attachment-preview-img" />
                            ) : (
                                <span className="attachment-file-icon">📄</span>
                            )}
                            <div className="attachment-file-info">
                                <span className="attachment-file-name">{attachment.name}</span>
                                <span className="attachment-file-size">
                                    {(attachment.size / 1024).toFixed(1)} KB
                                </span>
                            </div>
                            <button
                                type="button"
                                className="btn btn-ghost btn-sm attachment-remove-btn"
                                onClick={clearFile}
                                title="Remove attachment"
                            >
                                ✕
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
            >
                {loading ? 'Submitting...' : '🚀 Submit Complaint'}
            </button>
        </form>
    );
};

export default ComplaintForm;
