import React, { useState, useEffect } from 'react';
import pharmacistAPI from '../../../../services/staff/pharmacistAPI';
import './ExportStockPage.css';
import {
  FaPlus, FaEye, FaEdit, FaTrash, FaSave, FaTimes,
  FaCheck, FaCheckDouble, FaBan
} from 'react-icons/fa';
import {
  FiFilter, FiCalendar, FiClock, FiLayers, FiSearch, FiCheckCircle, FiX, FiPackage, FiRefreshCw,
  FiTrendingUp, FiAlertCircle, FiBarChart2
} from 'react-icons/fi';

const ExportStockPage = () => {
  const [loading, setLoading] = useState(false);
  const [issues, setIssues] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Data hỗ trợ cho Form
  const [departments, setDepartments] = useState([]);
  const [stockList, setStockList] = useState([]);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Detail Modal State
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);

  // Statistics State
  const [statistics, setStatistics] = useState(null);
  const [pendingApproval, setPendingApproval] = useState([]);
  const [pendingCompletion, setPendingCompletion] = useState([]);

  // Filter State
  const [activeQuickFilter, setActiveQuickFilter] = useState('30days');
  const [filterApplied, setFilterApplied] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
    issueType: '',
    departmentId: '',
    patientId: ''
  });

  // Form State
  const [formData, setFormData] = useState({
    issueType: 'DEPARTMENT_ISSUE',
    departmentId: '',
    notes: '',
    items: [] //Array of { stockId, quantity, stockName(display only) }
  });

  // --- 1. INITIAL DATA FETCHING ---
  useEffect(() => {
    fetchIssues();
    fetchSupportData();
    fetchStatisticsAndPending();
  }, []);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const res = await pharmacistAPI.goodsIssueAPI.getAll();
      if (res?.status === 'OK') setIssues(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchSupportData = async () => {
    try {
      const deptRes = await pharmacistAPI.pharmacistDepartmentAPI.getDepartments();
      if (deptRes?.status === 'OK') {
        // Handle both array and paginated response
        const deptData = Array.isArray(deptRes.data)
          ? deptRes.data
          : (deptRes.data?.content || []);
        setDepartments(deptData);
      }

      const stockRes = await pharmacistAPI.pharmacistInventoryAPI.getInventory();
      if (stockRes?.status === 'OK') {
        // Handle both array and paginated response
        const stockData = Array.isArray(stockRes.data)
          ? stockRes.data
          : (stockRes.data?.content || []);
        setStockList(stockData);
      }
    } catch (e) { console.error(e); }
  };

  // Fetch statistics and pending issues
  const fetchStatisticsAndPending = async () => {
    try {
      // Statistics for last 30 days
      const { startDate, endDate } = getDateRange(30);
      const [statsRes, pendingApprovalRes, pendingCompletionRes] = await Promise.all([
        pharmacistAPI.goodsIssueAPI.getStatistics(startDate, endDate),
        pharmacistAPI.goodsIssueAPI.getPendingApproval(48),
        pharmacistAPI.goodsIssueAPI.getPendingCompletion(48)
      ]);

      if (statsRes?.status === 'OK') {
        setStatistics(statsRes.data);
      }
      if (pendingApprovalRes?.status === 'OK') {
        setPendingApproval(Array.isArray(pendingApprovalRes.data) ? pendingApprovalRes.data : []);
      }
      if (pendingCompletionRes?.status === 'OK') {
        setPendingCompletion(Array.isArray(pendingCompletionRes.data) ? pendingCompletionRes.data : []);
      }
    } catch (e) { console.error('Error fetching statistics:', e); }
  };

  // Server-side search
  const handleServerSearch = async (keyword) => {
    if (!keyword || keyword.trim() === '') {
      fetchIssues();
      return;
    }
    setIsSearching(true);
    setLoading(true);
    try {
      const res = await pharmacistAPI.goodsIssueAPI.search(keyword.trim());
      if (res?.status === 'OK') {
        setIssues(Array.isArray(res.data) ? res.data : []);
        setFilterApplied(true);
      }
    } catch (e) {
      console.error('Search error:', e);
      // Fallback to client-side search
      const res = await pharmacistAPI.goodsIssueAPI.getAll();
      if (res?.status === 'OK') {
        const filtered = res.data.filter(issue =>
          (issue.notes?.toLowerCase() || '').includes(keyword.toLowerCase()) ||
          (issue.departmentName?.toLowerCase() || '').includes(keyword.toLowerCase()) ||
          String(issue.goodsIssueId || issue.id).includes(keyword)
        );
        setIssues(filtered);
      }
    }
    finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        handleServerSearch(searchTerm);
      }
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // Quick filter for pending approval
  const handlePendingApprovalFilter = async () => {
    setLoading(true);
    setActiveQuickFilter('pendingApproval');
    try {
      const res = await pharmacistAPI.goodsIssueAPI.getPendingApproval(48);
      if (res?.status === 'OK') {
        setIssues(Array.isArray(res.data) ? res.data : []);
        setFilterApplied(true);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // Quick filter for pending completion
  const handlePendingCompletionFilter = async () => {
    setLoading(true);
    setActiveQuickFilter('pendingCompletion');
    try {
      const res = await pharmacistAPI.goodsIssueAPI.getPendingCompletion(48);
      if (res?.status === 'OK') {
        setIssues(Array.isArray(res.data) ? res.data : []);
        setFilterApplied(true);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // Open detail modal
  const handleOpenDetail = (issue) => {
    setSelectedIssue(issue);
    setShowDetailModal(true);
  };

  // --- FILTER HANDLERS ---
  // Helper: Get date string for quick filters
  const getDateRange = (days) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };

  // Quick filter buttons
  const handleQuickFilter = async (filterType) => {
    setActiveQuickFilter(filterType);
    setLoading(true);
    try {
      let range;
      switch (filterType) {
        case '7days':
          range = getDateRange(7);
          break;
        case '30days':
          range = getDateRange(30);
          break;
        case '90days':
          range = getDateRange(90);
          break;
        default:
          range = getDateRange(30);
      }
      setFilters({ ...filters, startDate: range.startDate, endDate: range.endDate });
      const res = await pharmacistAPI.goodsIssueAPI.getByDateRange(range.startDate, range.endDate);
      if (res?.status === 'OK') {
        setIssues(Array.isArray(res.data) ? res.data : []);
        setFilterApplied(true);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // Apply all filters
  const handleApplyFilters = async () => {
    setLoading(true);
    try {
      let result = [];
      // Priority: Date Range > Status > Type > Department > Patient
      if (filters.startDate && filters.endDate) {
        const res = await pharmacistAPI.goodsIssueAPI.getByDateRange(filters.startDate, filters.endDate);
        if (res?.status === 'OK') result = Array.isArray(res.data) ? res.data : [];
      } else if (filters.status) {
        const res = await pharmacistAPI.goodsIssueAPI.getByStatus(filters.status);
        if (res?.status === 'OK') result = Array.isArray(res.data) ? res.data : [];
      } else if (filters.issueType) {
        const res = await pharmacistAPI.goodsIssueAPI.getByType(filters.issueType);
        if (res?.status === 'OK') result = Array.isArray(res.data) ? res.data : [];
      } else if (filters.departmentId) {
        const res = await pharmacistAPI.goodsIssueAPI.getByDepartment(filters.departmentId);
        if (res?.status === 'OK') result = Array.isArray(res.data) ? res.data : [];
      } else if (filters.patientId) {
        const res = await pharmacistAPI.goodsIssueAPI.getByPatient(filters.patientId);
        if (res?.status === 'OK') result = Array.isArray(res.data) ? res.data : [];
      } else {
        // No filter, get all
        const res = await pharmacistAPI.goodsIssueAPI.getAll();
        if (res?.status === 'OK') result = Array.isArray(res.data) ? res.data : [];
      }

      // Client-side filtering for combined filters
      if (filters.status && result.length > 0) {
        result = result.filter(i => i.status === filters.status);
      }
      if (filters.issueType && result.length > 0) {
        result = result.filter(i => i.issueType === filters.issueType);
      }
      if (filters.departmentId && result.length > 0) {
        result = result.filter(i => String(i.departmentId) === String(filters.departmentId));
      }

      setIssues(result);
      setFilterApplied(true);
    } catch (e) { console.error(e); alert("Lỗi khi lọc dữ liệu"); }
    finally { setLoading(false); }
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      status: '',
      issueType: '',
      departmentId: '',
      patientId: ''
    });
    setActiveQuickFilter('');
    setFilterApplied(false);
    fetchIssues();
  };

  // --- 2. FORM HANDLERS ---
  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormData({ issueType: 'DEPARTMENT_ISSUE', departmentId: '', notes: '', items: [] });
    setShowModal(true);
  };

  const handleOpenEdit = async (id) => {
    setLoading(true);
    try {
      const res = await pharmacistAPI.goodsIssueAPI.getById(id);
      if (res?.status === 'OK') {
        const data = res.data;
        // Map data từ API về format của Form
        setFormData({
          id: data.goodsIssueId || data.id,
          issueType: data.issueType,
          departmentId: data.departmentId,
          notes: data.notes || '',
          items: (data.items || []).map(i => ({
            stockId: i.stockId,
            quantity: i.quantity,
            stockName: i.itemName || i.itemDisplayName || `Item #${i.itemId}` // Use itemName from new API
          }))
        });
        setIsEditing(true);
        setShowModal(true);
      }
    } catch (e) { console.error(e); alert("Lỗi tải chi tiết"); }
    finally { setLoading(false); }
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { stockId: '', quantity: 1 }]
    });
  };

  const handleRemoveItem = (index) => {
    const newItems = [...formData.items];
    newItems.splice(index, 1);
    setFormData({ ...formData, items: newItems });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async () => {
    // Validation cơ bản
    if (!formData.departmentId && formData.issueType === 'DEPARTMENT_ISSUE') {
      alert("Vui lòng chọn Khoa phòng"); return;
    }
    if (formData.items.length === 0) {
      alert("Vui lòng thêm ít nhất 1 mặt hàng"); return;
    }
    for (let item of formData.items) {
      if (!item.stockId || item.quantity <= 0) {
        alert("Vui lòng chọn thuốc và nhập số lượng hợp lệ"); return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        issueType: formData.issueType,
        departmentId: formData.departmentId,
        notes: formData.notes,
        items: formData.items.map(i => ({ stockId: i.stockId, quantity: parseInt(i.quantity) }))
      };

      let res;
      if (isEditing) {
        res = await pharmacistAPI.goodsIssueAPI.update(formData.id, payload);
      } else {
        res = await pharmacistAPI.goodsIssueAPI.create(payload);
      }

      if (res?.status === 'OK') {
        alert(isEditing ? "Cập nhật thành công!" : "Tạo phiếu xuất thành công!");
        setShowModal(false);
        fetchIssues();
      } else {
        alert(res?.message || "Thao tác thất bại");
      }
    } catch (e) { console.error(e); alert("Lỗi hệ thống"); }
    finally { setLoading(false); }
  };

  // --- ACTION HANDLERS ---
  // Xóa phiếu (chỉ DRAFT)
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa phiếu xuất này?")) return;
    setLoading(true);
    try {
      const res = await pharmacistAPI.goodsIssueAPI.delete(id);
      if (res?.status === 'OK') {
        alert("Xóa phiếu thành công!");
        setShowDetailModal(false);
        setSelectedIssue(null);
        fetchIssues();
      } else {
        alert(res?.message || "Không thể xóa phiếu");
      }
    } catch (e) { console.error(e); alert("Lỗi hệ thống"); }
    finally { setLoading(false); }
  };

  // Duyệt phiếu (DRAFT → APPROVED)
  const handleApprove = async (id) => {
    if (!window.confirm("Xác nhận duyệt phiếu xuất này?")) return;
    setLoading(true);
    try {
      const res = await pharmacistAPI.goodsIssueAPI.approve(id);
      if (res?.status === 'OK') {
        alert("Duyệt phiếu thành công!");
        setShowDetailModal(false);
        setSelectedIssue(null);
        fetchIssues();
      } else {
        alert(res?.message || "Không thể duyệt phiếu");
      }
    } catch (e) { console.error(e); alert("Lỗi hệ thống"); }
    finally { setLoading(false); }
  };

  // Hoàn thành phiếu (APPROVED → COMPLETED)
  const handleComplete = async (id) => {
    if (!window.confirm("Xác nhận hoàn thành phiếu xuất? Tồn kho sẽ được cập nhật.")) return;
    setLoading(true);
    try {
      const res = await pharmacistAPI.goodsIssueAPI.complete(id);
      if (res?.status === 'OK') {
        alert("Hoàn thành phiếu xuất thành công! Tồn kho đã được cập nhật.");
        setShowDetailModal(false);
        setSelectedIssue(null);
        fetchIssues();
      } else {
        alert(res?.message || "Không thể hoàn thành phiếu");
      }
    } catch (e) { console.error(e); alert("Lỗi hệ thống"); }
    finally { setLoading(false); }
  };

  // Hủy phiếu (any → CANCELLED)
  const handleCancel = async (id) => {
    if (!window.confirm("Xác nhận hủy phiếu xuất này?")) return;
    setLoading(true);
    try {
      const res = await pharmacistAPI.goodsIssueAPI.cancel(id);
      if (res?.status === 'OK') {
        alert("Hủy phiếu thành công!");
        setShowDetailModal(false);
        setSelectedIssue(null);
        fetchIssues();
      } else {
        alert(res?.message || "Không thể hủy phiếu");
      }
    } catch (e) { console.error(e); alert("Lỗi hệ thống"); }
    finally { setLoading(false); }
  };

  // --- 3. RENDER HELPERS ---
  const getStatusBadge = (status, statusDisplay) => {
    const styles = {
      DRAFT: { bg: '#e6f7ff', color: '#1890ff', border: '#91d5ff' },
      PENDING: { bg: '#fff7e6', color: '#fa8c16', border: '#ffd591' },
      APPROVED: { bg: '#f6ffed', color: '#52c41a', border: '#b7eb8f' },
      COMPLETED: { bg: '#f6ffed', color: '#52c41a', border: '#b7eb8f' },
      CANCELLED: { bg: '#fff1f0', color: '#ff4d4f', border: '#ffa39e' }
    };
    const style = styles[status] || styles.DRAFT;
    return (
      <span style={{
        padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
        backgroundColor: style.bg, color: style.color, border: `1px solid ${style.border}`
      }}>
        {statusDisplay || status || 'N/A'}
      </span>
    );
  };

  const getIssueTypeBadge = (issueType, issueTypeDisplay) => {
    const styles = {
      DEPARTMENT_ISSUE: { bg: '#e6f7ff', color: '#1890ff' },
      MEDICATION_ORDER_GROUP: { bg: '#f9f0ff', color: '#722ed1' },
      DISPOSAL: { bg: '#fff1f0', color: '#ff4d4f' },
      TRANSFER: { bg: '#fff7e6', color: '#fa8c16' },
      PRESCRIPTION: { bg: '#e6fffb', color: '#13c2c2' }
    };
    const style = styles[issueType] || { bg: '#f5f5f5', color: '#666' };
    return (
      <span style={{
        padding: '4px 8px', borderRadius: '4px', fontSize: '12px',
        backgroundColor: style.bg, color: style.color
      }}>
        {issueTypeDisplay || issueType || 'N/A'}
      </span>
    );
  };

  // Filter issues based on search term
  const filteredIssues = issues.filter(issue => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      (issue.issueNumber || '').toLowerCase().includes(searchLower) ||
      (issue.notes || '').toLowerCase().includes(searchLower) ||
      (issue.departmentName || '').toLowerCase().includes(searchLower) ||
      (issue.patientName || '').toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="export-stock-page">
      <div className="page-header">
        <h1 className="page-title">Quản lý Xuất kho (Goods Issue)</h1>
      </div>

      {/* TOOLBAR */}
      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-group">
            <input
              type="text"
              placeholder="Tìm theo mã phiếu, ghi chú..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn-search"><FiSearch/></button>
          </div>
          <button className="btn-refresh" onClick={() => fetchIssues()} disabled={loading}>
            <FiRefreshCw className={loading ? 'spinning' : ''} />
            Làm mới
          </button>
        </div>
        <button className="btn-create" onClick={handleOpenCreate}>
          <FaPlus/> Tạo Phiếu Xuất
        </button>
      </div>

      {/* FILTER SECTION - Always visible like InventoryTransactionsPage */}
      <div style={{
        background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
        padding: '2rem',
        borderRadius: '16px',
        marginBottom: '1.5rem',
        boxShadow: '0 10px 30px rgba(14, 165, 233, 0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative Background Pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          transform: 'translate(30%, -30%)',
          pointerEvents: 'none'
        }}></div>

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              padding: '0.75rem',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <FiFilter size={20} style={{ color: '#fff' }} />
            </div>
            <div>
              <h3 style={{
                margin: 0,
                fontSize: '1.25rem',
                fontWeight: '700',
                color: '#fff',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                Bộ lọc tìm kiếm
              </h3>
              <p style={{
                margin: 0,
                fontSize: '0.85rem',
                color: 'rgba(255, 255, 255, 0.9)',
                marginTop: '0.25rem'
              }}>
                Tùy chỉnh tiêu chí để tìm kiếm chính xác
              </p>
            </div>
          </div>

          {/* Active Filter Badge */}
          {filterApplied ? (
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              color: '#28a745',
              padding: '0.5rem 1rem',
              borderRadius: '25px',
              fontSize: '0.9rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              <FiCheckCircle size={16} />
              <span>Đang áp dụng bộ lọc</span>
            </div>
          ) : (
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              color: '#10b981',
              padding: '0.5rem 1rem',
              borderRadius: '25px',
              fontSize: '0.9rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              <FiClock size={16} />
              <span>{activeQuickFilter === '7days' ? '7' : activeQuickFilter === '90days' ? '90' : '30'} ngày gần đây</span>
            </div>
          )}
        </div>

        {/* Filter Content Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Time Period Group */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
              paddingBottom: '0.75rem',
              borderBottom: '2px solid #f0f0f0'
            }}>
              <FiCalendar size={18} style={{ color: '#0ea5e9' }} />
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#2d3748' }}>
                Khoảng thời gian
              </h4>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
              {/* Start Date */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#4a5568' }}>
                  <FiCalendar size={14} style={{ color: '#0ea5e9' }} />
                  Từ ngày
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `2px solid ${filters.startDate ? '#0ea5e9' : '#e2e8f0'}`,
                    borderRadius: '10px',
                    fontSize: '0.95rem',
                    background: filters.startDate ? '#f7fafc' : '#fff',
                    boxShadow: filters.startDate ? '0 0 0 3px rgba(14, 165, 233, 0.1)' : 'none'
                  }}
                />
              </div>

              {/* End Date */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#4a5568' }}>
                  <FiCalendar size={14} style={{ color: '#0ea5e9' }} />
                  Đến ngày
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `2px solid ${filters.endDate ? '#0ea5e9' : '#e2e8f0'}`,
                    borderRadius: '10px',
                    fontSize: '0.95rem',
                    background: filters.endDate ? '#f7fafc' : '#fff',
                    boxShadow: filters.endDate ? '0 0 0 3px rgba(14, 165, 233, 0.1)' : 'none'
                  }}
                />
              </div>

              {/* Quick Filter */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#4a5568' }}>
                  <FiClock size={14} style={{ color: '#10b981' }} />
                  Xem gần đây
                </label>
                <select
                  value={activeQuickFilter}
                  onChange={(e) => handleQuickFilter(e.target.value)}
                  disabled={filters.startDate || filters.endDate}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `2px solid ${(!filters.startDate && !filters.endDate) ? '#10b981' : '#e2e8f0'}`,
                    borderRadius: '10px',
                    fontSize: '0.95rem',
                    background: (!filters.startDate && !filters.endDate) ? '#f0fdf4' : '#f9fafb',
                    opacity: (filters.startDate || filters.endDate) ? 0.6 : 1,
                    cursor: (filters.startDate || filters.endDate) ? 'not-allowed' : 'pointer',
                    boxShadow: (!filters.startDate && !filters.endDate) ? '0 0 0 3px rgba(16, 185, 129, 0.1)' : 'none'
                  }}
                >
                  <option value="7days">7 ngày qua</option>
                  <option value="30days">30 ngày qua</option>
                  <option value="90days">90 ngày qua</option>
                </select>
                {(!filters.startDate && !filters.endDate) && (
                  <small style={{ color: '#10b981', fontSize: '0.8rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: '600' }}>
                    <FiCheckCircle size={12} /> Đang áp dụng
                  </small>
                )}
              </div>
            </div>
          </div>

          {/* Category Filters Group */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
              paddingBottom: '0.75rem',
              borderBottom: '2px solid #f0f0f0'
            }}>
              <FiLayers size={18} style={{ color: '#8b5cf6' }} />
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#2d3748' }}>
                Phân loại
              </h4>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
              {/* Status Filter */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#4a5568' }}>
                  <FiPackage size={14} style={{ color: '#8b5cf6' }} />
                  Trạng thái
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `2px solid ${filters.status ? '#8b5cf6' : '#e2e8f0'}`,
                    borderRadius: '10px',
                    fontSize: '0.95rem',
                    background: filters.status ? '#faf5ff' : '#fff',
                    cursor: 'pointer',
                    boxShadow: filters.status ? '0 0 0 3px rgba(139, 92, 246, 0.1)' : 'none'
                  }}
                >
                  <option value="">-- Tất cả --</option>
                  <option value="DRAFT">Nháp (DRAFT)</option>
                  <option value="APPROVED">Đã duyệt (APPROVED)</option>
                  <option value="COMPLETED">Hoàn thành (COMPLETED)</option>
                  <option value="CANCELLED">Đã hủy (CANCELLED)</option>
                </select>
              </div>

              {/* Issue Type Filter */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#4a5568' }}>
                  <FiPackage size={14} style={{ color: '#f59e0b' }} />
                  Loại xuất
                </label>
                <select
                  value={filters.issueType}
                  onChange={(e) => setFilters({...filters, issueType: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `2px solid ${filters.issueType ? '#f59e0b' : '#e2e8f0'}`,
                    borderRadius: '10px',
                    fontSize: '0.95rem',
                    background: filters.issueType ? '#fffbeb' : '#fff',
                    cursor: 'pointer',
                    boxShadow: filters.issueType ? '0 0 0 3px rgba(245, 158, 11, 0.1)' : 'none'
                  }}
                >
                  <option value="">-- Tất cả --</option>
                  <option value="DEPARTMENT_ISSUE">Xuất cho Khoa</option>
                  <option value="PATIENT_ISSUE">Xuất cho Bệnh nhân</option>
                  <option value="TRANSFER">Chuyển kho</option>
                  <option value="DISPOSAL">Xuất hủy</option>
                </select>
              </div>

              {/* Department Filter */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#4a5568' }}>
                  <FiPackage size={14} style={{ color: '#3b82f6' }} />
                  Khoa/Phòng
                </label>
                <select
                  value={filters.departmentId}
                  onChange={(e) => setFilters({...filters, departmentId: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `2px solid ${filters.departmentId ? '#3b82f6' : '#e2e8f0'}`,
                    borderRadius: '10px',
                    fontSize: '0.95rem',
                    background: filters.departmentId ? '#eff6ff' : '#fff',
                    cursor: 'pointer',
                    boxShadow: filters.departmentId ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none'
                  }}
                >
                  <option value="">-- Tất cả --</option>
                  {departments.map(d => (
                    <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Search Group */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
              paddingBottom: '0.75rem',
              borderBottom: '2px solid #f0f0f0'
            }}>
              <FiSearch size={18} style={{ color: '#ec4899' }} />
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#2d3748' }}>
                Tìm kiếm
              </h4>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#4a5568' }}>
                <FiPackage size={14} style={{ color: '#ec4899' }} />
                ID Bệnh nhân
              </label>
              <input
                type="number"
                placeholder="Nhập ID bệnh nhân để xem lịch sử xuất..."
                value={filters.patientId}
                onChange={(e) => setFilters({...filters, patientId: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `2px solid ${filters.patientId ? '#ec4899' : '#e2e8f0'}`,
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  background: filters.patientId ? '#fdf2f8' : '#fff',
                  boxShadow: filters.patientId ? '0 0 0 3px rgba(236, 72, 153, 0.1)' : 'none'
                }}
              />
              {filters.patientId && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#ec4899', fontWeight: '500' }}>
                  ✓ Đang lọc theo bệnh nhân #{filters.patientId}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            paddingTop: '1.5rem',
            borderTop: '2px solid #f0f0f0'
          }}>
            <button
              onClick={handleClearFilters}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.875rem 1.75rem',
                background: '#fff',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '0.95rem',
                fontWeight: '600',
                color: '#64748b',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}
            >
              <FiX size={18} />
              Xóa bộ lọc
            </button>
            <button
              onClick={handleApplyFilters}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.875rem 2rem',
                background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                border: 'none',
                borderRadius: '12px',
                fontSize: '0.95rem',
                fontWeight: '600',
                color: '#fff',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
              }}
            >
              <FiCheckCircle size={18} />
              {loading ? 'Đang lọc...' : 'Áp dụng bộ lọc'}
            </button>
          </div>
        </div>
      </div>

      {/* STATISTICS CARDS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        {/* Total Issues Card */}
        <div style={{
          background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
          borderRadius: '16px',
          padding: '1.5rem',
          color: '#fff',
          boxShadow: '0 8px 20px rgba(14, 165, 233, 0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '80px',
            height: '80px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%'
          }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <FiBarChart2 size={24} />
            <span style={{ fontSize: '0.9rem', fontWeight: '500', opacity: 0.9 }}>Tổng phiếu</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>
            {statistics?.totalIssues ?? issues.length}
          </div>
          <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '0.5rem' }}>
            Trong 30 ngày qua
          </div>
        </div>

        {/* Pending Approval Card */}
        <div
          onClick={handlePendingApprovalFilter}
          style={{
            background: activeQuickFilter === 'pendingApproval'
              ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
              : '#fff',
            borderRadius: '16px',
            padding: '1.5rem',
            color: activeQuickFilter === 'pendingApproval' ? '#fff' : '#1a202c',
            boxShadow: activeQuickFilter === 'pendingApproval'
              ? '0 8px 20px rgba(245, 158, 11, 0.3)'
              : '0 4px 12px rgba(0,0,0,0.08)',
            border: activeQuickFilter === 'pendingApproval' ? 'none' : '2px solid #fed7aa',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
          }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '80px',
            height: '80px',
            background: activeQuickFilter === 'pendingApproval' ? 'rgba(255,255,255,0.1)' : 'rgba(245, 158, 11, 0.1)',
            borderRadius: '50%'
          }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <FiAlertCircle size={24} style={{ color: activeQuickFilter === 'pendingApproval' ? '#fff' : '#f59e0b' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: '500', opacity: 0.9 }}>Chờ duyệt</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: activeQuickFilter === 'pendingApproval' ? '#fff' : '#f59e0b' }}>
            {pendingApproval.length}
          </div>
          <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.5rem' }}>
            Trong 48 giờ qua - Click để lọc
          </div>
        </div>

        {/* Pending Completion Card */}
        <div
          onClick={handlePendingCompletionFilter}
          style={{
            background: activeQuickFilter === 'pendingCompletion'
              ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
              : '#fff',
            borderRadius: '16px',
            padding: '1.5rem',
            color: activeQuickFilter === 'pendingCompletion' ? '#fff' : '#1a202c',
            boxShadow: activeQuickFilter === 'pendingCompletion'
              ? '0 8px 20px rgba(59, 130, 246, 0.3)'
              : '0 4px 12px rgba(0,0,0,0.08)',
            border: activeQuickFilter === 'pendingCompletion' ? 'none' : '2px solid #bfdbfe',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
          }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '80px',
            height: '80px',
            background: activeQuickFilter === 'pendingCompletion' ? 'rgba(255,255,255,0.1)' : 'rgba(59, 130, 246, 0.1)',
            borderRadius: '50%'
          }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <FiClock size={24} style={{ color: activeQuickFilter === 'pendingCompletion' ? '#fff' : '#3b82f6' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: '500', opacity: 0.9 }}>Chờ hoàn thành</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: activeQuickFilter === 'pendingCompletion' ? '#fff' : '#3b82f6' }}>
            {pendingCompletion.length}
          </div>
          <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.5rem' }}>
            Trong 48 giờ qua - Click để lọc
          </div>
        </div>

        {/* Completed Card */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '1.5rem',
          color: '#1a202c',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          border: '2px solid #bbf7d0',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '80px',
            height: '80px',
            background: 'rgba(34, 197, 94, 0.1)',
            borderRadius: '50%'
          }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <FiCheckCircle size={24} style={{ color: '#22c55e' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: '500', opacity: 0.9 }}>Hoàn thành</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#22c55e' }}>
            {statistics?.completedCount ?? issues.filter(i => i.status === 'COMPLETED').length}
          </div>
          <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.5rem' }}>
            Trong 30 ngày qua
          </div>
        </div>
      </div>

      {/* Search Results Info */}
      {isSearching && (
        <div style={{
          background: '#fef3c7',
          border: '1px solid #fcd34d',
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: '#92400e'
        }}>
          <FiSearch size={16} />
          <span>Đang tìm kiếm "{searchTerm}"... Tìm thấy {issues.length} kết quả</span>
        </div>
      )}

      {/* TABLE */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Mã phiếu</th>
              <th>Loại xuất</th>
              <th>Khoa/Bệnh nhân</th>
              <th>Ngày xuất</th>
              <th>Số mặt hàng</th>
              <th>Trạng thái</th>
              <th className="text-center">Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="text-center">Đang tải...</td></tr>
            ) : filteredIssues.length > 0 ? filteredIssues.map(item => (
              <tr key={item.goodsIssueId}>
                <td>
                  <strong>{item.issueNumber || `#${item.goodsIssueId}`}</strong>
                </td>
                <td>{getIssueTypeBadge(item.issueType, item.issueTypeDisplay)}</td>
                <td>
                  {item.departmentName || item.patientName || item.receiverName || '-'}
                  {item.patientCode && <span className="sub-text"> ({item.patientCode})</span>}
                </td>
                <td>{item.issueDate || (item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : '-')}</td>
                <td className="text-center">{item.itemCount || item.items?.length || 0}</td>
                <td>{getStatusBadge(item.status, item.statusDisplay)}</td>
                <td className="text-center">
                  {(item.status === 'DRAFT' || item.status === 'PENDING') && (
                    <button className="btn-icon edit" onClick={() => handleOpenEdit(item.goodsIssueId)} title="Sửa">
                      <FaEdit/>
                    </button>
                  )}
                  <button
                    className="btn-icon view"
                    title="Xem chi tiết"
                    onClick={() => handleOpenDetail(item)}
                  >
                    <FaEye/>
                  </button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="7" className="text-center">Chưa có phiếu xuất kho nào.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL FORM */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content large-modal">
            <div className="modal-header">
              <h2>{isEditing ? `Cập nhật Phiếu #${formData.id}` : 'Tạo Phiếu Xuất Kho'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}><FaTimes/></button>
            </div>
            
            <div className="modal-body">
              {/* General Info */}
              <div className="form-grid">
                <div className="form-group">
                  <label>Loại xuất kho</label>
                  <select 
                    value={formData.issueType}
                    onChange={(e) => setFormData({...formData, issueType: e.target.value})}
                    disabled={isEditing} // Không cho sửa loại khi đã tạo
                  >
                    <option value="DEPARTMENT_ISSUE">Xuất cho Khoa/Phòng</option>
                    <option value="DISPOSAL">Xuất Hủy</option>
                    <option value="TRANSFER">Chuyển kho</option>
                  </select>
                </div>
                
                {formData.issueType === 'DEPARTMENT_ISSUE' && (
                  <div className="form-group">
                    <label>Khoa/Phòng nhận</label>
                    <select 
                      value={formData.departmentId}
                      onChange={(e) => setFormData({...formData, departmentId: e.target.value})}
                    >
                      <option value="">-- Chọn khoa --</option>
                      {departments.map(d => (
                        <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-group full-width">
                  <label>Ghi chú</label>
                  <input 
                    type="text" 
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Nhập lý do xuất kho..."
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="items-section">
                <div className="section-header">
                  <h3>Danh sách Hàng hóa</h3>
                  <button className="btn-secondary small" onClick={handleAddItem}><FaPlus/> Thêm dòng</button>
                </div>
                
                <table className="sub-table">
                  <thead>
                    <tr>
                      <th style={{width: '50%'}}>Tên Thuốc / Vật tư</th>
                      <th style={{width: '20%'}}>Số lượng</th>
                      <th style={{width: '10%'}}>Xóa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <select 
                            value={item.stockId}
                            onChange={(e) => handleItemChange(index, 'stockId', e.target.value)}
                            className="item-select"
                          >
                            <option value="">-- Chọn mặt hàng --</option>
                            {stockList.map(s => (
                              <option key={s.id} value={s.id}>
                                {s.medicineName || s.name} (Tồn: {s.stockQuantity})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input 
                            type="number" 
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            className="qty-input"
                          />
                        </td>
                        <td className="text-center">
                          <button className="btn-icon delete" onClick={() => handleRemoveItem(index)}>
                            <FaTrash/>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {formData.items.length === 0 && (
                      <tr><td colSpan="3" className="text-center">Chưa có mặt hàng nào.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>Hủy bỏ</button>
              <button className="btn-save" onClick={handleSubmit} disabled={loading}>
                <FaSave/> {loading ? 'Đang lưu...' : 'Lưu Phiếu'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {showDetailModal && selectedIssue && (
        <div className="modal-overlay">
          <div className="modal-content large-modal">
            <div className="modal-header">
              <h2>Chi tiết Phiếu xuất #{selectedIssue.issueNumber || selectedIssue.goodsIssueId}</h2>
              <button className="close-btn" onClick={() => setShowDetailModal(false)}><FaTimes/></button>
            </div>

            <div className="modal-body">
              {/* General Info */}
              <div className="detail-info-grid">
                <div className="info-item">
                  <label>Mã phiếu:</label>
                  <span>{selectedIssue.issueNumber || `#${selectedIssue.goodsIssueId}`}</span>
                </div>
                <div className="info-item">
                  <label>Loại xuất:</label>
                  <span>{getIssueTypeBadge(selectedIssue.issueType, selectedIssue.issueTypeDisplay)}</span>
                </div>
                <div className="info-item">
                  <label>Trạng thái:</label>
                  <span>{getStatusBadge(selectedIssue.status, selectedIssue.statusDisplay)}</span>
                </div>
                <div className="info-item">
                  <label>Ngày xuất:</label>
                  <span>{selectedIssue.issueDate || (selectedIssue.createdAt ? new Date(selectedIssue.createdAt).toLocaleDateString('vi-VN') : '-')}</span>
                </div>
                <div className="info-item">
                  <label>Khoa/Bệnh nhân:</label>
                  <span>{selectedIssue.departmentName || selectedIssue.patientName || selectedIssue.receiverName || '-'}</span>
                </div>
                {selectedIssue.issuerEmployeeName && (
                  <div className="info-item">
                    <label>Người xuất:</label>
                    <span>{selectedIssue.issuerEmployeeName}</span>
                  </div>
                )}
                {selectedIssue.approvedByEmployeeName && (
                  <div className="info-item">
                    <label>Người duyệt:</label>
                    <span>{selectedIssue.approvedByEmployeeName}</span>
                  </div>
                )}
                {selectedIssue.notes && (
                  <div className="info-item full-width">
                    <label>Ghi chú:</label>
                    <span>{selectedIssue.notes}</span>
                  </div>
                )}
              </div>

              {/* Items Table */}
              <div className="items-section">
                <h3>Danh sách Hàng hóa ({selectedIssue.itemCount || selectedIssue.items?.length || 0} mặt hàng)</h3>
                {selectedIssue.items && selectedIssue.items.length > 0 ? (
                  <table className="items-table">
                    <thead>
                      <tr>
                        <th>STT</th>
                        <th>Tên thuốc/vật tư</th>
                        <th>Lô / HSD</th>
                        <th>Số lượng</th>
                        <th>Đơn giá</th>
                        <th>Thành tiền</th>
                        <th>Trạng thái HSD</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedIssue.items.map((itm, idx) => (
                        <tr key={itm.goodsIssueItemId || idx}>
                          <td>{idx + 1}</td>
                          <td>
                            {itm.itemName || itm.itemDisplayName || `Item #${itm.itemId}`}
                            {itm.itemCode && <span className="sub-text"> ({itm.itemCode})</span>}
                          </td>
                          <td>
                            {itm.batchInfo || (
                              <>
                                {itm.batchNumber && <span>Lô: {itm.batchNumber}</span>}
                                {itm.expiryDate && <span> - HSD: {itm.expiryDate}</span>}
                              </>
                            )}
                          </td>
                          <td className="text-center">{itm.quantity || 0}</td>
                          <td className="text-right">
                            {itm.unitPrice ? itm.unitPrice.toLocaleString('vi-VN') + ' đ' : '-'}
                          </td>
                          <td className="text-right">
                            {itm.totalPrice ? itm.totalPrice.toLocaleString('vi-VN') + ' đ' : '-'}
                          </td>
                          <td>
                            <span className={`expiry-status ${itm.isExpired ? 'expired' : itm.isExpiringSoon ? 'expiring' : 'valid'}`}>
                              {itm.expiryStatus || (itm.isExpired ? '⚠️ Hết hạn' : itm.isExpiringSoon ? '⚠️ Sắp hết hạn' : '✓ Còn hạn')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="5" className="text-right"><strong>Tổng cộng:</strong></td>
                        <td className="text-right">
                          <strong>{selectedIssue.totalAmount ? selectedIssue.totalAmount.toLocaleString('vi-VN') + ' đ' : '-'}</strong>
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                ) : (
                  <p className="no-items">Không có chi tiết mặt hàng</p>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <div className="footer-left">
                {/* Nút Xóa - chỉ DRAFT */}
                {selectedIssue.status === 'DRAFT' && (
                  <button
                    className="btn-danger"
                    onClick={() => handleDelete(selectedIssue.goodsIssueId)}
                    disabled={loading}
                  >
                    <FaTrash/> Xóa phiếu
                  </button>
                )}
                {/* Nút Hủy - mọi status trừ COMPLETED và CANCELLED */}
                {selectedIssue.status !== 'COMPLETED' && selectedIssue.status !== 'CANCELLED' && (
                  <button
                    className="btn-warning"
                    onClick={() => handleCancel(selectedIssue.goodsIssueId)}
                    disabled={loading}
                  >
                    <FaBan/> Hủy phiếu
                  </button>
                )}
              </div>
              <div className="footer-right">
                <button className="btn-cancel" onClick={() => setShowDetailModal(false)}>Đóng</button>
                {/* Nút Sửa - chỉ DRAFT hoặc PENDING */}
                {(selectedIssue.status === 'DRAFT' || selectedIssue.status === 'PENDING') && (
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      setShowDetailModal(false);
                      handleOpenEdit(selectedIssue.goodsIssueId);
                    }}
                    disabled={loading}
                  >
                    <FaEdit/> Chỉnh sửa
                  </button>
                )}
                {/* Nút Duyệt - chỉ DRAFT */}
                {selectedIssue.status === 'DRAFT' && (
                  <button
                    className="btn-primary"
                    onClick={() => handleApprove(selectedIssue.goodsIssueId)}
                    disabled={loading}
                  >
                    <FaCheck/> Duyệt phiếu
                  </button>
                )}
                {/* Nút Hoàn thành - chỉ APPROVED */}
                {selectedIssue.status === 'APPROVED' && (
                  <button
                    className="btn-success"
                    onClick={() => handleComplete(selectedIssue.goodsIssueId)}
                    disabled={loading}
                  >
                    <FaCheckDouble/> Hoàn thành
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportStockPage;