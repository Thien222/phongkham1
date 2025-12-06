import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, DatePicker, Space, Typography } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, DollarOutlined, UserOutlined, ShoppingOutlined, EyeOutlined } from '@ant-design/icons';
import { fetchInvoices, fetchPatients, fetchProducts, fetchRefractions } from '../lib/api';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Title } = Typography;

export function ReportsPage() {
  const [dateRange, setDateRange] = useState([dayjs().startOf('month'), dayjs().endOf('month')]);
  const [stats, setStats] = useState({
    revenue: 0,
    patients: 0,
    products: 0,
    refractions: 0,
    invoicesCount: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStats();
  }, [dateRange]);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Fetch all data
      const [invoices, patients, products, refractions] = await Promise.all([
        fetchInvoices(),
        fetchPatients(),
        fetchProducts(),
        fetchRefractions()
      ]);

      // Filter by date range
      const startDate = dateRange[0].startOf('day');
      const endDate = dateRange[1].endOf('day');

      const filteredInvoices = invoices.filter(inv => {
        const invDate = dayjs(inv.createdAt);
        return invDate.isAfter(startDate) && invDate.isBefore(endDate) && inv.status === 'PAID';
      });

      const filteredPatients = patients.filter(p => {
        const pDate = dayjs(p.createdAt);
        return pDate.isAfter(startDate) && pDate.isBefore(endDate);
      });

      const filteredRefractions = refractions.filter(r => {
        const rDate = dayjs(r.createdAt);
        return rDate.isAfter(startDate) && rDate.isBefore(endDate);
      });

      // Calculate revenue
      const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);

      setStats({
        revenue: totalRevenue,
        patients: filteredPatients.length,
        products: products.length,
        refractions: filteredRefractions.length,
        invoicesCount: filteredInvoices.length
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (dates) => {
    if (dates && dates.length === 2) {
      setDateRange(dates);
    }
  };

  return (
    <div>
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        <Card>
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Title level={2}>Báo cáo & Thống kê</Title>
            <Space>
              <span>Chọn khoảng thời gian:</span>
              <RangePicker
                value={dateRange}
                onChange={handleDateChange}
                format="DD/MM/YYYY"
                style={{ width: 300 }}
              />
            </Space>
          </Space>
        </Card>

        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}>
            <Card loading={loading}>
              <Statistic
                title="Doanh thu"
                value={stats.revenue}
                suffix="đ"
                precision={0}
                valueStyle={{ color: '#3f8600' }}
                prefix={<DollarOutlined />}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card loading={loading}>
              <Statistic
                title="Hóa đơn"
                value={stats.invoicesCount}
                valueStyle={{ color: '#1890ff' }}
                prefix={<ShoppingOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card loading={loading}>
              <Statistic
                title="Bệnh nhân mới"
                value={stats.patients}
                valueStyle={{ color: '#722ed1' }}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card loading={loading}>
              <Statistic
                title="Lượt đo khúc xạ"
                value={stats.refractions}
                valueStyle={{ color: '#fa8c16' }}
                prefix={<EyeOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Card title="Thống kê chi tiết" loading={loading}>
              <Space direction="vertical" style={{ width: '100%' }} size={16}>
                <div>
                  <div style={{ marginBottom: 8 }}>
                    <strong>Doanh thu trung bình/hóa đơn:</strong>
                  </div>
                  <div style={{ fontSize: 20, color: '#1890ff' }}>
                    {stats.invoicesCount > 0 
                      ? `${Math.round(stats.revenue / stats.invoicesCount).toLocaleString()} đ`
                      : '0 đ'
                    }
                  </div>
                </div>
                
                <div>
                  <div style={{ marginBottom: 8 }}>
                    <strong>Tỷ lệ chuyển đổi (Đo khúc xạ → Hóa đơn):</strong>
                  </div>
                  <div style={{ fontSize: 20, color: '#52c41a' }}>
                    {stats.refractions > 0 
                      ? `${Math.round((stats.invoicesCount / stats.refractions) * 100)}%`
                      : '0%'
                    }
                  </div>
                </div>

                <div>
                  <div style={{ marginBottom: 8 }}>
                    <strong>Tổng sản phẩm trong kho:</strong>
                  </div>
                  <div style={{ fontSize: 20, color: '#fa8c16' }}>
                    {stats.products}
                  </div>
                </div>
              </Space>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card title="Tóm tắt" loading={loading}>
              <Space direction="vertical" style={{ width: '100%' }} size={16}>
                <div style={{ padding: 16, background: '#f0f2f5', borderRadius: 8 }}>
                  <div style={{ marginBottom: 8, color: '#888' }}>Khoảng thời gian:</div>
                  <div style={{ fontSize: 16, fontWeight: 500 }}>
                    {dateRange[0].format('DD/MM/YYYY')} - {dateRange[1].format('DD/MM/YYYY')}
                  </div>
                </div>

                <div style={{ padding: 16, background: '#f6ffed', borderRadius: 8, border: '1px solid #b7eb8f' }}>
                  <div style={{ marginBottom: 8, color: '#52c41a', fontWeight: 500 }}>
                    Tổng doanh thu
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 600, color: '#52c41a' }}>
                    {stats.revenue.toLocaleString()} đ
                  </div>
                </div>

                <div style={{ padding: 16, background: '#e6f7ff', borderRadius: 8, border: '1px solid #91d5ff' }}>
                  <div style={{ marginBottom: 8, color: '#1890ff', fontWeight: 500 }}>
                    Tổng số giao dịch
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 600, color: '#1890ff' }}>
                    {stats.invoicesCount}
                  </div>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>

        <Card title="Gợi ý phân tích">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <strong>💡 Nhận xét:</strong>
              <ul style={{ marginTop: 8 }}>
                <li>
                  {stats.refractions > stats.invoicesCount 
                    ? `Có ${stats.refractions - stats.invoicesCount} lượt đo khúc xạ chưa chuyển thành hóa đơn. Hãy theo dõi và chăm sóc khách hàng tốt hơn.`
                    : 'Tỷ lệ chuyển đổi tốt! Tiếp tục duy trì chất lượng dịch vụ.'
                  }
                </li>
                <li>
                  {stats.patients > 0
                    ? `Có ${stats.patients} bệnh nhân mới trong kỳ. Đây là dấu hiệu tích cực cho sự phát triển.`
                    : 'Chưa có bệnh nhân mới trong kỳ. Cần tăng cường hoạt động marketing.'
                  }
                </li>
                <li>
                  Doanh thu trung bình mỗi hóa đơn: {stats.invoicesCount > 0 
                    ? `${Math.round(stats.revenue / stats.invoicesCount).toLocaleString()} đ`
                    : '0 đ'
                  }
                </li>
              </ul>
            </div>
          </Space>
        </Card>
      </Space>
    </div>
  );
}
