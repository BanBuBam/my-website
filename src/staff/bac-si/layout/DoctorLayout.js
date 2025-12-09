import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './DoctorLayout.css';
import {
    FiHome,
    FiClipboard,
    FiFileText,
    FiUsers,
    FiCalendar,
    FiClock,
    FiList,
    FiActivity,
    FiTrendingUp,
    FiFolder,
    FiBarChart2,
    FiEdit3,
    FiAlertCircle,
    FiCheckCircle
} from 'react-icons/fi';
import StaffAvatarDropdown from '../../components/StaffAvatarDropdown';

const DoctorLayout = () => {
    return (
        <div className="doctor-layout">
            <aside className="doctor-sidebar">
                <div className="sidebar-header">
                    <h1>Bác sĩ</h1>
                </div>
                <nav className="sidebar-nav">
                    {/* Tổng quan */}
                    <div className="nav-category">
                        <div className="category-header">Tổng quan</div>
                        <ul>
                            <li>
                                <NavLink to="/staff/bac-si/dashboard">
                                    <FiHome />
                                    <span>Dashboard</span>
                                </NavLink>
                            </li>
                        </ul>
                    </div>

                    {/* Lịch làm việc */}
                    <div className="nav-category">
                        <div className="category-header">Lịch làm việc</div>
                        <ul>
                            <li>
                                <NavLink to="/staff/bac-si/lich-hen">
                                    <FiCalendar />
                                    <span>Lịch hẹn</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/bac-si/lich-lam-viec">
                                    <FiClock />
                                    <span>//Lịch làm việc cá nhân</span>
                                </NavLink>
                            </li>
                        </ul>
                    </div>
                    
                    {/* Cấp cứu */}
                    <div className="nav-category">
                        <div className="category-header">Cấp cứu</div>
                        <ul>
                            <li>
                                <NavLink to="/staff/bac-si/cap-cuu">
                                    <FiAlertCircle />
                                    <span>Lượt khám cấp cứu (Emerging Encounter)</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/bac-si/diagnostic-orders">
                                    <FiActivity />
                                    <span>Quản lý Chỉ định Xét nghiệm</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/bac-si/hoi-chan">
                                    <FiUsers />
                                    <span>Quản lý Hội chẩn</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/bac-si/protocols">
                                    <FiActivity />
                                    <span>Quản lý Protocol</span>
                                </NavLink>
                            </li>
                        </ul>
                    </div>

                    {/* Khám bệnh ngoại trú */}
                    <div className="nav-category">
                        <div className="category-header">Khám bệnh ngoại trú</div>
                        <ul>
                            <li>
                                <NavLink to="/staff/bac-si/danh-sach-benh-nhan">
                                    <FiUsers />
                                    <span>Danh sách bệnh nhân</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/bac-si/danh-sach-cho-kham">
                                    <FiList />
                                    <span>//Danh sách chờ khám</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/bac-si/kham-benh">
                                    <FiClipboard />
                                    <span>Khám bệnh</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/bac-si/encounters">
                                    <FiUsers />
                                    <span>Quản lý Lượt khám</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/bac-si/tai-kham">
                                    <FiCalendar />
                                    <span>Quản lý Tái khám</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/bac-si/encounter-vital">
                                    <FiActivity />
                                    <span>Quản lý dấu hiệu sinh tồn</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/bac-si/clinical-notes">
                                    <FiFileText />
                                    <span>Quản lý Ghi chú y khoa (Clinic Notes)</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/bac-si/lab-test-order">
                                    <FiClipboard />
                                    <span>Quản lý Yêu cầu xét nghiệm</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/bac-si/imaging-order">
                                    <FiFileText />
                                    <span>Quản lý Xét nghiệm hình ảnh</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/bac-si/prescription">
                                    <FiEdit3 />
                                    <span>Quản lý đơn thuốc</span>
                                </NavLink>
                            </li>

                            {/*<li>*/}
                            {/*    <NavLink to="/staff/bac-si/ke-don-thuoc">*/}
                            {/*        <FiEdit3 />*/}
                            {/*        <span>Kê đơn thuốc</span>*/}
                            {/*    </NavLink>*/}
                            {/*</li>*/}
                            {/*<li>*/}
                            {/*    <NavLink to="/staff/bac-si/chi-dinh-cls">*/}
                            {/*        <FiActivity />*/}
                            {/*        <span>Chỉ định xét nghiệm/CLS</span>*/}
                            {/*    </NavLink>*/}
                            {/*</li>*/}
                        </ul>
                    </div>
                    
                    

                    {/* Bệnh nhân nội trú */}
                    <div className="nav-category">
                        <div className="category-header">Bệnh nhân nội trú</div>
                        <ul>
                            <li>
                                <NavLink to="/staff/bac-si/yeu-cau-nhap-vien">
                                    <FiClipboard />
                                    <span>Quản lý yêu cầu nhập viện</span>
                                </NavLink>
                            </li>
                            <li>
                                {/*<NavLink to="/staff/bac-si/benh-nhan-noi-tru">*/}
                                <NavLink to="/staff/bac-si/danh-sach-benh-nhan">
                                    <FiUsers />
                                    <span>Danh sách bệnh nhân</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/bac-si/dieu-tri-noi-tru">
                                    <FiActivity />
                                    <span>Quản lý điều trị nội trú</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/bac-si/benh-an-dien-tu">
                                    <FiFolder />
                                    <span>//Bệnh án điện tử</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/bac-si/ke-y-lenh">
                                    <FiEdit3 />
                                    <span>//Kê y lệnh</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/bac-si/xac-nhan-nhom-y-lenh">
                                    <FiCheckCircle />
                                    <span>Xác nhận nhóm y lệnh</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/bac-si/theo-doi-dien-bien">
                                    <FiTrendingUp />
                                    <span>//Theo dõi diễn biến</span>
                                </NavLink>
                            </li>
                        </ul>
                    </div>

                    {/* Kết quả & Hồ sơ */}
                    <div className="nav-category">
                        <div className="category-header">Kết quả & Hồ sơ</div>
                        <ul>
                            <li>
                                <NavLink to="/staff/bac-si/ket-qua-cls">
                                    <FiFileText />
                                    <span>Kết quả cận lâm sàng</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/bac-si/ho-so-benh-an">
                                    <FiFolder />
                                    <span>//Hồ sơ bệnh án</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/bac-si/lich-su-kham-benh">
                                    <FiClock />
                                    <span>//Lịch sử khám bệnh</span>
                                </NavLink>
                            </li>
                        </ul>
                    </div>

                    {/* Phẫu thuật/Thủ thuật */}
                    <div className="nav-category">
                        <div className="category-header">Phẫu thuật/Thủ thuật</div>
                        <ul>
                            <li>
                                <NavLink to="/staff/bac-si/lich-phau-thuat">
                                    <FiCalendar />
                                    <span>//Lịch phẫu thuật</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/bac-si/phieu-phau-thuat">
                                    <FiFileText />
                                    <span>//Phiếu phẫu thuật</span>
                                </NavLink>
                            </li>
                        </ul>
                    </div>

                    

                    {/* Báo cáo */}
                    <div className="nav-category">
                        <div className="category-header">Báo cáo</div>
                        <ul>
                            <li>
                                <NavLink to="/staff/bac-si/thong-ke-kham-benh">
                                    <FiBarChart2 />
                                    <span>Thống kê khám bệnh</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/bac-si/bao-cao-cong-viec">
                                    <FiFileText />
                                    <span>Báo cáo công việc</span>
                                </NavLink>
                            </li>
                        </ul>
                    </div>
                </nav>
            </aside>
            <main className="doctor-content">
                <div className="content-header">
                    <StaffAvatarDropdown />
                </div>
                <div className="content-body">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DoctorLayout;