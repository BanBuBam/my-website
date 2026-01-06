import React, { useState, useEffect } from 'react';
import pharmacistAPI from '../../../../services/staff/pharmacistAPI';
import './DrugInteractionPage.css';
import { 
  FaSearch, FaTrash, FaExclamationTriangle, FaCheckCircle, 
  FaInfoCircle, FaEye, FaFilter, FaTimes, FaExchangeAlt, 
  FaShieldAlt, FaPlus, FaEdit, FaSave, FaStethoscope, FaList, FaUser, 
  FaBolt, FaBan, FaRadiation, FaChartLine, FaClock, FaDatabase, 
  FaFileImport, FaUndo, FaChevronLeft, FaChevronRight
} from 'react-icons/fa';

const DrugInteractionPage = () => {
  // Tab State: 'CHECK', 'MANAGE', 'STATS'
  const [activeTab, setActiveTab] = useState('CHECK');
  const [loading, setLoading] = useState(false);

  // ==================== STATE FOR TAB 1: CHECKER ====================
  // Patient search
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [patientSearchResults, setPatientSearchResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchingPatient, setSearchingPatient] = useState(false);

  // Medicine search
  const [checkSearchTerm, setCheckSearchTerm] = useState('');
  const [checkAllMedicines, setCheckAllMedicines] = useState([]); 
  const [checkFilteredMedicines, setCheckFilteredMedicines] = useState([]); 
  const [checkLoadingMedicines, setCheckLoadingMedicines] = useState(false);
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [checkResult, setCheckResult] = useState(null);
  const [quickResult, setQuickResult] = useState(null);

  // ==================== STATE FOR TAB 2: MANAGE ====================
  const [interactionList, setInteractionList] = useState([]);
  const [manageSearchTerm, setManageSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [selectedInteractionDetail, setSelectedInteractionDetail] = useState(null);
  
  // Form Create/Edit
  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // --- UPDATED: FORM DATA STATE WITH CORRECT ENUMS ---
  const [formData, setFormData] = useState({
    interactionId: null,
    medicine1Id: '',
    medicine1Name: '',
    medicine2Id: '',
    medicine2Name: '',
    interactionType: 'PHARMACOKINETIC', // Enum chuẩn
    severityLevel: 'MODERATE',          // Enum chuẩn
    clinicalEffect: '',
    mechanism: '',
    managementRecommendation: '',
    alternativeTherapy: '',
    onsetTime: 'RAPID',                 // Enum chuẩn (RAPID, DELAYED, VARIABLE)
    documentationLevel: 'PROBABLE',     // Enum chuẩn (ESTABLISHED, PROBABLE...)
    isActive: true
  });

  // Search medicine in form
  const [medSearchTerm, setMedSearchTerm] = useState('');
  const [allMedicines, setAllMedicines] = useState([]); 
  const [filteredMedicines, setFilteredMedicines] = useState([]); 
  const [loadingMedicines, setLoadingMedicines] = useState(false);
  const [searchingFor, setSearchingFor] = useState(null);

  // ==================== STATE FOR TAB 3: STATISTICS ====================
  const [statsGeneral, setStatsGeneral] = useState(null);
  const [severityCounts, setSeverityCounts] = useState(null);
  const [recentInteractions, setRecentInteractions] = useState([]);

  // ==================== STATE FOR DATA & TRASH & IMPORT ====================
  const [showDataModal, setShowDataModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [dataTab, setDataTab] = useState('STATS'); 
  const [dataFilter, setDataFilter] = useState('ACTIVE'); 
  const [softDeleteStats, setSoftDeleteStats] = useState(null);
  const [paginatedList, setPaginatedList] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [importJson, setImportJson] = useState('');

  // ==================================================================
  // TAB 1 LOGIC: CHECK INTERACTIONS
  // ==================================================================

  // Patient search functions
  const handleSearchPatient = async () => {
    if (!patientSearchTerm.trim()) return;
    setSearchingPatient(true);
    try {
      const res = await pharmacistAPI.pharmacistPatientAPI.searchPatientsByName(patientSearchTerm, 0, 10);
      if (res?.status === 'OK' && res.data?.content) {
        setPatientSearchResults(res.data.content);
      } else if (res?.data && Array.isArray(res.data)) {
        setPatientSearchResults(res.data);
      } else {
        setPatientSearchResults([]);
      }
    } catch (e) {
      console.error('Error searching patients:', e);
      setPatientSearchResults([]);
    } finally {
      setSearchingPatient(false);
    }
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setPatientSearchResults([]);
    setPatientSearchTerm('');
  };

  const handleClearPatient = () => {
    setSelectedPatient(null);
    setPatientSearchTerm('');
    setPatientSearchResults([]);
  };

  useEffect(() => {
    loadCheckMedicines();
  }, []);

  const loadCheckMedicines = async () => {
    setCheckLoadingMedicines(true);
    try {
      const res = await pharmacistAPI.medicineAPI.getMedicines('', 0, 1000, ['medicineName,asc']);
      if (res?.status === 'OK' && res.data?.content) {
        setCheckAllMedicines(res.data.content);
        setCheckFilteredMedicines(res.data.content);
      } else if (res?.data && Array.isArray(res.data)) {
        setCheckAllMedicines(res.data);
        setCheckFilteredMedicines(res.data);
      }
    } catch (e) {
      console.error('Error loading medicines for CHECK tab:', e);
    } finally {
      setCheckLoadingMedicines(false);
    }
  };

  useEffect(() => {
    if (!checkSearchTerm.trim()) {
      setCheckFilteredMedicines(checkAllMedicines);
    } else {
      const searchLower = checkSearchTerm.toLowerCase();
      const filtered = checkAllMedicines.filter(m =>
        m.medicineName?.toLowerCase().includes(searchLower) ||
        m.sku?.toLowerCase().includes(searchLower) ||
        m.manufacturer?.toLowerCase().includes(searchLower)
      );
      setCheckFilteredMedicines(filtered);
    }
  }, [checkSearchTerm, checkAllMedicines]);

  const handleAddMedicine = (med) => {
    if (!selectedMedicines.find(m => m.medicineId === med.medicineId)) {
      setSelectedMedicines([...selectedMedicines, med]);
      setCheckResult(null);
      setQuickResult(null);
    }
  };
  const handleRemoveMedicine = (id) => { setSelectedMedicines(selectedMedicines.filter(m => m.medicineId !== id)); setCheckResult(null); setQuickResult(null); };
  const handleCheckInteraction = async () => {
    if (selectedMedicines.length < 2) { alert("Chọn ít nhất 2 thuốc."); return; }
    setLoading(true); setQuickResult(null);
    try {
      const ids = selectedMedicines.map(m => m.medicineId);
      const pId = selectedPatient ? selectedPatient.patientId : null;
      const res = await pharmacistAPI.pharmacistInteractionAPI.checkInteractions(ids, pId);
      if (res?.status === 'OK') setCheckResult(res.data); else alert("Kiểm tra thất bại.");
    } catch (e) { console.error(e); alert("Lỗi khi kiểm tra."); } finally { setLoading(false); }
  };

  // Quick Tools
  const handleQuickSafety = async () => { if (selectedMedicines.length < 2) return; setLoading(true); try { const ids = selectedMedicines.map(m=>m.medicineId); const res = await pharmacistAPI.pharmacistInteractionAPI.quickSafetyCheck(ids); if(res?.status==='success') setQuickResult({type:'SAFETY', isSafe:res.data, message:res.message}); } catch(e){console.error(e);} finally{setLoading(false);} };
  const handleGetContraindicated = async () => { if (selectedMedicines.length < 2) return; setLoading(true); try { const ids = selectedMedicines.map(m=>m.medicineId); const res = await pharmacistAPI.pharmacistInteractionAPI.getContraindicatedInteractions(ids); if(res?.status==='OK') setQuickResult({type:'LIST', title:'Chống chỉ định', list:res.data}); } catch(e){console.error(e);} finally{setLoading(false);} };
  const handleGetMajor = async () => { if (selectedMedicines.length < 2) return; setLoading(true); try { const ids = selectedMedicines.map(m=>m.medicineId); const res = await pharmacistAPI.pharmacistInteractionAPI.getMajorInteractions(ids); if(res?.status==='OK') setQuickResult({type:'LIST', title:'Nghiêm trọng', list:res.data}); } catch(e){console.error(e);} finally{setLoading(false);} };
  const handleCheckPair = async () => { if (selectedMedicines.length < 2) return; const m1=selectedMedicines[0], m2=selectedMedicines[1]; setLoading(true); try { const res = await pharmacistAPI.pharmacistInteractionAPI.checkInteractionBetween(m1.medicineId, m2.medicineId); if(res?.status==='OK') setQuickResult({type:'PAIR', pair:`${m1.medicineName} - ${m2.medicineName}`, data:res.data}); } catch(e){console.error(e);} finally{setLoading(false);} };

  const renderCheckResultList = (list, title, colorClass) => {
    if (!list || list.length === 0) return null;
    return (
      <div className={`check-result-group ${colorClass}`}>
        <h4>{title} ({list.length})</h4>
        {list.map((item, idx) => (
          <div key={idx} className="check-result-item">
            <div className="item-header"><strong>{item.medicine1Name} + {item.medicine2Name}</strong></div>
            <p><strong>Hậu quả:</strong> {item.description || item.clinicalEffect}</p>
            <p><strong>Xử trí:</strong> {item.management || item.managementRecommendation}</p>
          </div>
        ))}
      </div>
    );
  };

  // ==================================================================
  // TAB 2 LOGIC: MANAGE INTERACTIONS
  // ==================================================================
  const fetchInteractions = async () => {
    setLoading(true);
    try {
      let res;
      if (manageSearchTerm) res = await pharmacistAPI.pharmacistInteractionAPI.searchInteractions(manageSearchTerm);
      else if (filterSeverity !== 'ALL') res = await pharmacistAPI.pharmacistInteractionAPI.getInteractionsBySeverity(filterSeverity);
      else res = await pharmacistAPI.pharmacistInteractionAPI.getAllActiveInteractions();
      if (res?.status === 'OK') setInteractionList(Array.isArray(res.data) ? res.data : []);
      else setInteractionList([]);
    } catch (e) { console.error(e); setInteractionList([]); } finally { setLoading(false); }
  };

  useEffect(() => { if (activeTab === 'MANAGE') fetchInteractions(); }, [activeTab, filterSeverity]);

  const handleDeleteInteraction = async (id) => {
    if (!window.confirm("Xóa tương tác này?")) return;
    setLoading(true);
    try { const res = await pharmacistAPI.pharmacistInteractionAPI.deleteInteraction(id); if (res?.status === 'OK') { alert("Xóa thành công!"); fetchInteractions(); } } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleViewDetail = async (id) => {
    setLoading(true);
    try { const res = await pharmacistAPI.pharmacistInteractionAPI.getInteractionById(id); if (res?.status === 'OK') setSelectedInteractionDetail(res.data); } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormData({
      interactionId: null,
      medicine1Id: '',
      medicine1Name: '',
      medicine2Id: '',
      medicine2Name: '',
      interactionType: 'PHARMACOKINETIC',
      severityLevel: 'MODERATE',
      clinicalEffect: '',
      mechanism: '',
      managementRecommendation: '',
      alternativeTherapy: '',
      onsetTime: 'RAPID',
      documentationLevel: 'PROBABLE',
      isActive: true
    });
    setMedSearchTerm('');
    setShowFormModal(true);
    loadAllMedicines();
  };

  const handleOpenEdit = (item) => {
    setIsEditing(true);
    const med1Name = item.medicine1?.medicineName || item.medicine1Name || '';
    const med2Name = item.medicine2?.medicineName || item.medicine2Name || '';
    setFormData({
      interactionId: item.interactionId,
      medicine1Id: item.medicine1Id,
      medicine1Name: med1Name,
      medicine2Id: item.medicine2Id,
      medicine2Name: med2Name,
      interactionType: item.interactionType || 'PHARMACOKINETIC',
      severityLevel: item.severityLevel,
      clinicalEffect: item.clinicalEffect || '',
      mechanism: item.mechanism || '',
      managementRecommendation: item.managementRecommendation || '',
      alternativeTherapy: item.alternativeTherapy || '',
      onsetTime: item.onsetTime || 'RAPID',
      documentationLevel: item.documentationLevel || 'PROBABLE',
      isActive: item.isActive !== undefined ? item.isActive : true
    });
    setMedSearchTerm('');
    setShowFormModal(true);
    loadAllMedicines();
  };

  // --- UPDATED: HANDLESUBMIT TO MATCH JSON PAYLOAD ---
  const handleSubmit = async () => {
    // Validation
    if (!formData.medicine1Id || !formData.medicine2Id) {
      alert("⚠️ Vui lòng chọn đủ 2 thuốc!");
      return;
    }
    if (!formData.clinicalEffect || formData.clinicalEffect.trim() === '') {
      alert("⚠️ Vui lòng nhập tác dụng lâm sàng!");
      return;
    }

    setLoading(true);
    try {
      // Payload structure matches exactly the requirements
      const payload = {
        medicine1Id: parseInt(formData.medicine1Id),
        medicine2Id: parseInt(formData.medicine2Id),
        interactionType: formData.interactionType,
        severityLevel: formData.severityLevel,
        clinicalEffect: formData.clinicalEffect.trim(),
        mechanism: formData.mechanism?.trim() || null, // null or undefined is fine usually, keeping logic simple
        managementRecommendation: formData.managementRecommendation?.trim() || null,
        alternativeTherapy: formData.alternativeTherapy?.trim() || null,
        onsetTime: formData.onsetTime,
        documentationLevel: formData.documentationLevel,
        isActive: formData.isActive
      };

      console.log('=== DRUG INTERACTION PAYLOAD ===');
      console.log(JSON.stringify(payload, null, 2));

      let res;
      if (isEditing) {
        res = await pharmacistAPI.pharmacistInteractionAPI.updateInteraction(formData.interactionId, payload);
      } else {
        res = await pharmacistAPI.pharmacistInteractionAPI.createInteraction(payload);
      }

      if (res?.status === 'OK') {
        alert(isEditing ? "✅ Cập nhật tương tác thành công!" : "✅ Tạo mới tương tác thành công!");
        setShowFormModal(false);
        fetchInteractions();
      } else {
        alert(res?.message || "❌ Lỗi khi lưu tương tác");
      }
    } catch (e) {
      console.error('Error submitting interaction:', e);
      alert('❌ Lỗi: ' + (e.message || 'Không thể lưu'));
    } finally {
      setLoading(false);
    }
  };

  // Load all medicines when opening the form
  const loadAllMedicines = async () => {
    setLoadingMedicines(true);
    try {
      const res = await pharmacistAPI.medicineAPI.getMedicines('', 0, 1000, ['medicineName,asc']);
      if (res?.status === 'OK' && res.data?.content) {
        setAllMedicines(res.data.content);
        setFilteredMedicines(res.data.content);
      } else if (res?.data && Array.isArray(res.data)) {
        setAllMedicines(res.data);
        setFilteredMedicines(res.data);
      }
    } catch (e) {
      console.error('Error loading medicines:', e);
      alert('Không thể tải danh sách thuốc');
    } finally {
      setLoadingMedicines(false);
    }
  };

  useEffect(() => {
    if (!medSearchTerm.trim()) {
      setFilteredMedicines(allMedicines);
    } else {
      const searchLower = medSearchTerm.toLowerCase();
      const filtered = allMedicines.filter(m =>
        m.medicineName?.toLowerCase().includes(searchLower) ||
        m.sku?.toLowerCase().includes(searchLower) ||
        m.manufacturer?.toLowerCase().includes(searchLower)
      );
      setFilteredMedicines(filtered);
    }
  }, [medSearchTerm, allMedicines]);

  const handleSelectMedicine = (med) => {
    if (searchingFor === 'MED1') setFormData({ ...formData, medicine1Id: med.medicineId, medicine1Name: med.medicineName });
    else if (searchingFor === 'MED2') setFormData({ ...formData, medicine2Id: med.medicineId, medicine2Name: med.medicineName });
    setSearchingFor(null); setMedSearchTerm('');
  };

  // ==================================================================
  // TAB 3 LOGIC: STATISTICS
  // ==================================================================
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, severityRes, recentRes] = await Promise.all([
        pharmacistAPI.pharmacistInteractionAPI.getInteractionStatistics(),
        pharmacistAPI.pharmacistInteractionAPI.getInteractionCountBySeverity(),
        pharmacistAPI.pharmacistInteractionAPI.getRecentInteractions(10)
      ]);
      if (statsRes?.status === 'OK') setStatsGeneral(statsRes.data);
      if (severityRes?.status === 'OK') setSeverityCounts(severityRes.data);
      if (recentRes?.status === 'OK') setRecentInteractions(recentRes.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { if (activeTab === 'STATS') fetchDashboardData(); }, [activeTab]);

  // ==================================================================
  // DATA, TRASH & IMPORT LOGIC
  // ==================================================================
  const handleOpenDataModal = () => { setShowDataModal(true); setDataTab('STATS'); fetchSoftDeleteStats(); };
  const fetchSoftDeleteStats = async () => { 
    setLoading(true); 
    try { 
      const res = await pharmacistAPI.pharmacistInteractionAPI.getSoftDeleteStatistics(); 
      if (res?.status === 'OK') setSoftDeleteStats(res.data); 
    } catch (e) { console.error(e); } finally { setLoading(false); } 
  };
  
  const fetchPaginatedList = async (p = 0) => {
    setLoading(true); setPaginatedList([]);
    try {
      let res;
      if (dataFilter === 'ACTIVE') res = await pharmacistAPI.pharmacistInteractionAPI.getActiveInteractionsPaginated(p, 10);
      else res = await pharmacistAPI.pharmacistInteractionAPI.getDeletedInteractions(p, 10);
      if (res?.status === 'OK' && res.data) { setPaginatedList(res.data.content || []); setTotalPages(res.data.totalPages || 0); setPage(p); }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { if (showDataModal && dataTab === 'LIST') fetchPaginatedList(0); }, [dataTab, dataFilter, showDataModal]);

  const handleRestore = async (id) => { if (!window.confirm("Khôi phục?")) return; setLoading(true); try { const res = await pharmacistAPI.pharmacistInteractionAPI.restoreInteraction(id); if (res?.status === 'OK') { alert("Khôi phục thành công!"); fetchPaginatedList(page); fetchInteractions(); } } catch (e) { console.error(e); } finally { setLoading(false); } };

  const handleOpenImport = () => { setShowImportModal(true); setImportJson(''); };
  const handleImport = async () => {
    if (!importJson) return;
    try {
      const data = JSON.parse(importJson);
      if (!Array.isArray(data)) { alert("JSON phải là mảng []"); return; }
      setLoading(true);
      const res = await pharmacistAPI.pharmacistInteractionAPI.bulkImportInteractions(data);
      if (res?.status === 'OK') { alert("Import thành công!"); setShowImportModal(false); fetchInteractions(); } else alert(res?.message || "Lỗi import");
    } catch (e) { alert("Lỗi JSON: " + e.message); } finally { setLoading(false); }
  };

  const getSeverityBadge = (level, item = null) => {
    if (item && item.severityDisplayText && item.severityColor) {
      return (
        <span className="severity-badge" style={{
          backgroundColor: item.severityColor + '20',
          color: item.severityColor,
          border: `1px solid ${item.severityColor}`
        }}>
          {item.severityIcon || ''} {item.severityDisplayText}
        </span>
      );
    }
    switch (level) {
      case 'CONTRAINDICATED': return <span className="severity-badge contraindicated"><FaTimes/> Chống chỉ định</span>;
      case 'MAJOR': return <span className="severity-badge major"><FaExclamationTriangle/> Nghiêm trọng</span>;
      case 'MODERATE': return <span className="severity-badge moderate"><FaInfoCircle/> Trung bình</span>;
      case 'MINOR': return <span className="severity-badge minor"><FaCheckCircle/> Nhẹ</span>;
      default: return <span className="severity-badge unknown">{level}</span>;
    }
  };

  // --- UPDATED: Helper function to map new interaction types to text ---
  const getInteractionTypeText = (type) => {
      switch(type) {
          case 'PHARMACOKINETIC': return 'Dược động học';
          case 'PHARMACODYNAMIC': return 'Dược lực học';
          case 'PHARMACEUTICAL': return 'Tương kỵ hóa lý';
          case 'SYNERGISTIC': return 'Hiệp đồng';
          case 'ANTAGONISTIC': return 'Đối kháng';
          default: return type || '-';
      }
  };

  // Helper: Lấy tên thuốc từ item (hỗ trợ cả format cũ và mới)
  const getMedicineName = (item, which) => {
    if (which === 1) {
      return item.medicine1?.medicineName || item.medicine1Name || `Thuốc #${item.medicine1Id}`;
    } else {
      return item.medicine2?.medicineName || item.medicine2Name || `Thuốc #${item.medicine2Id}`;
    }
  };

  return (
    <div className="interaction-page-container">
      <div className="page-header"><h1 className="page-title">Hệ thống Tương tác thuốc & An toàn Dược</h1></div>
      <div className="main-tabs">
        <button className={`tab-button ${activeTab==='CHECK'?'active':''}`} onClick={()=>setActiveTab('CHECK')}><FaStethoscope/> Kiểm tra Đơn thuốc</button>
        <button className={`tab-button ${activeTab==='MANAGE'?'active':''}`} onClick={()=>setActiveTab('MANAGE')}><FaList/> Quản lý Danh mục</button>
        <button className={`tab-button ${activeTab==='STATS'?'active':''}`} onClick={()=>setActiveTab('STATS')}><FaChartLine/> Thống kê & Báo cáo</button>
      </div>

      {activeTab === 'CHECK' && (
        <div className="checker-layout">
          <div className="panel left-panel">
            <h3><FaStethoscope/> Nhập thông tin</h3>

            {/* Patient Search Section */}
            <div className="form-group">
              <label>
                Bệnh nhân <span style={{color: 'red'}}>*</span>
              </label>

              {!selectedPatient ? (
                <>
                  <div className="search-box" style={{marginBottom: '10px'}}>
                    <input
                      placeholder="Nhập tên bệnh nhân để tìm kiếm..."
                      value={patientSearchTerm}
                      onChange={e => setPatientSearchTerm(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSearchPatient()}
                      style={{flex: 1}}
                    />
                    <button onClick={handleSearchPatient} disabled={searchingPatient}>
                      <FaSearch/>
                    </button>
                  </div>

                  {searchingPatient && (
                    <p style={{color: '#888', fontSize: '14px'}}>Đang tìm kiếm...</p>
                  )}

                  {patientSearchResults.length > 0 && (
                    <ul className="search-results-list" style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: '10px 0',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      maxHeight: '200px',
                      overflowY: 'auto'
                    }}>
                      {patientSearchResults.map(patient => (
                        <li
                          key={patient.patientId}
                          onClick={() => handleSelectPatient(patient)}
                          style={{
                            padding: '10px',
                            borderBottom: '1px solid #eee',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
                        >
                          <div style={{fontWeight: 'bold'}}>{patient.fullName}</div>
                          <div style={{fontSize: '12px', color: '#666'}}>
                            ID: {patient.patientId} | SĐT: {patient.phoneNumber || 'N/A'}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: '#f9f9f9'
                }}>
                  <div>
                    <strong>{selectedPatient.fullName}</strong>
                    <span style={{marginLeft: '10px', color: '#666'}}>
                      (P{selectedPatient.patientId})
                    </span>
                  </div>
                  <button
                    onClick={handleClearPatient}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#e74c3c',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Thay đổi
                  </button>
                </div>
              )}
            </div>

            {/* Medicine Search Section */}
            <div className="form-group">
              <label><FaSearch/> Chọn thuốc</label>
              <div className="search-box" style={{marginBottom: '10px'}}>
                <input
                  placeholder="Tìm kiếm thuốc theo tên, SKU, nhà sản xuất..."
                  value={checkSearchTerm}
                  onChange={e=>setCheckSearchTerm(e.target.value)}
                  style={{flex: 1}}
                />
              </div>

              {checkLoadingMedicines ? (
                <p style={{color: '#888', fontSize: '14px'}}>Đang tải danh sách thuốc...</p>
              ) : (
                <>
                  <select
                    size="6"
                    onChange={(e) => {
                      const med = checkFilteredMedicines.find(m => m.medicineId === parseInt(e.target.value));
                      if (med) handleAddMedicine(med);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      marginBottom: '8px'
                    }}
                  >
                    {checkFilteredMedicines.length > 0 ? (
                      checkFilteredMedicines.map(med => (
                        <option key={med.medicineId} value={med.medicineId}>
                          {med.medicineName} {med.manufacturer ? `- ${med.manufacturer}` : ''} {med.sku ? `(${med.sku})` : ''}
                        </option>
                      ))
                    ) : (
                      <option disabled>Không tìm thấy thuốc</option>
                    )}
                  </select>
                  <small style={{color: '#888', display: 'block'}}>
                    Hiển thị {checkFilteredMedicines.length} / {checkAllMedicines.length} thuốc - Click để thêm
                  </small>
                </>
              )}
            </div>

            <div className="selected-medicines-area">
              <h4>Đã chọn ({selectedMedicines.length})</h4>
              <ul className="selected-list">
                {selectedMedicines.map(med => (
                  <li key={med.medicineId}>
                    <strong>{med.medicineName}</strong>
                    <button className="remove-btn" onClick={()=>handleRemoveMedicine(med.medicineId)}>
                      <FaTrash/>
                    </button>
                  </li>
                ))}
                {selectedMedicines.length === 0 && <li className="empty-msg">Chưa chọn thuốc</li>}
              </ul>
            </div>

            <button
              className="check-action-btn"
              onClick={handleCheckInteraction}
              disabled={loading || selectedMedicines.length < 2}
            >
              {loading ? 'Đang phân tích...' : 'KIỂM TRA AN TOÀN'}
            </button>

            <div className="quick-tools">
              <h4>Công cụ nhanh</h4>
              <div className="tool-buttons">
                <button onClick={handleQuickSafety} disabled={selectedMedicines.length<2}>
                  <FaShieldAlt/> Safety Check
                </button>
                <button onClick={handleGetContraindicated} disabled={selectedMedicines.length<2} className="btn-contra">
                  <FaBan/> Chống chỉ định
                </button>
                <button onClick={handleGetMajor} disabled={selectedMedicines.length<2} className="btn-major">
                  <FaRadiation/> Nghiêm trọng
                </button>
                <button onClick={handleCheckPair} disabled={selectedMedicines.length<2}>
                  <FaExchangeAlt/> Check Cặp
                </button>
              </div>
            </div>
          </div>
          <div className="panel right-panel">
            <h3>Kết quả Phân tích</h3>
            {quickResult && (<div className="quick-result-box"><div className="quick-header">KẾT QUẢ NHANH <button className="close-mini" onClick={()=>setQuickResult(null)}>&times;</button></div>{quickResult.type==='SAFETY' && <div className={`safety-status ${quickResult.isSafe?'safe':'danger'}`}>{quickResult.isSafe?<FaCheckCircle size={30}/>:<FaExclamationTriangle size={30}/>}<div><strong>{quickResult.isSafe?'AN TOÀN':'CẢNH BÁO'}</strong><p>{quickResult.message}</p></div></div>}{quickResult.type==='LIST' && <div><h5>{quickResult.title} ({quickResult.list?.length||0})</h5>{quickResult.list?.length>0?<ul className="quick-list">{quickResult.list.map((it,i)=><li key={i}><strong>{it.medicine1Name}-{it.medicine2Name}</strong>: {it.description}</li>)}</ul>:<p>Không tìm thấy.</p>}</div>}{quickResult.type==='PAIR' && <div><h5>Tương tác: {quickResult.pair}</h5>{quickResult.data?<div className="pair-detail"><p><strong>Mức độ:</strong> {getSeverityBadge(quickResult.data.severityLevel)}</p><p><strong>Hậu quả:</strong> {quickResult.data.clinicalEffect}</p></div>:<p style={{color:'green'}}>Không có tương tác.</p>}</div>}</div>)}
            {!checkResult && !quickResult && !loading && <div className="placeholder-text"><FaInfoCircle/> Chọn thuốc và nhấn Kiểm tra.</div>}
            {checkResult && (<div className="check-result-container"><div className={`status-box ${checkResult.isSafeToPrescribe?'safe':'warning'}`}><div className="status-icon">{checkResult.isSafeToPrescribe?<FaCheckCircle size={40}/>:<FaExclamationTriangle size={40}/>}</div><div className="status-text"><h4>{checkResult.recommendation}</h4><p>Rủi ro: <strong>{checkResult.overallRiskLevel}</strong></p></div></div><div className="summary-counts"><span className="count-badge contra">{checkResult.contraindicatedCount} CCĐ</span><span className="count-badge major">{checkResult.majorCount} Major</span><span className="count-badge moderate">{checkResult.moderateCount} Mod</span><span className="count-badge minor">{checkResult.minorCount} Min</span></div><div className="result-lists">{renderCheckResultList(checkResult.contraindicatedInteractions, "Chống chỉ định", "contra-group")}{renderCheckResultList(checkResult.majorInteractions, "Nghiêm trọng", "major-group")}{renderCheckResultList(checkResult.moderateInteractions, "Trung bình", "moderate-group")}{renderCheckResultList(checkResult.minorInteractions, "Nhẹ", "minor-group")}{checkResult.totalInteractionsFound === 0 && <p className="no-interaction-msg">Không phát hiện tương tác.</p>}</div><div className="timestamp">{new Date(checkResult.checkTimestamp).toLocaleString('vi-VN')}</div></div>)}
          </div>
        </div>
      )}

      {activeTab === 'MANAGE' && (
        <div className="manage-layout">
          <div className="manage-controls">
            <div className="search-box">
              <input placeholder="Tìm kiếm thuốc..." value={manageSearchTerm} onChange={e=>setManageSearchTerm(e.target.value)} onKeyDown={e=>e.key==='Enter'&&fetchInteractions()}/>
              <button onClick={fetchInteractions}><FaSearch/></button>
            </div>
            <select value={filterSeverity} onChange={e=>setFilterSeverity(e.target.value)}>
              <option value="ALL">Tất cả mức độ</option>
              <option value="CONTRAINDICATED">Chống chỉ định</option>
              <option value="MAJOR">Nghiêm trọng</option>
              <option value="MODERATE">Trung bình</option>
              <option value="MINOR">Nhẹ</option>
            </select>
            <button className="btn-primary" onClick={handleOpenCreate}><FaPlus/> Thêm mới</button>
            <button className="btn-secondary" onClick={handleOpenImport}><FaFileImport/> Import</button>
            <button className="btn-secondary" onClick={handleOpenDataModal}><FaDatabase/> Dữ liệu</button>
          </div>
          <div className="table-container">
            <table className="interaction-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th style={{width:'30%'}}>Cặp thuốc</th>
                  <th>Loại</th>
                  <th>Mức độ</th>
                  <th>Hậu quả</th>
                  <th className="text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {interactionList.length > 0 ? interactionList.map(item => (
                  <tr key={item.interactionId}>
                    <td>{item.interactionId}</td>
                    <td>
                      <div className="drug-pair-cell">
                        <div className="drug-name">
                          <strong>{getMedicineName(item, 1)}</strong>
                        </div>
                        <FaExchangeAlt className="exchange-icon"/>
                        <div className="drug-name">
                          <strong>{getMedicineName(item, 2)}</strong>
                        </div>
                      </div>
                      {item.medicine1?.manufacturer && (
                        <small style={{color:'#888', display:'block', marginTop:'4px'}}>
                          {item.medicine1.manufacturer} / {item.medicine2?.manufacturer}
                        </small>
                      )}
                    </td>
                    <td>
                      <span className="type-badge" style={{
                        backgroundColor: item.interactionType === 'PHARMACODYNAMIC' ? '#e6f7ff' : '#f6ffed',
                        color: item.interactionType === 'PHARMACODYNAMIC' ? '#1890ff' : '#52c41a',
                        padding: '2px 8px', borderRadius: '4px', fontSize: '12px'
                      }}>
                        {getInteractionTypeText(item.interactionType)}
                      </span>
                    </td>
                    <td>{getSeverityBadge(item.severityLevel, item)}</td>
                    <td style={{maxWidth: '250px'}}>
                      <div style={{fontSize:'13px'}}>{item.clinicalEffect || item.description || '-'}</div>
                      {item.onsetTime && (
                        <small style={{color:'#fa8c16'}}>
                          <FaClock style={{marginRight:'3px'}}/>
                          {item.onsetTime === 'RAPID' ? 'Khởi phát nhanh' :
                           item.onsetTime === 'DELAYED' ? 'Khởi phát chậm' : item.onsetTime}
                        </small>
                      )}
                    </td>
                    <td className="text-center" style={{whiteSpace:'nowrap'}}>
                      <button className="btn-icon view" onClick={()=>handleViewDetail(item.interactionId)} title="Xem chi tiết"><FaEye/></button>
                      <button className="btn-icon edit" onClick={()=>handleOpenEdit(item)} title="Sửa"><FaEdit/></button>
                      <button className="btn-icon delete" onClick={()=>handleDeleteInteraction(item.interactionId)} title="Xóa"><FaTrash/></button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="6" className="text-center">{loading ? 'Đang tải...' : 'Không có dữ liệu'}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'STATS' && (
        <div className="stats-layout">
          <div className="stats-overview">
            <div className="stat-card total"><div className="icon-bg"><FaDatabase/></div><div className="stat-info"><h3>{statsGeneral?.total_active||0}</h3><p>Tổng số Active</p></div></div>
            <div className="stat-card active"><div className="icon-bg"><FaCheckCircle/></div><div className="stat-info"><h3>{statsGeneral?.total_active||0}</h3><p>Đang hoạt động</p></div></div>
            <div className="stat-card warning"><div className="icon-bg"><FaExclamationTriangle/></div><div className="stat-info"><h3>{severityCounts?(severityCounts.CONTRAINDICATED||0)+(severityCounts.MAJOR||0):0}</h3><p>Mức độ Cao</p></div></div>
          </div>
          <div className="stats-details-grid">
            <div className="panel severity-panel"><h4>Phân bố Mức độ</h4><div className="severity-list"><div className="sev-item contra"><span>Chống chỉ định</span><strong>{severityCounts?.CONTRAINDICATED||0}</strong></div><div className="sev-item major"><span>Nghiêm trọng</span><strong>{severityCounts?.MAJOR||0}</strong></div><div className="sev-item moderate"><span>Trung bình</span><strong>{severityCounts?.MODERATE||0}</strong></div><div className="sev-item minor"><span>Nhẹ</span><strong>{severityCounts?.MINOR||0}</strong></div></div></div>
            <div className="panel recent-panel">
              <h4><FaClock/> Gần đây</h4>
              <ul className="recent-list">
                {recentInteractions.map(it => (
                  <li key={it.interactionId}>
                    <div className="recent-info">
                      <span className="recent-pair">{getMedicineName(it, 1)} + {getMedicineName(it, 2)}</span>
                      <span className="recent-sev">{getSeverityBadge(it.severityLevel, it)}</span>
                    </div>
                    <span className="recent-time">ID:{it.interactionId}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      {selectedInteractionDetail && (
        <div className="modal-overlay">
          <div className="modal-content" style={{maxWidth: '700px'}}>
            <div className="modal-header" style={{borderBottomColor: selectedInteractionDetail.severityColor || '#667eea', borderBottomWidth: '3px'}}>
              <h2>Chi tiết Tương tác #{selectedInteractionDetail.interactionId}</h2>
              <button className="close-btn" onClick={()=>setSelectedInteractionDetail(null)}>&times;</button>
            </div>
            <div className="modal-body">
              {/* Drug Pair Header */}
              <div className="detail-pair-header" style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'15px', marginBottom:'20px'}}>
                <div className="drug-box" style={{flex:1, textAlign:'center', padding:'15px', backgroundColor:'#f0f5ff', borderRadius:'8px', border:'1px solid #d6e4ff'}}>
                  <strong style={{fontSize:'14px', color:'#1890ff'}}>{getMedicineName(selectedInteractionDetail, 1)}</strong>
                  {selectedInteractionDetail.medicine1?.manufacturer && (
                    <div style={{fontSize:'12px', color:'#888', marginTop:'5px'}}>{selectedInteractionDetail.medicine1.manufacturer}</div>
                  )}
                </div>
                <FaExchangeAlt style={{color:'#fa8c16', fontSize:'20px'}}/>
                <div className="drug-box" style={{flex:1, textAlign:'center', padding:'15px', backgroundColor:'#fff7e6', borderRadius:'8px', border:'1px solid #ffd591'}}>
                  <strong style={{fontSize:'14px', color:'#fa8c16'}}>{getMedicineName(selectedInteractionDetail, 2)}</strong>
                  {selectedInteractionDetail.medicine2?.manufacturer && (
                    <div style={{fontSize:'12px', color:'#888', marginTop:'5px'}}>{selectedInteractionDetail.medicine2.manufacturer}</div>
                  )}
                </div>
              </div>

              {/* Info Grid */}
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px', marginBottom:'20px'}}>
                <div className="detail-row"><span className="label" style={{fontWeight:'600'}}>Mức độ:</span> {getSeverityBadge(selectedInteractionDetail.severityLevel, selectedInteractionDetail)}</div>
                <div className="detail-row"><span className="label" style={{fontWeight:'600'}}>Loại:</span>
                  <span style={{
                    backgroundColor: selectedInteractionDetail.interactionType === 'PHARMACODYNAMIC' ? '#e6f7ff' : '#f6ffed',
                    color: selectedInteractionDetail.interactionType === 'PHARMACODYNAMIC' ? '#1890ff' : '#52c41a',
                    padding: '2px 8px', borderRadius: '4px', fontSize: '12px', marginLeft:'5px'
                  }}>
                    {getInteractionTypeText(selectedInteractionDetail.interactionType)}
                  </span>
                </div>
                <div className="detail-row"><span className="label" style={{fontWeight:'600'}}>Khởi phát:</span>
                  <span style={{marginLeft:'5px'}}>
                    {selectedInteractionDetail.onsetTime === 'RAPID' ? '⚡ Nhanh' :
                     selectedInteractionDetail.onsetTime === 'DELAYED' ? '⏰ Chậm' : 
                     selectedInteractionDetail.onsetTime === 'VARIABLE' ? '🔄 Thay đổi' : selectedInteractionDetail.onsetTime || '-'}
                  </span>
                </div>
                <div className="detail-row"><span className="label" style={{fontWeight:'600'}}>Tài liệu:</span>
                  <span style={{marginLeft:'5px'}}>{selectedInteractionDetail.documentationLevel || '-'}</span>
                </div>
              </div>

              {/* Details Blocks */}
              <div className="detail-block" style={{marginBottom:'15px', padding:'12px', backgroundColor:'#fff1f0', borderRadius:'6px', border:'1px solid #ffa39e'}}>
                <span className="label" style={{fontWeight:'600', color:'#ff4d4f'}}>🔴 Hậu quả lâm sàng:</span>
                <p style={{margin:'8px 0 0', lineHeight:'1.6'}}>{selectedInteractionDetail.clinicalEffect || '-'}</p>
              </div>
              <div className="detail-block" style={{marginBottom:'15px', padding:'12px', backgroundColor:'#e6f7ff', borderRadius:'6px', border:'1px solid #91d5ff'}}>
                <span className="label" style={{fontWeight:'600', color:'#1890ff'}}>🔬 Cơ chế:</span>
                <p style={{margin:'8px 0 0', lineHeight:'1.6'}}>{selectedInteractionDetail.mechanism || '-'}</p>
              </div>
              <div className="detail-block" style={{marginBottom:'15px', padding:'12px', backgroundColor:'#f6ffed', borderRadius:'6px', border:'1px solid #b7eb8f'}}>
                <span className="label" style={{fontWeight:'600', color:'#52c41a'}}>✅ Khuyến nghị xử trí:</span>
                <p style={{margin:'8px 0 0', lineHeight:'1.6'}}>{selectedInteractionDetail.managementRecommendation || '-'}</p>
              </div>
              {selectedInteractionDetail.alternativeTherapy && (
                <div className="detail-block" style={{marginBottom:'15px', padding:'12px', backgroundColor:'#fff7e6', borderRadius:'6px', border:'1px solid #ffd591'}}>
                  <span className="label" style={{fontWeight:'600', color:'#fa8c16'}}>💡 Liệu pháp thay thế:</span>
                  <p style={{margin:'8px 0 0', lineHeight:'1.6'}}>{selectedInteractionDetail.alternativeTherapy}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* --- UPDATED FORM MODAL WITH CORRECT SELECT OPTIONS --- */}
      {showFormModal && (
        <div className="modal-overlay">
          <div className="modal-content large-form">
            <div className="modal-header">
              <h2>{isEditing ? 'Cập nhật' : 'Tạo mới'}</h2>
              <button className="close-btn" onClick={()=>setShowFormModal(false)}>&times;</button>
            </div>
            <div className="modal-body form-body">
              <h4 className="form-section-title">1. Chọn Cặp thuốc</h4>

              {/* Medicine 1 Selection */}
              <div className="form-group">
                <label>Thuốc 1 <span className="req">*</span></label>
                {searchingFor === 'MED1' ? (
                  <div>
                    <div className="search-input-row" style={{marginBottom: '10px'}}>
                      <input
                        autoFocus
                        placeholder="Tìm kiếm thuốc theo tên, SKU, nhà sản xuất..."
                        value={medSearchTerm}
                        onChange={e=>setMedSearchTerm(e.target.value)}
                        style={{flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}}
                      />
                      <button
                        onClick={()=>setSearchingFor(null)}
                        style={{marginLeft: '8px', padding: '8px 12px'}}
                      >
                        Đóng
                      </button>
                    </div>
                    {loadingMedicines ? (
                      <p>Đang tải danh sách thuốc...</p>
                    ) : (
                      <select
                        size="8"
                        onChange={(e) => {
                          const med = filteredMedicines.find(m => m.medicineId === parseInt(e.target.value));
                          if (med) handleSelectMedicine(med);
                        }}
                        style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}}
                      >
                        {filteredMedicines.length > 0 ? (
                          filteredMedicines.map(m => (
                            <option key={m.medicineId} value={m.medicineId}>
                              {m.medicineName} {m.manufacturer ? `- ${m.manufacturer}` : ''} {m.sku ? `(${m.sku})` : ''}
                            </option>
                          ))
                        ) : (
                          <option disabled>Không tìm thấy thuốc</option>
                        )}
                      </select>
                    )}
                    <small style={{color: '#888', display: 'block', marginTop: '5px'}}>
                      Hiển thị {filteredMedicines.length} / {allMedicines.length} thuốc
                    </small>
                  </div>
                ) : (
                  <div className="drug-input-group">
                    <input
                      type="text"
                      readOnly
                      value={formData.medicine1Name}
                      placeholder="Chưa chọn"
                      style={{flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f5f5f5'}}
                    />
                    <button
                      className="btn-pick"
                      onClick={()=>{setSearchingFor('MED1'); setMedSearchTerm('');}}
                      style={{marginLeft: '8px', padding: '8px 12px'}}
                    >
                      <FaSearch/> Chọn
                    </button>
                  </div>
                )}
              </div>

              <div className="exchange-icon-center" style={{textAlign: 'center', margin: '15px 0'}}>
                <FaExchangeAlt style={{fontSize: '24px', color: '#888'}}/>
              </div>

              {/* Medicine 2 Selection */}
              <div className="form-group">
                <label>Thuốc 2 <span className="req">*</span></label>
                {searchingFor === 'MED2' ? (
                  <div>
                    <div className="search-input-row" style={{marginBottom: '10px'}}>
                      <input
                        autoFocus
                        placeholder="Tìm kiếm thuốc theo tên, SKU, nhà sản xuất..."
                        value={medSearchTerm}
                        onChange={e=>setMedSearchTerm(e.target.value)}
                        style={{flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}}
                      />
                      <button
                        onClick={()=>setSearchingFor(null)}
                        style={{marginLeft: '8px', padding: '8px 12px'}}
                      >
                        Đóng
                      </button>
                    </div>
                    {loadingMedicines ? (
                      <p>Đang tải danh sách thuốc...</p>
                    ) : (
                      <select
                        size="8"
                        onChange={(e) => {
                          const med = filteredMedicines.find(m => m.medicineId === parseInt(e.target.value));
                          if (med) handleSelectMedicine(med);
                        }}
                        style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}}
                      >
                        {filteredMedicines.length > 0 ? (
                          filteredMedicines.map(m => (
                            <option key={m.medicineId} value={m.medicineId}>
                              {m.medicineName} {m.manufacturer ? `- ${m.manufacturer}` : ''} {m.sku ? `(${m.sku})` : ''}
                            </option>
                          ))
                        ) : (
                          <option disabled>Không tìm thấy thuốc</option>
                        )}
                      </select>
                    )}
                    <small style={{color: '#888', display: 'block', marginTop: '5px'}}>
                      Hiển thị {filteredMedicines.length} / {allMedicines.length} thuốc
                    </small>
                  </div>
                ) : (
                  <div className="drug-input-group">
                    <input
                      type="text"
                      readOnly
                      value={formData.medicine2Name}
                      placeholder="Chưa chọn"
                      style={{flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f5f5f5'}}
                    />
                    <button
                      className="btn-pick"
                      onClick={()=>{setSearchingFor('MED2'); setMedSearchTerm('');}}
                      style={{marginLeft: '8px', padding: '8px 12px'}}
                    >
                      <FaSearch/> Chọn
                    </button>
                  </div>
                )}
              </div>

              <h4 className="form-section-title" style={{marginTop: '25px'}}>2. Thông tin tương tác</h4>

              {/* Interaction Type - Corrected Enums */}
              <div className="form-group">
                <label>Loại tương tác <span className="req">*</span></label>
                <select
                  value={formData.interactionType}
                  onChange={e=>setFormData({...formData, interactionType:e.target.value})}
                >
                  <option value="PHARMACOKINETIC">Dược động học (Pharmacokinetic)</option>
                  <option value="PHARMACODYNAMIC">Dược lực học (Pharmacodynamic)</option>
                  <option value="PHARMACEUTICAL">Tương kỵ hóa lý (Pharmaceutical)</option>
                  <option value="SYNERGISTIC">Hiệp đồng (Synergistic)</option>
                  <option value="ANTAGONISTIC">Đối kháng (Antagonistic)</option>
                </select>
              </div>

              {/* Severity Level - Corrected Enums */}
              <div className="form-group">
                <label>Mức độ nghiêm trọng <span className="req">*</span></label>
                <select value={formData.severityLevel} onChange={e=>setFormData({...formData, severityLevel:e.target.value})}>
                  <option value="CONTRAINDICATED">Chống chỉ định</option>
                  <option value="MAJOR">Nghiêm trọng</option>
                  <option value="MODERATE">Trung bình</option>
                  <option value="MINOR">Nhẹ</option>
                </select>
              </div>

              {/* Clinical Effect */}
              <div className="form-group">
                <label>Tác dụng lâm sàng <span className="req">*</span></label>
                <textarea
                  rows="3"
                  value={formData.clinicalEffect}
                  onChange={e=>setFormData({...formData, clinicalEffect:e.target.value})}
                  placeholder="VD: May increase anticoagulant effect"
                />
              </div>

              {/* Mechanism */}
              <div className="form-group">
                <label>Cơ chế (Tùy chọn)</label>
                <textarea
                  rows="2"
                  value={formData.mechanism}
                  onChange={e=>setFormData({...formData, mechanism:e.target.value})}
                  placeholder="VD: Pharmacodynamic interaction"
                />
              </div>

              {/* Management Recommendation */}
              <div className="form-group">
                <label>Khuyến nghị xử lý (Tùy chọn)</label>
                <textarea
                  rows="3"
                  value={formData.managementRecommendation}
                  onChange={e=>setFormData({...formData, managementRecommendation:e.target.value})}
                  placeholder="VD: Monitor INR closely"
                />
              </div>

              {/* Alternative Therapy */}
              <div className="form-group">
                <label>Thuốc thay thế (Tùy chọn)</label>
                <textarea
                  rows="2"
                  value={formData.alternativeTherapy}
                  onChange={e=>setFormData({...formData, alternativeTherapy:e.target.value})}
                  placeholder="VD: Use alternative drug"
                />
              </div>

              {/* Onset Time - Corrected Enums */}
              <div className="form-group">
                <label>Thời gian khởi phát (Tùy chọn)</label>
                <select
                  value={formData.onsetTime}
                  onChange={e=>setFormData({...formData, onsetTime:e.target.value})}
                >
                  <option value="RAPID">Nhanh (Rapid)</option>
                  <option value="DELAYED">Chậm (Delayed)</option>
                  <option value="VARIABLE">Thay đổi (Variable)</option>
                </select>
              </div>

              {/* Documentation Level - Corrected Enums */}
              <div className="form-group">
                <label>Mức độ tài liệu (Tùy chọn)</label>
                <select
                  value={formData.documentationLevel}
                  onChange={e=>setFormData({...formData, documentationLevel:e.target.value})}
                >
                  <option value="ESTABLISHED">Thiết lập (Established)</option>
                  <option value="PROBABLE">Có thể (Probable)</option>
                  <option value="SUSPECTED">Nghi ngờ (Suspected)</option>
                  <option value="POSSIBLE">Khả năng (Possible)</option>
                  <option value="UNLIKELY">Ít khả năng (Unlikely)</option>
                </select>
              </div>

              {/* Is Active */}
              <div className="form-group">
                <label style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={e=>setFormData({...formData, isActive:e.target.checked})}
                    style={{width: 'auto'}}
                  />
                  <span>Kích hoạt</span>
                </label>
              </div>

              <div className="form-actions">
                <button className="btn-cancel" onClick={()=>setShowFormModal(false)}>Hủy</button>
                <button className="btn-save" onClick={handleSubmit} disabled={loading}><FaSave/> Lưu</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showImportModal && (<div className="modal-overlay"><div className="modal-content large-form"><div className="modal-header"><h2>Import JSON</h2><button className="close-btn" onClick={()=>setShowImportModal(false)}>&times;</button></div><div className="modal-body"><textarea rows="10" style={{width:'100%', padding:'10px', border:'1px solid #ddd', borderRadius:'4px', fontFamily:'monospace'}} value={importJson} onChange={e=>setImportJson(e.target.value)} placeholder='[{"medicine1Id": 1, "medicine2Id": 5...}]'/><div className="form-actions"><button className="btn-cancel" onClick={()=>setShowImportModal(false)}>Hủy</button><button className="btn-save" onClick={handleImport} disabled={loading}><FaFileImport/> Import</button></div></div></div></div>)}
      
      {/* MODAL DATA & TRASH */}
      {showDataModal && (
        <div className="modal-overlay">
          <div className="modal-content large-modal">
            <div className="modal-header">
              <h2>Quản lý Dữ liệu & Thùng rác</h2>
              <button className="close-btn" onClick={() => setShowDataModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="tabs">
                <button className={`tab-btn ${dataTab==='STATS'?'active':''}`} onClick={()=>{setDataTab('STATS'); fetchSoftDeleteStats();}}>Thống kê Xóa</button>
                <button className={`tab-btn ${dataTab==='LIST'?'active':''}`} onClick={()=>{setDataTab('LIST'); fetchPaginatedList(0);}}>Danh sách Dữ liệu</button>
              </div>
              <div className="tab-content">
                {dataTab === 'STATS' && softDeleteStats && (
                  <div className="stats-dashboard" style={{gap: '15px'}}>
                    <div className="stat-card active" style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center'}}>
                      <h4>Active (Đang hoạt động)</h4>
                      <h3 style={{fontSize:'36px', margin:'10px 0'}}>{softDeleteStats.active}</h3>
                    </div>

                    <div className="stat-card warning" style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center'}}>
                      <h4>Deleted (Đã xóa)</h4>
                      <h3 style={{fontSize:'36px', margin:'10px 0', color:'#fff'}}>{softDeleteStats.deleted}</h3>
                    </div>

                    <div className="stat-card total" style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center'}}>
                      <h4>Total (Tổng cộng)</h4>
                      <h3 style={{fontSize:'36px', margin:'10px 0'}}>{softDeleteStats.total}</h3>
                    </div>
                  </div>
                )}

                {dataTab === 'LIST' && (
                  <div>
                    <div className="filter-bar"><button className={`filter-chip ${dataFilter==='ACTIVE'?'active':''}`} onClick={()=>setDataFilter('ACTIVE')}><FaCheckCircle/> Active</button><button className={`filter-chip ${dataFilter==='DELETED'?'active delete':''}`} onClick={()=>setDataFilter('DELETED')}><FaTrash/> Deleted</button></div>
                    <table className="data-table">
                      <thead><tr><th>ID</th><th>Cặp thuốc</th><th>Loại</th><th>Mức độ</th><th>Thao tác</th></tr></thead>
                      <tbody>
                        {paginatedList.length > 0 ? paginatedList.map(item => (
                          <tr key={item.interactionId}>
                            <td>{item.interactionId}</td>
                            <td>
                              <strong>{getMedicineName(item, 1)}</strong>
                              <FaExchangeAlt style={{margin:'0 8px', color:'#888'}}/>
                              <strong>{getMedicineName(item, 2)}</strong>
                            </td>
                            <td>
                              <span style={{
                                fontSize:'11px', padding:'2px 6px', borderRadius:'4px',
                                backgroundColor: item.interactionType === 'PHARMACODYNAMIC' ? '#e6f7ff' : '#f6ffed',
                                color: item.interactionType === 'PHARMACODYNAMIC' ? '#1890ff' : '#52c41a'
                              }}>
                                {getInteractionTypeText(item.interactionType)}
                              </span>
                            </td>
                            <td>{getSeverityBadge(item.severityLevel, item)}</td>
                            <td className="text-center">
                              {dataFilter === 'DELETED' && (
                                <button className="btn-icon" title="Khôi phục" onClick={()=>handleRestore(item.interactionId)}><FaUndo/></button>
                              )}
                              {dataFilter === 'ACTIVE' && (
                                <button className="btn-icon view" title="Xem chi tiết" onClick={()=>handleViewDetail(item.interactionId)}><FaEye/></button>
                              )}
                            </td>
                          </tr>
                        )) : (
                          <tr><td colSpan="5" className="text-center">{loading ? 'Đang tải...' : 'Không có dữ liệu'}</td></tr>
                        )}
                      </tbody>
                    </table>
                    <div className="pagination-controls"><button disabled={page===0} onClick={()=>fetchPaginatedList(page-1)}><FaChevronLeft/> Trước</button><span>{page+1}/{totalPages||1}</span><button disabled={page>=totalPages-1} onClick={()=>fetchPaginatedList(page+1)}>Sau <FaChevronRight/></button></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DrugInteractionPage;