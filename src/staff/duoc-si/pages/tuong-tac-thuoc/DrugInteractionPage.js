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
  const [patientId, setPatientId] = useState('');
  const [checkSearchTerm, setCheckSearchTerm] = useState('');
  const [checkSearchResults, setCheckSearchResults] = useState([]);
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
  const [formData, setFormData] = useState({
    interactionId: null, medicine1Id: '', medicine1Name: '', medicine2Id: '', medicine2Name: '',
    severityLevel: 'MODERATE', description: '', clinicalEffect: '', mechanism: '', management: ''
  });
  
  // Search medicine in form
  const [medSearchTerm, setMedSearchTerm] = useState('');
  const [medSearchResults, setMedSearchResults] = useState([]);
  const [searchingFor, setSearchingFor] = useState(null);

  // ==================== STATE FOR TAB 3: STATISTICS ====================
  const [statsGeneral, setStatsGeneral] = useState(null);
  const [severityCounts, setSeverityCounts] = useState(null);
  const [recentInteractions, setRecentInteractions] = useState([]);

  // ==================== STATE FOR DATA & TRASH & IMPORT ====================
  const [showDataModal, setShowDataModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [dataTab, setDataTab] = useState('STATS'); // STATS, LIST
  const [dataFilter, setDataFilter] = useState('ACTIVE'); // ACTIVE, DELETED
  const [softDeleteStats, setSoftDeleteStats] = useState(null);
  const [paginatedList, setPaginatedList] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [importJson, setImportJson] = useState('');

  // ==================================================================
  // TAB 1 LOGIC: CHECK INTERACTIONS
  // ==================================================================
  const handleSearchMedicineToAdd = async () => {
    if (!checkSearchTerm) return;
    try { const res = await pharmacistAPI.pharmacistInventoryAPI.searchMedicine(checkSearchTerm); if (res?.status === 'OK') setCheckSearchResults(res.data); } catch (e) { console.error(e); }
  };
  const handleAddMedicine = (med) => {
    if (!selectedMedicines.find(m => m.medicineId === med.medicineId)) {
      setSelectedMedicines([...selectedMedicines, med]); setCheckResult(null); setQuickResult(null); setCheckSearchResults([]); setCheckSearchTerm('');
    }
  };
  const handleRemoveMedicine = (id) => { setSelectedMedicines(selectedMedicines.filter(m => m.medicineId !== id)); setCheckResult(null); setQuickResult(null); };
  const handleCheckInteraction = async () => {
    if (selectedMedicines.length < 2) { alert("Chọn ít nhất 2 thuốc."); return; }
    setLoading(true); setQuickResult(null);
    try {
      const ids = selectedMedicines.map(m => m.medicineId);
      const pId = patientId ? parseInt(patientId) : null;
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

  const handleOpenCreate = () => { setIsEditing(false); setFormData({ interactionId: null, medicine1Id: '', medicine1Name: '', medicine2Id: '', medicine2Name: '', severityLevel: 'MODERATE', description: '', clinicalEffect: '', mechanism: '', management: '' }); setMedSearchResults([]); setShowFormModal(true); };
  const handleOpenEdit = (item) => { setIsEditing(true); setFormData({ interactionId: item.interactionId, medicine1Id: item.medicine1Id, medicine1Name: item.medicine1Name, medicine2Id: item.medicine2Id, medicine2Name: item.medicine2Name, severityLevel: item.severityLevel, description: item.description||'', clinicalEffect: item.clinicalEffect||'', mechanism: item.mechanism||'', management: item.managementRecommendation||'' }); setShowFormModal(true); };
  const handleSubmit = async () => {
    if (!formData.medicine1Id || !formData.medicine2Id || !formData.description) { alert("Thiếu thông tin!"); return; }
    setLoading(true);
    try {
      const payload = { medicine1Id: formData.medicine1Id, medicine2Id: formData.medicine2Id, severityLevel: formData.severityLevel, description: formData.description, clinicalEffect: formData.clinicalEffect, mechanism: formData.mechanism, management: formData.management };
      let res;
      if (isEditing) res = await pharmacistAPI.pharmacistInteractionAPI.updateInteraction(formData.interactionId, payload);
      else res = await pharmacistAPI.pharmacistInteractionAPI.createInteraction(payload);
      if (res?.status === 'OK') { alert(isEditing ? "Cập nhật xong!" : "Tạo mới xong!"); setShowFormModal(false); fetchInteractions(); } else alert(res?.message || "Lỗi");
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleSearchMedicine = async () => { if (!medSearchTerm.trim()) return; try { const res = await pharmacistAPI.pharmacistInventoryAPI.searchMedicine(medSearchTerm); if (res?.status === 'OK') setMedSearchResults(res.data); } catch (e) { console.error(e); } };
  const handleSelectMedicine = (med) => { if (searchingFor === 'MED1') setFormData({ ...formData, medicine1Id: med.medicineId, medicine1Name: med.medicineName }); else if (searchingFor === 'MED2') setFormData({ ...formData, medicine2Id: med.medicineId, medicine2Name: med.medicineName }); setSearchingFor(null); setMedSearchResults([]); setMedSearchTerm(''); };

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

  const getSeverityBadge = (level) => {
    switch (level) {
      case 'CONTRAINDICATED': return <span className="severity-badge contraindicated"><FaTimes/> Chống chỉ định</span>;
      case 'MAJOR': return <span className="severity-badge major"><FaExclamationTriangle/> Nghiêm trọng</span>;
      case 'MODERATE': return <span className="severity-badge moderate"><FaInfoCircle/> Trung bình</span>;
      case 'MINOR': return <span className="severity-badge minor"><FaCheckCircle/> Nhẹ</span>;
      default: return <span className="severity-badge unknown">{level}</span>;
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

      {/* TAB 1, 2, 3 giữ nguyên logic render cũ... */}
      {activeTab === 'CHECK' && (
        <div className="checker-layout">
          <div className="panel left-panel">
            <h3><FaStethoscope/> Nhập thông tin</h3>
            <div className="form-group"><label><FaUser/> ID Bệnh nhân</label><input type="number" placeholder="Nhập ID..." value={patientId} onChange={e=>setPatientId(e.target.value)} className="std-input"/></div>
            <div className="form-group"><label><FaSearch/> Chọn thuốc</label><div className="search-box"><input placeholder="Nhập tên..." value={checkSearchTerm} onChange={e=>setCheckSearchTerm(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSearchMedicineToAdd()}/><button onClick={handleSearchMedicineToAdd}><FaSearch/></button></div>{checkSearchResults.length>0 && <ul className="search-results-list">{checkSearchResults.map(med=><li key={med.medicineId}><span>{med.medicineName}</span> <button className="add-btn" onClick={()=>handleAddMedicine(med)}><FaPlus/></button></li>)}</ul>}</div>
            <div className="selected-medicines-area"><h4>Đã chọn ({selectedMedicines.length})</h4><ul className="selected-list">{selectedMedicines.map(med=><li key={med.medicineId}><strong>{med.medicineName}</strong> <button className="remove-btn" onClick={()=>handleRemoveMedicine(med.medicineId)}><FaTrash/></button></li>)}{selectedMedicines.length===0 && <li className="empty-msg">Chưa chọn thuốc</li>}</ul></div>
            <button className="check-action-btn" onClick={handleCheckInteraction} disabled={loading||selectedMedicines.length<2}>{loading?'Đang phân tích...':'KIỂM TRA AN TOÀN'}</button>
            <div className="quick-tools"><h4>Công cụ nhanh</h4><div className="tool-buttons"><button onClick={handleQuickSafety} disabled={selectedMedicines.length<2}><FaShieldAlt/> Safety Check</button><button onClick={handleGetContraindicated} disabled={selectedMedicines.length<2} className="btn-contra"><FaBan/> Chống chỉ định</button><button onClick={handleGetMajor} disabled={selectedMedicines.length<2} className="btn-major"><FaRadiation/> Nghiêm trọng</button><button onClick={handleCheckPair} disabled={selectedMedicines.length<2}><FaExchangeAlt/> Check Cặp</button></div></div>
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
          <div className="filter-toolbar">
            <div className="search-group"><input placeholder="Tìm kiếm..." value={manageSearchTerm} onChange={e=>setManageSearchTerm(e.target.value)} onKeyDown={e=>e.key==='Enter'&&fetchInteractions()}/><button className="btn-search" onClick={fetchInteractions}><FaSearch/></button></div>
            <div className="right-actions"><div className="filter-group"><FaFilter/><select value={filterSeverity} onChange={e=>setFilterSeverity(e.target.value)}><option value="ALL">Tất cả</option><option value="CONTRAINDICATED">Chống chỉ định</option><option value="MAJOR">Nghiêm trọng</option><option value="MODERATE">Trung bình</option><option value="MINOR">Nhẹ</option></select></div><button className="btn-create" onClick={handleOpenImport}><FaFileImport/> Import JSON</button><button className="btn-secondary" onClick={handleOpenDataModal}><FaDatabase/> Dữ liệu & Trash</button><button className="btn-create" onClick={handleOpenCreate}><FaPlus/> Thêm mới</button></div>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead><tr><th>ID</th><th style={{width:'30%'}}>Cặp thuốc</th><th>Mức độ</th><th>Hậu quả</th><th className="text-center">Thao tác</th></tr></thead>
              <tbody>
                {interactionList.map(item => (
                  <tr key={item.interactionId}>
                    <td>{item.interactionId}</td>
                    <td><div className="drug-pair"><strong>{item.medicine1Name}</strong><FaExchangeAlt className="exchange-icon"/><strong>{item.medicine2Name}</strong></div></td>
                    <td>{getSeverityBadge(item.severityLevel)}</td>
                    <td>{item.clinicalEffect || item.description}</td>
                    <td className="text-center"><button className="btn-icon view" onClick={()=>handleViewDetail(item.interactionId)}><FaEye/></button><button className="btn-icon edit" onClick={()=>handleOpenEdit(item)}><FaEdit/></button><button className="btn-icon delete" onClick={()=>handleDeleteInteraction(item.interactionId)}><FaTrash/></button></td>
                  </tr>
                ))}
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
            <div className="panel recent-panel"><h4><FaClock/> Gần đây</h4><ul className="recent-list">{recentInteractions.map(it=><li key={it.interactionId}><div className="recent-info"><span className="recent-pair">{it.medicine1Name} + {it.medicine2Name}</span><span className="recent-sev">{getSeverityBadge(it.severityLevel)}</span></div><span className="recent-time">ID:{it.interactionId}</span></li>)}</ul></div>
          </div>
        </div>
      )}

      {/* MODALS */}
      {selectedInteractionDetail && (<div className="modal-overlay"><div className="modal-content"><div className="modal-header" style={{borderBottomColor: selectedInteractionDetail.severityColor}}><h2>Chi tiết #{selectedInteractionDetail.interactionId}</h2><button className="close-btn" onClick={()=>setSelectedInteractionDetail(null)}>&times;</button></div><div className="modal-body"><div className="detail-pair-header"><div className="drug-box">{selectedInteractionDetail.medicine1Name}</div><FaExchangeAlt/><div className="drug-box">{selectedInteractionDetail.medicine2Name}</div></div><div className="detail-row"><span className="label">Mức độ:</span>{getSeverityBadge(selectedInteractionDetail.severityLevel)}</div><div className="detail-block"><span className="label">Hậu quả:</span><p>{selectedInteractionDetail.clinicalEffect}</p></div><div className="detail-block"><span className="label">Cơ chế:</span><p>{selectedInteractionDetail.mechanism}</p></div><div className="detail-block management"><span className="label">Xử trí:</span><p>{selectedInteractionDetail.managementRecommendation}</p></div></div></div></div>)}
      {showFormModal && (<div className="modal-overlay"><div className="modal-content large-form"><div className="modal-header"><h2>{isEditing ? 'Cập nhật' : 'Tạo mới'}</h2><button className="close-btn" onClick={()=>setShowFormModal(false)}>&times;</button></div><div className="modal-body form-body"><h4 className="form-section-title">1. Chọn Cặp thuốc</h4><div className="form-row pair-select"><div className="form-group"><label>Thuốc 1 <span className="req">*</span></label><div className="drug-input-group"><input type="text" readOnly value={formData.medicine1Name} placeholder="Chưa chọn"/><button className="btn-pick" onClick={()=>setSearchingFor('MED1')}><FaSearch/></button></div></div><div className="exchange-icon-center"><FaExchangeAlt/></div><div className="form-group"><label>Thuốc 2 <span className="req">*</span></label><div className="drug-input-group"><input type="text" readOnly value={formData.medicine2Name} placeholder="Chưa chọn"/><button className="btn-pick" onClick={()=>setSearchingFor('MED2')}><FaSearch/></button></div></div></div>{searchingFor && (<div className="med-search-popup"><div className="search-header"><h5>Tìm thuốc</h5><button className="close-mini" onClick={()=>setSearchingFor(null)}>&times;</button></div><div className="search-input-row"><input autoFocus placeholder="Nhập tên..." value={medSearchTerm} onChange={e=>setMedSearchTerm(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSearchMedicine()}/><button onClick={handleSearchMedicine}>Tìm</button></div><ul className="search-list">{medSearchResults.map(m=><li key={m.medicineId} onClick={()=>handleSelectMedicine(m)}>{m.medicineName}</li>)}</ul></div>)}<h4 className="form-section-title">2. Thông tin</h4><div className="form-group"><label>Mức độ <span className="req">*</span></label><select value={formData.severityLevel} onChange={e=>setFormData({...formData, severityLevel:e.target.value})}><option value="CONTRAINDICATED">Chống chỉ định</option><option value="MAJOR">Nghiêm trọng</option><option value="MODERATE">Trung bình</option><option value="MINOR">Nhẹ</option></select></div><div className="form-group"><label>Hậu quả</label><textarea rows="2" value={formData.clinicalEffect} onChange={e=>setFormData({...formData, clinicalEffect:e.target.value})}/></div><div className="form-group"><label>Cơ chế</label><textarea rows="2" value={formData.mechanism} onChange={e=>setFormData({...formData, mechanism:e.target.value})}/></div><div className="form-group"><label>Xử trí</label><textarea rows="3" value={formData.management} onChange={e=>setFormData({...formData, management:e.target.value})}/></div><div className="form-group"><label>Mô tả ngắn <span className="req">*</span></label><input type="text" value={formData.description} onChange={e=>setFormData({...formData, description:e.target.value})}/></div><div className="form-actions"><button className="btn-cancel" onClick={()=>setShowFormModal(false)}>Hủy</button><button className="btn-save" onClick={handleSubmit} disabled={loading}><FaSave/> Lưu</button></div></div></div></div>)}
      {showImportModal && (<div className="modal-overlay"><div className="modal-content large-form"><div className="modal-header"><h2>Import JSON</h2><button className="close-btn" onClick={()=>setShowImportModal(false)}>&times;</button></div><div className="modal-body"><textarea rows="10" style={{width:'100%', padding:'10px', border:'1px solid #ddd', borderRadius:'4px', fontFamily:'monospace'}} value={importJson} onChange={e=>setImportJson(e.target.value)} placeholder='[{"medicine1Id": 1, "medicine2Id": 5...}]'/><div className="form-actions"><button className="btn-cancel" onClick={()=>setShowImportModal(false)}>Hủy</button><button className="btn-save" onClick={handleImport} disabled={loading}><FaFileImport/> Import</button></div></div></div></div>)}
      
      {/* MODAL DATA & TRASH (UPDATED FOR JSON STRUCTURE) */}
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
                {/* TAB STATS: HIỂN THỊ THEO CHIỀU DỌC, LABEL SỐ */}
                {dataTab === 'STATS' && softDeleteStats && (
                  <div className="stats-dashboard" style={{gap: '15px'}}>
                    {/* Card Active */}
                    <div className="stat-card active" style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center'}}>
                      <h4>Active (Đang hoạt động)</h4>
                      <h3 style={{fontSize:'36px', margin:'10px 0'}}>{softDeleteStats.active}</h3>
                    </div>

                    {/* Card Deleted */}
                    <div className="stat-card warning" style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center'}}>
                      <h4>Deleted (Đã xóa)</h4>
                      <h3 style={{fontSize:'36px', margin:'10px 0', color:'#fff'}}>{softDeleteStats.deleted}</h3>
                    </div>

                    {/* Card Total */}
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
                      <thead><tr><th>ID</th><th>Cặp thuốc</th><th>Mức độ</th><th>Thao tác</th></tr></thead>
                      <tbody>
                        {paginatedList.map(item => (
                          <tr key={item.interactionId}>
                            <td>{item.interactionId}</td>
                            <td>{item.medicine1Name} + {item.medicine2Name}</td>
                            <td>{getSeverityBadge(item.severityLevel)}</td>
                            <td className="text-center">
                              {dataFilter === 'DELETED' && (
                                <button className="btn-icon" title="Khôi phục" onClick={()=>handleRestore(item.interactionId)}><FaUndo/></button>
                              )}
                            </td>
                          </tr>
                        ))}
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