import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { FaSignOutAlt } from 'react-icons/fa';
import { NavLink, useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = ({ dispatch }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    Cookies.remove('adminToken');
    dispatch({ type: 'ADMIN_LOGOUT' });
    toast.success("Logout Successful", { autoClose: 2000 });
    navigate('/admin/login');
  };

  return (
    <div className="admin-dashboard">
      <div className="sidebar">
        <h3 className="sidebar-menu-title">Admin Panel</h3>
        <ul className="sidebar-menu">
          <NavLink
            to="/admin/customer-order-details"
            className={({ isActive }) => (isActive ? 'sidebar-menu-item sidebar-menu-item-active' : 'sidebar-menu-item')}
          >
            <span className="sidebar-menu-item-text">Customer Order Details</span>
          </NavLink>
          <NavLink
            to="/admin/pizza-update"
            className={({ isActive }) => (isActive ? 'sidebar-menu-item sidebar-menu-item-active' : 'sidebar-menu-item')}
          >
            <span className="sidebar-menu-item-text">Update Pizza</span>
          </NavLink>
          <NavLink
            to="/admin/customer-rating"
            className={({ isActive }) => (isActive ? 'sidebar-menu-item sidebar-menu-item-active' : 'sidebar-menu-item')}
          >
            <span className="sidebar-menu-item-text">Customer Rating</span>
          </NavLink>
          <NavLink
            to="/admin/pizza-analysis"
            className={({ isActive }) => (isActive ? 'sidebar-menu-item sidebar-menu-item-active' : 'sidebar-menu-item')}
          >
            <span className="sidebar-menu-item-text">Pizza Analyse</span>
          </NavLink>
          <li className="sidebar-menu-item" onClick={handleLogout}>
            <FaSignOutAlt className="logout-icon" />
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;
