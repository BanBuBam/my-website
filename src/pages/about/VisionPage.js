import React from 'react';
import './VisionPage.css';
import { 
  FiTarget, 
  FiTrendingUp, 
  FiGlobe, 
  FiAward, 
  FiHeart,
  FiUsers,
  FiShield,
  FiStar
} from 'react-icons/fi';

const VisionPage = () => {
  const visionPoints = [
    {
      icon: <FiGlobe />,
      title: 'Tầm nhìn toàn cầu',
      description: 'Trở thành bệnh viện hàng đầu khu vực với tiêu chuẩn quốc tế'
    },
    {
      icon: <FiAward />,
      title: 'Chất lượng vượt trội',
      description: 'Cung cấp dịch vụ y tế chất lượng cao nhất cho cộng đồng'
    },
    {
      icon: <FiUsers />,
      title: 'Đội ngũ xuất sắc',
      description: 'Xây dựng đội ngũ y bác sĩ chuyên nghiệp, tận tâm'
    },
    {
      icon: <FiTrendingUp />,
      title: 'Phát triển bền vững',
      description: 'Không ngừng đổi mới và phát triển công nghệ y tế'
    }
  ];

  const strategicGoals = [
    {
      icon: <FiTarget />,
      title: 'Mục tiêu 2025',
      goals: [
        'Đạt chuẩn bệnh viện hạng đặc biệt',
        'Mở rộng quy mô lên 500 giường bệnh',
        'Phục vụ 1 triệu lượt bệnh nhân/năm'
      ]
    },
    {
      icon: <FiStar />,
      title: 'Mục tiêu 2030',
      goals: [
        'Trở thành trung tâm y tế hàng đầu khu vực',
        'Hợp tác với các bệnh viện quốc tế',
        'Đào tạo nguồn nhân lực y tế chất lượng cao'
      ]
    }
  ];

  const coreValues = [
    {
      icon: <FiHeart />,
      title: 'Tận tâm',
      description: 'Đặt lợi ích bệnh nhân lên hàng đầu'
    },
    {
      icon: <FiShield />,
      title: 'An toàn',
      description: 'Cam kết an toàn tuyệt đối trong điều trị'
    },
    {
      icon: <FiAward />,
      title: 'Chuyên nghiệp',
      description: 'Duy trì tiêu chuẩn chuyên môn cao nhất'
    },
    {
      icon: <FiUsers />,
      title: 'Nhân văn',
      description: 'Chăm sóc toàn diện cả thể chất và tinh thần'
    }
  ];

  return (
    <div className="vision-page">
      {/* Header */}
      <div className="page-header">
        <h1>Tầm nhìn & Sứ mệnh</h1>
        <p>Định hướng phát triển bền vững của Bệnh viện Quốc tế Phú Yên</p>
      </div>

      {/* Vision Statement */}
      <section className="vision-statement">
        <div className="vision-hero">
          <FiTarget className="vision-hero-icon" />
          <h2>Tầm nhìn</h2>
          <p className="vision-text">
            "Trở thành bệnh viện hàng đầu tại Việt Nam, cung cấp dịch vụ y tế 
            chất lượng quốc tế, là địa chỉ tin cậy cho sức khỏe cộng đồng"
          </p>
        </div>
      </section>

      {/* Vision Points */}
      <section className="vision-points-section">
        <h2>Định hướng phát triển</h2>
        <div className="vision-points-grid">
          {visionPoints.map((point, index) => (
            <div key={index} className="vision-point-card">
              <div className="vision-point-icon">{point.icon}</div>
              <h3>{point.title}</h3>
              <p>{point.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Strategic Goals */}
      <section className="strategic-goals-section">
        <h2>Mục tiêu chiến lược</h2>
        <div className="goals-grid">
          {strategicGoals.map((goal, index) => (
            <div key={index} className="goal-card">
              <div className="goal-header">
                <div className="goal-icon">{goal.icon}</div>
                <h3>{goal.title}</h3>
              </div>
              <ul className="goal-list">
                {goal.goals.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Core Values */}
      <section className="core-values-section">
        <h2>Giá trị cốt lõi</h2>
        <div className="core-values-grid">
          {coreValues.map((value, index) => (
            <div key={index} className="core-value-card">
              <div className="core-value-icon">{value.icon}</div>
              <h3>{value.title}</h3>
              <p>{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission Statement */}
      <section className="mission-statement">
        <div className="mission-content">
          <h2>Sứ mệnh</h2>
          <div className="mission-text">
            <p>
              Cung cấp dịch vụ chăm sóc sức khỏe toàn diện, chất lượng cao với 
              sự tận tâm và chuyên nghiệp. Chúng tôi cam kết:
            </p>
            <ul className="mission-list">
              <li>
                <FiHeart />
                <span>Đặt lợi ích và sức khỏe của bệnh nhân lên hàng đầu</span>
              </li>
              <li>
                <FiAward />
                <span>Duy trì và nâng cao chất lượng dịch vụ y tế</span>
              </li>
              <li>
                <FiUsers />
                <span>Phát triển đội ngũ y bác sĩ chuyên nghiệp, tận tâm</span>
              </li>
              <li>
                <FiTrendingUp />
                <span>Không ngừng đổi mới và ứng dụng công nghệ tiên tiến</span>
              </li>
              <li>
                <FiShield />
                <span>Đảm bảo an toàn tuyệt đối trong mọi hoạt động y tế</span>
              </li>
              <li>
                <FiGlobe />
                <span>Đóng góp tích cực cho sự phát triển y tế cộng đồng</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Commitment Section */}
      <section className="commitment-section">
        <h2>Cam kết của chúng tôi</h2>
        <div className="commitment-content">
          <p>
            Bệnh viện Quốc tế Phú Yên cam kết mang đến trải nghiệm chăm sóc sức khỏe 
            tốt nhất cho mọi bệnh nhân. Chúng tôi không ngừng nỗ lực để:
          </p>
          <div className="commitment-grid">
            <div className="commitment-item">
              <div className="commitment-number">01</div>
              <h4>Chất lượng dịch vụ</h4>
              <p>Cung cấp dịch vụ y tế đạt tiêu chuẩn quốc tế</p>
            </div>
            <div className="commitment-item">
              <div className="commitment-number">02</div>
              <h4>Đội ngũ chuyên nghiệp</h4>
              <p>Đào tạo và phát triển đội ngũ y bác sĩ xuất sắc</p>
            </div>
            <div className="commitment-item">
              <div className="commitment-number">03</div>
              <h4>Công nghệ hiện đại</h4>
              <p>Đầu tư trang thiết bị y tế tiên tiến nhất</p>
            </div>
            <div className="commitment-item">
              <div className="commitment-number">04</div>
              <h4>Trách nhiệm xã hội</h4>
              <p>Đóng góp cho sự phát triển y tế cộng đồng</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default VisionPage;

