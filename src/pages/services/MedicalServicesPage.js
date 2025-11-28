import React from 'react';
import './MedicalServicesPage.css';
import { FiActivity, FiHeart, FiEye, FiUsers, FiClock, FiCheckCircle, FiPhone } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const MedicalServicesPage = () => {
  const services = [
    {
      id: 1,
      icon: <FiActivity />,
      title: 'Khám tổng quát',
      description: 'Khám sức khỏe định kỳ, tầm soát bệnh lý toàn diện',
      features: [
        'Khám lâm sàng tổng quát',
        'Xét nghiệm máu, nước tiểu cơ bản',
        'Chẩn đoán hình ảnh (X-quang, siêu âm)',
        'Tư vấn sức khỏe cá nhân hóa'
      ],
      color: '#3b82f6'
    },
    {
      id: 2,
      icon: <FiHeart />,
      title: 'Khám chuyên khoa',
      description: 'Dịch vụ khám và điều trị chuyên sâu theo từng chuyên khoa',
      features: [
        'Tim mạch - Hô hấp',
        'Tiêu hóa - Gan mật',
        'Thần kinh - Cơ xương khớp',
        'Nội tiết - Chuyển hóa'
      ],
      color: '#ef4444'
    },
    {
      id: 3,
      icon: <FiEye />,
      title: 'Chẩn đoán hình ảnh',
      description: 'Trang thiết bị hiện đại, kết quả chính xác',
      features: [
        'X-quang kỹ thuật số',
        'Siêu âm 4D',
        'CT Scanner 128 lát cắt',
        'MRI 1.5 Tesla'
      ],
      color: '#8b5cf6'
    },
    {
      id: 4,
      icon: <FiUsers />,
      title: 'Xét nghiệm',
      description: 'Phòng xét nghiệm đạt chuẩn quốc tế',
      features: [
        'Xét nghiệm sinh hóa',
        'Xét nghiệm huyết học',
        'Xét nghiệm vi sinh',
        'Xét nghiệm miễn dịch'
      ],
      color: '#22c55e'
    },
    {
      id: 5,
      icon: <FiClock />,
      title: 'Cấp cứu 24/7',
      description: 'Sẵn sàng tiếp nhận và xử lý các ca cấp cứu',
      features: [
        'Đội ngũ bác sĩ trực 24/7',
        'Trang thiết bị cấp cứu hiện đại',
        'Xe cứu thương chuyên dụng',
        'Phòng hồi sức tích cực'
      ],
      color: '#f97316'
    },
    {
      id: 6,
      icon: <FiCheckCircle />,
      title: 'Nội trú',
      description: 'Chăm sóc toàn diện cho bệnh nhân nội trú',
      features: [
        'Phòng bệnh tiện nghi',
        'Chăm sóc 24/7',
        'Dinh dưỡng cá nhân hóa',
        'Theo dõi sức khỏe liên tục'
      ],
      color: '#06b6d4'
    }
  ];

  const packages = [
    {
      name: 'Gói khám cơ bản',
      price: '1.500.000đ',
      features: [
        'Khám lâm sàng',
        'Xét nghiệm máu cơ bản',
        'X-quang phổi',
        'Siêu âm bụng tổng quát'
      ]
    },
    {
      name: 'Gói khám nâng cao',
      price: '3.500.000đ',
      features: [
        'Tất cả dịch vụ gói cơ bản',
        'Xét nghiệm chuyên sâu',
        'Siêu âm tim',
        'Điện tâm đồ',
        'Tư vấn dinh dưỡng'
      ],
      highlight: true
    },
    {
      name: 'Gói khám VIP',
      price: '7.000.000đ',
      features: [
        'Tất cả dịch vụ gói nâng cao',
        'CT Scanner',
        'MRI não',
        'Nội soi dạ dày',
        'Tư vấn bác sĩ chuyên khoa'
      ]
    }
  ];

  return (
    <div className="medical-services-page">
      {/* Hero Section */}
      <section className="services-hero">
        <div className="hero-content">
          <h1>Dịch vụ y khoa</h1>
          <p>Cung cấp đa dạng dịch vụ y tế chất lượng cao với đội ngũ bác sĩ chuyên môn và trang thiết bị hiện đại</p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="services-grid-section">
        <div className="section-header">
          <h2>Các dịch vụ của chúng tôi</h2>
          <p>Đáp ứng mọi nhu cầu chăm sóc sức khỏe của bạn</p>
        </div>
        <div className="services-grid">
          {services.map((service) => (
            <div key={service.id} className="service-card">
              <div className="service-icon" style={{ backgroundColor: `${service.color}15`, color: service.color }}>
                {service.icon}
              </div>
              <h3>{service.title}</h3>
              <p className="service-description">{service.description}</p>
              <ul className="service-features">
                {service.features.map((feature, index) => (
                  <li key={index}>
                    <FiCheckCircle style={{ color: service.color }} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Packages Section */}
      <section className="packages-section">
        <div className="section-header">
          <h2>Gói khám sức khỏe</h2>
          <p>Lựa chọn gói khám phù hợp với nhu cầu của bạn</p>
        </div>
        <div className="packages-grid">
          {packages.map((pkg, index) => (
            <div key={index} className={`package-card ${pkg.highlight ? 'highlight' : ''}`}>
              {pkg.highlight && <div className="badge">Phổ biến</div>}
              <h3>{pkg.name}</h3>
              <div className="package-price">{pkg.price}</div>
              <ul className="package-features">
                {pkg.features.map((feature, idx) => (
                  <li key={idx}>
                    <FiCheckCircle />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link to="/dat-lich-kham" className="btn-book-package">
                Đặt lịch ngay
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="why-choose-section">
        <div className="section-header">
          <h2>Tại sao chọn chúng tôi?</h2>
        </div>
        <div className="why-choose-grid">
          <div className="why-item">
            <div className="why-icon">
              <FiUsers />
            </div>
            <h3>Đội ngũ chuyên môn</h3>
            <p>Bác sĩ giàu kinh nghiệm, được đào tạo bài bản</p>
          </div>
          <div className="why-item">
            <div className="why-icon">
              <FiActivity />
            </div>
            <h3>Trang thiết bị hiện đại</h3>
            <p>Công nghệ y tế tiên tiến, đạt chuẩn quốc tế</p>
          </div>
          <div className="why-item">
            <div className="why-icon">
              <FiHeart />
            </div>
            <h3>Chăm sóc tận tâm</h3>
            <p>Đặt sức khỏe bệnh nhân lên hàng đầu</p>
          </div>
          <div className="why-item">
            <div className="why-icon">
              <FiClock />
            </div>
            <h3>Phục vụ 24/7</h3>
            <p>Luôn sẵn sàng hỗ trợ mọi lúc mọi nơi</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="services-cta-section">
        <div className="cta-content">
          <h2>Cần tư vấn về dịch vụ?</h2>
          <p>Liên hệ với chúng tôi để được tư vấn chi tiết</p>
          <div className="cta-actions">
            <a href="tel:0248345555" className="btn btn-primary">
              <FiPhone /> Gọi ngay: 024 8345 555
            </a>
            <Link to="/dat-lich-kham" className="btn btn-secondary">
              Đặt lịch khám
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MedicalServicesPage;

