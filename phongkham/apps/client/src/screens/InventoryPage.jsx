import { useState, useEffect } from 'react';
import { Card, Table, Button, Input, Modal, Form, Select, message, Space, Tag, Alert, Tabs, InputNumber, DatePicker, Row, Col, Upload } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, WarningOutlined, InboxOutlined } from '@ant-design/icons';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../lib/api';
import dayjs from 'dayjs';

const { Search } = Input;
const { Dragger } = Upload;

export function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('glasses');
  const [form] = Form.useForm();

  useEffect(() => {
    loadProducts();
  }, [activeTab]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await fetchProducts(activeTab, searchQuery);
      setProducts(data);
    } catch (error) {
      message.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleAdd = () => {
    setSelectedProduct(null);
    form.resetFields();
    form.setFieldsValue({ category: activeTab });
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setSelectedProduct(record);
    form.setFieldsValue({
      ...record,
      expiresAt: record.expiresAt ? dayjs(record.expiresAt) : null
    });
    setModalVisible(true);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa sản phẩm này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteProduct(id);
          message.success('Đã xóa sản phẩm');
          loadProducts();
        } catch (error) {
          message.error('Không thể xóa sản phẩm');
        }
      }
    });
  };

  const handleSubmit = async (values) => {
    try {
      const data = {
        ...values,
        expiresAt: values.expiresAt ? values.expiresAt.toISOString() : null
      };
      
      if (selectedProduct) {
        await updateProduct(selectedProduct.id, data);
        message.success('Đã cập nhật sản phẩm');
      } else {
        await createProduct(data);
        message.success('Đã thêm sản phẩm mới');
      }
      
      setModalVisible(false);
      loadProducts();
    } catch (error) {
      message.error('Không thể lưu sản phẩm');
    }
  };

  const getLowStockProducts = () => {
    return products.filter(p => p.quantity <= p.minStock);
  };

  const getExpiringProducts = () => {
    const thirtyDaysFromNow = dayjs().add(30, 'day');
    return products.filter(p => 
      p.expiresAt && 
      dayjs(p.expiresAt).isBefore(thirtyDaysFromNow) && 
      dayjs(p.expiresAt).isAfter(dayjs())
    );
  };

  const getExpiredProducts = () => {
    return products.filter(p => 
      p.expiresAt && dayjs(p.expiresAt).isBefore(dayjs())
    );
  };

  const columns = [
    {
      title: 'Mã SP',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Nhà sản xuất',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
      render: (text) => text || '-'
    },
    {
      title: 'Chất liệu',
      dataIndex: 'material',
      key: 'material',
      width: 100,
      render: (text) => text || '-'
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (qty, record) => {
        const isLow = qty <= record.minStock;
        return (
          <Tag color={qty === 0 ? 'red' : isLow ? 'orange' : 'green'}>
            {qty}
          </Tag>
        );
      }
    },
    {
      title: 'Giá bán',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (price) => `${price.toLocaleString()} đ`
    },
    {
      title: 'Hạn sử dụng',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      width: 120,
      render: (date) => {
        if (!date) return '-';
        const isExpired = dayjs(date).isBefore(dayjs());
        const isExpiringSoon = dayjs(date).isBefore(dayjs().add(30, 'day'));
        return (
          <Tag color={isExpired ? 'red' : isExpiringSoon ? 'orange' : 'default'}>
            {dayjs(date).format('DD/MM/YYYY')}
          </Tag>
        );
      }
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 120,
      render: (_, record) => {
        if (record.quantity === 0) {
          return <Tag color="red">Hết hàng</Tag>;
        }
        if (record.quantity <= record.minStock) {
          return <Tag color="orange">Sắp hết</Tag>;
        }
        if (record.expiresAt && dayjs(record.expiresAt).isBefore(dayjs())) {
          return <Tag color="red">Hết hạn</Tag>;
        }
        return <Tag color="green">Còn hàng</Tag>;
      }
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button 
            icon={<EditOutlined />} 
            size="small" 
            onClick={() => handleEdit(record)}
          />
          <Button 
            icon={<DeleteOutlined />} 
            size="small" 
            danger 
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      )
    }
  ];

  const lowStockProducts = getLowStockProducts();
  const expiringProducts = getExpiringProducts();
  const expiredProducts = getExpiredProducts();

  const tabItems = [
    { key: 'glasses', label: 'Tròng kính' },
    { key: 'lenses', label: 'Gọng kính' },
    { key: 'medicine', label: 'Thuốc' }
  ];

  return (
    <div>
      {(lowStockProducts.length > 0 || expiringProducts.length > 0 || expiredProducts.length > 0) && (
        <Card style={{ marginBottom: 16 }} title={<span><WarningOutlined /> Cảnh báo</span>}>
          {expiredProducts.length > 0 && (
            <Alert
              message={`Thuốc sắp hết hạn: ${expiredProducts.length} sản phẩm`}
              description={
                <div>
                  {expiredProducts.map(p => (
                    <div key={p.id}>
                      <strong>{p.name}</strong> - HSD: {dayjs(p.expiresAt).format('DD/MM/YYYY')}
                    </div>
                  ))}
                </div>
              }
              type="error"
              showIcon
              style={{ marginBottom: 12 }}
            />
          )}
          
          {expiringProducts.length > 0 && (
            <Alert
              message={`Thuốc sắp hết hạn: ${expiringProducts.length} sản phẩm`}
              description={`Các sản phẩm sẽ hết hạn trong vòng 30 ngày tới`}
              type="warning"
              showIcon
              style={{ marginBottom: 12 }}
            />
          )}
          
          {lowStockProducts.length > 0 && (
            <Alert
              message={`Sản phẩm sắp hết: ${lowStockProducts.length} sản phẩm`}
              description={
                <div>
                  {lowStockProducts.slice(0, 5).map(p => (
                    <div key={p.id}>
                      <strong>{p.name}</strong> - Còn: {p.quantity}
                    </div>
                  ))}
                  {lowStockProducts.length > 5 && <div>...và {lowStockProducts.length - 5} sản phẩm khác</div>}
                </div>
              }
              type="warning"
              showIcon
            />
          )}
        </Card>
      )}

      <Card 
        title={<h2 style={{ margin: 0 }}>Quản lý kho hàng</h2>}
        extra={
          <Space>
            <Search
              placeholder="Tìm kiếm sản phẩm..."
              allowClear
              onSearch={handleSearch}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: 300 }}
              prefix={<SearchOutlined />}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Thêm sản phẩm
            </Button>
          </Space>
        }
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} style={{ marginBottom: 16 }} />
        
        <Table
          columns={columns}
          dataSource={products}
          loading={loading}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{ 
            pageSize: 20, 
            showSizeChanger: true, 
            showTotal: (total) => `Tổng ${total} sản phẩm` 
          }}
        />
      </Card>

      <Modal
        title={selectedProduct ? 'Sửa thông tin sản phẩm' : 'Thêm sản phẩm mới'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="code"
                label="Mã sản phẩm"
                rules={[{ required: true, message: 'Vui lòng nhập mã sản phẩm' }]}
              >
                <Input placeholder="VD: L001" disabled={!!selectedProduct} />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="category"
                label="Loại sản phẩm"
                rules={[{ required: true, message: 'Vui lòng chọn loại sản phẩm' }]}
              >
                <Select placeholder="Chọn loại sản phẩm">
                  <Select.Option value="glasses">Tròng kính</Select.Option>
                  <Select.Option value="lenses">Gọng kính</Select.Option>
                  <Select.Option value="medicine">Thuốc</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="name"
            label="Tên sản phẩm"
            rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
          >
            <Input placeholder="Nhập tên sản phẩm" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="manufacturer" label="Nhà sản xuất">
                <Input placeholder="VD: Essilor, Hoya, CHEMI" />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item name="material" label="Chất liệu">
                <Input placeholder="VD: Chống AS xanh, đôi màu" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="sphRange" label="Tính năng (SPH Range)">
                <Input placeholder="VD: -20.00 đến +20.00" />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item name="cylRange" label="Độ loạn (CYL Range)">
                <Input placeholder="VD: 0.00 đến -8.00" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="price"
                label="Giá bán (VND)"
                rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
              >
                <InputNumber 
                  placeholder="0" 
                  style={{ width: '100%' }}
                  min={0}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            
            <Col span={8}>
              <Form.Item
                name="quantity"
                label="Số lượng"
                rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
              >
                <InputNumber placeholder="0" style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            
            <Col span={8}>
              <Form.Item name="minStock" label="Tồn kho tối thiểu" initialValue={5}>
                <InputNumber placeholder="5" style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="expiresAt" label="Hạn sử dụng (chỉ áp dụng cho thuốc)">
            <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="imageUrl" label="URL hình ảnh">
            <Input placeholder="https://example.com/image.jpg" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                {selectedProduct ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
