import React, { useState } from 'react';
import './NewsEventsPage.css';
import { 
  FiCalendar, 
  FiClock, 
  FiTag,
  FiTrendingUp,
  FiAward,
  FiHeart,
  FiUsers,
  FiActivity
} from 'react-icons/fi';

const NewsEventsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const newsItems = [
    {
      id: 1,
      title: 'Khai trương Trung tâm Tim mạch hiện đại',
      category: 'su-kien',
      date: '2025-11-15',
      image: null,
      icon: <FiHeart />,
      excerpt: 'Bệnh viện Quốc tế Phú Yên chính thức khai trương Trung tâm Tim mạch với trang thiết bị hiện đại nhất khu vực.',
      content: 'Trung tâm Tim mạch được trang bị máy móc hiện đại, phòng mổ đạt chuẩn quốc tế và đội ngũ bác sĩ giàu kinh nghiệm.',
      color: '#e53e3e'
    },
    {
      id: 2,
      title: 'Chương trình khám sức khỏe miễn phí cho người cao tuổi',
      category: 'chuong-trinh',
      date: '2025-11-10',
      image: null,
      icon: <FiUsers />,
      excerpt: 'Bệnh viện tổ chức chương trình khám sức khỏe miễn phí cho 500 người cao tuổi trong tháng 11.',
      content: 'Chương trình bao gồm khám tổng quát, xét nghiệm máu, đo huyết áp và tư vấn sức khỏe miễn phí.',
      color: '#8dc63f'
    },
    {
      id: 3,
      title: 'Bệnh viện đạt chứng nhận ISO 9001:2015',
      category: 'thanh-tuu',
      date: '2025-11-05',
      image: null,
      icon: <FiAward />,
      excerpt: 'Bệnh viện Quốc tế Phú Yên vinh dự đạt chứng nhận ISO 9001:2015 về hệ thống quản lý chất lượng.',
      content: 'Đây là minh chứng cho cam kết của bệnh viện trong việc cung cấp dịch vụ y tế chất lượng cao.',
      color: '#f59e0b'
    },
    {
      id: 4,
      title: 'Hội thảo "Phòng ngừa bệnh tim mạch"',
      category: 'su-kien',
      date: '2025-10-28',
      image: null,
      icon: <FiActivity />,
      excerpt: 'Hội thảo với sự tham gia của các chuyên gia tim mạch hàng đầu trong nước.',
      content: 'Hội thảo cung cấp kiến thức về phòng ngừa và điều trị bệnh tim mạch cho cộng đồng.',
      color: '#0ea5e9'
    },
    {
      id: 5,
      title: 'Ứng dụng công nghệ AI trong chẩn đoán hình ảnh',
      category: 'cong-nghe',
      date: '2025-10-20',
      image: null,
      icon: <FiTrendingUp />,
      excerpt: 'Bệnh viện triển khai hệ thống AI hỗ trợ chẩn đoán hình ảnh y khoa.',
      content: 'Công nghệ AI giúp tăng độ chính xác trong chẩn đoán và rút ngắn thời gian xử lý kết quả.',
      color: '#a855f7'
    },
    {
      id: 6,
      title: 'Ngày hội hiến máu nhân đạo 2025',
      category: 'chuong-trinh',
      date: '2025-10-15',
      image: null,
      icon: <FiHeart />,
      excerpt: 'Bệnh viện tổ chức ngày hội hiến máu với hơn 300 đơn vị máu được hiến tặng.',
      content: 'Sự kiện thu hút đông đảo cán bộ, nhân viên và người dân tham gia hiến máu tình nguyện.',
      color: '#dc2626'
    },
    {
      id: 7,
      title: 'Khai trương phòng khám Nhi cao cấp',
      category: 'su-kien',
      date: '2025-10-10',
      image: null,
      icon: <FiUsers />,
      excerpt: 'Phòng khám Nhi cao cấp với không gian thân thiện và trang thiết bị hiện đại.',
      content: 'Phòng khám được thiết kế đặc biệt để tạo cảm giác thoải mái cho trẻ em khi khám bệnh.',
      color: '#f97316'
    },
    {
      id: 8,
      title: 'Chương trình đào tạo kỹ năng cấp cứu cho cộng đồng',
      category: 'chuong-trinh',
      date: '2025-10-05',
      image: null,
      icon: <FiActivity />,
      excerpt: 'Khóa đào tạo miễn phí về kỹ năng sơ cứu và cấp cứu ban đầu cho người dân.',
      content: 'Chương trình giúp nâng cao nhận thức và kỹ năng xử lý tình huống cấp cứu trong cộng đồng.',
      color: '#22c55e'
    }
  ];

  const categories = [
    { id: 'all', name: 'Tất cả', icon: <FiTag /> },
    { id: 'su-kien', name: 'Sự kiện', icon: <FiCalendar /> },
    { id: 'chuong-trinh', name: 'Chương trình', icon: <FiUsers /> },
    { id: 'thanh-tuu', name: 'Thành tựu', icon: <FiAward /> },
    { id: 'cong-nghe', name: 'Công nghệ', icon: <FiTrendingUp /> }
  ];

  const filteredNews = selectedCategory === 'all' 
    ? newsItems 
    : newsItems.filter(item => item.category === selectedCategory);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="news-page">
      {/* Header */}
      <div className="page-header">
        <h1>Tin tức & Sự kiện</h1>
        <p>Cập nhật tin tức mới nhất từ Bệnh viện Quốc tế Phú Yên</p>
      </div>

      {/* Featured News */}
      {newsItems.length > 0 && (
        <section className="featured-news-section">
          <div className="featured-news-card">
            <div 
              className="featured-icon" 
              style={{ backgroundColor: `${newsItems[0].color}15`, color: newsItems[0].color }}
            >
              {newsItems[0].icon}
            </div>
            <div className="featured-content">
              <div className="featured-meta">
                <span className="featured-category">Tin nổi bật</span>
                <span className="featured-date">
                  <FiCalendar /> {formatDate(newsItems[0].date)}
                </span>
              </div>
              <h2>{newsItems[0].title}</h2>
              <p>{newsItems[0].excerpt}</p>
              <button className="btn-read-more">Đọc thêm</button>
            </div>
          </div>
        </section>
      )}

      {/* Filter Section */}
      <section className="news-filter-section">
        <div className="news-filter-tabs">
          {categories.map(category => (
            <button
              key={category.id}
              className={`news-filter-tab ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.icon}
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* News Grid */}
      <section className="news-grid-section">
        <div className="news-grid">
          {filteredNews.map(item => (
            <div key={item.id} className="news-card">
              <div 
                className="news-icon" 
                style={{ backgroundColor: `${item.color}15`, color: item.color }}
              >
                {item.icon}
              </div>
              <div className="news-meta">
                <span className="news-date">
                  <FiCalendar /> {formatDate(item.date)}
                </span>
              </div>
              <h3>{item.title}</h3>
              <p className="news-excerpt">{item.excerpt}</p>
              <p className="news-content">{item.content}</p>
              <button className="btn-read-more-small">Xem chi tiết</button>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter Subscription */}
      <section className="newsletter-section">
        <div className="newsletter-content text-green">
          <h2>Đăng ký nhận tin tức</h2>
          <p>Nhận thông tin mới nhất về sức khỏe và các chương trình của bệnh viện</p>
          <div className="newsletter-form">
            <input 
              type="email" 
              placeholder="Nhập địa chỉ email của bạn" 
              className="newsletter-input"
            />
            <button className="btn-subscribe">Đăng ký</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NewsEventsPage;

