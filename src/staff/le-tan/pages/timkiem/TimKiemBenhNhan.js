import React, { useState } from 'react';
import './TimKiemBenhNhan.css';
import { FiSearch, FiEdit, FiEye, FiInfo, FiArrowLeft } from 'react-icons/fi';

// Dữ liệu mẫu (mock data) - Trong thực tế, bạn sẽ lấy dữ liệu này từ API
const allPatients = [
  { id: 'BN001', name: 'Nguyễn Văn An', phone: '0901234567', cccd: '123456789012', dob: '1985-05-15', lastVisit: '2024-01-10', gender: 'Nam', email: 'vana@email.com', address: 'Số 123, Đường ABC, Quận 1, TP.HCM', 
    emergencyContactName: 'Nguyễn Thị B', emergencyContactPhone: '0901112223', 
    bhyt: 'HS4010012345678', validFrom: '2023-01-01', validTo: '2024-12-31', 
    workplace: 'Công ty Công nghệ ABC', occupation: 'Kỹ sư phần mềm' 
  },
  { id: 'BN003', name: 'Lê Văn Hoàng', phone: '0912345678', cccd: '456789012345', dob: '1978-02-10', lastVisit: '2023-12-05', gender: 'Nam', email: 'hoangvl@email.com', address: 'Số 789, Đường DEF, Quận 5, TP.HCM', 
    emergencyContactName: '', emergencyContactPhone: '', 
    bhyt: '', validFrom: '', validTo: '', 
    workplace: 'Tự kinh doanh', occupation: 'Doanh nhân'
  },
];

// --- COMPONENT CON ĐỂ HIỂN THỊ FORM XEM/SỬA ---
const PatientInfoForm = ({ patient, onBack, isReadOnly }) => {
  const [formData, setFormData] = useState(patient);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    console.log('Updating patient data:', formData);
    alert(`Đã cập nhật thông tin cho bệnh nhân ${formData.name}`);
    onBack();
  };

  const title = isReadOnly ? "Thông tin chi tiết bệnh nhân" : "Cập nhật thông tin bệnh nhân";

  return (
    <div className="card">
      <div className="edit-form-header">
        <h3>{title}</h3>
        <button onClick={onBack} className="back-button"><FiArrowLeft /> Quay lại</button>
      </div>
      <form onSubmit={handleUpdate}>
        {/* Personal Info Section */}
        <div className="form-section">
          <h4>Thông tin cá nhân</h4>
          <div className="form-grid">
            <div className="form-group"><label>Họ và tên *</label><input type="text" name="name" value={formData.name} onChange={handleChange} readOnly={isReadOnly} required /></div>
            <div className="form-group"><label>Số điện thoại *</label><input type="text" name="phone" value={formData.phone} onChange={handleChange} readOnly={isReadOnly} required /></div>
            <div className="form-group"><label>Số CCCD/CMND *</label><input type="text" name="cccd" value={formData.cccd} onChange={handleChange} readOnly={isReadOnly} required /></div>
            <div className="form-group"><label>Ngày sinh *</label><input type="date" name="dob" value={formData.dob} onChange={handleChange} readOnly={isReadOnly} required /></div>
            <div className="form-group"><label>Giới tính *</label><select name="gender" value={formData.gender} onChange={handleChange} disabled={isReadOnly} required><option>Nam</option><option>Nữ</option></select></div>
            <div className="form-group"><label>Email</label><input type="email" name="email" value={formData.email} onChange={handleChange} readOnly={isReadOnly} /></div>
            <div className="form-group full-width"><label>Địa chỉ *</label><input type="text" name="address" value={formData.address} onChange={handleChange} readOnly={isReadOnly} required /></div>
          </div>
        </div>
        
        {/* Emergency Contact Section */}
        <div className="form-section">
            <h4>Thông tin liên hệ khẩn cấp</h4>
            <div className="form-grid">
                <div className="form-group"><label>Người liên hệ khẩn cấp</label><input type="text" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} readOnly={isReadOnly} /></div>
                <div className="form-group"><label>Số điện thoại liên hệ khẩn cấp</label><input type="text" name="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={handleChange} readOnly={isReadOnly} /></div>
            </div>
        </div>

        {/* Health Insurance Section */}
        <div className="form-section">
            <h4>Thông tin bảo hiểm y tế</h4>
            <div className="form-grid">
                <div className="form-group full-width"><label>Số thẻ BHYT</label><input type="text" name="bhyt" value={formData.bhyt} onChange={handleChange} readOnly={isReadOnly} /></div>
                <div className="form-group"><label>Có hiệu lực từ</label><input type="date" name="validFrom" value={formData.validFrom} onChange={handleChange} readOnly={isReadOnly} /></div>
                <div className="form-group"><label>Có hiệu lực đến</label><input type="date" name="validTo" value={formData.validTo} onChange={handleChange} readOnly={isReadOnly} /></div>
            </div>
        </div>
        
        {/* Occupation Section */}
        <div className="form-section">
            <h4>Thông tin nghề nghiệp</h4>
            <div className="form-grid">
                <div className="form-group"><label>Nơi làm việc</label><input type="text" name="workplace" value={formData.workplace} onChange={handleChange} readOnly={isReadOnly} /></div>
                <div className="form-group"><label>Nghề nghiệp</label><input type="text" name="occupation" value={formData.occupation} onChange={handleChange} readOnly={isReadOnly} /></div>
            </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          {isReadOnly ? (
            <button type="button" className="update-btn" onClick={onBack}>Đóng</button>
          ) : (
            <>
              <button type="button" className="cancel-btn" onClick={onBack}>Hủy</button>
              <button type="submit" className="update-btn">Cập nhật</button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};


// --- COMPONENT CHÍNH CỦA TRANG TÌM KIẾM ---
const TimKiemPage = () => {
    const [searchResults, setSearchResults] = useState(null);
    const [viewMode, setViewMode] = useState('search'); 
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // State để quản lý loại tìm kiếm và từ khóa
    const [searchType, setSearchType] = useState('phone'); // Mặc định tìm theo SĐT
    const [searchQuery, setSearchQuery] = useState('');

    // Logic tìm kiếm đã được cập nhật
    const handleSearch = (e) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            const lowerCaseQuery = searchQuery.toLowerCase().trim();
            if (!lowerCaseQuery) {
                setSearchResults([]);
                setIsLoading(false);
                return;
            }

            const results = allPatients.filter(patient => {
                const patientName = patient.name.toLowerCase();
                const patientId = patient.id.toLowerCase();
                
                switch (searchType) {
                    case 'phone':
                        return patient.phone.includes(lowerCaseQuery);
                    case 'name':
                        return patientName.includes(lowerCaseQuery);
                    case 'id':
                        return patientId.includes(lowerCaseQuery);
                    case 'cccd':
                        return patient.cccd.includes(lowerCaseQuery);
                    default:
                        return false;
                }
            });
            setSearchResults(results);
            setIsLoading(false);
        }, 500);
    };
    
    // Các hàm xử lý click (giữ nguyên)
    const handleEditClick = (patient) => { setSelectedPatient(patient); setViewMode('edit'); };
    const handleViewClick = (patient) => { setSelectedPatient(patient); setViewMode('view'); };
    const handleBackToSearch = () => { setSelectedPatient(null); setViewMode('search'); };
  
    return (
      <div className="patient-search-page">
        <div className="page-header">
            <div>
                <h2>Tìm kiếm / Đăng ký Bệnh nhân</h2>
                <p>Quản lý thông tin bệnh nhân và đăng ký mới</p>
            </div>
        </div>
  
        {viewMode === 'search' && (
          <>
            <div className="card">
              <form className="search-form-container" onSubmit={handleSearch}>
                <div className="input-group">
                  <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
                    <option value="phone">Số điện thoại</option>
                    <option value="name">Họ tên</option>
                    <option value="id">Mã BN</option>
                    <option value="cccd">Số CCCD</option>
                  </select>
                  <input 
                    type="text" 
                    placeholder="Nhập thông tin tìm kiếm..." 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                  />
                </div>
                <button type="submit" className="search-button" disabled={isLoading}>
                  <FiSearch />
                  {isLoading ? 'Đang tìm...' : 'Tìm kiếm'}
                </button>
              </form>
            </div>
  
            {searchResults && (
              <div className="card">
                <h4>Kết quả tìm kiếm ({searchResults.length})</h4>
                <div className="results-table">
                  <div className="results-header">
                      <span>Mã BN</span>
                      <span>Họ tên</span>
                      <span>SĐT</span>
                      <span>CCCD</span>
                      <span>Ngày sinh</span>
                      <span>Lần khám cuối</span>
                      <span>Thao tác</span>
                  </div>
                  {searchResults.length > 0 ? (
                    searchResults.map(patient => (
                      <div key={patient.id} className="result-row">
                        <span className="patient-id">{patient.id}</span>
                        <span>{patient.name}</span>
                        <span>{patient.phone}</span>
                        <span>{patient.cccd}</span>
                        <span>{patient.dob}</span>
                        <span>{patient.lastVisit}</span>
                        <span className="action-buttons">
                          <button onClick={() => handleEditClick(patient)} className="action-icon edit"><FiEdit /></button>
                          <button onClick={() => handleViewClick(patient)} className="action-icon view"><FiEye /></button>
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="no-results-message">Không tìm thấy bệnh nhân nào phù hợp.</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
  
        {(viewMode === 'edit' || viewMode === 'view') && (
          <PatientInfoForm 
              patient={selectedPatient} 
              onBack={handleBackToSearch} 
              isReadOnly={viewMode === 'view'} 
          />
        )}
      </div>
    );
};
  
export default TimKiemPage;