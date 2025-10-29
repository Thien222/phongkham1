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

const { Sider } = Layout;

const items = [
  { key: '/', icon: <DashboardOutlined />, label: <Link to="/">Dashboard</Link> },
  { key: '/reception', icon: <TeamOutlined />, label: <Link to="/reception">Tiếp tân</Link> },
  { key: '/refraction', icon: <EyeOutlined />, label: <Link to="/refraction">Khúc xạ</Link> },
  { key: '/examination', icon: <SolutionOutlined />, label: <Link to="/examination">Khám bệnh</Link> },
  { key: '/invoices', icon: <FileTextOutlined />, label: <Link to="/invoices">Hóa đơn</Link> },
  { key: '/inventory', icon: <DatabaseOutlined />, label: <Link to="/inventory">Kho hàng</Link> },
  { key: '/reports', icon: <BarChartOutlined />, label: <Link to="/reports">Thống kê</Link> },
  { key: '/incidents', icon: <WarningOutlined />, label: <Link to="/incidents">Sự cố</Link> },
  { key: '/settings', icon: <SettingOutlined />, label: <Link to="/settings">Cài đặt</Link> }
];

export function AppSider() {
  const { pathname } = useLocation();
  return (
    <Sider width={220} breakpoint="lg" collapsedWidth={64}>
      <div style={{ height: 56, color: '#fff', display: 'flex', alignItems: 'center', padding: '0 16px', fontWeight: 600 }}>
        Eye Clinic
      </div>
      <Menu theme="dark" mode="inline" selectedKeys={[pathname]} items={items} />
    </Sider>
  );
}


