import React, { useState, useEffect } from 'react';
import './WorkShiftPage.css';
import { hrWorkShiftAPI } from '../../../../services/staff/hrAPI';
import { FiPlus, FiEdit2, FiTrash2, FiClock, FiX, FiSearch, FiFilter, FiCheckCircle, FiLayers, FiHome, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const WorkShiftPage = () => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchCode, setSearchCode] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);

  // Filter states
  const [filterType, setFilterType] = useState('all');
  const [shiftType, setShiftType] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  // Get current user info from localStorage
  const [currentUserInfo] = useState(() => {
    try {
      const staffUserInfo = localStorage.getItem('staffUserInfo');
      const employeeAccountId = localStorage.getItem('employeeAccountId');

      if (staffUserInfo && employeeAccountId) {
        const userInfo = JSON.parse(staffUserInfo);
        return {
          employeeAccountId: parseInt(employeeAccountId),
          username: userInfo.username || userInfo.sub,
          fullName: userInfo.fullName || userInfo.username,
        };
      }
      return null;
    } catch (e) {
      console.error('Error parsing user info:', e);
      return null;
    }
  });

  const [formData, setFormData] = useState({
    shiftName: '',
    shiftCode: '',
    shiftType: 'MORNING',
    startTime: '',
    endTime: '',
    durationHours: 8,
    breakDurationMinutes: 60,
    departmentId: '',
    requiredStaffCount: 10,
    minimumStaffCount: 8,
    maximumStaffCount: 12,
    priorityLevel: 'MEDIUM',
    isActive: true,
    isWeekendApplicable: false,
    isHolidayApplicable: false,
    overtimeEligible: false,
    description: '',
    specialRequirements: '',
    createdByEmployeeId: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    try {
      setLoading(true);
      setSearchResult(null);
      setSearchCode('');
      const response = await hrWorkShiftAPI.getWorkShifts();
      console.log('Fetch shifts response:', response);

      // Handle different response structures
      if (response.data) {
        // If response.data is an array
        if (Array.isArray(response.data)) {
          setShifts(response.data);
        }
        // If response.data has content property (paginated)
        else if (response.data.content && Array.isArray(response.data.content)) {
          setShifts(response.data.content);
        }
        // If response.data is the shifts object itself
        else {
          setShifts([response.data]);
        }
      } else if (Array.isArray(response)) {
        // If response itself is an array
        setShifts(response);
      } else {
        setShifts([]);
      }
    } catch (err) {
      console.error('Error fetching work shifts:', err);
      setShifts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchByCode = async () => {
    if (!searchCode.trim()) {
      alert('Vui lòng nhập mã ca làm việc');
      return;
    }

    try {
      setSearching(true);
      const response = await hrWorkShiftAPI.getWorkShiftByCode(searchCode.trim());
      console.log('Search by code response:', response);

      if (response.data) {
        setSearchResult(response.data);
        setShifts([response.data]);
      } else {
        alert('Không tìm thấy ca làm việc với mã: ' + searchCode);
        setSearchResult(null);
      }
    } catch (err) {
      console.error('Error searching work shift:', err);
      alert('Không tìm thấy ca làm việc với mã: ' + searchCode);
      setSearchResult(null);
    } finally {
      setSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchCode('');
    setSearchResult(null);
    fetchShifts();
  };

  const handleFilterSearch = async () => {
    try {
      setSearching(true);
      setSearchResult(null);
      setSearchCode('');
      let response;

      switch (filterType) {
        case 'all':
          response = await hrWorkShiftAPI.getWorkShifts();
          break;
        case 'active':
          response = await hrWorkShiftAPI.getActiveWorkShifts();
          break;
        case 'current':
          response = await hrWorkShiftAPI.getCurrentWorkShifts();
          break;
        case 'weekend':
          response = await hrWorkShiftAPI.getWeekendWorkShifts();
          break;
        case 'holiday':
          response = await hrWorkShiftAPI.getHolidayWorkShifts();
          break;
        case 'type':
          if (!shiftType) {
            alert('Vui lòng chọn loại ca làm việc');
            setSearching(false);
            return;
          }
          response = await hrWorkShiftAPI.getWorkShiftsByType(shiftType);
          break;
        case 'department':
          if (!departmentId) {
            alert('Vui lòng nhập ID phòng ban');
            setSearching(false);
            return;
          }
          response = await hrWorkShiftAPI.getWorkShiftsByDepartment(departmentId);
          break;
        default:
          response = await hrWorkShiftAPI.getWorkShifts();
      }

      console.log('Filter search response:', response);

      // Handle different response structures
      if (response.data) {
        if (Array.isArray(response.data)) {
          setShifts(response.data);
        } else if (response.data.content && Array.isArray(response.data.content)) {
          setShifts(response.data.content);
        } else {
          setShifts([response.data]);
        }
      } else if (Array.isArray(response)) {
        setShifts(response);
      } else {
        setShifts([]);
      }

      setSearchResult({ type: filterType, count: shifts.length });
    } catch (err) {
      console.error('Error filtering work shifts:', err);
      alert('Lỗi khi lọc ca làm việc: ' + err.message);
      setShifts([]);
    } finally {
      setSearching(false);
    }
  };

  const handleClearFilter = () => {
    setFilterType('all');
    setShiftType('');
    setDepartmentId('');
    setSearchResult(null);
    fetchShifts();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa ca làm việc này?')) {
      try {
        await hrWorkShiftAPI.deleteWorkShift(id);
        alert('Xóa ca làm việc thành công!');
        fetchShifts();
      } catch (err) {
        alert('Lỗi khi xóa ca làm việc: ' + err.message);
      }
    }
  };

  const handleOpenModal = () => {
    if (!currentUserInfo || !currentUserInfo.employeeAccountId) {
      alert('Không tìm thấy thông tin tài khoản. Vui lòng đăng nhập lại.');
      return;
    }

    setShowModal(true);
    setFormData({
      shiftName: '',
      shiftCode: '',
      shiftType: 'MORNING',
      startTime: '',
      endTime: '',
      durationHours: 8,
      breakDurationMinutes: 60,
      departmentId: '',
      requiredStaffCount: 10,
      minimumStaffCount: 8,
      maximumStaffCount: 12,
      priorityLevel: 'MEDIUM',
      isActive: true,
      isWeekendApplicable: false,
      isHolidayApplicable: false,
      overtimeEligible: false,
      description: '',
      specialRequirements: '',
      createdByEmployeeId: currentUserInfo.employeeAccountId
    });
    setErrors({});
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      shiftName: '',
      shiftCode: '',
      shiftType: 'MORNING',
      startTime: '',
      endTime: '',
      durationHours: 8,
      breakDurationMinutes: 60,
      departmentId: '',
      requiredStaffCount: 10,
      minimumStaffCount: 8,
      maximumStaffCount: 12,
      priorityLevel: 'MEDIUM',
      isActive: true,
      isWeekendApplicable: false,
      isHolidayApplicable: false,
      overtimeEligible: false,
      description: '',
      specialRequirements: '',
      createdByEmployeeId: currentUserInfo?.employeeAccountId || ''
    });
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.shiftName.trim()) {
      newErrors.shiftName = 'Vui lòng nhập tên ca làm việc';
    }
    if (!formData.shiftCode.trim()) {
      newErrors.shiftCode = 'Vui lòng nhập mã ca làm việc';
    }
    if (!formData.startTime) {
      newErrors.startTime = 'Vui lòng chọn giờ bắt đầu';
    }
    if (!formData.endTime) {
      newErrors.endTime = 'Vui lòng chọn giờ kết thúc';
    }
    if (!formData.durationHours || formData.durationHours <= 0) {
      newErrors.durationHours = 'Số giờ làm việc phải lớn hơn 0';
    }
    if (!formData.createdByEmployeeId) {
      newErrors.createdByEmployeeId = 'Không tìm thấy thông tin nhân viên tạo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const submitData = {
        shiftName: formData.shiftName,
        shiftCode: formData.shiftCode,
        shiftType: formData.shiftType,
        startTime: formData.startTime + ':00', // Add seconds
        endTime: formData.endTime + ':00', // Add seconds
        durationHours: parseFloat(formData.durationHours),
        breakDurationMinutes: parseInt(formData.breakDurationMinutes),
        departmentId: formData.departmentId ? parseInt(formData.departmentId) : null,
        requiredStaffCount: parseInt(formData.requiredStaffCount),
        minimumStaffCount: parseInt(formData.minimumStaffCount),
        maximumStaffCount: parseInt(formData.maximumStaffCount),
        priorityLevel: formData.priorityLevel,
        isActive: formData.isActive,
        isWeekendApplicable: formData.isWeekendApplicable,
        isHolidayApplicable: formData.isHolidayApplicable,
        overtimeEligible: formData.overtimeEligible,
        description: formData.description || null,
        specialRequirements: formData.specialRequirements || null,
        createdByEmployeeId: parseInt(formData.createdByEmployeeId)
      };

      console.log('Submitting work shift data:', submitData);

      const response = await hrWorkShiftAPI.createWorkShift(submitData);
      console.log('Create work shift response:', response);

      alert('Tạo ca làm việc thành công!');
      handleCloseModal();
      fetchShifts();
    } catch (err) {
      console.error('Error creating work shift:', err);
      alert('Lỗi khi tạo ca làm việc: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="work-shift-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="work-shift-page">
      <div className="page-header">
        <div>
          <h1>Quản lý Ca làm việc</h1>
          <p className="page-subtitle">Quản lý các ca làm việc trong hệ thống</p>
        </div>
        <button className="btn-primary" onClick={handleOpenModal}>
          <FiPlus /> Thêm Ca làm việc
        </button>
      </div>

      {/* Search by Code Section */}
      <div className="search-section">
        <div className="section-header">
          <h3>Tìm kiếm theo mã ca</h3>
        </div>
        <div className="search-box">
          <input
            type="text"
            placeholder="Nhập mã ca làm việc (VD: MORNING, AFTERNOON, NIGHT...)"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearchByCode()}
            className="search-input"
          />
          <button
            className="btn-search"
            onClick={handleSearchByCode}
            disabled={searching}
          >
            <FiSearch /> {searching ? 'Đang tìm...' : 'Tìm kiếm'}
          </button>
          {(searchResult || searchCode) && (
            <button className="btn-clear" onClick={handleClearSearch}>
              <FiX /> Xóa
            </button>
          )}
        </div>
      </div>

      {/* FILTER SECTION - New design matching InventoryTransactionsPage */}
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: showFilter ? '1.5rem' : 0,
            position: 'relative',
            zIndex: 1,
            cursor: 'pointer'
          }}
          onClick={() => setShowFilter(!showFilter)}
        >
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
                Bộ lọc nâng cao
              </h3>
              <p style={{
                margin: 0,
                fontSize: '0.85rem',
                color: 'rgba(255, 255, 255, 0.9)',
                marginTop: '0.25rem'
              }}>
                Click để {showFilter ? 'thu gọn' : 'mở rộng'} bộ lọc
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Filter Status Badge */}
            {searchResult && searchResult.type && (
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
                <span>Đang lọc ({shifts.length} kết quả)</span>
              </div>
            )}

            {/* Toggle Button */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              padding: '0.5rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {showFilter ? <FiChevronUp size={20} style={{ color: '#fff' }} /> : <FiChevronDown size={20} style={{ color: '#fff' }} />}
            </div>
          </div>
        </div>

        {/* Filter Content Card */}
        {showFilter && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            position: 'relative',
            zIndex: 1
          }}>
            {/* Filter Options Section */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem',
                paddingBottom: '0.75rem',
                borderBottom: '2px solid #f0f0f0'
              }}>
                <FiLayers size={18} style={{ color: '#667eea' }} />
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#2d3748' }}>
                  Tùy chọn lọc
                </h4>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: filterType === 'type' || filterType === 'department' ? 'repeat(2, 1fr)' : '1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#4a5568' }}>
                    <FiSearch size={14} style={{ color: '#667eea' }} />
                    Loại tìm kiếm <span style={{ color: '#e53e3e' }}>*</span>
                  </label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '2px solid #e2e8f0',
                      borderRadius: '10px',
                      fontSize: '0.95rem',
                      backgroundColor: '#fff',
                      cursor: 'pointer',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="all">Tất cả ca làm việc</option>
                    <option value="active">Ca đang hoạt động</option>
                    <option value="current">Ca hiện tại</option>
                    <option value="weekend">Ca cuối tuần</option>
                    <option value="holiday">Ca ngày lễ</option>
                    <option value="type">Theo loại ca</option>
                    <option value="department">Theo phòng ban</option>
                  </select>
                </div>

                {filterType === 'type' && (
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#4a5568' }}>
                      <FiClock size={14} style={{ color: '#667eea' }} />
                      Loại ca làm việc <span style={{ color: '#e53e3e' }}>*</span>
                    </label>
                    <select
                      value={shiftType}
                      onChange={(e) => setShiftType(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: '2px solid #e2e8f0',
                        borderRadius: '10px',
                        fontSize: '0.95rem',
                        backgroundColor: '#fff',
                        cursor: 'pointer',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="">-- Chọn loại ca --</option>
                      <option value="MORNING_SHIFT">Ca sáng</option>
                      <option value="AFTERNOON_SHIFT">Ca chiều</option>
                      <option value="EVENING_SHIFT">Ca tối</option>
                      <option value="NIGHT_SHIFT">Ca đêm</option>
                      <option value="FULL_DAY">Ca cả ngày</option>
                      <option value="FLEXIBLE">Ca linh hoạt</option>
                      <option value="ON_CALL">Ca trực</option>
                    </select>
                  </div>
                )}

                {filterType === 'department' && (
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#4a5568' }}>
                      <FiHome size={14} style={{ color: '#667eea' }} />
                      ID Phòng ban <span style={{ color: '#e53e3e' }}>*</span>
                    </label>
                    <input
                      type="number"
                      value={departmentId}
                      onChange={(e) => setDepartmentId(e.target.value)}
                      placeholder="Nhập ID phòng ban"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: '2px solid #e2e8f0',
                        borderRadius: '10px',
                        fontSize: '0.95rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem',
              paddingTop: '1rem',
              borderTop: '2px solid #f0f0f0'
            }}>
              <button
                onClick={handleFilterSearch}
                disabled={searching}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: searching ? 'not-allowed' : 'pointer',
                  opacity: searching ? 0.7 : 1,
                  transition: 'all 0.2s ease'
                }}
              >
                <FiSearch size={16} />
                {searching ? 'Đang lọc...' : 'Áp dụng bộ lọc'}
              </button>
              <button
                onClick={handleClearFilter}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: '#fff',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  color: '#4a5568',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <FiX size={16} />
                Xóa bộ lọc
              </button>
            </div>

            {/* Filter Result Info */}
            {searchResult && searchResult.type && (
              <div style={{
                marginTop: '1rem',
                padding: '0.75rem 1rem',
                background: '#f0f9ff',
                borderRadius: '10px',
                border: '1px solid #bee3f8',
                textAlign: 'center'
              }}>
                <span style={{ color: '#2b6cb0', fontSize: '0.9rem' }}>
                  Đang hiển thị: <strong>
                    {filterType === 'all' && 'Tất cả ca làm việc'}
                    {filterType === 'active' && 'Ca đang hoạt động'}
                    {filterType === 'current' && 'Ca hiện tại'}
                    {filterType === 'weekend' && 'Ca cuối tuần'}
                    {filterType === 'holiday' && 'Ca ngày lễ'}
                    {filterType === 'type' && `Ca loại ${shiftType}`}
                    {filterType === 'department' && `Ca phòng ban ${departmentId}`}
                  </strong> ({shifts.length} kết quả)
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="shift-cards">
        {shifts.length > 0 ? (
          shifts.map((shift) => (
            <div key={shift.shiftId} className="shift-card">
              <div className="shift-icon">
                <FiClock />
              </div>
              <div className="shift-info">
                <h3>{shift.shiftName || 'N/A'}</h3>
                <p className="shift-time">
                  {shift.startTime || 'N/A'} - {shift.endTime || 'N/A'}
                </p>
                <p className="shift-description">
                  <strong>Mã:</strong> {shift.shiftCode || 'N/A'} | <strong>Loại:</strong> {shift.shiftType || 'N/A'}
                </p>
                <p className="shift-description">{shift.description || 'Không có mô tả'}</p>
              </div>
              <div className="shift-actions">
                <button className="btn-icon btn-edit" title="Chỉnh sửa">
                  <FiEdit2 />
                </button>
                <button
                  className="btn-icon btn-delete"
                  onClick={() => handleDelete(shift.shiftId)}
                  title="Xóa"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-data-card">
            <p>Chưa có ca làm việc nào</p>
          </div>
        )}
      </div>

      <div className="table-container">
        <h3>Chi tiết Ca làm việc ({shifts.length})</h3>
        <table className="shift-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên ca</th>
              <th>Mã ca</th>
              <th>Loại ca</th>
              <th>Giờ bắt đầu</th>
              <th>Giờ kết thúc</th>
              <th>Số giờ</th>
              <th>Nghỉ giải lao</th>
              <th>Yêu cầu NV</th>
              <th>Ưu tiên</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {shifts.length > 0 ? (
              shifts.map((shift) => (
                <tr key={shift.shiftId}>
                  <td>{shift.shiftId}</td>
                  <td><strong>{shift.shiftName || 'N/A'}</strong></td>
                  <td><code>{shift.shiftCode || 'N/A'}</code></td>
                  <td>{shift.shiftType || 'N/A'}</td>
                  <td>{shift.startTime || 'N/A'}</td>
                  <td>{shift.endTime || 'N/A'}</td>
                  <td>{shift.durationHours || 0}h</td>
                  <td>{shift.breakDurationMinutes || 0} phút</td>
                  <td>
                    {shift.requiredStaffCount || 0}
                    {shift.minimumStaffCount && ` (min: ${shift.minimumStaffCount})`}
                  </td>
                  <td>
                    <span className={`priority-badge priority-${(shift.priorityLevel || 'NORMAL').toLowerCase()}`}>
                      {shift.priorityLevel || 'NORMAL'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${shift.isActive ? 'active' : 'inactive'}`}>
                      {shift.isActive ? 'Hoạt động' : 'Ngừng'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon btn-edit" title="Chỉnh sửa">
                        <FiEdit2 />
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleDelete(shift.shiftId)}
                        title="Xóa"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="12" className="no-data">
                  Chưa có ca làm việc nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Thêm Ca làm việc */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Thêm Ca làm việc mới</h2>
              <button className="btn-close" onClick={handleCloseModal}>
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-body">
              {/* Thông tin cơ bản */}
              <div className="form-section">
                <h3 className="section-title">Thông tin cơ bản</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label>Tên ca làm việc <span className="required">*</span></label>
                    <input
                      type="text"
                      name="shiftName"
                      value={formData.shiftName}
                      onChange={handleInputChange}
                      placeholder="Ví dụ: Ca sáng"
                    />
                    {errors.shiftName && <span className="error-text">{errors.shiftName}</span>}
                  </div>

                  <div className="form-group">
                    <label>Mã ca làm việc <span className="required">*</span></label>
                    <input
                      type="text"
                      name="shiftCode"
                      value={formData.shiftCode}
                      onChange={handleInputChange}
                      placeholder="Ví dụ: MORNING_01"
                    />
                    {errors.shiftCode && <span className="error-text">{errors.shiftCode}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Loại ca làm việc</label>
                    <select
                      name="shiftType"
                      value={formData.shiftType}
                      onChange={handleInputChange}
                    >
                      <option value="MORNING">Ca sáng (MORNING)</option>
                      <option value="AFTERNOON">Ca chiều (AFTERNOON)</option>
                      <option value="EVENING">Ca tối (EVENING)</option>
                      <option value="NIGHT">Ca đêm (NIGHT)</option>
                      <option value="FULL_DAY">Cả ngày (FULL_DAY)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Mức độ ưu tiên</label>
                    <select
                      name="priorityLevel"
                      value={formData.priorityLevel}
                      onChange={handleInputChange}
                    >
                      <option value="LOW">Thấp (LOW)</option>
                      <option value="MEDIUM">Trung bình (MEDIUM)</option>
                      <option value="HIGH">Cao (HIGH)</option>
                      <option value="URGENT">Khẩn cấp (URGENT)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Thời gian làm việc */}
              <div className="form-section">
                <h3 className="section-title">Thời gian làm việc</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label>Giờ bắt đầu <span className="required">*</span></label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                    />
                    {errors.startTime && <span className="error-text">{errors.startTime}</span>}
                  </div>

                  <div className="form-group">
                    <label>Giờ kết thúc <span className="required">*</span></label>
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                    />
                    {errors.endTime && <span className="error-text">{errors.endTime}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Số giờ làm việc <span className="required">*</span></label>
                    <input
                      type="number"
                      name="durationHours"
                      value={formData.durationHours}
                      onChange={handleInputChange}
                      min="1"
                      max="24"
                      step="0.5"
                    />
                    {errors.durationHours && <span className="error-text">{errors.durationHours}</span>}
                  </div>

                  <div className="form-group">
                    <label>Thời gian nghỉ giải lao (phút)</label>
                    <input
                      type="number"
                      name="breakDurationMinutes"
                      value={formData.breakDurationMinutes}
                      onChange={handleInputChange}
                      min="0"
                      max="120"
                    />
                  </div>
                </div>
              </div>

              {/* Yêu cầu nhân sự */}
              <div className="form-section">
                <h3 className="section-title">Yêu cầu nhân sự</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label>Số lượng nhân viên yêu cầu</label>
                    <input
                      type="number"
                      name="requiredStaffCount"
                      value={formData.requiredStaffCount}
                      onChange={handleInputChange}
                      min="1"
                    />
                  </div>

                  <div className="form-group">
                    <label>Số lượng tối thiểu</label>
                    <input
                      type="number"
                      name="minimumStaffCount"
                      value={formData.minimumStaffCount}
                      onChange={handleInputChange}
                      min="1"
                    />
                  </div>

                  <div className="form-group">
                    <label>Số lượng tối đa</label>
                    <input
                      type="number"
                      name="maximumStaffCount"
                      value={formData.maximumStaffCount}
                      onChange={handleInputChange}
                      min="1"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>ID Phòng ban (tùy chọn)</label>
                    <input
                      type="number"
                      name="departmentId"
                      value={formData.departmentId}
                      onChange={handleInputChange}
                      placeholder="Nhập ID phòng ban"
                    />
                  </div>
                </div>

                {/* Thông tin người tạo */}
                <div className="form-group" style={{
                  backgroundColor: '#f8f9fa',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid #dee2e6'
                }}>
                  <label style={{ marginBottom: '0.5rem', display: 'block' }}>
                    Thông tin người tạo
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <strong>Tài khoản:</strong>
                      <span>{currentUserInfo?.username || 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <strong>Họ tên:</strong>
                      <span>{currentUserInfo?.fullName || 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <strong>ID Nhân viên:</strong>
                      <span>{currentUserInfo?.employeeAccountId || 'N/A'}</span>
                    </div>
                  </div>
                  <input
                    type="hidden"
                    name="createdByEmployeeId"
                    value={formData.createdByEmployeeId}
                  />
                  {errors.createdByEmployeeId && (
                    <span className="error-text" style={{ display: 'block', marginTop: '0.5rem' }}>
                      {errors.createdByEmployeeId}
                    </span>
                  )}
                </div>
              </div>

              {/* Cài đặt bổ sung */}
              <div className="form-section">
                <h3 className="section-title">Cài đặt bổ sung</h3>

                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                    />
                    <span>Kích hoạt ca làm việc</span>
                  </label>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isWeekendApplicable"
                      checked={formData.isWeekendApplicable}
                      onChange={handleInputChange}
                    />
                    <span>Áp dụng cho cuối tuần</span>
                  </label>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isHolidayApplicable"
                      checked={formData.isHolidayApplicable}
                      onChange={handleInputChange}
                    />
                    <span>Áp dụng cho ngày lễ</span>
                  </label>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="overtimeEligible"
                      checked={formData.overtimeEligible}
                      onChange={handleInputChange}
                    />
                    <span>Được tính tăng ca</span>
                  </label>
                </div>
              </div>

              {/* Mô tả */}
              <div className="form-section">
                <h3 className="section-title">Mô tả & Yêu cầu đặc biệt</h3>

                <div className="form-group">
                  <label>Mô tả ca làm việc</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Mô tả chi tiết về ca làm việc..."
                  />
                </div>

                <div className="form-group">
                  <label>Yêu cầu đặc biệt</label>
                  <textarea
                    name="specialRequirements"
                    value={formData.specialRequirements}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Các yêu cầu đặc biệt về nhân sự, kỹ năng..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCloseModal}
                  disabled={submitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Đang tạo...' : 'Tạo Ca làm việc'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkShiftPage;

