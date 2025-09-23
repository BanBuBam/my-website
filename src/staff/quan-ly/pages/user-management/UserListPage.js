import React, { useState, useEffect } from 'react';
import './UserListPage.css';
import { FiPlus, FiEdit, FiLock, FiUnlock, FiX } from 'react-icons/fi';

const mockUsers = [
    { id: 1, name: 'Nguyễn Thị Lan', email: 'lan.nt@email.com', roles: ['Lễ tân'], status: 'Hoạt động' },
    { id: 2, name: 'Trần Văn B', email: 'b.tv@email.com', roles: ['Bác sĩ'], status: 'Hoạt động' },
    { id: 3, name: 'Lê Hoàng C', email: 'c.lh@email.com', roles: ['Bác sĩ', 'Admin'], status: 'Đã khóa' },
];

const ALL_ROLES = ['Bác sĩ', 'Điều dưỡng', 'Lễ tân', 'Kế toán', 'Dược sĩ', 'Bác sĩ xét nghiệm', 'Admin'];

// --- Sub-component for the Add/Edit Modal ---
const UserModal = ({ isOpen, onClose, onSave, userData }) => {
    const [formData, setFormData] = useState({ roles: [] });

    useEffect(() => {
        if (userData) {
            setFormData({ ...userData, roles: userData.roles || [] });
        } else {
            setFormData({ name: '', email: '', roles: [], status: 'Hoạt động' });
        }
    }, [userData, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // --- UPDATED: Handler for the multi-select dropdown ---
    const handleRoleChange = (e) => {
        const selectedRoles = Array.from(e.target.selectedOptions, option => option.value);
        setFormData(prev => ({ ...prev, roles: selectedRoles }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!isOpen) return null;
    const isAdding = !userData;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{isAdding ? 'Thêm người dùng mới' : 'Chỉnh sửa thông tin'}</h2>
                    <button onClick={onClose} className="close-btn"><FiX /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Tên người dùng</label>
                        <input type="text" name="name" value={formData.name || ''} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" name="email" value={formData.email || ''} onChange={handleChange} required />
                    </div>
                    
                    {/* --- UPDATED: Replaced checkboxes with a multi-select dropdown --- */}
                    <div className="form-group">
                        <label>Vai trò (Giữ Ctrl/Command để chọn nhiều)</label>
                        <select
                            multiple={true}
                            name="roles"
                            value={formData.roles || []}
                            onChange={handleRoleChange}
                            className="roles-select"
                        >
                            {ALL_ROLES.map(role => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </select>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="cancel-btn" onClick={onClose}>Hủy</button>
                        <button type="submit" className="save-btn">Lưu thay đổi</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Main Page Component (No changes here) ---
const UserListPage = () => {
    const [users, setUsers] = useState(mockUsers);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    const handleOpenAddModal = () => {
        setCurrentUser(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (user) => {
        setCurrentUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentUser(null);
    };

    const handleSaveUser = (userData) => {
        if (currentUser) {
            setUsers(users.map(user => user.id === currentUser.id ? { ...user, ...userData } : user));
        } else {
            const newUser = { ...userData, id: Date.now() };
            setUsers([newUser, ...users]);
        }
        handleCloseModal();
    };

    const handleToggleLock = (userId) => {
        setUsers(users.map(user => 
            user.id === userId ? { ...user, status: user.status === 'Hoạt động' ? 'Đã khóa' : 'Hoạt động' } : user
        ));
    };

    return (
        <div className="user-list-page">
            <div className="page-header">
                <div>
                    <h2>Quản lý Người dùng</h2>
                    <p>Thêm, sửa và quản lý tài khoản người dùng trong hệ thống</p>
                </div>
                <button onClick={handleOpenAddModal} className="add-new-btn"><FiPlus /> Thêm mới</button>
            </div>
            <div className="card">
                <table>
                    <thead>
                        <tr>
                            <th>Tên người dùng</th>
                            <th>Email</th>
                            <th>Vai trò</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>
                                    <div className="role-badges">
                                        {user.roles.map(role => <span key={role} className="role-badge">{role}</span>)}
                                    </div>
                                </td>
                                <td>
                                    <span className={`status-badge ${user.status === 'Hoạt động' ? 'active' : 'locked'}`}>
                                        {user.status}
                                    </span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button onClick={() => handleOpenEditModal(user)} className="icon-btn"><FiEdit /></button>
                                        <button onClick={() => handleToggleLock(user.id)} className="icon-btn">
                                            {user.status === 'Hoạt động' ? <FiLock /> : <FiUnlock />}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <UserModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveUser}
                userData={currentUser}
            />
        </div>
    );
};

export default UserListPage;