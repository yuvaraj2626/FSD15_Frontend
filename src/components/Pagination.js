import React from 'react';
import './Pagination.css';

const Pagination = ({ pagination, onPageChange }) => {
    if (!pagination || pagination.totalPages <= 1) return null;

    const { page, totalPages, total, limit } = pagination;
    const start = (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);

    // Generate page numbers to display (up to 5, centered around current)
    const getPages = () => {
        const pages = [];
        let startPage = Math.max(1, page - 2);
        let endPage = Math.min(totalPages, page + 2);

        if (endPage - startPage < 4) {
            if (startPage === 1) endPage = Math.min(5, totalPages);
            else startPage = Math.max(1, endPage - 4);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        return pages;
    };

    return (
        <div className="pagination-wrapper">
            <div className="pagination-info">
                Showing <strong>{start}–{end}</strong> of <strong>{total}</strong> complaints
            </div>
            <div className="pagination-controls">
                <button
                    className="page-btn page-btn--nav"
                    onClick={() => onPageChange(1)}
                    disabled={page === 1}
                    title="First page"
                >
                    «
                </button>
                <button
                    className="page-btn page-btn--nav"
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                    title="Previous page"
                >
                    ‹
                </button>

                {getPages().map(p => (
                    <button
                        key={p}
                        className={`page-btn ${p === page ? 'active' : ''}`}
                        onClick={() => onPageChange(p)}
                    >
                        {p}
                    </button>
                ))}

                <button
                    className="page-btn page-btn--nav"
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === totalPages}
                    title="Next page"
                >
                    ›
                </button>
                <button
                    className="page-btn page-btn--nav"
                    onClick={() => onPageChange(totalPages)}
                    disabled={page === totalPages}
                    title="Last page"
                >
                    »
                </button>
            </div>
        </div>
    );
};

export default Pagination;
