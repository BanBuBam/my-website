import React from 'react';
import './AboutUsPage.css';
import { FiAward, FiHeart, FiUsers, FiShield, FiTarget, FiTrendingUp } from 'react-icons/fi';

const AboutUsPage = () => {
  const values = [
    {
      icon: <FiHeart />,
      title: 'Tận tâm',
      description: 'Chăm sóc bệnh nhân với sự tận tâm và trách nhiệm cao nhất'
    },
    {
      icon: <FiAward />,
      title: 'Chất lượng',
      description: 'Cam kết cung cấp dịch vụ y tế chất lượng cao theo tiêu chuẩn quốc tế'
    },
    {
      icon: <FiUsers />,
      title: 'Đội ngũ chuyên nghiệp',
      description: 'Đội ngũ y bác sĩ giàu kinh nghiệm, được đào tạo bài bản'
    },
    {
      icon: <FiShield />,
      title: 'An toàn',
      description: 'Đảm bảo an toàn tuyệt đối cho bệnh nhân trong quá trình điều trị'
    }
  ];

  const milestones = [
    { year: '2010', event: 'Thành lập bệnh viện với 100 giường bệnh' },
    { year: '2013', event: 'Mở rộng quy mô lên 200 giường bệnh' },
    { year: '2016', event: 'Đạt chứng nhận ISO 9001:2015' },
    { year: '2019', event: 'Khai trương Trung tâm Tim mạch hiện đại' },
    { year: '2022', event: 'Đạt chuẩn bệnh viện hạng I' },
    { year: '2025', event: 'Phục vụ hơn 500,000 lượt bệnh nhân' }
  ];

  return (
    <div className="about-us-page">
      {/* Header */}
      <div className="page-header">
        <h1>Về chúng tôi</h1>
        <p>Bệnh viện Quốc tế Phú Yên - Đồng hành cùng sức khỏe cộng đồng</p>
      </div>

      {/* Introduction Section */}
      <section className="intro-section">
        <div className="intro-content">
          <h2>Giới thiệu chung</h2>
          <p>
            Bệnh viện Quốc tế Phú Yên được thành lập năm 2010 với sứ mệnh mang đến dịch vụ 
            chăm sóc sức khỏe chất lượng cao cho cộng đồng. Với hơn 15 năm kinh nghiệm, 
            chúng tôi tự hào là một trong những cơ sở y tế hàng đầu tại khu vực.
          </p>
          <p>
            Bệnh viện được trang bị hệ thống thiết bị y tế hiện đại, đội ngũ y bác sĩ 
            giàu kinh nghiệm và cơ sở vật chất đạt tiêu chuẩn quốc tế. Chúng tôi cam kết 
            cung cấp dịch vụ y tế toàn diện, từ khám chữa bệnh, chẩn đoán hình ảnh, 
            xét nghiệm đến điều trị nội trú và phẫu thuật.
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <h2>Giá trị cốt lõi</h2>
        <div className="values-grid">
          {values.map((value, index) => (
            <div key={index} className="value-card">
              <div className="value-icon">{value.icon}</div>
              <h3>{value.title}</h3>
              <p>{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Milestones Section */}
      <section className="milestones-section">
        <h2>Hành trình phát triển</h2>
        <div className="timeline">
          {milestones.map((milestone, index) => (
            <div key={index} className="timeline-item">
              <div className="timeline-year">{milestone.year}</div>
              <div className="timeline-content">
                <p>{milestone.event}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-icon"><FiUsers /></div>
            <div className="stat-number">50+</div>
            <div className="stat-label">Bác sĩ chuyên khoa</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon"><FiAward /></div>
            <div className="stat-number">20+</div>
            <div className="stat-label">Chuyên khoa</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon"><FiTarget /></div>
            <div className="stat-number">300+</div>
            <div className="stat-label">Giường bệnh</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon"><FiTrendingUp /></div>
            <div className="stat-number">500K+</div>
            <div className="stat-label">Bệnh nhân/năm</div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="mission-content">
          <h2>Sứ mệnh của chúng tôi</h2>
          <p>
            Mang đến dịch vụ chăm sóc sức khỏe chất lượng cao, an toàn và hiệu quả 
            cho mọi người dân. Chúng tôi không ngừng nỗ lực để trở thành bệnh viện 
            hàng đầu trong khu vực, nơi bệnh nhân có thể tin tưởng và gửi gắm sức khỏe.
          </p>
          <div className="mission-points">
            <div className="mission-point">
              <FiHeart />
              <span>Chăm sóc bệnh nhân tận tâm</span>
            </div>
            <div className="mission-point">
              <FiAward />
              <span>Chất lượng dịch vụ hàng đầu</span>
            </div>
            <div className="mission-point">
              <FiShield />
              <span>An toàn tuyệt đối</span>
            </div>
            <div className="mission-point">
              <FiUsers />
              <span>Đội ngũ chuyên nghiệp</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUsPage;

