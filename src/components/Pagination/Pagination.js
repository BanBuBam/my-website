import React from 'react';
import './Pagination.css';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

/**
 * Reusable Pagination Component
 * 
 * @param {number} currentPage - Current page number (0-based)
 * @param {number} totalPages - Total number of pages
 * @param {number} totalElements - Total number of items
 * @param {number} pageSize - Number of items per page
 * @param {function} onPageChange - Callback when page changes
 * @param {boolean} isFirst - Whether current page is first page
 * @param {boolean} isLast - Whether current page is last page
 */
const Pagination = ({
  currentPage = 0,
  totalPages = 1,
  totalElements = 0,
  pageSize = 10,
  onPageChange,
  isFirst = true,
  isLast = true,
}) => {
  // Don't show pagination if there's only one page or no data
  if (totalPages <= 1 || totalElements === 0) {
    return null;
  }

  // Calculate range of items being displayed
  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is small
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page, last page, and pages around current page
      const startPage = Math.max(0, currentPage - 2);
      const endPage = Math.min(totalPages - 1, currentPage + 2);
      
      if (startPage > 0) {
        pages.push(0);
        if (startPage > 1) pages.push('...');
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      if (endPage < totalPages - 1) {
        if (endPage < totalPages - 2) pages.push('...');
        pages.push(totalPages - 1);
      }
    }
    
    return pages;
  };

  const handlePrevious = () => {
    if (!isFirst && currentPage > 0) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (!isLast && currentPage < totalPages - 1) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page) => {
    if (page !== '...' && page !== currentPage) {
      onPageChange(page);
    }
  };

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        Hiển thị <strong>{startItem}-{endItem}</strong> của <strong>{totalElements}</strong> kết quả
      </div>
      
      <div className="pagination-controls">
        <button
          className="pagination-btn pagination-prev"
          onClick={handlePrevious}
          disabled={isFirst}
          title="Trang trước"
        >
          <FiChevronLeft />
          <span>Trước</span>
        </button>
        
        <div className="pagination-pages">
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              className={`pagination-page ${page === currentPage ? 'active' : ''} ${page === '...' ? 'dots' : ''}`}
              onClick={() => handlePageClick(page)}
              disabled={page === '...'}
            >
              {page === '...' ? '...' : page + 1}
            </button>
          ))}
        </div>
        
        <button
          className="pagination-btn pagination-next"
          onClick={handleNext}
          disabled={isLast}
          title="Trang sau"
        >
          <span>Sau</span>
          <FiChevronRight />
        </button>
      </div>
      
      <div className="pagination-page-info">
        Trang <strong>{currentPage + 1}</strong> / <strong>{totalPages}</strong>
      </div>
    </div>
  );
};

export default Pagination;

