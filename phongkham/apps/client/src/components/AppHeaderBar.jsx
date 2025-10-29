import { useState } from 'react';
import { Layout, Space, Typography, Avatar, Dropdown, Modal, Form, Input, Button, message, Tag } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined, BellOutlined, LoginOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Header } = Layout;
const { confirm } = Modal;

export function AppHeaderBar() {
  const navigate = useNavigate();
  const { user, logout, login } = useAuth();
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [loginForm] = Form.useForm();
  const [loginLoading, setLoginLoading] = useState(false);

  const today = new Date().toLocaleDateString('vi-VN', { 
    weekday: 'long', 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });

  const handleLogout = () => {
    confirm({
      title: 'Xác nhận đăng xuất',
      content: 'Bạn có chắc muốn đăng xuất?',
      okText: 'Đăng xuất',
      cancelText: 'Hủy',
      onOk: () => {
        logout();
        message.success('Đã đăng xuất');
      }
    });
  };

  const handleLogin = async (values) => {
    setLoginLoading(true);
    try {
      const result = await login(values.username, values.password);
      if (result.success) {
        message.success('Đăng nhập thành công!');
        setLoginModalVisible(false);
        loginForm.resetFields();
      } else {
        message.error(result.message);
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const menuItems = user ? [
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
      danger: true,
      onClick: handleLogout
    }
  ] : [];

  return (
    <>
      <Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0' }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <div>
            <Typography.Text strong style={{ fontSize: 16 }}>
              {today}
            </Typography.Text>
          </div>
          <Space size={16}>
            <BellOutlined style={{ fontSize: 20, cursor: 'pointer' }} />
            
            {user ? (
              <Dropdown menu={{ items: menuItems }} placement="bottomRight">
                <Space style={{ cursor: 'pointer' }}>
                  <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                  <div>
                    <Typography.Text strong>{user.fullName}</Typography.Text>
                    {user.role === 'admin' && (
                      <Tag color="red" style={{ marginLeft: 8 }}>Admin</Tag>
                    )}
                  </div>
                </Space>
              </Dropdown>
            ) : (
              <Button 
                type="primary" 
                icon={<LoginOutlined />}
                onClick={() => setLoginModalVisible(true)}
              >
                Đăng nhập Admin
              </Button>
            )}
          </Space>
        </Space>
      </Header>

      {/* Login Modal */}
      <Modal
        title="Đăng nhập Admin"
        open={loginModalVisible}
        onCancel={() => {
          setLoginModalVisible(false);
          loginForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={loginForm}
          layout="vertical"
          onFinish={handleLogin}
        >
          <Form.Item
            name="username"
            label="Tên đăng nhập"
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
          >
            <Input placeholder="admin" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
          >
            <Input.Password placeholder="Nhập mật khẩu" />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setLoginModalVisible(false);
                loginForm.resetFields();
              }}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loginLoading}>
                Đăng nhập
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
