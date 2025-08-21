import React from 'react';
import './Footer.css'; // Tạo file Footer.css để style

// Import các ảnh cần dùng
import emailIcon from '../../../assets/icons/email1.png';
import logo from '../../../assets/images/logo.png';
import addressIcon from '../../../assets/icons/address.png';
import phoneIcon from '../../../assets/icons/phone-icon.png';
import faxIcon from '../../../assets/icons/fax.png';
import mailIcon from '../../../assets/icons/email.png';
import facebookIcon from '../../../assets/icons/facebook.png';
import youtubeIcon from '../../../assets/icons/youtube.png';
import zaloIcon from '../../../assets/icons/zalo.png';
import certificationImg from '../../../assets/icons/certification-icon.png';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="newsletter-bar">
        <div className="container newsletter-container">
          <div className="newsletter-text">
            <h4>Đăng ký nhận thông tin</h4>
            <p>Nhận thông báo về các thông tin mới của Bệnh viên quốc tế Phú Yên</p>
          </div>
          <form className="newsletter-form">
            <img src={emailIcon} alt="email icon" />
            <input type="email" placeholder="Địa chỉ email" />
            <button type="submit">Đăng ký</button>
          </form>
        </div>
      </div>
      <div className="footer-main">
        <div className="container footer-main-container">
          <div className="footer-col footer-info">
            <img src={logo} alt="Logo" className="footer-logo" />
            <p className="working-hours">Giờ làm việc: Từ 8h00 đến 21h00 tất cả các ngày trong tuần ( không bao gồm ngày nghỉ, lễ, tết, theo quy định của bộ lao động ). Khoa cấp cứu vẫn hoạt động vào ngày lễ.</p>
            <ul className="contact-list">
              <li>
                <img src={addressIcon} alt="address icon" />
                <div><span>Địa chỉ</span><strong>706 Campfire Ave. Meriden, CT 06450</strong></div>
              </li>
              <li>
                {/* merged image */}
                <div className="icon-wrapper-small">
                  <img src={phoneIcon} alt="phone icon" className="icon-visible" />
                  <img src={phoneIcon} alt="" className="icon-hidden" />
                </div>
                <div><span>Điện thoại</span><strong>310-437-2766</strong></div>
              </li>
              <li>
                {/* merged image */}
                <div className="icon-wrapper-small">
                  <img src={phoneIcon} alt="emergency icon" className="icon-visible" />
                  <img src={phoneIcon} alt="" className="icon-hidden" />
                </div>
                <div><span>Cấp cứu</span><strong>310-437-2766</strong></div>
              </li>
              <li>
                <img src={faxIcon} alt="fax icon" />
                <div><span>Fax</span><strong>+1-212-9876543</strong></div>
              </li>
              <li>
                <img src={mailIcon} alt="mail icon" />
                <div><span>Mail</span><strong>unreal@outlook.com</strong></div>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Về chúng tôi</h4>
            <ul>
              <li><a href="#">Giới thiệu</a></li>
              <li><a href="#">Đội ngũ bác sĩ</a></li>
              <li><a href="#">Tin tức</a></li>
              <li><a href="#">Tuyển dụng</a></li>
              <li><a href="#">Sitemap</a></li>
              <li><a href="#">Chính sách</a></li>
              <li><a href="#">Liên hệ</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Liên kết nhanh</h4>
            <ul>
              <li><a href="#">Tìm bác sĩ</a></li>
              <li><a href="#">Đặt lịch khám</a></li>
              <li><a href="#">Hỏi đáp</a></li>
              <li><a href="#">Chuyên khoa</a></li>
              <li><a href="#">Gói dịch vụ</a></li>
              <li><a href="#">Hướng dẫn khách hàng</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Mạng xã hội</h4>
            <div className="footer-socials">
              <a href="#"><img src={facebookIcon} alt="Facebook" /></a>
              <a href="#"><img src={youtubeIcon} alt="Youtube" /></a>
              <a href="#"><img src={zaloIcon} alt="Zalo" /></a>
            </div>
            <img src={certificationImg} alt="Certification" className="certification-img" />
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container footer-bottom-container">
          <p className="disclaimer">Các thông tin trên website này chỉ dành cho mục đích tham khảo, tra cứu, khuyến nghị Quý khách hàng không tự ý áp dụng. PIH không chịu trách nhiệm về những trường hợp tự ý áp dụng mà không có chỉ định của bác sĩ.”</p>
          <p className="copyright">© 2000-2021, All Rights Reserved</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;