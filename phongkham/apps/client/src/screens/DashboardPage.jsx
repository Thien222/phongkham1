import { useState, useEffect } from 'react';
import { Card, Col, Row, Space, Statistic, Typography, List, Tag, Button } from 'antd';
import { UserOutlined, InboxOutlined, EyeOutlined, DollarOutlined, SolutionOutlined } from '@ant-design/icons';
import { fetchDashboardStats } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

export function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await fetchDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Typography.Title level={2}>
        Chào mừng bạn trở lại! Đây là tổng quan hệ thống hôm nay.
      </Typography.Title>
      
      <Row gutter={16}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng bệnh nhân"
              value={stats?.totalPatients || 0}
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng kho hàng"
              value={stats?.totalProducts || 0}
              prefix={<InboxOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Khúc xạ hôm nay"
              value={stats?.refractionsToday || 0}
              prefix={<EyeOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Doanh thu tháng"
              value={stats?.revenueThisMonth || 0}
              suffix="đ"
              prefix={<DollarOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Thao tác nhanh" variant="borderless">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card 
              hoverable 
              onClick={() => navigate('/reception')}
              style={{ textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}
            >
              <UserOutlined style={{ fontSize: 32, marginBottom: 8 }} />
              <div style={{ fontSize: 16, fontWeight: 500 }}>Thêm bệnh nhân</div>
              <div style={{ fontSize: 12, opacity: 0.9 }}>Đăng ký mới</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card 
              hoverable 
              onClick={() => navigate('/refraction')}
              style={{ textAlign: 'center', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}
            >
              <EyeOutlined style={{ fontSize: 32, marginBottom: 8 }} />
              <div style={{ fontSize: 16, fontWeight: 500 }}>Đo khúc xạ</div>
              <div style={{ fontSize: 12, opacity: 0.9 }}>Thực hiện đo</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card 
              hoverable 
              onClick={() => navigate('/examination')}
              style={{ textAlign: 'center', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}
            >
              <SolutionOutlined style={{ fontSize: 32, marginBottom: 8 }} />
              <div style={{ fontSize: 16, fontWeight: 500 }}>Khám bệnh</div>
              <div style={{ fontSize: 12, opacity: 0.9 }}>Ghi nhận kết quả</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card 
              hoverable 
              onClick={() => navigate('/inventory')}
              style={{ textAlign: 'center', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}
            >
              <InboxOutlined style={{ fontSize: 32, marginBottom: 8 }} />
              <div style={{ fontSize: 16, fontWeight: 500 }}>Kiểm kê kho</div>
              <div style={{ fontSize: 12, opacity: 0.9 }}>Quản lý tồn kho</div>
            </Card>
          </Col>
        </Row>
      </Card>

      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <Card title="Hoạt động gần đây" variant="borderless">
            {stats?.recentPatients && stats.recentPatients.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={stats.recentPatients}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<UserOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
                      title={
                        <Space>
                          <span>{item.fullName}</span>
                          <Tag color="blue">{item.code}</Tag>
                        </Space>
                      }
                      description={`Bệnh nhân mới đăng ký - ${dayjs(item.createdAt).fromNow()}`}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Typography.Text type="secondary">Chưa có hoạt động nào gần đây</Typography.Text>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Đo khúc xạ gần đây" variant="borderless">
            {stats?.recentRefractions && stats.recentRefractions.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={stats.recentRefractions}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<EyeOutlined style={{ fontSize: 24, color: '#52c41a' }} />}
                      title={
                        <Space>
                          <span>{item.patient?.fullName}</span>
                          <Tag color="green">{item.patient?.code}</Tag>
                        </Space>
                      }
                      description={`Đo khúc xạ hoàn thành - ${dayjs(item.createdAt).fromNow()}`}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Typography.Text type="secondary">Chưa có dữ liệu đo khúc xạ</Typography.Text>
            )}
          </Card>
        </Col>
      </Row>
    </Space>
  );
}


