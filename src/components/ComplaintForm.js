import React, { useState } from 'react';
import { complaintsAPI } from '../services/api';

const ComplaintForm = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Technical',
        priority: 'Medium'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await complaintsAPI.create(formData);
            setFormData({
                title: '',
                description: '',
                category: 'Technical',
                priority: 'Medium'
            });
            onSuccess();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to create complaint');
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

            <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
            >
                {loading ? 'Submitting...' : 'Submit Complaint'}
            </button>
        </form>
    );
};

export default ComplaintForm;
