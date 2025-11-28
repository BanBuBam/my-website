import React, { useState } from 'react';
import './CustomerSupportPage.css';
import { 
  FiPhone, 
  FiMail, 
  FiMapPin, 
  FiClock,
  FiMessageCircle,
  FiHelpCircle,
  FiFileText,
  FiSend
} from 'react-icons/fi';

const CustomerSupportPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const contactInfo = [
    {
      icon: <FiPhone />,
      title: 'Hotline',
      content: '024 8345 555',
      description: 'Hỗ trợ 24/7',
      color: '#0ea5e9'
    },
    {
      icon: <FiPhone />,
      title: 'Cấp cứu',
      content: '024 1138 884',
      description: 'Luôn sẵn sàng',
      color: '#dc2626'
    },
    {
      icon: <FiMail />,
      title: 'Email',
      content: 'contact@trinitycare.vn',
      description: 'Phản hồi trong 24h',
      color: '#8dc63f'
    },
    {
      icon: <FiMapPin />,
      title: 'Địa chỉ',
      content: 'Số 12, Xuân Thủy, Cầu Giấy, Hà Nội',
      description: 'Đến thăm chúng tôi',
      color: '#a855f7'
    }
  ];

  const faqs = [
    {
      question: 'Làm thế nào để đặt lịch khám?',
      answer: 'Bạn có thể đặt lịch khám trực tuyến qua website, gọi điện thoại đến hotline, hoặc đến trực tiếp bệnh viện để đăng ký.'
    },
    {
      question: 'Bệnh viện có khám vào cuối tuần không?',
      answer: 'Có, bệnh viện hoạt động 7 ngày/tuần. Khoa cấp cứu hoạt động 24/7 kể cả ngày lễ, tết.'
    },
    {
      question: 'Tôi có thể hủy lịch hẹn không?',
      answer: 'Có, bạn có thể hủy lịch hẹn bằng cách gọi điện hoặc thông qua tài khoản trực tuyến của mình. Vui lòng hủy trước ít nhất 24 giờ.'
    },
    {
      question: 'Bệnh viện có chấp nhận bảo hiểm y tế không?',
      answer: 'Có, chúng tôi chấp nhận hầu hết các loại bảo hiểm y tế. Vui lòng mang theo thẻ bảo hiểm khi đến khám.'
    },
    {
      question: 'Giờ thăm bệnh là khi nào?',
      answer: 'Giờ thăm bệnh: Sáng 8h-11h, Chiều 14h-17h, Tối 18h-20h. Mỗi bệnh nhân được 2 người thăm cùng lúc.'
    },
    {
      question: 'Làm thế nào để lấy kết quả xét nghiệm?',
      answer: 'Kết quả xét nghiệm có thể được lấy trực tiếp tại bệnh viện hoặc tra cứu online qua website với mã bệnh nhân.'
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log('Form submitted:', formData);
    setSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="support-page">
      {/* Header */}
      <div className="page-header">
        <h1>Hỗ trợ khách hàng</h1>
        <p>Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7</p>
      </div>

      {/* Contact Info Cards */}
      <section className="contact-info-section">
        <div className="contact-info-grid">
          {contactInfo.map((info, index) => (
            <div key={index} className="contact-info-card">
              <div 
                className="contact-icon" 
                style={{ backgroundColor: `${info.color}15`, color: info.color }}
              >
                {info.icon}
              </div>
              <h3>{info.title}</h3>
              <p className="contact-content">{info.content}</p>
              <p className="contact-description">{info.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Form */}
      <section className="contact-form-section">
        <div className="contact-form-container">
          <div className="form-header">
            <FiMessageCircle className="form-header-icon" />
            <h2>Gửi tin nhắn cho chúng tôi</h2>
            <p>Điền thông tin bên dưới và chúng tôi sẽ phản hồi sớm nhất</p>
          </div>

          {submitted ? (
            <div className="success-message">
              <FiSend />
              <h3>Gửi thành công!</h3>
              <p>Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi trong thời gian sớm nhất.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Họ và tên <span className="required">*</span></label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Nhập họ và tên"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email <span className="required">*</span></label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Nhập email"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Số điện thoại <span className="required">*</span></label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="subject">Chủ đề <span className="required">*</span></label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">-- Chọn chủ đề --</option>
                    <option value="appointment">Đặt lịch khám</option>
                    <option value="results">Kết quả xét nghiệm</option>
                    <option value="billing">Thanh toán</option>
                    <option value="complaint">Khiếu nại</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="message">Nội dung <span className="required">*</span></label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows="6"
                  placeholder="Nhập nội dung tin nhắn..."
                ></textarea>
              </div>

              <button type="submit" className="btn-submit">
                <FiSend /> Gửi tin nhắn
              </button>
            </form>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="faq-header">
          <FiHelpCircle className="faq-header-icon" />
          <h2>Câu hỏi thường gặp</h2>
          <p>Tìm câu trả lời cho các câu hỏi phổ biến</p>
        </div>
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div key={index} className="faq-item">
              <div className="faq-question">
                <FiFileText />
                <h3>{faq.question}</h3>
              </div>
              <p className="faq-answer">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Working Hours */}
      <section className="working-hours-section">
        <FiClock className="working-hours-icon" />
        <h2>Giờ làm việc</h2>
        <div className="working-hours-content">
          <div className="hours-item">
            <span className="day">Thứ 2 - Thứ 6:</span>
            <span className="time">8:00 - 21:00</span>
          </div>
          <div className="hours-item">
            <span className="day">Thứ 7 - Chủ nhật:</span>
            <span className="time">8:00 - 18:00</span>
          </div>
          <div className="hours-item emergency">
            <span className="day">Cấp cứu:</span>
            <span className="time">24/7</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CustomerSupportPage;

