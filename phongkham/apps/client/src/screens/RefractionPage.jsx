import { useState, useEffect } from 'react';
import { Card, Select, Button, Input, Form, DatePicker, message, Row, Col, Divider, Table, Space, Tag, Modal } from 'antd';
import { SearchOutlined, PlusOutlined, SaveOutlined, SwapOutlined } from '@ant-design/icons';
import { fetchPatients, createRefraction, fetchProducts } from '../lib/api';
import { CreateInvoiceModal } from '../components/CreateInvoiceModal';
import api from '../lib/api';
import dayjs from 'dayjs';

export function RefractionPage() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [products, setProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    loadPatients();
    loadAllProducts();
  }, []);

  const loadPatients = async (q = '') => {
    try {
      // Chỉ lấy bệnh nhân có mục đích cắt kính hoặc cả hai
      const data = await fetchPatients(q, 'refraction', 'waiting');
      setPatients(data);
    } catch (error) {
      message.error('Không thể tải danh sách bệnh nhân');
    }
  };

  const loadAllProducts = async () => {
    try {
      // Load CẢ tròng kính VÀ gọng kính
      const [glassesData, framesData] = await Promise.all([
        fetchProducts('glasses'),
        fetchProducts('lenses')
      ]);
      setProducts([...glassesData, ...framesData]);
    } catch (error) {
      message.error('Không thể tải danh sách sản phẩm');
    }
  };

  const handlePatientSelect = (value) => {
    const patient = patients.find(p => p.id === value);
    setSelectedPatient(patient);
  };

  const handleSubmit = async (values) => {
    if (!selectedPatient) {
      message.warning('Vui lòng chọn bệnh nhân');
      return;
    }

    try {
      const payload = {
        patientId: selectedPatient.id,
        odSph: values.odSph || null,
        odCyl: values.odCyl || null,
        odAxis: values.odAxis || null,
        odVa: values.odVa || null,
        osSph: values.osSph || null,
        osCyl: values.osCyl || null,
        osAxis: values.osAxis || null,
        osVa: values.osVa || null,
        examDate: values.examDate ? values.examDate.toISOString() : new Date().toISOString(),
        notes: values.notes || null
      };

      await createRefraction(payload);
      message.success('Đã lưu kết quả đo khúc xạ');
      
      // Generate product recommendations
      generateRecommendations(values);
      
      form.resetFields(['odSph', 'odCyl', 'odAxis', 'odVa', 'osSph', 'osCyl', 'osAxis', 'osVa', 'notes']);
    } catch (error) {
      message.error('Không thể lưu kết quả đo khúc xạ');
    }
  };

  const parseRange = (rangeStr) => {
    if (!rangeStr) return null;
    
    // Parse range like "-20.00 đến +20.00" or "-8.00 to +8.00"
    const match = rangeStr.match(/([-+]?\d+\.?\d*)\s*(?:đến|to|-)\s*([-+]?\d+\.?\d*)/i);
    if (match) {
      return {
        min: parseFloat(match[1]),
        max: parseFloat(match[2])
      };
    }
    return null;
  };

  const isValueInRange = (value, rangeStr) => {
    if (!rangeStr) return true; // If no range specified, accept all
    const range = parseRange(rangeStr);
    if (!range) return true;
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return true;
    
    return numValue >= range.min && numValue <= range.max;
  };

  const generateRecommendations = (values) => {
    // Parse input values
    const odSph = values.odSph || '0';
    const osSph = values.osSph || '0';
    const odCyl = values.odCyl || '0';
    const osCyl = values.osCyl || '0';

    // Find max values to filter products
    const sphValues = [parseFloat(odSph), parseFloat(osSph)].filter(v => !isNaN(v));
    const cylValues = [parseFloat(odCyl), parseFloat(osCyl)].filter(v => !isNaN(v));
    
    const maxSphAbs = sphValues.length > 0 ? Math.max(...sphValues.map(Math.abs)) : 0;
    const minSph = sphValues.length > 0 ? Math.min(...sphValues) : 0;
    const maxSph = sphValues.length > 0 ? Math.max(...sphValues) : 0;
    
    const maxCylAbs = cylValues.length > 0 ? Math.max(...cylValues.map(Math.abs)) : 0;
    const minCyl = cylValues.length > 0 ? Math.min(...cylValues) : 0;
    const maxCyl = cylValues.length > 0 ? Math.max(...cylValues) : 0;

    // Filter products based on prescription
    const matched = products.filter(product => {
      // Check SPH range
      const sphInRange = isValueInRange(odSph, product.sphRange) && 
                         isValueInRange(osSph, product.sphRange);
      
      // Check CYL range
      const cylInRange = isValueInRange(odCyl, product.cylRange) && 
                         isValueInRange(osCyl, product.cylRange);
      
      // Product must accommodate both eyes
      return sphInRange && cylInRange;
    });

    // Sort by relevance (products with tighter ranges first)
    const sorted = matched.sort((a, b) => {
      const aRange = parseRange(a.sphRange);
      const bRange = parseRange(b.sphRange);
      
      if (!aRange || !bRange) return 0;
      
      const aWidth = aRange.max - aRange.min;
      const bWidth = bRange.max - bRange.min;
      
      return aWidth - bWidth; // Smaller range = more specialized = higher priority
    });

    setRecommendations(sorted);
    
    if (sorted.length > 0) {
      message.success(`Tìm thấy ${sorted.length} sản phẩm phù hợp với chỉ số khúc xạ`);
    } else {
      message.warning('Không tìm thấy sản phẩm phù hợp. Vui lòng kiểm tra kho hàng hoặc đặt hàng mới.');
    }
  };

  const handleAddProduct = (product) => {
    const existing = selectedProducts.find(p => p.id === product.id);
    if (existing) {
      setSelectedProducts(selectedProducts.map(p => 
        p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
      ));
    } else {
      setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
    }
    message.success(`Đã thêm ${product.name} vào đơn hàng`);
  };

  const handleRemoveProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
  };

  const handleOpenInvoiceModal = () => {
    if (selectedProducts.length === 0) {
      message.warning('Vui lòng thêm ít nhất một sản phẩm vào đơn hàng bằng cách click nút "Thêm"');
      return;
    }
    setShowInvoiceModal(true);
  };

  const handleInvoiceModalClose = (success) => {
    if (success) {
      setSelectedProducts([]);
      setRecommendations([]);
    }
    setShowInvoiceModal(false);
  };

  const handleSwitchToExamination = async () => {
    if (!selectedPatient) {
      message.warning('Vui lòng chọn bệnh nhân');
      return;
    }

    try {
      // Add "examination" to visit purpose
      await api.patch(`/patients/${selectedPatient.id}/visit-purpose`, {
        addPurpose: 'examination'
      });
      
      message.success('Đã chuyển bệnh nhân sang Khám bệnh');
      
      Modal.info({
        title: 'Chuyển sang Khám bệnh',
        content: 'Bệnh nhân đã được thêm vào danh sách Khám bệnh. Vui lòng chuyển sang tab Khám bệnh để tiếp tục.',
        onOk: () => {
          // Reload patients to update the visitPurpose
          loadPatients();
        }
      });
    } catch (error) {
      console.error('Error switching to examination:', error);
      message.error('Không thể chuyển sang Khám bệnh');
    }
  };

  const recommendationColumns = [
    {
      title: 'Loại',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (cat) => (
        <Tag color={cat === 'glasses' ? 'blue' : 'green'}>
          {cat === 'glasses' ? 'Tròng kính' : 'Gọng kính'}
        </Tag>
      )
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Chỉ số SPH',
      dataIndex: 'sphRange',
      key: 'sphRange',
      width: 120,
      render: (text) => text || '-'
    },
    {
      title: 'Chỉ số CYL',
      dataIndex: 'cylRange',
      key: 'cylRange',
      width: 120,
      render: (text) => text || '-'
    },
    {
      title: 'Chất liệu',
      dataIndex: 'material',
      key: 'material',
      width: 120,
      render: (text) => text || '-'
    },
    {
      title: 'Tồn kho',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      render: (qty) => (
        <Tag color={qty > 0 ? 'green' : 'red'}>
          {qty}
        </Tag>
      )
    },
    {
      title: 'Giá bán',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (price) => `${price.toLocaleString()} đ`
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Button 
          type="primary" 
          size="small" 
          icon={<PlusOutlined />}
          onClick={() => handleAddProduct(record)}
          disabled={record.quantity === 0}
        >
          Thêm
        </Button>
      )
    }
  ];

  return (
    <div>
      <Card title={<h2 style={{ margin: 0 }}>Đo khúc xạ</h2>}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Chọn bệnh nhân" required>
                <Select
                  showSearch
                  placeholder="Tìm kiếm bệnh nhân..."
                  optionFilterProp="children"
                  onChange={handlePatientSelect}
                  onSearch={(value) => loadPatients(value)}
                  filterOption={false}
                  suffixIcon={<SearchOutlined />}
                >
                  {patients.map(patient => (
                    <Select.Option key={patient.id} value={patient.id}>
                      {patient.fullName} ({patient.code})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="examDate" label="Ngày khám" initialValue={dayjs()}>
                <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          {selectedPatient && (
            <Card type="inner" style={{ marginBottom: 16, background: '#f5f5f5' }}>
              <Row gutter={16}>
                <Col span={8}><strong>Họ tên:</strong> {selectedPatient.fullName}</Col>
                <Col span={8}><strong>Mã BN:</strong> {selectedPatient.code}</Col>
                <Col span={8}><strong>SĐT:</strong> {selectedPatient.phone || '-'}</Col>
              </Row>
              <Button 
                icon={<SwapOutlined />} 
                onClick={handleSwitchToExamination}
                block
                style={{ marginTop: 12 }}
              >
                Chuyển sang Khám bệnh
              </Button>
            </Card>
          )}

          <Divider>Kết quả đo khúc xạ</Divider>

          <Row gutter={24}>
            <Col span={12}>
              <Card title="Mắt phải (OD)" type="inner">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="odSph" label="Cầu (SPH)">
                      <Input placeholder="VD: -3.50" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="odCyl" label="Trụ (CYL)">
                      <Input placeholder="VD: -1.00" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="odAxis" label="Trục (AXIS)">
                      <Input placeholder="VD: 180" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="odVa" label="Thị lực (VA)">
                      <Input placeholder="VD: 10/10" />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>

            <Col span={12}>
              <Card title="Mắt trái (OS)" type="inner">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="osSph" label="Cầu (SPH)">
                      <Input placeholder="VD: -3.25" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="osCyl" label="Trụ (CYL)">
                      <Input placeholder="VD: -0.75" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="osAxis" label="Trục (AXIS)">
                      <Input placeholder="VD: 15" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="osVa" label="Thị lực (VA)">
                      <Input placeholder="VD: 10/10" />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>

          <Form.Item name="notes" label="Ghi chú">
            <Input.TextArea rows={3} placeholder="Nhập ghi chú..." />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                Lưu kết quả
              </Button>
              {recommendations.length > 0 && (
                <Button 
                  onClick={handleOpenInvoiceModal}
                  type={selectedProducts.length > 0 ? 'default' : 'dashed'}
                >
                  Tạo đơn hàng ({selectedProducts.length})
                </Button>
              )}
            </Space>
          </Form.Item>
        </Form>

        {recommendations.length > 0 && (
          <>
            <Divider>Sản phẩm gợi ý ({recommendations.filter(p => 
              p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.code.toLowerCase().includes(searchQuery.toLowerCase())
            ).length}/{recommendations.length} sản phẩm)</Divider>
            
            <Input
              placeholder="Tìm kiếm sản phẩm..."
              prefix={<SearchOutlined />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ marginBottom: '16px', width: '300px' }}
              allowClear
            />
            
            {selectedProducts.length === 0 && (
              <div style={{ 
                background: '#e6f7ff', 
                border: '1px solid #91d5ff', 
                padding: '12px', 
                borderRadius: '4px', 
                marginBottom: '16px',
                color: '#0050b3'
              }}>
                💡 <strong>Lưu ý:</strong> Hóa đơn kính cần có CẢ tròng kính VÀ gọng kính. Click nút <strong>"Thêm"</strong> để chọn sản phẩm, sau đó click <strong>"Tạo đơn hàng"</strong>.
              </div>
            )}
            <Table
              columns={recommendationColumns}
              dataSource={recommendations.filter(p => 
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.code.toLowerCase().includes(searchQuery.toLowerCase())
              )}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              size="small"
            />
          </>
        )}
      </Card>

      <CreateInvoiceModal
        visible={showInvoiceModal}
        onClose={handleInvoiceModalClose}
        patient={selectedPatient}
        products={selectedProducts}
        type="glasses"
      />
    </div>
  );
}
