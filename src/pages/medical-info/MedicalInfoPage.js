import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientAuthAPI } from '../../services/api';
import './MedicalInfoPage.css';

const MedicalInfoPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [medicalInfo, setMedicalInfo] = useState(null);

  // Lấy thông tin y tế khi component mount
  useEffect(() => {
    const fetchMedicalInfo = async () => {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        setError('Bạn cần đăng nhập để xem thông tin');
        setLoading(false);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return;
      }

      setLoading(true);
      setError('');
      
      try {
        console.log('Calling getMedicalInfo API...');
        const response = await patientAuthAPI.getMedicalInfo();
        console.log('Medical info response:', response);

        if (response && response.data) {
          setMedicalInfo(response.data);
        } else {
          setError('Không nhận được dữ liệu từ server');
        }
      } catch (error) {
        console.error('Lỗi lấy thông tin y tế:', error);
        
        if (error.message === 'Failed to fetch') {
          setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
        } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          setTimeout(() => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            navigate('/login');
          }, 2000);
        } else {
          setError(error.message || 'Không thể lấy thông tin. Vui lòng thử lại.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMedicalInfo();
  }, [navigate]);

  if (loading) {
    return (
      <div className="medical-info-container">
        <div className="medical-info-content">
          <div className="loading-message">Đang tải thông tin y tế...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="medical-info-container">
      <div className="medical-info-content">
        {/* Tiêu đề */}
        <div className="header-section">
          <h1>Thông tin y tế</h1>
          <p>Xem thông tin y tế của bạn</p>
          {medicalInfo && medicalInfo.patientCode && (
            <p className="patient-code">Mã bệnh nhân: <strong>{medicalInfo.patientCode}</strong></p>
          )}
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {medicalInfo && (
          <div className="medical-info-grid">
            {/* Nhóm máu */}
            <div className="info-card">
              <div className="info-label">Nhóm máu</div>
              <div className="info-value">
                {medicalInfo.bloodType || <span className="no-data">Chưa cập nhật</span>}
              </div>
            </div>

            {/* Dị ứng */}
            <div className="info-card full-width">
              <div className="info-label">Dị ứng</div>
              <div className="info-value">
                {medicalInfo.allergies || <span className="no-data">Không có</span>}
              </div>
            </div>

            {/* Nghề nghiệp */}
            <div className="info-card">
              <div className="info-label">Nghề nghiệp</div>
              <div className="info-value">
                {medicalInfo.occupation || <span className="no-data">Chưa cập nhật</span>}
              </div>
            </div>

            {/* Tình trạng hôn nhân */}
            <div className="info-card">
              <div className="info-label">Tình trạng hôn nhân</div>
              <div className="info-value">
                {medicalInfo.maritalStatus ? (
                  medicalInfo.maritalStatus === 'Single' ? 'Độc thân' :
                  medicalInfo.maritalStatus === 'Married' ? 'Đã kết hôn' :
                  medicalInfo.maritalStatus === 'Divorced' ? 'Ly hôn' :
                  medicalInfo.maritalStatus === 'Widowed' ? 'Góa' :
                  medicalInfo.maritalStatus
                ) : <span className="no-data">Chưa cập nhật</span>}
              </div>
            </div>
          </div>
        )}

        {/* Nút quay lại */}
        <div className="action-section">
          <button 
            className="back-btn" 
            onClick={() => navigate('/cap-nhat-thong-tin')}
          >
            Cập nhật thông tin
          </button>
          <button 
            className="home-btn" 
            onClick={() => navigate('/')}
          >
            Quay lại trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};

export default MedicalInfoPage;

