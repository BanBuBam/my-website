import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './NurseLayout.css';
import {
    FiHome,
    FiGrid,
    FiLogIn,
    FiHeart,
    FiRepeat,
    FiCheckSquare,
    FiActivity,
    FiClipboard,
    FiFileText,
    FiUsers,
    FiTrendingUp,
    FiEdit3,
    FiPackage,
    FiBarChart2
} from 'react-icons/fi';
import StaffAvatarDropdown from '../../components/StaffAvatarDropdown';

const NurseLayout = () => {
    return (
        <div className="nurse-layout">
            <aside className="nurse-sidebar">
                <div className="sidebar-header">
                    <h1>Điều dưỡng</h1>
                </div>
                <nav className="sidebar-nav">
                    {/* Tổng quan */}
                    <div className="nav-category">
                        <div className="category-header">Tổng quan</div>
                        <ul>
                            <li>
                                <NavLink to="/staff/dieu-duong/dashboard">
                                    <FiHome />
                                    <span>Dashboard</span>
                                </NavLink>
                            </li>
                        </ul>
                    </div>

                    {/* Quản lý giường bệnh */}
                    <div className="nav-category">
                        <div className="category-header">Quản lý giường bệnh</div>
                        <ul>
                            <li>
                                <NavLink to="/staff/dieu-duong/so-do-giuong">
                                    <FiGrid />
                                    <span>Sơ đồ giường bệnh</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/dieu-duong/danh-sach-giuong">
                                    <FiClipboard />
                                    <span>Danh sách giường</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/dieu-duong/chuyen-giuong">
                                    <FiRepeat />
                                    <span>Chuyển giường</span>
                                </NavLink>
                            </li>
                        </ul>
                    </div>

                    {/* Nhập xuất viện */}
                    <div className="nav-category">
                        <div className="category-header">Nhập xuất viện</div>
                        <ul>
                            <li>
                                <NavLink to="/staff/dieu-duong/nhap-vien">
                                    <FiLogIn />
                                    <span>Nhập viện</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/dieu-duong/xuat-vien">
                                    <FiLogIn />
                                    <span>Xuất viện</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/dieu-duong/danh-sach-benh-nhan">
                                    <FiUsers />
                                    <span>Danh sách bệnh nhân</span>
                                </NavLink>
                            </li>
                        </ul>
                    </div>

                    {/* Chăm sóc bệnh nhân */}
                    <div className="nav-category">
                        <div className="category-header">Chăm sóc bệnh nhân</div>
                        <ul>
                            <li>
                                <NavLink to="/staff/dieu-duong/cham-soc">
                                    <FiHeart />
                                    <span>Chăm sóc bệnh nhân</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/dieu-duong/theo-doi-sinh-hieu">
                                    <FiActivity />
                                    <span>Theo dõi sinh hiệu</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/dieu-duong/ghi-chep-dieu-duong">
                                    <FiEdit3 />
                                    <span>Ghi chép điều dưỡng</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/dieu-duong/theo-doi-dien-bien">
                                    <FiTrendingUp />
                                    <span>Theo dõi diễn biến</span>
                                </NavLink>
                            </li>
                        </ul>
                    </div>

                    {/* Y lệnh */}
                    <div className="nav-category">
                        <div className="category-header">Y lệnh</div>
                        <ul>
                            <li>
                                <NavLink to="/staff/dieu-duong/y-lenh">
                                    <FiCheckSquare />
                                    <span>Y lệnh cần thực hiện</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/dieu-duong/y-lenh-thuoc">
                                    <FiPackage />
                                    <span>Y lệnh thuốc</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/dieu-duong/lich-su-y-lenh">
                                    <FiFileText />
                                    <span>Lịch sử y lệnh</span>
                                </NavLink>
                            </li>
                        </ul>
                    </div>

                    {/* Báo cáo */}
                    <div className="nav-category">
                        <div className="category-header">Báo cáo</div>
                        <ul>
                            <li>
                                <NavLink to="/staff/dieu-duong/bao-cao-cong-viec">
                                    <FiBarChart2 />
                                    <span>Báo cáo công việc</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/dieu-duong/bao-cao-benh-nhan">
                                    <FiFileText />
                                    <span>Báo cáo bệnh nhân</span>
                                </NavLink>
                            </li>
                        </ul>
                    </div>
                </nav>
            </aside>
            <main className="nurse-content">
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

export default NurseLayout;