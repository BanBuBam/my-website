import React, { useState, useEffect } from 'react';
import pharmacistAPI from '../../../../services/staff/pharmacistAPI';
import './StockTakingPage.css';
import {
  FaPlus, FaEye, FaEdit, FaTrash, FaSave, FaTimes, FaPlay, FaCheck, FaBan, FaChartBar
} from 'react-icons/fa';
import {
  FiFilter, FiLayers, FiSearch, FiCheckCircle, FiX,
  FiPackage, FiRefreshCw, FiClipboard, FiCalendar, FiAlertTriangle, FiTrendingUp, FiClock
} from 'react-icons/fi';

const StockTakingPage = () => {
  const [loading, setLoading] = useState(false);
  const [stockTakings, setStockTakings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Data hỗ trợ cho Form
  const [cabinets, setCabinets] = useState([]);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Detail Modal State
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Variance Analysis Modal
  const [showVarianceModal, setShowVarianceModal] = useState(false);
  const [varianceData, setVarianceData] = useState(null);

  // Statistics Modal
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [statistics, setStatistics] = useState(null);

  // Overdue & Pending Adjustments
  const [overdueItems, setOverdueItems] = useState([]);
  const [pendingAdjustments, setPendingAdjustments] = useState([]);

  // Date Range Filter
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  // Filter State
  const [activeQuickFilter, setActiveQuickFilter] = useState('all');
  const [filterApplied, setFilterApplied] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    cabinetId: ''
  });

  // Notification
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  // Form State
  const [formData, setFormData] = useState({
    takingType: 'FULL_COUNT',
    cabinetId: '',
    takingDate: '',
    notes: ''
  });

  // Stock Taking Types (khớp với backend)
  const stockTakingTypes = [
    { value: 'FULL_COUNT', label: 'Kiểm kê toàn bộ kho', requiresCabinet: false },
    { value: 'CYCLE_COUNT', label: 'Kiểm kê định kỳ theo tủ', requiresCabinet: true },
    { value: 'SPOT_CHECK', label: 'Kiểm tra đột xuất', requiresCabinet: true }
  ];

  // Status Types
  const statusTypes = [
    { value: 'DRAFT', label: 'Nháp', color: '#1890ff' },
    { value: 'IN_PROGRESS', label: 'Đang thực hiện', color: '#fa8c16' },
    { value: 'COMPLETED', label: 'Hoàn thành', color: '#52c41a' },
    { value: 'CANCELLED', label: 'Đã hủy', color: '#ff4d4f' }
  ];

  // --- NOTIFICATION HELPER ---
  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), 4000);
  };

  // --- 1. INITIAL DATA FETCHING ---
  useEffect(() => {
    fetchStockTakings();
    fetchCabinets();
    fetchOverdueAndPending();
  }, []);

  const fetchStockTakings = async () => {
    setLoading(true);
    try {
      const res = await pharmacistAPI.stockTakingAPI.getAll();
      if (res?.status === 'OK') {
        setStockTakings(Array.isArray(res.data) ? res.data : (res.data?.content || []));
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchCabinets = async () => {
    try {
      // Sử dụng getAllCabinets với size lớn để lấy tất cả tủ
      const res = await pharmacistAPI.pharmacistCabinetAPI.getAllCabinets(0, 100);
      if (res?.status === 'OK' || res?.code === 200) {
        const data = Array.isArray(res.data) ? res.data : (res.data?.content || []);
        setCabinets(data);
        console.log('Loaded cabinets:', data);
      }
    } catch (e) { console.error('Error loading cabinets:', e); }
  };

  const fetchOverdueAndPending = async () => {
    try {
      const [overdueRes, pendingRes] = await Promise.all([
        pharmacistAPI.stockTakingAPI.getOverdue(7),
        pharmacistAPI.stockTakingAPI.getPendingAdjustments()
      ]);
      if (overdueRes?.status === 'OK') {
        setOverdueItems(Array.isArray(overdueRes.data) ? overdueRes.data : []);
      }
      if (pendingRes?.status === 'OK') {
        setPendingAdjustments(Array.isArray(pendingRes.data) ? pendingRes.data : []);
      }
    } catch (e) { console.error(e); }
  };

  // Open detail modal
  const handleOpenDetail = async (item) => {
    setLoading(true);
    try {
      const res = await pharmacistAPI.stockTakingAPI.getById(item.stockTakingId || item.id);
      if (res?.status === 'OK') {
        setSelectedItem(res.data);
        setShowDetailModal(true);
      }
    } catch (e) { console.error(e); alert("Lỗi tải chi tiết"); }
    finally { setLoading(false); }
  };

  // --- ACTION HANDLERS (Start, Complete, Apply, Cancel) ---
  const handleStartStockTaking = async (id) => {
    if (!window.confirm("Bắt đầu kiểm kê? Hệ thống sẽ tự động tạo danh sách items cần kiểm.")) return;
    setLoading(true);
    try {
      const res = await pharmacistAPI.stockTakingAPI.start(id);
      if (res?.status === 'OK') {
        showNotification('success', 'Đã bắt đầu kiểm kê thành công!');
        setShowDetailModal(false);
        fetchStockTakings();
        fetchOverdueAndPending();
      } else {
        showNotification('error', res?.message || 'Không thể bắt đầu kiểm kê');
      }
    } catch (e) { console.error(e); showNotification('error', 'Lỗi hệ thống'); }
    finally { setLoading(false); }
  };

  const handleCompleteStockTaking = async (id) => {
    if (!window.confirm("Hoàn thành kiểm kê? Hệ thống sẽ tính toán chênh lệch.")) return;
    setLoading(true);
    try {
      const res = await pharmacistAPI.stockTakingAPI.complete(id);
      if (res?.status === 'OK') {
        showNotification('success', 'Đã hoàn thành kiểm kê! Xem phân tích chênh lệch để áp dụng điều chỉnh.');
        setShowDetailModal(false);
        fetchStockTakings();
        fetchOverdueAndPending();
      } else {
        showNotification('error', res?.message || 'Không thể hoàn thành kiểm kê');
      }
    } catch (e) { console.error(e); showNotification('error', 'Lỗi hệ thống'); }
    finally { setLoading(false); }
  };

  const handleApplyAdjustments = async (id) => {
    if (!window.confirm("Áp dụng điều chỉnh tồn kho? Thao tác này sẽ tạo các biến động kho tương ứng.")) return;
    setLoading(true);
    try {
      const res = await pharmacistAPI.stockTakingAPI.applyAdjustments(id);
      if (res?.status === 'OK') {
        showNotification('success', 'Đã áp dụng điều chỉnh tồn kho thành công!');
        setShowDetailModal(false);
        setShowVarianceModal(false);
        fetchStockTakings();
        fetchOverdueAndPending();
      } else {
        showNotification('error', res?.message || 'Không thể áp dụng điều chỉnh');
      }
    } catch (e) { console.error(e); showNotification('error', 'Lỗi hệ thống'); }
    finally { setLoading(false); }
  };

  const handleCancelStockTaking = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn HỦY phiếu kiểm kê này?")) return;
    setLoading(true);
    try {
      const res = await pharmacistAPI.stockTakingAPI.cancel(id);
      if (res?.status === 'OK') {
        showNotification('success', 'Đã hủy phiếu kiểm kê!');
        setShowDetailModal(false);
        fetchStockTakings();
        fetchOverdueAndPending();
      } else {
        showNotification('error', res?.message || 'Không thể hủy phiếu');
      }
    } catch (e) { console.error(e); showNotification('error', 'Lỗi hệ thống'); }
    finally { setLoading(false); }
  };

  // --- VARIANCE ANALYSIS ---
  const handleViewVarianceAnalysis = async (id) => {
    setLoading(true);
    try {
      const res = await pharmacistAPI.stockTakingAPI.getVarianceAnalysis(id);
      if (res?.status === 'OK') {
        setVarianceData(res.data);
        setShowVarianceModal(true);
      } else {
        showNotification('error', res?.message || 'Không thể tải phân tích chênh lệch');
      }
    } catch (e) { console.error(e); showNotification('error', 'Lỗi hệ thống'); }
    finally { setLoading(false); }
  };

  // --- STATISTICS ---
  const handleViewStatistics = async () => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = today.toISOString().split('T')[0];

    setLoading(true);
    try {
      const res = await pharmacistAPI.stockTakingAPI.getStatistics(startOfMonth, endOfMonth);
      if (res?.status === 'OK') {
        setStatistics(res.data);
        setShowStatsModal(true);
      } else {
        showNotification('error', res?.message || 'Không thể tải thống kê');
      }
    } catch (e) { console.error(e); showNotification('error', 'Lỗi hệ thống'); }
    finally { setLoading(false); }
  };

  // --- DATE RANGE FILTER ---
  const handleFilterByDateRange = async () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      showNotification('error', 'Vui lòng chọn khoảng thời gian');
      return;
    }
    setLoading(true);
    try {
      const res = await pharmacistAPI.stockTakingAPI.getByDateRange(dateRange.startDate, dateRange.endDate);
      if (res?.status === 'OK') {
        setStockTakings(Array.isArray(res.data) ? res.data : []);
        setFilterApplied(true);
        showNotification('success', `Tìm thấy ${res.data?.length || 0} phiếu kiểm kê`);
      }
    } catch (e) { console.error(e); showNotification('error', 'Lỗi tìm kiếm'); }
    finally { setLoading(false); }
  };

  // --- SEARCH ---
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchStockTakings();
      return;
    }
    setLoading(true);
    try {
      const res = await pharmacistAPI.stockTakingAPI.search(searchTerm);
      if (res?.status === 'OK') {
        setStockTakings(Array.isArray(res.data) ? res.data : []);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // --- FILTER HANDLERS ---
  const handleApplyFilters = () => {
    // Filters are applied in filteredItems computed value
    setFilterApplied(filters.type !== '' || filters.cabinetId !== '');
  };

  const handleClearFilters = () => {
    setFilters({ type: '', status: '', cabinetId: '' });
    setActiveQuickFilter('all');
    setFilterApplied(false);
    fetchStockTakings();
  };

  // Quick filter by status
  const handleQuickFilter = (status) => {
    setActiveQuickFilter(status);
    if (status === 'all') {
      fetchStockTakings();
      setFilterApplied(false);
    } else {
      setFilters({ ...filters, status });
      setFilterApplied(true);
    }
  };

  // --- 2. FORM HANDLERS ---
  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormData({
      takingType: 'FULL_COUNT',
      cabinetId: '',
      takingDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = async (id) => {
    setLoading(true);
    try {
      const res = await pharmacistAPI.stockTakingAPI.getById(id);
      if (res?.status === 'OK') {
        const data = res.data;
        setFormData({
          id: data.stockTakingId || data.id,
          takingType: data.takingType || data.type,
          cabinetId: data.cabinetId || '',
          takingDate: data.takingDate || data.scheduledDate || '',
          notes: data.notes || ''
        });
        setIsEditing(true);
        setShowModal(true);
      }
    } catch (e) { console.error(e); alert("Lỗi tải chi tiết"); }
    finally { setLoading(false); }
  };

  // Kiểm tra xem loại kiểm kê có yêu cầu cabinetId không
  const requiresCabinetId = (takingType) => {
    return takingType === 'CYCLE_COUNT' || takingType === 'SPOT_CHECK';
  };

  const handleSubmit = async () => {
    // Validate ngày kiểm kê
    if (!formData.takingDate) {
      alert("Vui lòng chọn ngày kiểm kê"); return;
    }

    // Validate cabinetId nếu loại kiểm kê yêu cầu
    if (requiresCabinetId(formData.takingType) && !formData.cabinetId) {
      alert(`Loại "${stockTakingTypes.find(t => t.value === formData.takingType)?.label}" yêu cầu phải chọn tủ thuốc`);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        takingType: formData.takingType,
        takingDate: formData.takingDate,
        cabinetId: formData.cabinetId ? parseInt(formData.cabinetId) : null,
        notes: formData.notes
      };

      let res;
      if (isEditing) {
        res = await pharmacistAPI.stockTakingAPI.update(formData.id, payload);
      } else {
        res = await pharmacistAPI.stockTakingAPI.create(payload);
      }

      if (res?.status === 'OK') {
        alert(isEditing ? "Cập nhật thành công!" : "Tạo phiếu kiểm kê thành công!");
        setShowModal(false);
        fetchStockTakings();
      } else {
        alert(res?.message || "Thao tác thất bại");
      }
    } catch (e) { console.error(e); alert("Lỗi hệ thống"); }
    finally { setLoading(false); }
  };

  // Delete stock taking (DRAFT only)
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa phiếu kiểm kê này?")) return;
    setLoading(true);
    try {
      const res = await pharmacistAPI.stockTakingAPI.delete(id);
      if (res?.status === 'OK') {
        showNotification('success', 'Xóa phiếu thành công!');
        setShowDetailModal(false);
        setSelectedItem(null);
        fetchStockTakings();
      } else {
        showNotification('error', res?.message || 'Không thể xóa phiếu');
      }
    } catch (e) { console.error(e); showNotification('error', 'Lỗi hệ thống'); }
    finally { setLoading(false); }
  };

  // --- 3. RENDER HELPERS ---
  const getStatusBadge = (status) => {
    const statusInfo = statusTypes.find(s => s.value === status) || { label: status, color: '#666' };
    return (
      <span style={{
        padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
        backgroundColor: `${statusInfo.color}15`, color: statusInfo.color,
        border: `1px solid ${statusInfo.color}40`
      }}>
        {statusInfo.label}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const typeInfo = stockTakingTypes.find(t => t.value === type) || { label: type };
    const colors = {
      'FULL_COUNT': { bg: '#e6f7ff', color: '#1890ff' },
      'CYCLE_COUNT': { bg: '#fff7e6', color: '#fa8c16' },
      'SPOT_CHECK': { bg: '#fff1f0', color: '#ff4d4f' }
    };
    const style = colors[type] || { bg: '#f5f5f5', color: '#666' };
    return (
      <span style={{
        padding: '4px 12px', borderRadius: '4px', fontSize: '12px',
        backgroundColor: style.bg, color: style.color
      }}>
        {typeInfo.label}
      </span>
    );
  };

  // Filter items based on search term and filters
  const filteredItems = stockTakings.filter(item => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = (
        (item.stockTakingNumber || '').toLowerCase().includes(searchLower) ||
        (item.notes || '').toLowerCase().includes(searchLower) ||
        (item.cabinetName || '').toLowerCase().includes(searchLower) ||
        String(item.stockTakingId || item.id).includes(searchLower)
      );
      if (!matchesSearch) return false;
    }
    // Type filter (hỗ trợ cả takingType từ backend mới và type cũ)
    if (filters.type && (item.takingType || item.type) !== filters.type) return false;
    // Cabinet filter
    if (filters.cabinetId && String(item.cabinetId) !== String(filters.cabinetId)) return false;
    // Quick filter by status
    if (activeQuickFilter !== 'all' && item.status !== activeQuickFilter) return false;
    return true;
  });

  return (
    <div className="stock-taking-page">
      {/* NOTIFICATION */}
      {notification.show && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          padding: '1rem 1.5rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          background: notification.type === 'success' ? '#d4edda' : '#f8d7da',
          color: notification.type === 'success' ? '#155724' : '#721c24',
          display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600'
        }}>
          {notification.type === 'success' ? <FiCheckCircle size={20}/> : <FiAlertTriangle size={20}/>}
          {notification.message}
        </div>
      )}

      <div className="page-header">
        <h1 className="page-title">
          <FiClipboard style={{ marginRight: '0.5rem' }} />
          Kiểm kê hàng tồn kho
        </h1>
        <button
          className="btn-stats"
          onClick={handleViewStatistics}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px',
            fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}
        >
          <FaChartBar /> Xem thống kê
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '1.25rem', borderRadius: '12px', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FiClipboard size={28} />
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700' }}>{stockTakings.length}</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Tổng phiếu kiểm kê</div>
            </div>
          </div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #fa8c16 0%, #f5222d 100%)', padding: '1.25rem', borderRadius: '12px', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FiClock size={28} />
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700' }}>{stockTakings.filter(i => i.status === 'IN_PROGRESS').length}</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Đang thực hiện</div>
            </div>
          </div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%)', padding: '1.25rem', borderRadius: '12px', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FiAlertTriangle size={28} />
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700' }}>{overdueItems.length}</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Quá hạn</div>
            </div>
          </div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #52c41a 0%, #237804 100%)', padding: '1.25rem', borderRadius: '12px', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FiTrendingUp size={28} />
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700' }}>{pendingAdjustments.length}</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Chờ điều chỉnh</div>
            </div>
          </div>
        </div>
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
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className="btn-search" onClick={handleSearch}><FiSearch/></button>
          </div>
          {/* Date Range Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiCalendar style={{ color: '#667eea' }}/>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
              style={{ padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}
            />
            <span>→</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
              style={{ padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}
            />
            <button
              onClick={handleFilterByDateRange}
              disabled={loading}
              style={{
                background: '#667eea', color: '#fff', border: 'none',
                padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer'
              }}
            >
              Lọc
            </button>
          </div>
          <button className="btn-refresh" onClick={() => { fetchStockTakings(); fetchOverdueAndPending(); }} disabled={loading}>
            <FiRefreshCw className={loading ? 'spinning' : ''} />
            Làm mới
          </button>
        </div>
        <button className="btn-create" onClick={handleOpenCreate}>
          <FaPlus/> Tạo Phiếu Kiểm Kê
        </button>
      </div>

      {/* QUICK FILTER TABS */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => handleQuickFilter('all')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            border: activeQuickFilter === 'all' ? 'none' : '1px solid #e2e8f0',
            background: activeQuickFilter === 'all' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#fff',
            color: activeQuickFilter === 'all' ? '#fff' : '#4a5568',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          Tất cả ({stockTakings.length})
        </button>
        {statusTypes.map(status => (
          <button
            key={status.value}
            onClick={() => handleQuickFilter(status.value)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              border: activeQuickFilter === status.value ? 'none' : `1px solid ${status.color}40`,
              background: activeQuickFilter === status.value ? status.color : '#fff',
              color: activeQuickFilter === status.value ? '#fff' : status.color,
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            {status.label} ({stockTakings.filter(i => i.status === status.value).length})
          </button>
        ))}
      </div>

      {/* FILTER SECTION */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem',
        borderRadius: '16px',
        marginBottom: '1.5rem',
        boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative Background Pattern */}
        <div style={{
          position: 'absolute',
          top: 0, right: 0,
          width: '300px', height: '300px',
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
              justifyContent: 'center'
            }}>
              <FiFilter size={20} style={{ color: '#fff' }} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#fff' }}>
                Bộ lọc tìm kiếm
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.9)', marginTop: '0.25rem' }}>
                Lọc theo loại kiểm kê và tủ thuốc
              </p>
            </div>
          </div>
          {filterApplied && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              color: '#28a745',
              padding: '0.5rem 1rem',
              borderRadius: '25px',
              fontSize: '0.9rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <FiCheckCircle size={16} />
              <span>Đang áp dụng bộ lọc</span>
            </div>
          )}
        </div>

        {/* Filter Content Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '2rem',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
            {/* Type Filter */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#4a5568' }}>
                <FiLayers size={14} style={{ color: '#667eea' }} />
                Loại kiểm kê
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
                style={{
                  width: '100%', padding: '0.75rem',
                  border: `2px solid ${filters.type ? '#667eea' : '#e2e8f0'}`,
                  borderRadius: '10px', fontSize: '0.95rem', cursor: 'pointer'
                }}
              >
                <option value="">-- Tất cả --</option>
                {stockTakingTypes.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Cabinet Filter */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#4a5568' }}>
                <FiPackage size={14} style={{ color: '#3b82f6' }} />
                Tủ thuốc
              </label>
              <select
                value={filters.cabinetId}
                onChange={(e) => setFilters({...filters, cabinetId: e.target.value})}
                style={{
                  width: '100%', padding: '0.75rem',
                  border: `2px solid ${filters.cabinetId ? '#3b82f6' : '#e2e8f0'}`,
                  borderRadius: '10px', fontSize: '0.95rem', cursor: 'pointer'
                }}
              >
                <option value="">-- Tất cả --</option>
                {cabinets.map(c => (
                  <option key={c.cabinetId} value={c.cabinetId}>{c.cabinetName}</option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
              <button
                onClick={handleClearFilters}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  padding: '0.75rem', background: '#fff', border: '2px solid #e2e8f0',
                  borderRadius: '10px', fontWeight: '600', color: '#64748b', cursor: 'pointer'
                }}
              >
                <FiX size={16} /> Xóa lọc
              </button>
              <button
                onClick={handleApplyFilters}
                disabled={loading}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  padding: '0.75rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none', borderRadius: '10px', fontWeight: '600', color: '#fff', cursor: 'pointer'
                }}
              >
                <FiCheckCircle size={16} /> Áp dụng
              </button>
            </div>
          </div>
        </div>
      </div>


      {/* TABLE */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Mã phiếu</th>
              <th>Loại kiểm kê</th>
              <th>Tủ thuốc</th>
              <th>Ngày kiểm kê</th>
              <th>Trạng thái</th>
              <th>Ghi chú</th>
              <th className="text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="text-center">Đang tải...</td></tr>
            ) : filteredItems.length > 0 ? filteredItems.map(item => (
              <tr key={item.stockTakingId || item.id}>
                <td>
                  <strong>{item.stockTakingNumber || `#${item.stockTakingId || item.id}`}</strong>
                </td>
                <td>{getTypeBadge(item.takingType || item.type)}</td>
                <td>{item.cabinetName || 'Tất cả tủ'}</td>
                <td>
                  {(item.takingDate || item.scheduledDate)
                    ? new Date(item.takingDate || item.scheduledDate).toLocaleDateString('vi-VN')
                    : '-'}
                </td>
                <td>{getStatusBadge(item.status)}</td>
                <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.notes || '-'}
                </td>
                <td className="text-center">
                  {item.status === 'DRAFT' && (
                    <>
                      <button className="btn-icon edit" onClick={() => handleOpenEdit(item.stockTakingId || item.id)} title="Sửa">
                        <FaEdit/>
                      </button>
                      <button className="btn-icon delete" onClick={() => handleDelete(item.stockTakingId || item.id)} title="Xóa">
                        <FaTrash/>
                      </button>
                    </>
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
              <tr><td colSpan="7" className="text-center">Chưa có phiếu kiểm kê nào.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE/EDIT MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isEditing ? 'Sửa Phiếu Kiểm Kê' : 'Tạo Phiếu Kiểm Kê Mới'}</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}><FaTimes/></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Loại kiểm kê *</label>
                <select
                  value={formData.takingType}
                  onChange={(e) => {
                    const newType = e.target.value;
                    setFormData({
                      ...formData,
                      takingType: newType,
                      // Reset cabinetId nếu chuyển sang FULL_COUNT
                      cabinetId: newType === 'FULL_COUNT' ? '' : formData.cabinetId
                    });
                  }}
                >
                  {stockTakingTypes.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>
                  Tủ thuốc {requiresCabinetId(formData.takingType) ? '*' : '(không áp dụng cho kiểm kê toàn bộ)'}
                </label>
                <select
                  value={formData.cabinetId}
                  onChange={(e) => setFormData({...formData, cabinetId: e.target.value})}
                  disabled={formData.takingType === 'FULL_COUNT'}
                  style={formData.takingType === 'FULL_COUNT' ? {backgroundColor: '#f5f5f5', cursor: 'not-allowed'} : {}}
                >
                  <option value="">-- Chọn tủ thuốc --</option>
                  {cabinets.map(c => (
                    <option key={c.cabinetId} value={c.cabinetId}>{c.cabinetName}</option>
                  ))}
                </select>
                {requiresCabinetId(formData.takingType) && !formData.cabinetId && (
                  <small style={{color: '#ff4d4f', marginTop: '4px', display: 'block'}}>
                    ⚠️ Bắt buộc chọn tủ thuốc cho loại kiểm kê này
                  </small>
                )}
              </div>
              <div className="form-group">
                <label>Ngày kiểm kê *</label>
                <input
                  type="date"
                  value={formData.takingDate}
                  onChange={(e) => setFormData({...formData, takingDate: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Ghi chú</label>
                <textarea
                  rows="3"
                  placeholder="Nhập ghi chú về đợt kiểm kê..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>
                <FaTimes/> Hủy
              </button>
              <button className="btn-save" onClick={handleSubmit} disabled={loading}>
                <FaSave/> {loading ? 'Đang xử lý...' : (isEditing ? 'Cập nhật' : 'Tạo phiếu')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {showDetailModal && selectedItem && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi tiết Phiếu Kiểm Kê</h2>
              <button className="btn-close" onClick={() => setShowDetailModal(false)}><FaTimes/></button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Mã phiếu:</label>
                  <span><strong>{selectedItem.stockTakingNumber || `#${selectedItem.stockTakingId || selectedItem.id}`}</strong></span>
                </div>
                <div className="detail-item">
                  <label>Trạng thái:</label>
                  <span>{getStatusBadge(selectedItem.status)}</span>
                </div>
                <div className="detail-item">
                  <label>Loại kiểm kê:</label>
                  <span>{getTypeBadge(selectedItem.takingType || selectedItem.type)}</span>
                </div>
                <div className="detail-item">
                  <label>Tủ thuốc:</label>
                  <span>{selectedItem.cabinetName || 'Tất cả tủ'}</span>
                </div>
                <div className="detail-item">
                  <label>Ngày kiểm kê:</label>
                  <span>{(selectedItem.takingDate || selectedItem.scheduledDate) ? new Date(selectedItem.takingDate || selectedItem.scheduledDate).toLocaleDateString('vi-VN') : '-'}</span>
                </div>
                <div className="detail-item">
                  <label>Người tạo:</label>
                  <span>{selectedItem.createdByName || '-'}</span>
                </div>
                {selectedItem.startedAt && (
                  <div className="detail-item">
                    <label>Bắt đầu:</label>
                    <span>{new Date(selectedItem.startedAt).toLocaleString('vi-VN')}</span>
                  </div>
                )}
                {selectedItem.completedAt && (
                  <div className="detail-item">
                    <label>Hoàn thành:</label>
                    <span>{new Date(selectedItem.completedAt).toLocaleString('vi-VN')}</span>
                  </div>
                )}
                <div className="detail-item full-width">
                  <label>Ghi chú:</label>
                  <span>{selectedItem.notes || 'Không có ghi chú'}</span>
                </div>
                {/* Variance Summary */}
                {selectedItem.status === 'COMPLETED' && selectedItem.totalVariance !== undefined && (
                  <div className="detail-item full-width" style={{ background: '#fff7e6', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
                    <label style={{ color: '#fa8c16', fontWeight: '700' }}>📊 Tóm tắt chênh lệch:</label>
                    <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem' }}>
                      <span>Tổng items: <strong>{selectedItem.totalItems || 0}</strong></span>
                      <span>Có chênh lệch: <strong style={{ color: '#ff4d4f' }}>{selectedItem.itemsWithVariance || 0}</strong></span>
                      <span>Giá trị chênh lệch: <strong style={{ color: '#ff4d4f' }}>{(selectedItem.totalVarianceValue || 0).toLocaleString('vi-VN')} đ</strong></span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {/* DRAFT Actions */}
              {selectedItem.status === 'DRAFT' && (
                <>
                  <button
                    onClick={() => handleStartStockTaking(selectedItem.stockTakingId || selectedItem.id)}
                    disabled={loading}
                    style={{ background: '#52c41a', color: '#fff', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <FaPlay /> Bắt đầu kiểm kê
                  </button>
                  <button className="btn-edit" onClick={() => { setShowDetailModal(false); handleOpenEdit(selectedItem.stockTakingId || selectedItem.id); }}>
                    <FaEdit/> Sửa
                  </button>
                  <button className="btn-delete" onClick={() => handleDelete(selectedItem.stockTakingId || selectedItem.id)}>
                    <FaTrash/> Xóa
                  </button>
                </>
              )}
              {/* IN_PROGRESS Actions */}
              {selectedItem.status === 'IN_PROGRESS' && (
                <button
                  onClick={() => handleCompleteStockTaking(selectedItem.stockTakingId || selectedItem.id)}
                  disabled={loading}
                  style={{ background: '#1890ff', color: '#fff', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <FaCheck /> Hoàn thành kiểm kê
                </button>
              )}
              {/* COMPLETED Actions */}
              {selectedItem.status === 'COMPLETED' && (
                <>
                  <button
                    onClick={() => handleViewVarianceAnalysis(selectedItem.stockTakingId || selectedItem.id)}
                    disabled={loading}
                    style={{ background: '#fa8c16', color: '#fff', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <FaChartBar /> Xem chênh lệch
                  </button>
                  <button
                    onClick={() => handleApplyAdjustments(selectedItem.stockTakingId || selectedItem.id)}
                    disabled={loading}
                    style={{ background: '#52c41a', color: '#fff', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <FiCheckCircle /> Áp dụng điều chỉnh
                  </button>
                </>
              )}
              {/* Cancel button - available for DRAFT and IN_PROGRESS */}
              {(selectedItem.status === 'DRAFT' || selectedItem.status === 'IN_PROGRESS') && (
                <button
                  onClick={() => handleCancelStockTaking(selectedItem.stockTakingId || selectedItem.id)}
                  disabled={loading}
                  style={{ background: '#ff4d4f', color: '#fff', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <FaBan /> Hủy phiếu
                </button>
              )}
              <button className="btn-cancel" onClick={() => setShowDetailModal(false)}>
                <FaTimes/> Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VARIANCE ANALYSIS MODAL */}
      {showVarianceModal && varianceData && (
        <div className="modal-overlay" onClick={() => setShowVarianceModal(false)}>
          <div className="modal-content modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: '900px' }}>
            <div className="modal-header" style={{ background: 'linear-gradient(135deg, #fa8c16 0%, #f5222d 100%)', color: '#fff' }}>
              <h2><FaChartBar /> Phân tích chênh lệch</h2>
              <button className="btn-close" onClick={() => setShowVarianceModal(false)} style={{ color: '#fff' }}><FaTimes/></button>
            </div>
            <div className="modal-body">
              {/* Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#f6ffed', border: '1px solid #b7eb8f', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#52c41a' }}>{varianceData.totalItems || 0}</div>
                  <div style={{ fontSize: '0.85rem', color: '#52c41a' }}>Tổng items</div>
                </div>
                <div style={{ background: '#fff7e6', border: '1px solid #ffd591', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fa8c16' }}>{varianceData.itemsWithVariance || 0}</div>
                  <div style={{ fontSize: '0.85rem', color: '#fa8c16' }}>Có chênh lệch</div>
                </div>
                <div style={{ background: '#fff1f0', border: '1px solid #ffa39e', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ff4d4f' }}>{varianceData.itemsShort || 0}</div>
                  <div style={{ fontSize: '0.85rem', color: '#ff4d4f' }}>Thiếu</div>
                </div>
                <div style={{ background: '#e6f7ff', border: '1px solid #91d5ff', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1890ff' }}>{varianceData.itemsOver || 0}</div>
                  <div style={{ fontSize: '0.85rem', color: '#1890ff' }}>Dư</div>
                </div>
              </div>

              {/* Variance Items Table */}
              {varianceData.items && varianceData.items.length > 0 ? (
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#fafafa', position: 'sticky', top: 0 }}>
                      <tr>
                        <th style={{ padding: '0.75rem', borderBottom: '2px solid #e8e8e8', textAlign: 'left' }}>Tên sản phẩm</th>
                        <th style={{ padding: '0.75rem', borderBottom: '2px solid #e8e8e8', textAlign: 'center' }}>Hệ thống</th>
                        <th style={{ padding: '0.75rem', borderBottom: '2px solid #e8e8e8', textAlign: 'center' }}>Thực tế</th>
                        <th style={{ padding: '0.75rem', borderBottom: '2px solid #e8e8e8', textAlign: 'center' }}>Chênh lệch</th>
                        <th style={{ padding: '0.75rem', borderBottom: '2px solid #e8e8e8', textAlign: 'right' }}>Giá trị</th>
                      </tr>
                    </thead>
                    <tbody>
                      {varianceData.items.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <td style={{ padding: '0.75rem' }}>{item.itemName || item.productName}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'center' }}>{item.systemQuantity}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'center' }}>{item.actualQuantity}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                            <span style={{
                              padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: '600',
                              background: item.variance > 0 ? '#e6f7ff' : item.variance < 0 ? '#fff1f0' : '#f6ffed',
                              color: item.variance > 0 ? '#1890ff' : item.variance < 0 ? '#ff4d4f' : '#52c41a'
                            }}>
                              {item.variance > 0 ? '+' : ''}{item.variance}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'right', color: item.varianceValue < 0 ? '#ff4d4f' : '#52c41a' }}>
                            {(item.varianceValue || 0).toLocaleString('vi-VN')} đ
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#8c8c8c' }}>
                  ✅ Không có chênh lệch nào được phát hiện
                </div>
              )}

              {/* Total Variance Value */}
              <div style={{ marginTop: '1rem', padding: '1rem', background: '#fafafa', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>Tổng giá trị chênh lệch:</span>
                <span style={{ fontWeight: '700', fontSize: '1.25rem', color: varianceData.totalVarianceValue < 0 ? '#ff4d4f' : '#52c41a' }}>
                  {(varianceData.totalVarianceValue || 0).toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>
            <div className="modal-footer" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => handleApplyAdjustments(selectedItem?.stockTakingId || selectedItem?.id)}
                disabled={loading || !varianceData.itemsWithVariance}
                style={{
                  background: varianceData.itemsWithVariance ? '#52c41a' : '#d9d9d9',
                  color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '6px',
                  fontWeight: '600', cursor: varianceData.itemsWithVariance ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}
              >
                <FiCheckCircle /> Áp dụng điều chỉnh tồn kho
              </button>
              <button className="btn-cancel" onClick={() => setShowVarianceModal(false)}>
                <FaTimes/> Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATISTICS MODAL */}
      {showStatsModal && statistics && (
        <div className="modal-overlay" onClick={() => setShowStatsModal(false)}>
          <div className="modal-content modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <div className="modal-header" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff' }}>
              <h2><FaChartBar /> Thống kê kiểm kê tháng này</h2>
              <button className="btn-close" onClick={() => setShowStatsModal(false)} style={{ color: '#fff' }}><FaTimes/></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#f6ffed', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#52c41a' }}>{statistics.totalCount || 0}</div>
                  <div style={{ color: '#52c41a' }}>Tổng phiếu kiểm kê</div>
                </div>
                <div style={{ background: '#e6f7ff', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1890ff' }}>{statistics.completedCount || 0}</div>
                  <div style={{ color: '#1890ff' }}>Đã hoàn thành</div>
                </div>
              </div>

              {/* By Type */}
              <h4 style={{ marginBottom: '1rem', color: '#4a5568' }}>Theo loại kiểm kê</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {Object.entries(statistics.byType || {}).map(([type, count]) => (
                  <div key={type} style={{ background: '#fafafa', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{count}</div>
                    <div style={{ fontSize: '0.8rem', color: '#8c8c8c' }}>{stockTakingTypes.find(t => t.value === type)?.label || type}</div>
                  </div>
                ))}
              </div>

              {/* By Status */}
              <h4 style={{ marginBottom: '1rem', color: '#4a5568' }}>Theo trạng thái</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                {Object.entries(statistics.byStatus || {}).map(([status, count]) => {
                  const statusInfo = statusTypes.find(s => s.value === status) || { label: status, color: '#666' };
                  return (
                    <div key={status} style={{ background: `${statusInfo.color}10`, padding: '1rem', borderRadius: '8px', textAlign: 'center', border: `1px solid ${statusInfo.color}30` }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: statusInfo.color }}>{count}</div>
                      <div style={{ fontSize: '0.8rem', color: statusInfo.color }}>{statusInfo.label}</div>
                    </div>
                  );
                })}
              </div>

              {/* Variance Summary */}
              {statistics.varianceSummary && (
                <div style={{ marginTop: '1.5rem', background: '#fff7e6', padding: '1rem', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 0.75rem 0', color: '#fa8c16' }}>📊 Tóm tắt chênh lệch</h4>
                  <div style={{ display: 'flex', gap: '2rem' }}>
                    <span>Tổng giá trị thiếu: <strong style={{ color: '#ff4d4f' }}>{(statistics.varianceSummary.totalShortValue || 0).toLocaleString('vi-VN')} đ</strong></span>
                    <span>Tổng giá trị dư: <strong style={{ color: '#52c41a' }}>{(statistics.varianceSummary.totalOverValue || 0).toLocaleString('vi-VN')} đ</strong></span>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowStatsModal(false)}>
                <FaTimes/> Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockTakingPage;