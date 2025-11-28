import React, { useState, useEffect } from 'react';
import pharmacistAPI from '../../../../services/staff/pharmacistAPI';
import './ExportStockPage.css';
import { 
  FaPlus, FaSearch, FaEye, FaEdit, FaFileExport, FaTrash, FaSave, FaTimes 
} from 'react-icons/fa';

const ExportStockPage = () => {
  const [loading, setLoading] = useState(false);
  const [issues, setIssues] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Data hỗ trợ cho Form
  const [departments, setDepartments] = useState([]);
  const [stockList, setStockList] = useState([]);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);

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
      if (deptRes?.status === 'OK') setDepartments(deptRes.data);

      const stockRes = await pharmacistAPI.pharmacistInventoryAPI.getInventory();
      if (stockRes?.status === 'OK') setStockList(stockRes.data);
    } catch (e) { console.error(e); }
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
          id: data.id,
          issueType: data.issueType,
          departmentId: data.departmentId,
          notes: data.notes,
          items: data.items.map(i => ({
            stockId: i.stockId,
            quantity: i.quantity,
            stockName: i.stockName // Giả sử API trả về tên để hiển thị
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

  // --- 3. RENDER HELPERS ---
  const getStatusBadge = (status) => {
    const styles = {
      DRAFT: { bg: '#e6f7ff', color: '#1890ff', border: '#91d5ff' },
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
        {status}
      </span>
    );
  };

  return (
    <div className="export-stock-page">
      <div className="page-header">
        <h1 className="page-title">Quản lý Xuất kho (Goods Issue)</h1>
      </div>

      {/* TOOLBAR */}
      <div className="toolbar">
        <div className="search-group">
          <input 
            type="text" 
            placeholder="Tìm theo mã phiếu, ghi chú..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="btn-search"><FaSearch/></button>
        </div>
        <button className="btn-create" onClick={handleOpenCreate}>
          <FaPlus/> Tạo Phiếu Xuất
        </button>
      </div>

      {/* TABLE */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Loại xuất</th>
              <th>Khoa/Phòng nhận</th>
              <th>Ghi chú</th>
              <th>Ngày tạo</th>
              <th>Trạng thái</th>
              <th className="text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {issues.length > 0 ? issues.map(item => (
              <tr key={item.id}>
                <td>#{item.id}</td>
                <td>{item.issueType}</td>
                <td>{item.departmentName || '-'}</td>
                <td>{item.notes}</td>
                <td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : '-'}</td>
                <td>{getStatusBadge(item.status || 'DRAFT')}</td>
                <td className="text-center">
                  {/* Chỉ cho sửa nếu là DRAFT */}
                  {(item.status === 'DRAFT' || !item.status) && (
                    <button className="btn-icon edit" onClick={() => handleOpenEdit(item.id)} title="Sửa">
                      <FaEdit/>
                    </button>
                  )}
                  <button className="btn-icon view" title="Xem chi tiết" onClick={() => handleOpenEdit(item.id)}>
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
    </div>
  );
};

export default ExportStockPage;