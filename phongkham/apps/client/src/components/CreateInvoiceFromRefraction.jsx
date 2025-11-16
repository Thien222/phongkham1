import { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Button, Table, Input, message, Space, Tag, Modal, InputNumber, Form } from 'antd';
import { ShoppingCartOutlined, SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { fetchProducts, createInvoice } from '../lib/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export function CreateInvoiceFromRefraction({ visible, onClose, patient, refraction }) {
  const [recommendedLenses, setRecommendedLenses] = useState([]);
  const [searchedFrames, setSearchedFrames] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [frameCodeSearch, setFrameCodeSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && patient && refraction) {
      loadRecommendedLenses();
    }
  }, [visible, patient, refraction]);

  const loadRecommendedLenses = async () => {
    if (!refraction) return;

    try {
      setLoading(true);
      // Get all lenses
      const allLenses = await fetchProducts('lenses', '');
      
      // Recommend based on prescription values (odSph, odCyl, odAdd, osSph, osCyl, osAdd)
      const odSph = parseFloat(refraction.odSph) || 0;
      const odCyl = parseFloat(refraction.odCyl) || 0;
      const osSph = parseFloat(refraction.osSph) || 0;
      const osCyl = parseFloat(refraction.osCyl) || 0;
      const odAdd = parseFloat(refraction.odAdd) || 0;
      const osAdd = parseFloat(refraction.osAdd) || 0;
      
      const hasAdd = (odAdd > 0 || osAdd > 0);

      const recommended = allLenses.filter(lens => {
        // Match lens category based on ADD
        if (hasAdd && lens.lensCategory !== 'hai_trong' && lens.lensCategory !== 'da_trong') {
          return false; // Need bifocal or progressive if ADD exists
        }
        
        if (!hasAdd && (lens.lensCategory === 'hai_trong' || lens.lensCategory === 'da_trong')) {
          return false; // Don't recommend bifocal/progressive if no ADD
        }

        // Check SPH range
        if (lens.sphRange) {
          const sphMatch = matchRange(lens.sphRange, Math.max(Math.abs(odSph), Math.abs(osSph)));
          if (!sphMatch) return false;
        }

        // Check CYL range
        if (lens.cylRange) {
          const cylMatch = matchRange(lens.cylRange, Math.max(Math.abs(odCyl), Math.abs(osCyl)));
          if (!cylMatch) return false;
        }

        // Check ADD range for bifocal/progressive
        if (hasAdd && lens.addRange) {
          const addMatch = matchRange(lens.addRange, Math.max(odAdd, osAdd));
          if (!addMatch) return false;
        }

        return true;
      });

      setRecommendedLenses(recommended);
    } catch (error) {
      message.error('Không thể tải danh sách tròng kính');
    } finally {
      setLoading(false);
    }
  };

  const matchRange = (rangeStr, value) => {
    // rangeStr format: "-10.00 ~ +6.00" or "+1.00 ~ +3.00"
    if (!rangeStr) return true;
    
    const parts = rangeStr.split('~').map(p => p.trim());
    if (parts.length !== 2) return true;
    
    const min = parseFloat(parts[0]);
    const max = parseFloat(parts[1]);
    
    return value >= Math.min(min, max) && value <= Math.max(min, max);
  };

  const handleSearchFrame = async () => {
    if (!frameCodeSearch.trim()) {
      message.warning('Vui lòng nhập mã gọng');
      return;
    }

    try {
      const frames = await fetchProducts('frames', frameCodeSearch);
      setSearchedFrames(frames);
    } catch (error) {
      message.error('Không thể tìm kiếm gọng');
    }
  };

  const handleAddItem = (product) => {
    const existing = selectedItems.find(item => item.productId === product.id);
    if (existing) {
      message.warning('Sản phẩm đã được thêm vào giỏ hàng');
      return;
    }

    setSelectedItems([
      ...selectedItems,
      {
        productId: product.id,
        productCode: product.code,
        productName: product.name,
        unitPrice: product.price,
        quantity: 1,
        totalPrice: product.price
      }
    ]);
    message.success(`Đã thêm ${product.name} vào giỏ hàng`);
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    setSelectedItems(selectedItems.map(item =>
      item.productId === productId
        ? { ...item, quantity: newQuantity, totalPrice: item.unitPrice * newQuantity }
        : item
    ));
  };

  const handleRemoveItem = (productId) => {
    setSelectedItems(selectedItems.filter(item => item.productId !== productId));
  };

  const handleCreateInvoice = async () => {
    if (selectedItems.length === 0) {
      message.warning('Vui lòng chọn ít nhất 1 sản phẩm');
      return;
    }

    try {
      const total = selectedItems.reduce((sum, item) => sum + item.totalPrice, 0);
      const invoiceData = {
        patientId: patient.id,
        type: 'glasses',
        items: selectedItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        })),
        total,
        status: 'UNPAID'
      };

      await createInvoice(invoiceData);
      message.success('Đã tạo hóa đơn thành công');
      onClose();
    } catch (error) {
      message.error('Không thể tạo hóa đơn');
    }
  };

  const lensColumns = [
    {
      title: 'Mã SP',
      dataIndex: 'code',
      key: 'code',
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Loại',
      dataIndex: 'lensCategory',
      key: 'lensCategory',
      render: (text) => {
        const map = {
          'don_trong': 'Đơn tròng',
          'hai_trong': '2 tròng',
          'da_trong': 'Đa tròng'
        };
        return map[text] || text;
      }
    },
    {
      title: 'SPH',
      dataIndex: 'sphRange',
      key: 'sphRange'
    },
    {
      title: 'CYL',
      dataIndex: 'cylRange',
      key: 'cylRange'
    },
    {
      title: 'ADD',
      dataIndex: 'addRange',
      key: 'addRange',
      render: (text) => text || '-'
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `${price.toLocaleString()}đ`
    },
    {
      title: 'Tồn kho',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (qty) => <Tag color={qty > 0 ? 'green' : 'red'}>{qty}</Tag>
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button
          size="small"
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => handleAddItem(record)}
          disabled={record.quantity === 0}
        >
          Thêm
        </Button>
      )
    }
  ];

  const cartColumns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text><br />
          <Text type="secondary">{record.productCode}</Text>
        </div>
      )
    },
    {
      title: 'Đơn giá',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (price) => `${price.toLocaleString()}đ`
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (qty, record) => (
        <InputNumber
          min={1}
          value={qty}
          onChange={(value) => handleUpdateQuantity(record.productId, value)}
        />
      )
    },
    {
      title: 'Thành tiền',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (price) => <Text strong>{price.toLocaleString()}đ</Text>
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button
          size="small"
          danger
          onClick={() => handleRemoveItem(record.productId)}
        >
          Xóa
        </Button>
      )
    }
  ];

  if (!patient || !refraction) return null;

  const totalAmount = selectedItems.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <Modal
      title="Tạo hóa đơn từ kết quả khúc xạ"
      open={visible}
      onCancel={onClose}
      width={1200}
      footer={null}
    >
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Text strong>Bệnh nhân:</Text> {patient.fullName} ({patient.code})<br />
            <Text strong>Ngày khúc xạ:</Text> {dayjs(refraction.examDate).format('DD/MM/YYYY')}
          </Col>
          <Col span={12}>
            <Text strong>Kính điều chỉnh:</Text><br />
            OD: {refraction.odSph} {refraction.odCyl} x {refraction.odAxis} {refraction.odAdd ? `(ADD: ${refraction.odAdd})` : ''}<br />
            OS: {refraction.osSph} {refraction.osCyl} x {refraction.osAxis} {refraction.osAdd ? `(ADD: ${refraction.osAdd})` : ''}
          </Col>
        </Row>
      </Card>

      <Card
        title="Gợi ý tròng kính"
        size="small"
        style={{ marginBottom: 16 }}
      >
        <Table
          columns={lensColumns}
          dataSource={recommendedLenses}
          rowKey="id"
          loading={loading}
          pagination={false}
          scroll={{ y: 200 }}
          locale={{ emptyText: 'Không có tròng kính phù hợp' }}
        />
      </Card>

      <Card
        title="Tìm gọng kính"
        size="small"
        style={{ marginBottom: 16 }}
      >
        <Space>
          <Input
            placeholder="Nhập mã gọng kính"
            value={frameCodeSearch}
            onChange={(e) => setFrameCodeSearch(e.target.value)}
            onPressEnter={handleSearchFrame}
            style={{ width: 200 }}
          />
          <Button icon={<SearchOutlined />} onClick={handleSearchFrame}>
            Tìm kiếm
          </Button>
        </Space>
        {searchedFrames.length > 0 && (
          <Table
            columns={lensColumns.filter(col => !['sphRange', 'cylRange', 'addRange', 'lensCategory'].includes(col.key))}
            dataSource={searchedFrames}
            rowKey="id"
            pagination={false}
            style={{ marginTop: 16 }}
          />
        )}
      </Card>

      <Card
        title={`Giỏ hàng (${selectedItems.length} sản phẩm)`}
        size="small"
        extra={
          <Title level={5} style={{ margin: 0 }}>
            Tổng: <Text type="danger">{totalAmount.toLocaleString()}đ</Text>
          </Title>
        }
      >
        <Table
          columns={cartColumns}
          dataSource={selectedItems}
          rowKey="productId"
          pagination={false}
          locale={{ emptyText: 'Chưa có sản phẩm nào trong giỏ' }}
        />
        <div style={{ textAlign: 'right', marginTop: 16 }}>
          <Space>
            <Button onClick={onClose}>Hủy</Button>
            <Button
              type="primary"
              icon={<ShoppingCartOutlined />}
              onClick={handleCreateInvoice}
              disabled={selectedItems.length === 0}
            >
              Tạo hóa đơn
            </Button>
          </Space>
        </div>
      </Card>
    </Modal>
  );
}


