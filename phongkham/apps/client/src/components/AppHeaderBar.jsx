import { Layout, Space, Typography, Avatar, Dropdown } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined, BellOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Header } = Layout;

export function AppHeaderBar() {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString('vi-VN', { 
    weekday: 'long', 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });

  const menuItems = [
    {
      key: 'settings',
      label: 'Cài đặt',
      icon: <SettingOutlined />,
      onClick: () => navigate('/settings')
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogoutOutlined />,
      danger: true
    }
  ];

  return (
    <Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0' }}>
      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <div>
          <Typography.Text strong style={{ fontSize: 16 }}>
            {today}
          </Typography.Text>
        </div>
        <Space size={16}>
          <BellOutlined style={{ fontSize: 20, cursor: 'pointer' }} />
          <Dropdown menu={{ items: menuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
              <Typography.Text strong>Admin</Typography.Text>
            </Space>
          </Dropdown>
        </Space>
      </Space>
    </Header>
  );
}


