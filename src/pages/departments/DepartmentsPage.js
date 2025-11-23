import React, { useState } from 'react';
import './DepartmentsPage.css';
import { 
  FiHeart, 
  FiActivity, 
  FiShield, 
  FiUsers, 
  FiEye,
  FiBriefcase,
  FiCrosshair,
  FiZap,
  FiTrendingUp,
  FiAward,
  FiClock,
  FiPhone
} from 'react-icons/fi';

const DepartmentsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const departments = [
    {
      id: 1,
      name: 'Khoa Tim mạch',
      icon: <FiHeart />,
      category: 'noi',
      description: 'Chuyên khoa điều trị các bệnh lý về tim mạch, huyết áp, mạch máu',
      services: ['Siêu âm tim', 'Điện tâm đồ', 'Holter huyết áp', 'Can thiệp tim mạch'],
      doctors: 8,
      color: '#e53e3e'
    },
    {
      id: 2,
      name: 'Khoa Nội tổng hợp',
      icon: <FiActivity />,
      category: 'noi',
      description: 'Khám và điều trị các bệnh lý nội khoa tổng quát',
      services: ['Khám nội tổng quát', 'Điều trị tiểu đường', 'Bệnh gan', 'Bệnh thận'],
      doctors: 12,
      color: '#0ea5e9'
    },
    {
      id: 3,
      name: 'Khoa Ngoại tổng hợp',
      icon: <FiShield />,
      category: 'ngoai',
      description: 'Phẫu thuật và điều trị các bệnh lý ngoại khoa',
      services: ['Phẫu thuật tổng quát', 'Phẫu thuật nội soi', 'Chấn thương', 'Bỏng'],
      doctors: 10,
      color: '#22c55e'
    },
    {
      id: 4,
      name: 'Khoa Sản - Phụ khoa',
      icon: <FiUsers />,
      category: 'san-phu',
      description: 'Chăm sóc sức khỏe sinh sản và phụ nữ',
      services: ['Khám thai', 'Siêu âm 4D', 'Sinh thường', 'Mổ đẻ', 'Điều trị vô sinh'],
      doctors: 9,
      color: '#a855f7'
    },
    {
      id: 5,
      name: 'Khoa Nhi',
      icon: <FiHeart />,
      category: 'nhi',
      description: 'Chăm sóc sức khỏe toàn diện cho trẻ em',
      services: ['Khám nhi tổng quát', 'Tiêm chủng', 'Dinh dưỡng', 'Bệnh truyền nhiễm'],
      doctors: 11,
      color: '#f97316'
    },
    {
      id: 6,
      name: 'Khoa Mắt',
      icon: <FiEye />,
      category: 'chuyen-khoa',
      description: 'Khám và điều trị các bệnh lý về mắt',
      services: ['Khám mắt tổng quát', 'Phẫu thuật mắt', 'Điều trị cận thị', 'Đục thủy tinh thể'],
      doctors: 6,
      color: '#06b6d4'
    },
    {
      id: 7,
      name: 'Khoa Răng - Hàm - Mặt',
      icon: <FiBriefcase />,
      category: 'chuyen-khoa',
      description: 'Chăm sóc và điều trị răng miệng',
      services: ['Khám răng tổng quát', 'Nhổ răng', 'Trám răng', 'Niềng răng', 'Implant'],
      doctors: 7,
      color: '#8b5cf6'
    },
    {
      id: 8,
      name: 'Khoa Cấp cứu',
      icon: <FiZap />,
      category: 'cap-cuu',
      description: 'Cấp cứu và hồi sức tích cực 24/7',
      services: ['Cấp cứu 24/7', 'Hồi sức cấp cứu', 'Chống độc', 'Cấp cứu ngoại khoa'],
      doctors: 15,
      color: '#dc2626'
    },
    {
      id: 9,
      name: 'Khoa Chẩn đoán hình ảnh',
      icon: <FiCrosshair />,
      category: 'can-lam-sang',
      description: 'Chẩn đoán hình ảnh với thiết bị hiện đại',
      services: ['X-quang', 'CT Scanner', 'MRI', 'Siêu âm', 'Nội soi'],
      doctors: 5,
      color: '#0891b2'
    },
    {
      id: 10,
      name: 'Khoa Xét nghiệm',
      icon: <FiTrendingUp />,
      category: 'can-lam-sang',
      description: 'Xét nghiệm với độ chính xác cao',
      services: ['Xét nghiệm máu', 'Xét nghiệm nước tiểu', 'Vi sinh', 'Hóa sinh', 'Miễn dịch'],
      doctors: 8,
      color: '#059669'
    }
  ];

  const categories = [
    { id: 'all', name: 'Tất cả chuyên khoa' },
    { id: 'noi', name: 'Nội khoa' },
    { id: 'ngoai', name: 'Ngoại khoa' },
    { id: 'san-phu', name: 'Sản - Phụ khoa' },
    { id: 'nhi', name: 'Nhi khoa' },
    { id: 'chuyen-khoa', name: 'Chuyên khoa khác' },
    { id: 'can-lam-sang', name: 'Cận lâm sàng' },
    { id: 'cap-cuu', name: 'Cấp cứu' }
  ];

  const filteredDepartments = selectedCategory === 'all' 
    ? departments 
    : departments.filter(dept => dept.category === selectedCategory);

  return (
    <div className="departments-page">
      {/* Header */}
      <div className="page-header">
        <h1>Chuyên khoa</h1>
        <p>Đội ngũ chuyên gia hàng đầu trong từng lĩnh vực y tế</p>
      </div>

      {/* Stats Section */}
      <section className="dept-stats-section">
        <div className="dept-stats-grid">
          <div className="dept-stat-card">
            <FiAward className="dept-stat-icon" />
            <div className="dept-stat-number">20+</div>
            <div className="dept-stat-label">Chuyên khoa</div>
          </div>
          <div className="dept-stat-card">
            <FiUsers className="dept-stat-icon" />
            <div className="dept-stat-number">50+</div>
            <div className="dept-stat-label">Bác sĩ chuyên khoa</div>
          </div>
          <div className="dept-stat-card">
            <FiClock className="dept-stat-icon" />
            <div className="dept-stat-number">24/7</div>
            <div className="dept-stat-label">Cấp cứu</div>
          </div>
          <div className="dept-stat-card">
            <FiHeart className="dept-stat-icon" />
            <div className="dept-stat-number">500K+</div>
            <div className="dept-stat-label">Bệnh nhân/năm</div>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="filter-section">
        <div className="filter-tabs">
          {categories.map(category => (
            <button
              key={category.id}
              className={`filter-tab ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </section>

      {/* Departments Grid */}
      <section className="departments-grid-section">
        <div className="departments-grid">
          {filteredDepartments.map(dept => (
            <div key={dept.id} className="department-card">
              <div className="department-header">
                <div 
                  className="department-icon-wrapper" 
                  style={{ backgroundColor: `${dept.color}15`, color: dept.color }}
                >
                  {dept.icon}
                </div>
                <h3>{dept.name}</h3>
              </div>
              <p className="department-description">{dept.description}</p>
              <div className="department-services">
                <h4>Dịch vụ:</h4>
                <ul>
                  {dept.services.map((service, index) => (
                    <li key={index}>{service}</li>
                  ))}
                </ul>
              </div>
              <div className="department-footer">
                <div className="department-doctors">
                  <FiUsers />
                  <span>{dept.doctors} bác sĩ</span>
                </div>
                <button className="btn-book">Đặt lịch khám</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="dept-cta-section">
        <div className="dept-cta-content">
          <h2>Cần tư vấn về chuyên khoa?</h2>
          <p>Liên hệ với chúng tôi để được tư vấn và hỗ trợ</p>
          <div className="dept-cta-actions">
            <a href="tel:84043727766" className="btn btn-primary">
              <FiPhone /> Gọi ngay: 84 04 372 766
            </a>
            <a href="/dat-lich-kham" className="btn btn-secondary">
              Đặt lịch khám
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DepartmentsPage;

