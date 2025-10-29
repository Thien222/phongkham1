import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  EyeOutlined,
  SolutionOutlined,
  FileTextOutlined,
  DatabaseOutlined,
  BarChartOutlined,
  WarningOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Sider } = Layout;

const allItems = [
  { key: '/', icon: <DashboardOutlined />, label: <Link to="/">Dashboard</Link>, role: 'user' },
  { key: '/reception', icon: <TeamOutlined />, label: <Link to="/reception">Tiếp tân</Link>, role: 'user' },
  { key: '/refraction', icon: <EyeOutlined />, label: <Link to="/refraction">Khúc xạ</Link>, role: 'user' },
  { key: '/examination', icon: <SolutionOutlined />, label: <Link to="/examination">Khám bệnh</Link>, role: 'user' },
  { key: '/invoices', icon: <FileTextOutlined />, label: <Link to="/invoices">Hóa đơn</Link>, role: 'user' },
  { key: '/inventory', icon: <DatabaseOutlined />, label: <Link to="/inventory">Kho hàng</Link>, role: 'admin' },
  { key: '/reports', icon: <BarChartOutlined />, label: <Link to="/reports">Thống kê</Link>, role: 'admin' },
  { key: '/incidents', icon: <WarningOutlined />, label: <Link to="/incidents">Sự cố</Link>, role: 'user' },
  { key: '/settings', icon: <SettingOutlined />, label: <Link to="/settings">Cài đặt</Link>, role: 'admin' }
];

export function AppSider() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  
  // Nếu không đăng nhập hoặc là user thường -> chỉ hiện menu cho user
  // Nếu là admin -> hiện hết
  const userRole = user?.role || 'user';
  const filteredItems = userRole === 'admin' 
    ? allItems 
    : allItems.filter(item => item.role === 'user');
  
  return (
    <Sider width={220} breakpoint="lg" collapsedWidth={64}>
      <div style={{ height: 56, color: '#fff', display: 'flex', alignItems: 'center', padding: '0 16px', fontWeight: 600 }}>
        Eye Clinic
      </div>
      <Menu theme="dark" mode="inline" selectedKeys={[pathname]} items={filteredItems} />
    </Sider>
  );
}


