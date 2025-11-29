import React, { useState, useEffect } from 'react';
import pharmacistAPI from '../../../../services/staff/pharmacistAPI';
import './StockTakingPage.css';
import {
  FaPlus, FaEye, FaEdit, FaTrash, FaSave, FaTimes
} from 'react-icons/fa';
import {
  FiFilter, FiLayers, FiSearch, FiCheckCircle, FiX,
  FiPackage, FiRefreshCw, FiClipboard
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

  // Filter State
  const [activeQuickFilter, setActiveQuickFilter] = useState('all');
  const [filterApplied, setFilterApplied] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    cabinetId: ''
  });

  // Form State
  const [formData, setFormData] = useState({
    type: 'FULL_INVENTORY',
    cabinetId: '',
    scheduledDate: '',
    notes: ''
  });

  // Stock Taking Types
  const stockTakingTypes = [
    { value: 'FULL_INVENTORY', label: 'Kiểm kê toàn bộ' },
    { value: 'PARTIAL_INVENTORY', label: 'Kiểm kê một phần' },
    { value: 'CYCLE_COUNT', label: 'Kiểm kê định kỳ' },
    { value: 'SPOT_CHECK', label: 'Kiểm tra đột xuất' }
  ];

  // Status Types
  const statusTypes = [
    { value: 'DRAFT', label: 'Nháp', color: '#1890ff' },
    { value: 'IN_PROGRESS', label: 'Đang thực hiện', color: '#fa8c16' },
    { value: 'COMPLETED', label: 'Hoàn thành', color: '#52c41a' },
    { value: 'CANCELLED', label: 'Đã hủy', color: '#ff4d4f' }
  ];

  // --- 1. INITIAL DATA FETCHING ---
  useEffect(() => {
    fetchStockTakings();
    fetchCabinets();
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
      const res = await pharmacistAPI.pharmacistCabinetAPI.getCabinets();
      if (res?.status === 'OK') {
        const data = Array.isArray(res.data) ? res.data : (res.data?.content || []);
        setCabinets(data);
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
      type: 'FULL_INVENTORY',
      cabinetId: '',
      scheduledDate: new Date().toISOString().split('T')[0],
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
          type: data.type,
          cabinetId: data.cabinetId || '',
          scheduledDate: data.scheduledDate || '',
          notes: data.notes || ''
        });
        setIsEditing(true);
        setShowModal(true);
      }
    } catch (e) { console.error(e); alert("Lỗi tải chi tiết"); }
    finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    if (!formData.scheduledDate) {
      alert("Vui lòng chọn ngày kiểm kê"); return;
    }

    setLoading(true);
    try {
      const payload = {
        type: formData.type,
        cabinetId: formData.cabinetId ? parseInt(formData.cabinetId) : null,
        scheduledDate: formData.scheduledDate,
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
        alert("Xóa phiếu thành công!");
        setShowDetailModal(false);
        setSelectedItem(null);
        fetchStockTakings();
      } else {
        alert(res?.message || "Không thể xóa phiếu");
      }
    } catch (e) { console.error(e); alert("Lỗi hệ thống"); }
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
      'FULL_INVENTORY': { bg: '#e6f7ff', color: '#1890ff' },
      'PARTIAL_INVENTORY': { bg: '#f9f0ff', color: '#722ed1' },
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
    // Type filter
    if (filters.type && item.type !== filters.type) return false;
    // Cabinet filter
    if (filters.cabinetId && String(item.cabinetId) !== String(filters.cabinetId)) return false;
    // Quick filter by status
    if (activeQuickFilter !== 'all' && item.status !== activeQuickFilter) return false;
    return true;
  });

  return (
    <div className="stock-taking-page">
      <div className="page-header">
        <h1 className="page-title">
          <FiClipboard style={{ marginRight: '0.5rem' }} />
          Kiểm kê hàng tồn kho
        </h1>
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
          <button className="btn-refresh" onClick={() => fetchStockTakings()} disabled={loading}>
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
                <td>{getTypeBadge(item.type)}</td>
                <td>{item.cabinetName || 'Tất cả tủ'}</td>
                <td>
                  {item.scheduledDate
                    ? new Date(item.scheduledDate).toLocaleDateString('vi-VN')
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
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  {stockTakingTypes.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Tủ thuốc (để trống = tất cả)</label>
                <select
                  value={formData.cabinetId}
                  onChange={(e) => setFormData({...formData, cabinetId: e.target.value})}
                >
                  <option value="">-- Tất cả tủ thuốc --</option>
                  {cabinets.map(c => (
                    <option key={c.cabinetId} value={c.cabinetId}>{c.cabinetName}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Ngày kiểm kê *</label>
                <input
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})}
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
                  <span>{getTypeBadge(selectedItem.type)}</span>
                </div>
                <div className="detail-item">
                  <label>Tủ thuốc:</label>
                  <span>{selectedItem.cabinetName || 'Tất cả tủ'}</span>
                </div>
                <div className="detail-item">
                  <label>Ngày kiểm kê:</label>
                  <span>{selectedItem.scheduledDate ? new Date(selectedItem.scheduledDate).toLocaleDateString('vi-VN') : '-'}</span>
                </div>
                <div className="detail-item">
                  <label>Người tạo:</label>
                  <span>{selectedItem.createdByName || '-'}</span>
                </div>
                <div className="detail-item full-width">
                  <label>Ghi chú:</label>
                  <span>{selectedItem.notes || 'Không có ghi chú'}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              {selectedItem.status === 'DRAFT' && (
                <>
                  <button className="btn-edit" onClick={() => { setShowDetailModal(false); handleOpenEdit(selectedItem.stockTakingId || selectedItem.id); }}>
                    <FaEdit/> Sửa
                  </button>
                  <button className="btn-delete" onClick={() => handleDelete(selectedItem.stockTakingId || selectedItem.id)}>
                    <FaTrash/> Xóa
                  </button>
                </>
              )}
              <button className="btn-cancel" onClick={() => setShowDetailModal(false)}>
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