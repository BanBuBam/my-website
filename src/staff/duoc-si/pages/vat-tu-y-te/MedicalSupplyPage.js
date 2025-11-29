import React, { useState, useEffect, useCallback } from 'react';
import pharmacistAPI from '../../../../services/staff/pharmacistAPI';
import './MedicalSupplyPage.css';
import {
  FaSearch, FaEye, FaCheck, FaTimes, FaBoxOpen, FaInfoCircle, FaBan, FaChartBar, FaDatabase, FaTrashAlt, FaUndo, FaRedo
} from 'react-icons/fa';

const MedicalSupplyPage = () => {
  // --- MAIN STATE ---
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('ALL'); // ALL, PATIENT, ENCOUNTER, CATEGORY, CODE

  // Pagination
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0
  });

  // Filter state
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  // State cho danh mục
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  // State Modal Chi tiết đơn
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // --- STATE CHO CHỨC NĂNG: TỒN KHO (Stock) ---
  const [stockData, setStockData] = useState(null);
  const [showStockModal, setShowStockModal] = useState(false);

  // --- STATE CHO CHỨC NĂNG: THỐNG KÊ & LỊCH SỬ (Stats) ---
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [activeTab, setActiveTab] = useState('HISTORY'); // HISTORY, FREQUENT, STATS
  const [historyData, setHistoryData] = useState([]);
  const [frequentData, setFrequentData] = useState([]);
  const [statsData, setStatsData] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0], // Mặc định hôm nay
    endDate: new Date().toISOString().split('T')[0]
  });

  // --- STATE CHO CHỨC NĂNG: DỮ LIỆU & THÙNG RÁC (Data & Trash) ---
  const [showDataModal, setShowDataModal] = useState(false);
  const [dataTab, setDataTab] = useState('STATS'); // STATS, MATERIALS, MEDICINES
  const [dataFilter, setDataFilter] = useState('ACTIVE'); // ACTIVE, DELETED
  const [softDeleteStats, setSoftDeleteStats] = useState(null);
  const [dataList, setDataList] = useState([]);

  // --- 1. FETCH ALL PRESCRIPTIONS (Khởi tạo khi load trang) ---
  const fetchAllPrescriptions = useCallback(async (page = 0) => {
    setLoading(true);
    try {
      const params = {
        page: page,
        size: pagination.size,
      };
      if (filterStatus) params.status = filterStatus;
      if (filterType) params.type = filterType;
      if (filterPriority) params.priority = filterPriority;

      const response = await pharmacistAPI.pharmacistMedicalSupplyAPI.getAll(params);
      if (response && response.status === 'OK' && response.data) {
        const content = response.data.content || [];
        setTableData(content);
        setPagination(prev => ({
          ...prev,
          page: response.data.number || 0,
          totalElements: response.data.totalElements || 0,
          totalPages: response.data.totalPages || 0
        }));
      } else {
        setTableData([]);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách đơn vật tư:", error);
      setTableData([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.size, filterStatus, filterType, filterPriority]);

  // Load data khi trang được mở
  useEffect(() => {
    fetchAllPrescriptions();
  }, [fetchAllPrescriptions]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await pharmacistAPI.pharmacistMedicalSupplyAPI.getCategories();
        if (response && response.status === 'OK' && Array.isArray(response.data)) {
          setCategories(response.data);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error("Lỗi lấy danh mục:", error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // --- 2. SEARCH FUNCTION ---
  const handleSearch = async () => {
    // Nếu tìm kiếm ALL mà không có search term, load lại toàn bộ
    if (searchType === 'ALL') {
      fetchAllPrescriptions(0);
      return;
    }

    if (searchType === 'CATEGORY' && !selectedCategory) return;
    if (searchType !== 'CATEGORY' && searchType !== 'ALL' && !searchTerm) return;

    setLoading(true);
    setTableData([]);

    try {
      let response;
      if (searchType === 'PATIENT') {
        response = await pharmacistAPI.pharmacistMedicalSupplyAPI.getPrescriptionsByPatient(searchTerm);
      } else if (searchType === 'ENCOUNTER') {
        response = await pharmacistAPI.pharmacistMedicalSupplyAPI.getPrescriptionsByEncounter(searchTerm);
      } else if (searchType === 'CATEGORY') {
        response = await pharmacistAPI.pharmacistMedicalSupplyAPI.getSuppliesByCategory(selectedCategory);
      } else if (searchType === 'CODE') {
        // Tìm theo mã đơn - có thể dùng API getById hoặc search
        response = await pharmacistAPI.pharmacistMedicalSupplyAPI.getPrescriptionById(searchTerm);
        if (response && response.status === 'OK' && response.data) {
          setTableData([response.data]); // Wrap single result in array
          setLoading(false);
          return;
        }
      }

      if (response && response.status === 'OK') {
        setTableData(Array.isArray(response.data) ? response.data : (response.data?.content || []));
      } else {
        setTableData([]);
      }
    } catch (error) {
      console.error("Lỗi tìm kiếm:", error);
      alert("Không tìm thấy dữ liệu hoặc có lỗi xảy ra từ Server.");
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const handleRefresh = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSearchType('ALL');
    setFilterStatus('');
    setFilterType('');
    setFilterPriority('');
    fetchAllPrescriptions(0);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      fetchAllPrescriptions(newPage);
    }
  };

  // --- 3. VIEW PRESCRIPTION DETAIL ---
  const handleViewDetail = async (id) => {
    if (searchType === 'CATEGORY') return;

    setLoading(true);
    try {
      const response = await pharmacistAPI.pharmacistMedicalSupplyAPI.getPrescriptionById(id);
      if (response && response.status === 'OK') {
        setSelectedItem(response.data);
        setShowModal(true);
      }
    } catch (error) {
      console.error("Lỗi lấy chi tiết:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- 4. ACTIONS: APPROVE, REJECT, DISPENSE, CANCEL ---
  // Hàm refresh danh sách sau khi thực hiện action
  const refreshAfterAction = () => {
    if (searchType === 'ALL') {
      fetchAllPrescriptions(pagination.page);
    } else {
      handleSearch();
    }
  };

  // Quick Actions - thao tác nhanh từ bảng danh sách
  const handleQuickApprove = async (item) => {
    if (!window.confirm(`Bạn có chắc chắn muốn DUYỆT đơn ${item.prescriptionCode}?`)) return;
    setLoading(true);
    try {
      const response = await pharmacistAPI.pharmacistMedicalSupplyAPI.approvePrescription(item.prescriptionId);
      if (response && response.status === 'OK') {
        alert("✅ Đã duyệt đơn thành công!");
        refreshAfterAction();
      } else {
        alert(response?.message || "Duyệt đơn thất bại.");
      }
    } catch (error) {
      console.error("Lỗi khi duyệt:", error);
      alert("Có lỗi xảy ra khi duyệt đơn.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickReject = async (item) => {
    const reason = window.prompt(`Nhập lý do từ chối đơn ${item.prescriptionCode}:`);
    if (reason === null) return;
    if (reason.trim() === "") {
      alert("Lý do từ chối không được để trống!");
      return;
    }
    setLoading(true);
    try {
      const response = await pharmacistAPI.pharmacistMedicalSupplyAPI.rejectPrescription(item.prescriptionId, reason);
      if (response && response.status === 'OK') {
        alert("❌ Đã từ chối đơn thành công!");
        refreshAfterAction();
      } else {
        alert(response?.message || "Từ chối đơn thất bại.");
      }
    } catch (error) {
      console.error("Lỗi khi từ chối:", error);
      alert("Có lỗi xảy ra khi từ chối đơn.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDispense = async (item) => {
    const notes = window.prompt(`Nhập ghi chú cấp phát cho đơn ${item.prescriptionCode} (nếu có):`, "");
    if (notes === null) return;
    setLoading(true);
    try {
      const response = await pharmacistAPI.pharmacistMedicalSupplyAPI.dispensePrescription(item.prescriptionId, notes);
      if (response && response.status === 'OK') {
        alert("📦 Đã cấp phát vật tư thành công!");
        refreshAfterAction();
      } else {
        alert(response?.message || "Cấp phát thất bại.");
      }
    } catch (error) {
      console.error("Lỗi khi cấp phát:", error);
      alert("Có lỗi xảy ra khi cấp phát.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCancel = async (item) => {
    const reason = window.prompt(`Nhập lý do hủy đơn ${item.prescriptionCode}:`);
    if (reason === null) return;
    if (reason.trim() === "") {
      alert("Lý do hủy không được để trống!");
      return;
    }
    if (!window.confirm("⚠️ Hành động này không thể hoàn tác. Bạn chắc chắn muốn hủy đơn này?")) return;
    setLoading(true);
    try {
      const response = await pharmacistAPI.pharmacistMedicalSupplyAPI.cancelPrescription(item.prescriptionId, reason);
      if (response && response.status === 'OK') {
        alert("🚫 Đã hủy đơn thành công!");
        refreshAfterAction();
      } else {
        alert(response?.message || "Hủy đơn thất bại.");
      }
    } catch (error) {
      console.error("Lỗi khi hủy:", error);
      alert("Có lỗi xảy ra khi hủy đơn.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedItem?.prescriptionId) return;
    if (!window.confirm(`Bạn có chắc chắn muốn DUYỆT đơn ${selectedItem.prescriptionCode}?`)) return;

    setLoading(true);
    try {
      const response = await pharmacistAPI.pharmacistMedicalSupplyAPI.approvePrescription(selectedItem.prescriptionId);
      if (response && response.status === 'OK') {
        alert("✅ Đã duyệt đơn thành công!");
        setShowModal(false);
        refreshAfterAction();
      } else {
        alert(response?.message || "Duyệt đơn thất bại.");
      }
    } catch (error) {
      console.error("Lỗi khi duyệt:", error);
      alert("Có lỗi xảy ra khi duyệt đơn.");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedItem?.prescriptionId) return;
    const reason = window.prompt("Vui lòng nhập lý do từ chối:");
    if (reason === null) return;
    if (reason.trim() === "") {
      alert("Lý do từ chối không được để trống!");
      return;
    }

    setLoading(true);
    try {
      const response = await pharmacistAPI.pharmacistMedicalSupplyAPI.rejectPrescription(selectedItem.prescriptionId, reason);
      if (response && response.status === 'OK') {
        alert("❌ Đã từ chối đơn thành công!");
        setShowModal(false);
        refreshAfterAction();
      } else {
        alert(response?.message || "Từ chối đơn thất bại.");
      }
    } catch (error) {
      console.error("Lỗi khi từ chối:", error);
      alert("Có lỗi xảy ra khi từ chối đơn.");
    } finally {
      setLoading(false);
    }
  };

  const handleDispense = async () => {
    if (!selectedItem?.prescriptionId) return;
    const notes = window.prompt("Nhập ghi chú cấp phát (nếu có):", "");
    if (notes === null) return;

    setLoading(true);
    try {
      const response = await pharmacistAPI.pharmacistMedicalSupplyAPI.dispensePrescription(selectedItem.prescriptionId, notes);
      if (response && response.status === 'OK') {
        alert("📦 Đã cấp phát vật tư thành công!");
        setShowModal(false);
        refreshAfterAction();
      } else {
        alert(response?.message || "Cấp phát thất bại.");
      }
    } catch (error) {
      console.error("Lỗi khi cấp phát:", error);
      alert("Có lỗi xảy ra khi cấp phát.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedItem?.prescriptionId) return;
    const reason = window.prompt("Vui lòng nhập lý do hủy đơn:");
    if (reason === null) return;
    if (reason.trim() === "") {
      alert("Lý do hủy không được để trống!");
      return;
    }
    if (!window.confirm("⚠️ Hành động này không thể hoàn tác. Bạn chắc chắn muốn hủy đơn này?")) return;

    setLoading(true);
    try {
      const response = await pharmacistAPI.pharmacistMedicalSupplyAPI.cancelPrescription(selectedItem.prescriptionId, reason);
      if (response && response.status === 'OK') {
        alert("🚫 Đã hủy đơn thành công!");
        setShowModal(false);
        refreshAfterAction();
      } else {
        alert(response?.message || "Hủy đơn thất bại.");
      }
    } catch (error) {
      console.error("Lỗi khi hủy:", error);
      alert("Có lỗi xảy ra khi hủy đơn.");
    } finally {
      setLoading(false);
    }
  };

  // --- 5. VIEW STOCK STATUS ---
  const handleViewStock = async (item) => {
    setLoading(true);
    try {
      const response = await pharmacistAPI.pharmacistMedicalSupplyAPI.getSupplyStockStatus(item.supply_id);
      if (response && response.status === 'OK') {
        // Merge thông tin từ API và thông tin từ row item (để hiển thị tên)
        setStockData({
          ...response.data,
          supplyName: item.supply_name,
          supplyCode: item.supply_code,
          unit: item.unit
        });
        setShowStockModal(true);
      } else {
        alert("Không lấy được thông tin tồn kho.");
      }
    } catch (error) {
      console.error("Lỗi lấy tồn kho:", error);
      alert("Không lấy được thông tin tồn kho.");
    } finally {
      setLoading(false);
    }
  };

  // --- 6. OPEN STATS MODAL ---
  const handleOpenStats = () => {
    setShowStatsModal(true);
    if (activeTab === 'HISTORY') fetchHistory();
    if (activeTab === 'STATS') fetchStatistics();
    if (activeTab === 'FREQUENT') fetchFrequent();
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await pharmacistAPI.pharmacistMedicalSupplyAPI.getPrescriptionHistory({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      if (response && response.status === 'OK') {
        setHistoryData(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const fetchFrequent = async () => {
    setLoading(true);
    try {
      const response = await pharmacistAPI.pharmacistMedicalSupplyAPI.getFrequentlyUsedSupplies(10);
      if (response && response.status === 'OK') {
        setFrequentData(response.data);
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const response = await pharmacistAPI.pharmacistMedicalSupplyAPI.getSupplyStatistics({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      if (response && response.status === 'OK') {
        setStatsData(response.data); 
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  useEffect(() => {
    if (showStatsModal) {
      if (activeTab === 'HISTORY') fetchHistory();
      if (activeTab === 'FREQUENT') fetchFrequent();
      if (activeTab === 'STATS') fetchStatistics();
    }
  }, [activeTab, showStatsModal, dateRange]);

  // --- 7. DATA MANAGEMENT & TRASH (Soft Delete) ---
  const handleOpenDataModal = () => {
    setShowDataModal(true);
    fetchSoftDeleteStats(); 
  };

  const fetchSoftDeleteStats = async () => {
    setLoading(true);
    try {
      const response = await pharmacistAPI.pharmacistMedicalSupplyAPI.getSoftDeleteStatistics();
      if (response && response.status === 'OK') {
        setSoftDeleteStats(response.data);
      }
    } catch (error) { console.error("Lỗi lấy thống kê xóa:", error); } finally { setLoading(false); }
  };

  const fetchDataList = async () => {
    setLoading(true);
    setDataList([]);
    try {
      let response;
      if (dataTab === 'MATERIALS') {
        response = dataFilter === 'ACTIVE' 
          ? await pharmacistAPI.pharmacistMedicalSupplyAPI.getActiveMaterials()
          : await pharmacistAPI.pharmacistMedicalSupplyAPI.getDeletedMaterials();
      } else if (dataTab === 'MEDICINES') {
        response = dataFilter === 'ACTIVE'
          ? await pharmacistAPI.pharmacistMedicalSupplyAPI.getActiveMedicines()
          : await pharmacistAPI.pharmacistMedicalSupplyAPI.getDeletedMedicines();
      }

      if (response && response.status === 'OK') {
        setDataList(Array.isArray(response.data) ? response.data : (response.data?.content || []));
      }
    } catch (error) { console.error("Lỗi lấy danh sách dữ liệu:", error); } finally { setLoading(false); }
  };

  // --- RESTORE FUNCTION ---
  const handleRestore = async (item) => {
    const id = item.id || item.medicineId || item.materialId;
    const name = item.name || item.medicineName || item.materialName;
    
    if (!window.confirm(`Bạn có chắc chắn muốn khôi phục "${name}" không?`)) return;

    setLoading(true);
    try {
      let response;
      if (dataTab === 'MATERIALS') {
        response = await pharmacistAPI.pharmacistMedicalSupplyAPI.restoreMaterial(id);
      } else if (dataTab === 'MEDICINES') {
        response = await pharmacistAPI.pharmacistMedicalSupplyAPI.restoreMedicine(id);
      }

      if (response && response.status === 'OK') {
        alert("Khôi phục thành công!");
        fetchDataList(); // Refresh list
        const statsRes = await pharmacistAPI.pharmacistMedicalSupplyAPI.getSoftDeleteStatistics(); // Refresh stats
        if (statsRes?.status === 'OK') setSoftDeleteStats(statsRes.data);
      } else {
        alert(response?.message || "Khôi phục thất bại.");
      }
    } catch (error) {
      console.error("Lỗi khi khôi phục:", error);
      alert("Có lỗi xảy ra khi khôi phục.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showDataModal) {
      if (dataTab === 'STATS') fetchSoftDeleteStats();
      else fetchDataList();
    }
  }, [dataTab, dataFilter, showDataModal]);

  // --- HELPERS ---
  const getStatusBadge = (status, color) => {
    let style = {};
    if (status === 'IN_STOCK') style = { backgroundColor: '#f6ffed', color: '#52c41a', border: '1px solid #b7eb8f' };
    else if (status === 'LOW_STOCK') style = { backgroundColor: '#fff7e6', color: '#fa8c16', border: '1px solid #ffd591' };
    else if (status === 'OUT_OF_STOCK') style = { backgroundColor: '#fff1f0', color: '#ff4d4f', border: '1px solid #ffa39e' };
    else style = {
      backgroundColor: color === 'orange' ? '#fff7e6' : color === 'green' ? '#f6ffed' : color === 'blue' ? '#e6f7ff' : '#f5f5f5',
      color: color === 'orange' ? '#fa8c16' : color === 'green' ? '#52c41a' : color === 'blue' ? '#1890ff' : '#595959',
      border: `1px solid ${color === 'orange' ? '#ffd591' : color === 'green' ? '#b7eb8f' : color === 'blue' ? '#91d5ff' : '#d9d9d9'}`
    };
    return <span className="status-badge" style={style}>{status}</span>;
  };

  return (
    <div className="medical-supply-page-container"> 
      <div className="page-header">
        <h1 className="page-title">Quản lý Cấp phát Vật tư Y tế</h1>
      </div>

      <div className="medical-supply-page">

        {/* --- TOOLBAR --- */}
        <div className="search-toolbar">
          <div className="search-group">
            <select value={searchType} onChange={(e) => { setSearchType(e.target.value); if (e.target.value === 'ALL') fetchAllPrescriptions(0); }} className="search-select">
              <option value="ALL">Tất cả đơn</option>
              <option value="PATIENT">Theo ID Bệnh nhân</option>
              <option value="ENCOUNTER">Theo Mã Lượt khám</option>
              <option value="CATEGORY">Theo Danh mục Vật tư</option>
              <option value="CODE">Theo Mã Đơn</option>
            </select>

            {searchType === 'CATEGORY' ? (
              <select className="search-select input-field" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                <option value="">-- Chọn danh mục --</option>
                {categories.map((cat) => (
                  <option key={cat.category_id} value={cat.category_name}>
                    {cat.category_name} ({cat.supply_count})
                  </option>
                ))}
              </select>
            ) : searchType !== 'ALL' ? (
              <input type="text" placeholder={searchType === 'PATIENT' ? "Nhập ID..." : searchType === 'ENCOUNTER' ? "Nhập mã lượt khám..." : "Nhập mã đơn..."} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
            ) : null}

            {searchType !== 'ALL' && (
              <button className="btn-search" onClick={handleSearch} disabled={loading}><FaSearch /> Tìm kiếm</button>
            )}
            <button className="btn-secondary" onClick={handleRefresh} disabled={loading} title="Làm mới"><FaRedo /> Làm mới</button>
          </div>

          <div className="action-group">
             <button className="btn-secondary" onClick={handleOpenStats}><FaChartBar/> Thống kê & Lịch sử</button>
             <button className="btn-secondary" onClick={handleOpenDataModal}><FaDatabase/> Dữ liệu & Thùng rác</button>
             <button className="btn-secondary"><FaBoxOpen/> Kho Vật tư</button>
          </div>
        </div>

        {/* --- FILTER BAR (cho chế độ ALL) --- */}
        {searchType === 'ALL' && (
          <div className="filter-bar" style={{ marginBottom: '15px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <label>Trạng thái:</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="search-select" style={{ minWidth: '140px' }}>
              <option value="">Tất cả</option>
              <option value="ORDERED">Đã đặt</option>
              <option value="APPROVED">Đã duyệt</option>
              <option value="DISPENSED">Đã cấp</option>
              <option value="PARTIALLY_DISPENSED">Cấp một phần</option>
              <option value="REJECTED">Từ chối</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
            <label>Loại đơn:</label>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="search-select" style={{ minWidth: '140px' }}>
              <option value="">Tất cả</option>
              <option value="SURGERY">Phẫu thuật</option>
              <option value="PROCEDURE">Thủ thuật</option>
              <option value="TREATMENT">Điều trị</option>
              <option value="EMERGENCY">Cấp cứu</option>
            </select>
            <label>Ưu tiên:</label>
            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="search-select" style={{ minWidth: '120px' }}>
              <option value="">Tất cả</option>
              <option value="NORMAL">Bình thường</option>
              <option value="URGENT">Khẩn</option>
              <option value="STAT">Cấp cứu</option>
            </select>
            <button className="btn-search" onClick={() => fetchAllPrescriptions(0)} disabled={loading}><FaSearch /> Lọc</button>
          </div>
        )}

        {/* --- DATA TABLE --- */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              {searchType === 'CATEGORY' ? (
                <tr><th>Mã VT</th><th>Tên Vật tư</th><th>Danh mục</th><th>Đơn vị</th><th>Tồn kho</th><th className="text-center">Chi tiết Tồn</th></tr>
              ) : (
                <tr><th>Mã Đơn</th><th>Bệnh nhân</th><th>Loại đơn</th><th>Ưu tiên</th><th>Ngày tạo</th><th>Trạng thái</th><th>Ghi chú</th><th className="text-center">Thao tác</th></tr>
              )}
            </thead>
            <tbody>
              {tableData.length > 0 ? tableData.map((item, index) => {
                  if (searchType === 'CATEGORY') {
                    return (
                      <tr key={item.supply_id || index}>
                        <td><strong>{item.supply_code}</strong></td>
                        <td>{item.supply_name}</td>
                        <td>{item.category}</td>
                        <td>{item.unit}</td>
                        <td style={{ fontWeight: 'bold', color: item.available_quantity > 0 ? '#262626' : 'red' }}>
                          {item.available_quantity}
                        </td>
                        <td className="text-center">
                          <button className="btn-icon" title="Xem tồn kho chi tiết" onClick={() => handleViewStock(item)}>
                            <FaInfoCircle />
                          </button>
                        </td>
                      </tr>
                    );
                  } else {
                    // Hiển thị cả chế độ ALL và các chế độ tìm kiếm khác
                    const getPriorityBadge = (priority) => {
                      const priorityStyles = {
                        STAT: { backgroundColor: '#fff1f0', color: '#ff4d4f', border: '1px solid #ffa39e' },
                        URGENT: { backgroundColor: '#fff7e6', color: '#fa8c16', border: '1px solid #ffd591' },
                        NORMAL: { backgroundColor: '#f6ffed', color: '#52c41a', border: '1px solid #b7eb8f' }
                      };
                      const priorityLabels = { STAT: 'Cấp cứu', URGENT: 'Khẩn', NORMAL: 'Bình thường' };
                      return <span className="status-badge" style={priorityStyles[priority] || priorityStyles.NORMAL}>{priorityLabels[priority] || priority}</span>;
                    };

                    const getTypeLabel = (type) => {
                      const typeLabels = {
                        SURGERY: 'Phẫu thuật',
                        PROCEDURE: 'Thủ thuật',
                        TREATMENT: 'Điều trị',
                        EMERGENCY: 'Cấp cứu'
                      };
                      return typeLabels[type] || type;
                    };

                    return (
                      <tr key={item.prescriptionId || index}>
                        <td><strong>{item.prescriptionCode}</strong></td>
                        <td>
                          {item.patientName || `BN #${item.patientId}`}
                          <br/><small style={{ color: '#888' }}>ID: {item.patientId} | LK: {item.encounterId}</small>
                        </td>
                        <td>{getTypeLabel(item.prescriptionType)}</td>
                        <td>{getPriorityBadge(item.priority)}</td>
                        <td>{item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : '-'}</td>
                        <td>{getStatusBadge(item.status, item.statusColor)}</td>
                        <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.notes || item.indication}>
                          {item.notes || item.indication || '-'}
                        </td>
                        <td className="text-center" style={{ whiteSpace: 'nowrap' }}>
                          <button className="btn-icon" onClick={() => handleViewDetail(item.prescriptionId)} title="Xem chi tiết"><FaEye /></button>
                          {/* Quick Actions dựa trên status */}
                          {item.status === 'ORDERED' && (
                            <>
                              <button className="btn-icon" style={{ color: '#52c41a' }} onClick={() => handleQuickApprove(item)} title="Duyệt đơn"><FaCheck /></button>
                              <button className="btn-icon" style={{ color: '#ff4d4f' }} onClick={() => handleQuickReject(item)} title="Từ chối"><FaTimes /></button>
                            </>
                          )}
                          {(item.status === 'APPROVED' || item.status === 'PARTIALLY_DISPENSED') && (
                            <button className="btn-icon" style={{ color: '#1890ff' }} onClick={() => handleQuickDispense(item)} title="Cấp phát"><FaBoxOpen /></button>
                          )}
                          {!['DISPENSED', 'CANCELLED', 'REJECTED'].includes(item.status) && (
                            <button className="btn-icon" style={{ color: '#888' }} onClick={() => handleQuickCancel(item)} title="Hủy đơn"><FaBan /></button>
                          )}
                        </td>
                      </tr>
                    );
                  }
              }) : (
                <tr><td colSpan={searchType === 'CATEGORY' ? 6 : 8} className="text-center">{loading ? "Đang tải..." : "Không có dữ liệu"}</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- PAGINATION (cho chế độ ALL) --- */}
        {searchType === 'ALL' && pagination.totalPages > 1 && (
          <div className="pagination-bar" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '15px', marginBottom: '15px' }}>
            <button
              className="btn-secondary"
              onClick={() => handlePageChange(0)}
              disabled={pagination.page === 0 || loading}
            >
              {'<<'}
            </button>
            <button
              className="btn-secondary"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 0 || loading}
            >
              {'<'}
            </button>
            <span style={{ padding: '0 15px' }}>
              Trang {pagination.page + 1} / {pagination.totalPages} (Tổng: {pagination.totalElements} đơn)
            </span>
            <button
              className="btn-secondary"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages - 1 || loading}
            >
              {'>'}
            </button>
            <button
              className="btn-secondary"
              onClick={() => handlePageChange(pagination.totalPages - 1)}
              disabled={pagination.page >= pagination.totalPages - 1 || loading}
            >
              {'>>'}
            </button>
          </div>
        )}

        {/* --- MODAL 1: PRESCRIPTION DETAIL --- */}
        {showModal && selectedItem && searchType !== 'CATEGORY' && (
          <div className="modal-overlay">
            <div className="modal-content large-modal">
              <div className="modal-header">
                <h2>Chi tiết Đơn Vật tư: {selectedItem.prescriptionCode}</h2>
                <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="info-grid">
                  <div className="info-item"><label>Bệnh nhân:</label><span>{selectedItem.patientName} (ID: {selectedItem.patientId})</span></div>
                  <div className="info-item"><label>Loại đơn:</label><span>{selectedItem.prescriptionType}</span></div>
                  <div className="info-item"><label>Trạng thái:</label><span>{getStatusBadge(selectedItem.status, selectedItem.statusColor)}</span></div>
                  <div className="info-item"><label>Ngày tạo:</label><span>{selectedItem.createdAt ? new Date(selectedItem.createdAt).toLocaleString('vi-VN') : '-'}</span></div>
                  <div className="info-item full-width"><label>Tiến độ:</label><span>{selectedItem.dispensingSummary}</span></div>
                </div>
                <h3 className="section-title">Danh sách Vật tư</h3>
                <div className="supplies-list">
                  <table className="sub-table">
                    <thead><tr><th>Tên Vật tư</th><th>Đơn vị</th><th>SL Kê</th><th>SL Đã cấp</th><th>Trạng thái</th></tr></thead>
                    <tbody>
                      {selectedItem.supplies && selectedItem.supplies.length > 0 ? (
                        selectedItem.supplies.map((supply, idx) => (
                          <tr key={idx}>
                            <td>{supply.supplyName}</td><td>{supply.unit}</td><td>{supply.quantityRequested}</td><td>{supply.quantityDispensed}</td><td>{supply.status}</td>
                          </tr>
                        ))
                      ) : <tr><td colSpan="5" className="text-center">Không có thông tin</td></tr>}
                    </tbody>
                  </table>
                </div>
                <div className="modal-actions-bar">
                  {/* ORDERED status: có thể duyệt hoặc từ chối */}
                  {(selectedItem.status === 'ORDERED' || selectedItem.pending) && (
                    <>
                      <button className="btn-action approve" onClick={handleApprove} disabled={loading}>
                        <FaCheck /> Duyệt Đơn
                      </button>
                      <button className="btn-action reject" onClick={handleReject} disabled={loading}>
                        <FaTimes /> Từ chối
                      </button>
                    </>
                  )}
                  {/* APPROVED status: có thể cấp phát */}
                  {(selectedItem.status === 'APPROVED' || (selectedItem.approved && !selectedItem.dispensed)) && (
                    <button className="btn-action dispense" onClick={handleDispense} disabled={loading}>
                      <FaBoxOpen /> Cấp phát
                    </button>
                  )}
                  {/* PARTIALLY_DISPENSED status: có thể tiếp tục cấp phát */}
                  {selectedItem.status === 'PARTIALLY_DISPENSED' && (
                    <button className="btn-action dispense" onClick={handleDispense} disabled={loading}>
                      <FaBoxOpen /> Cấp phát tiếp
                    </button>
                  )}
                  {/* Có thể hủy đơn nếu chưa hoàn thành cấp phát và chưa bị hủy */}
                  {!['DISPENSED', 'CANCELLED', 'REJECTED'].includes(selectedItem.status) &&
                   !selectedItem.cancelled && !selectedItem.dispensed && (
                    <button className="btn-action cancel" onClick={handleCancel} disabled={loading}>
                      <FaBan /> Hủy Đơn
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- MODAL 2: STOCK DETAILS --- */}
        {showStockModal && stockData && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Tồn kho: {stockData.supplyName}</h2>
                <button className="close-btn" onClick={() => setShowStockModal(false)}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="info-grid">
                  <div className="info-item"><label>Mã VT:</label><span>{stockData.supplyCode}</span></div>
                  <div className="info-item"><label>Trạng thái:</label>{getStatusBadge(stockData.stock_status, '')}</div>
                  
                  <div className="info-item"><label>Tổng tồn:</label><span>{(stockData.available_quantity || 0) + (stockData.reserved_quantity || 0)} {stockData.unit}</span></div>
                  <div className="info-item"><label>Khả dụng:</label><span style={{color:'green', fontWeight:'bold'}}>{stockData.available_quantity} {stockData.unit}</span></div>
                  
                  <div className="info-item"><label>Đang giữ chỗ:</label><span>{stockData.reserved_quantity} {stockData.unit}</span></div>
                  <div className="info-item"><label>Mức đặt hàng lại:</label><span style={{color:'#fa8c16'}}>{stockData.reorder_level} {stockData.unit}</span></div>
                  
                  <div className="info-item full-width"><label>Cập nhật lần cuối:</label><span>{stockData.last_updated ? new Date(stockData.last_updated).toLocaleString('vi-VN') : 'N/A'}</span></div>
                </div>
                
                <div className="alert-box" style={{marginTop:'20px', padding:'10px', backgroundColor:'#e6f7ff', borderRadius:'4px', fontSize:'13px', color:'#1890ff'}}>
                  <FaInfoCircle style={{marginRight:'5px', verticalAlign:'middle'}}/> 
                  Thông tin tồn kho được cập nhật theo thời gian thực.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- MODAL 3: STATISTICS & HISTORY --- */}
        {showStatsModal && (
          <div className="modal-overlay">
            <div className="modal-content large-modal">
              <div className="modal-header">
                <h2>Báo cáo & Thống kê Vật tư</h2>
                <button className="close-btn" onClick={() => setShowStatsModal(false)}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="filter-bar">
                  <label>Từ ngày:</label>
                  <input type="date" value={dateRange.startDate} onChange={e=>setDateRange({...dateRange, startDate: e.target.value})} />
                  <label>Đến ngày:</label>
                  <input type="date" value={dateRange.endDate} onChange={e=>setDateRange({...dateRange, endDate: e.target.value})} />
                </div>

                <div className="tabs">
                  <button className={`tab-btn ${activeTab==='HISTORY'?'active':''}`} onClick={()=>setActiveTab('HISTORY')}>Lịch sử Đơn</button>
                  <button className={`tab-btn ${activeTab==='STATS'?'active':''}`} onClick={()=>setActiveTab('STATS')}>Thống kê Tổng hợp</button>
                  <button className={`tab-btn ${activeTab==='FREQUENT'?'active':''}`} onClick={()=>setActiveTab('FREQUENT')}>Top Dùng Nhiều</button>
                </div>

                <div className="tab-content">
                  {activeTab === 'HISTORY' && (
                    <table className="data-table">
                      <thead><tr><th>Mã Đơn</th><th>Bệnh nhân</th><th>Loại</th><th>Ngày</th><th>Trạng thái</th></tr></thead>
                      <tbody>
                        {historyData.length > 0 ? historyData.map(h => (
                          <tr key={h.prescriptionId}>
                            <td>{h.prescriptionCode}</td><td>{h.patientName}</td><td>{h.prescriptionType}</td><td>{h.createdAt ? new Date(h.createdAt).toLocaleDateString('vi-VN') : '-'}</td><td>{h.status}</td>
                          </tr>
                        )) : <tr><td colSpan="5" className="text-center">Chưa có dữ liệu lịch sử</td></tr>}
                      </tbody>
                    </table>
                  )}

                  {activeTab === 'FREQUENT' && (
                    <table className="data-table">
                      <thead><tr><th>Tên Vật tư</th><th>Mã VT</th><th>Danh mục</th><th>Đơn vị</th><th>Số lần dùng</th></tr></thead>
                      <tbody>
                        {frequentData.length > 0 ? frequentData.map((f, i) => (
                          <tr key={i}>
                            <td>{f.supply_name}</td>
                            <td>{f.supply_code}</td>
                            <td>{f.category}</td>
                            <td>{f.unit}</td>
                            <td><strong>{f.usage_count}</strong></td>
                          </tr>
                        )) : <tr><td colSpan="5" className="text-center">Chưa có dữ liệu</td></tr>}
                      </tbody>
                    </table>
                  )}

                  {activeTab === 'STATS' && statsData && (
                    <div className="stats-dashboard">
                      <div className="info-grid">
                        <div className="info-item">
                          <label>Tổng đơn:</label>
                          <span style={{fontSize:'18px', color:'#1890ff'}}>{statsData.total_prescriptions || 0}</span>
                        </div>
                        <div className="info-item">
                          <label>Tổng VT cấp:</label>
                          <span style={{fontSize:'18px', color:'#52c41a'}}>{statsData.total_supplies_dispensed || 0}</span>
                        </div>
                        <div className="info-item">
                          <label>Vật tư dùng nhiều nhất:</label>
                          <span>{statsData.most_used_supply || 'N/A'}</span>
                        </div>
                        <div className="info-item">
                          <label>Trung bình VT/Đơn:</label>
                          <span>{statsData.average_supplies_per_prescription || 0}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- MODAL 4: DATA & TRASH (VERTICAL LAYOUT FIXED) --- */}
        {showDataModal && (
          <div className="modal-overlay">
            <div className="modal-content large-modal">
              <div className="modal-header">
                <h2>Quản lý Dữ liệu & Thùng rác</h2>
                <button className="close-btn" onClick={() => setShowDataModal(false)}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="tabs">
                  <button className={`tab-btn ${dataTab==='STATS'?'active':''}`} onClick={()=>setDataTab('STATS')}>Thống kê Xóa</button>
                  <button className={`tab-btn ${dataTab==='MATERIALS'?'active':''}`} onClick={()=>setDataTab('MATERIALS')}>Quản lý Vật tư</button>
                  <button className={`tab-btn ${dataTab==='MEDICINES'?'active':''}`} onClick={()=>setDataTab('MEDICINES')}>Quản lý Thuốc</button>
                </div>
                <div className="tab-content">
                  {dataTab === 'STATS' && softDeleteStats && (
                    <div className="stats-dashboard">
                      {/* SỬA GRID THÀNH 1 CỘT ĐỂ HIỂN THỊ DỌC */}
                      <div className="info-grid" style={{gridTemplateColumns:'1fr', gap: '20px'}}>
                        
                        <div className="stat-card">
                          <h4>Vật tư (Materials)</h4>
                          <div className="stat-row"><span>Tổng số:</span> <strong>{softDeleteStats.materials?.total_count?.toLocaleString()}</strong></div>
                          <div className="stat-row"><span>Hoạt động:</span> <strong style={{color:'#52c41a'}}>{softDeleteStats.materials?.active_count?.toLocaleString()}</strong></div>
                          <div className="stat-row"><span>Đã xóa:</span> <strong style={{color:'#ff4d4f'}}>{softDeleteStats.materials?.deleted_count?.toLocaleString()}</strong></div>
                          <div className="stat-row"><span>Tỷ lệ xóa:</span> <span>{softDeleteStats.materials?.deletion_rate}%</span></div>
                        </div>

                        <div className="stat-card">
                          <h4>Thuốc (Medicines)</h4>
                          <div className="stat-row"><span>Tổng số:</span> <strong>{softDeleteStats.medicines?.total_count?.toLocaleString()}</strong></div>
                          <div className="stat-row"><span>Hoạt động:</span> <strong style={{color:'#52c41a'}}>{softDeleteStats.medicines?.active_count?.toLocaleString()}</strong></div>
                          <div className="stat-row"><span>Đã xóa:</span> <strong style={{color:'#ff4d4f'}}>{softDeleteStats.medicines?.deleted_count?.toLocaleString()}</strong></div>
                          <div className="stat-row"><span>Tỷ lệ xóa:</span> <span>{softDeleteStats.medicines?.deletion_rate}%</span></div>
                        </div>

                        <div className="stat-card">
                          <h4>Tổng quan (Overall)</h4>
                          <div className="stat-row"><span>Tổng số:</span> <strong>{softDeleteStats.overall?.total_count?.toLocaleString()}</strong></div>
                          <div className="stat-row"><span>Hoạt động:</span> <strong style={{color:'#52c41a'}}>{softDeleteStats.overall?.active_count?.toLocaleString()}</strong></div>
                          <div className="stat-row"><span>Đã xóa:</span> <strong style={{color:'#ff4d4f'}}>{softDeleteStats.overall?.deleted_count?.toLocaleString()}</strong></div>
                          <div className="stat-row"><span>Tỷ lệ xóa:</span> <span>{softDeleteStats.overall?.deletion_rate}%</span></div>
                        </div>

                      </div>
                    </div>
                  )}

                  {(dataTab === 'MATERIALS' || dataTab === 'MEDICINES') && (
                    <div>
                      <div className="filter-bar" style={{justifyContent:'flex-start'}}>
                        <button className={`filter-chip ${dataFilter==='ACTIVE'?'active':''}`} onClick={()=>setDataFilter('ACTIVE')}><FaCheck/> Đang hoạt động</button>
                        <button className={`filter-chip ${dataFilter==='DELETED'?'active delete':''}`} onClick={()=>setDataFilter('DELETED')}><FaTrashAlt/> Thùng rác (Đã xóa)</button>
                      </div>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Mã</th>
                            <th>Tên {dataTab === 'MATERIALS' ? 'Vật tư' : 'Thuốc'}</th>
                            <th>{dataFilter === 'ACTIVE' ? 'Trạng thái' : 'Ngày xóa'}</th>
                            {dataFilter === 'DELETED' && <th className="text-center">Thao tác</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {dataList.length > 0 ? dataList.map((item, idx) => (
                            <tr key={item.id || idx}>
                              <td>{item.id || item.medicineId || item.materialId}</td>
                              <td>{item.code || item.medicineCode || item.materialCode || 'N/A'}</td>
                              <td>{item.name || item.medicineName || item.materialName}</td>
                              <td>
                                {dataFilter === 'ACTIVE' ? (
                                  <span className="status-badge" style={{backgroundColor:'#f6ffed', color:'#52c41a'}}>Active</span>
                                ) : (
                                  <span style={{color:'#ff4d4f'}}>{item.deletedAt ? new Date(item.deletedAt).toLocaleDateString() : 'Đã xóa'}</span>
                                )}
                              </td>
                              {dataFilter === 'DELETED' && (
                                <td className="text-center">
                                  <button className="btn-icon" title="Khôi phục" onClick={() => handleRestore(item)}>
                                    <FaUndo />
                                  </button>
                                </td>
                              )}
                            </tr>
                          )) : <tr><td colSpan={dataFilter === 'DELETED' ? "5" : "4"} className="text-center">Không có dữ liệu</td></tr>}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MedicalSupplyPage;