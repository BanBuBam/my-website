import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './FinanceLayout.css';
import {
    FiHome,
    FiFileText,
    FiBarChart2,
    FiDollarSign,
    FiUsers,
    FiCreditCard,
    FiList,
    FiCheckCircle,
    FiAlertCircle,
    FiTrendingUp,
    FiShoppingCart
} from 'react-icons/fi';
import StaffAvatarDropdown from '../../components/StaffAvatarDropdown';

const FinanceLayout = () => {
    return (
        <div className="finance-layout">
            {/* Sidebar */}
            <aside className="finance-sidebar">
                <div className="sidebar-header">
                    <h1>Tài chính</h1>
                </div>

                <nav className="sidebar-nav">
                    {/* Tổng quan */}
                    <div className="nav-category">
                        <div className="category-header">Tổng quan</div>
                        <ul>
                            <li>
                                <NavLink to="/staff/tai-chinh/dashboard">
                                    <FiHome />
                                    <span>Dashboard</span>
                                </NavLink>
                            </li>
                        </ul>
                    </div>

                    {/* Quản lý hóa đơn */}
                    <div className="nav-category">
                        <div className="category-header">Quản lý hóa đơn</div>
                        <ul>
                            <li>
                                <NavLink to="/staff/tai-chinh/thanh-toan-ngoai-tru">
                                    <FiDollarSign />
                                    <span>Thanh toán ngoại trú</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/tai-chinh/thanh-toan-noi-tru">
                                    <FiDollarSign />
                                    <span>Thanh toán nội trú</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/tai-chinh/thu-tam-ung-cap-cuu">
                                    <FiAlertCircle />
                                    <span>Thu tạm ứng cấp cứu</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/tai-chinh/quan-ly-hoa-don">
                                    <FiFileText />
                                    <span>Quản lý hóa đơn</span>
                                </NavLink>
                            </li>
                            {/* <li>
                                <NavLink to="/staff/tai-chinh/ds-hoa-don">
                                    <FiList />
                                    <span>Danh sách hóa đơn</span>
                                </NavLink>
                            </li> */}
                            {/* <li>
                                <NavLink to="/staff/tai-chinh/ds-luot-kham">
                                    <FiFileText />
                                    <span>Lượt khám chưa tạo hóa đơn</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/tai-chinh/chua-tt">
                                    <FiAlertCircle />
                                    <span>Hóa đơn chưa thanh toán</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/tai-chinh/hoa-don">
                                    <FiFileText />
                                    <span>Hóa đơn & Biên lai</span>
                                </NavLink>
                            </li> */}
                        </ul>
                    </div>

                    {/* Thu chi */}
                    <div className="nav-category">
                        <div className="category-header">Thu chi</div>
                        <ul>
                            <li>
                                <NavLink to="/staff/tai-chinh/thu-tien">
                                    <FiCreditCard />
                                    <span>Thu tiền</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/tai-chinh/tam-ung-hoan-vien-phi">
                                    <FiDollarSign />
                                    <span>Tạm ứng / Hoàn viện phí</span>
                                </NavLink>
                            </li>
                            
                            <li>
                                <NavLink to="/staff/tai-chinh/thu-chi">
                                    <FiTrendingUp />
                                    <span>Quản lý thu chi</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/tai-chinh/thanh-toan-nhap-kho">
                                    <FiShoppingCart />
                                    <span>Thanh toán nhập kho</span>
                                </NavLink>
                            </li>
                        </ul>
                    </div>

                    {/* Công nợ */}
                    <div className="nav-category">
                        <div className="category-header">Công nợ</div>
                        <ul>
                            <li>
                                <NavLink to="/staff/tai-chinh/cong-no-benh-nhan">
                                    <FiAlertCircle />
                                    <span>Công nợ bệnh nhân</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/tai-chinh/cong-no-nha-cung-cap">
                                    <FiUsers />
                                    <span>Công nợ nhà cung cấp</span>
                                </NavLink>
                            </li>
                        </ul>
                    </div>

                    {/* Nhân sự */}
                    <div className="nav-category">
                        <div className="category-header">Nhân sự</div>
                        <ul>
                            <li>
                                <NavLink to="/staff/tai-chinh/bang-luong">
                                    <FiUsers />
                                    <span>Bảng lương nhân viên</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/tai-chinh/tam-ung-luong">
                                    <FiDollarSign />
                                    <span>Tạm ứng lương</span>
                                </NavLink>
                            </li>
                        </ul>
                    </div>

                    {/* Báo cáo */}
                    <div className="nav-category">
                        <div className="category-header">Báo cáo</div>
                        <ul>
                            <li>
                                <NavLink to="/staff/tai-chinh/bao-cao">
                                    <FiBarChart2 />
                                    <span>Báo cáo tài chính</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/tai-chinh/bao-cao-doanh-thu">
                                    <FiTrendingUp />
                                    <span>Báo cáo doanh thu</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/staff/tai-chinh/bao-cao-cong-no">
                                    <FiBarChart2 />
                                    <span>Báo cáo công nợ</span>
                                </NavLink>
                            </li>
                        </ul>
                    </div>
                </nav>
            </aside>

            {/* Nội dung chính */}
            <main className="finance-content">
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

export default FinanceLayout;
