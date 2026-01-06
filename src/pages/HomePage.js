import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';
import {
  FiCalendar,
  FiUsers,
  FiActivity,
  FiHeart,
  FiShield,
  FiAward,
  FiClock,
  FiPhone,
  FiMapPin
} from 'react-icons/fi';

const HomePage = () => {
  const services = [
    {
      icon: <FiCalendar />,
      title: 'Đặt lịch khám',
      description: 'Đặt lịch khám bệnh trực tuyến nhanh chóng, tiện lợi',
      link: '/dat-lich-kham',
      color: '#0ea5e9'
    },
    {
      icon: <FiUsers />,
      title: 'Đội ngũ bác sĩ',
      description: 'Đội ngũ bác sĩ giàu kinh nghiệm, tận tâm',
      link: '/chuyen-gia',
      color: '#22c55e'
    },
    {
      icon: <FiActivity />,
      title: 'Khám sức khỏe',
      description: 'Gói khám sức khỏe tổng quát toàn diện',
      link: '/goi-kham',
      color: '#f97316'
    },
    {
      icon: <FiHeart />,
      title: 'Chăm sóc tận tâm',
      description: 'Dịch vụ chăm sóc bệnh nhân chu đáo, tận tình',
      link: '/dich-vu',
      color: '#a855f7'
    }
  ];

  const departments = [
    { name: 'Khoa Tim mạch', patients: '500+', icon: <FiHeart /> },
    { name: 'Khoa Nội tổng hợp', patients: '800+', icon: <FiActivity /> },
    { name: 'Khoa Ngoại tổng hợp', patients: '600+', icon: <FiShield /> },
    { name: 'Khoa Sản - Phụ khoa', patients: '700+', icon: <FiUsers /> },
    { name: 'Khoa Nhi', patients: '900+', icon: <FiHeart /> },
    { name: 'Khoa Cấp cứu', patients: '1000+', icon: <FiActivity /> }
  ];

  const stats = [
    { number: '15+', label: 'Năm kinh nghiệm', icon: <FiAward /> },
    { number: '50+', label: 'Bác sĩ chuyên khoa', icon: <FiUsers /> },
    { number: '20+', label: 'Chuyên khoa', icon: <FiActivity /> },
    { number: '24/7', label: 'Cấp cứu', icon: <FiClock /> }
  ];

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Bệnh viện TrinityCare</h1>
          <p className="hero-subtitle">
            Chăm sóc sức khỏe toàn diện với đội ngũ y bác sĩ giàu kinh nghiệm
          </p>
          <p className="hero-description">
            Chúng tôi cam kết mang đến dịch vụ y tế chất lượng cao,
            trang thiết bị hiện đại và môi trường chăm sóc tận tâm
          </p>
          <div className="hero-actions">
            <Link to="/dat-lich-kham" className="btn btn-primary">
              <FiCalendar /> Đặt lịch khám ngay
            </Link>
            <Link to="/chuyen-khoa" className="btn btn-secondary">
              Xem chuyên khoa
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-number">{stat.number}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <div className="section-header">
          <h2>Dịch vụ của chúng tôi</h2>
          <p>Cung cấp đa dạng dịch vụ y tế chất lượng cao</p>
        </div>
        <div className="services-grid">
          {services.map((service, index) => (
            <Link to={service.link} key={index} className="service-card">
              <div className="service-icon" style={{ backgroundColor: `${service.color}15`, color: service.color }}>
                {service.icon}
              </div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Departments Section */}
      <section className="departments-section">
        <div className="section-header">
          <h2>Chuyên khoa nổi bật</h2>
          <p>Đội ngũ chuyên gia hàng đầu trong từng lĩnh vực</p>
        </div>
        <div className="departments-grid">
          {departments.map((dept, index) => (
            <div key={index} className="department-card">
              <div className="department-icon">{dept.icon}</div>
              <h3>{dept.name}</h3>
              <p className="department-patients">{dept.patients} bệnh nhân/năm</p>
            </div>
          ))}
        </div>
        <div className="section-footer">
          <Link to="/chuyen-khoa" className="btn btn-outline">
            Xem tất cả chuyên khoa
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 style={{color: "white"}}>Cần hỗ trợ y tế?</h2>
          <p>Đội ngũ của chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7</p>
          <div className="cta-info">
            <div className="cta-item">
              <FiPhone />
              <div>
                <span>Hotline</span>
                <strong>0393348819</strong>
              </div>
            </div>
            <div className="cta-item">
              <FiMapPin />
              <div>
                <span>Địa chỉ</span>
                <strong>Số 10, Trần Phú, Hà Nội</strong>
              </div>
            </div>
          </div>
          <Link to="/dat-lich-kham" className="btn btn-primary-large">
            Đặt lịch khám ngay
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;