import { useState, useEffect } from 'react';
import { Card, Button, Form, message, Row, Col, Space, Tag, Input, Select, Checkbox, List, Divider, Typography, Modal } from 'antd';
import { SaveOutlined, EyeOutlined, PrinterOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { fetchPatients, createRefraction, updatePatient } from '../lib/api';
import { CreateInvoiceFromRefraction } from '../components/CreateInvoiceFromRefraction';
import { PrintRefractionSheet } from '../components/PrintRefractionSheet';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export function RefractionPage() {
  const [waitingPatients, setWaitingPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [savedRefraction, setSavedRefraction] = useState(null);
  const [invoiceModalVisible, setInvoiceModalVisible] = useState(false);
  const [printModalVisible, setPrintModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadWaitingPatients();
    const interval = setInterval(loadWaitingPatients, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadWaitingPatients = async () => {
    try {
      // Load patients with visitPurpose including 'refraction' and status not completed
      const data = await fetchPatients('', 'refraction', '');
      const waiting = data.filter(p => p.visitStatus !== 'completed');
      setWaitingPatients(waiting);
    } catch (error) {
      message.error('Không thể tải danh sách bệnh nhân');
    }
  };

  const handleSelectPatient = async (patient) => {
    setSelectedPatient(patient);
    form.resetFields();
    
    // Update patient status to in_progress
    try {
      await updatePatient(patient.id, { visitStatus: 'in_progress' });
      loadWaitingPatients();
    } catch (error) {
      console.error('Failed to update patient status');
    }
  };

  const handleSave = async (values) => {
    if (!selectedPatient) {
      message.warning('Vui lòng chọn bệnh nhân');
      return;
    }

    try {
      setLoading(true);
      
      // Create refraction record
      const refractionData = {
        patientId: selectedPatient.id,
        ...values,
        examDate: new Date().toISOString()
      };
      
      const createdRefraction = await createRefraction(refractionData);

      // Update patient status to completed for refraction
      await updatePatient(selectedPatient.id, { visitStatus: 'completed' });

      message.success('Đã lưu kết quả khúc xạ');
      
      // Save refraction for creating invoice
      setSavedRefraction({ ...createdRefraction, ...refractionData });
      
      // Ask what user wants to do next
      Modal.confirm({
        title: 'Lưu kết quả thành công!',
        content: 'Bạn muốn in phiếu khúc xạ hoặc tạo hóa đơn kính?',
        okText: 'In phiếu khúc xạ',
        cancelText: 'Tạo hóa đơn',
        onOk: () => {
          setPrintModalVisible(true);
        },
        onCancel: () => {
          setInvoiceModalVisible(true);
        }
      });
    } catch (error) {
      message.error('Không thể lưu kết quả');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Row gutter={16}>
        {/* Left: Waiting list */}
        <Col xs={24} lg={6}>
          <Card 
            title={
              <Space>
                <EyeOutlined />
                <span>Danh sách chờ khám</span>
                <Tag color="blue">{waitingPatients.length}</Tag>
              </Space>
            } 
            bordered={false}
            headStyle={{ background: '#f0f5ff', borderBottom: '2px solid #1890ff' }}
          >
            <List
              dataSource={waitingPatients.slice(0, 10)}
              pagination={false}
              renderItem={(patient) => (
                <List.Item
                  key={patient.id}
                  style={{
                    cursor: 'pointer',
                    background: selectedPatient?.id === patient.id ? '#e6f7ff' : 'white',
                    padding: '12px',
                    borderRadius: '6px',
                    marginBottom: '8px',
                    border: selectedPatient?.id === patient.id ? '2px solid #1890ff' : '1px solid #d9d9d9',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => handleSelectPatient(patient)}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <Tag color="red" style={{ fontSize: '14px', fontWeight: 'bold', minWidth: '50px', textAlign: 'center' }}>
                          {patient.queueNumber || '-'}
                        </Tag>
                        <Text strong style={{ fontSize: '14px' }}>{patient.fullName}</Text>
                      </Space>
                    }
                    description={
                      <div style={{ marginTop: '8px' }}>
                        <div style={{ marginBottom: '4px' }}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>SĐT: </Text>
                          <Text style={{ fontSize: '12px' }}>{patient.phone || '-'}</Text>
                        </div>
                        <div style={{ marginBottom: '4px' }}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>Thị lực: </Text>
                          <Text strong style={{ fontSize: '12px' }}>{patient.initialVaOd || '?'} / {patient.initialVaOs || '?'}</Text>
                        </div>
                        {patient.visitReason && (
                          <div>
                            <Text type="secondary" italic style={{ fontSize: '11px' }}>{patient.visitReason}</Text>
                          </div>
                        )}
                        <Tag color={patient.visitStatus === 'waiting' ? 'orange' : patient.visitStatus === 'in_progress' ? 'blue' : 'green'} style={{ marginTop: '4px', fontSize: '11px' }}>
                          {patient.visitStatus === 'waiting' ? 'Chờ khám' : patient.visitStatus === 'in_progress' ? 'Đang khám' : 'Hoàn thành'}
                        </Tag>
                      </div>
                    }
                  />
                </List.Item>
              )}
              locale={{ emptyText: <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>Không có bệnh nhân chờ khám</div> }}
            />
          </Card>
        </Col>

        {/* Right: Refraction form */}
        <Col xs={24} lg={18}>
          {selectedPatient ? (
            <Card
              title={
                <Space>
                  <EyeOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
                  <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Kết quả đo khúc xạ</span>
                  <Divider type="vertical" />
                  <Text strong style={{ fontSize: '16px' }}>{selectedPatient.fullName}</Text>
                  <Tag color="blue">{selectedPatient.code}</Tag>
                  <Tag color="red" style={{ fontSize: '14px', fontWeight: 'bold' }}>{selectedPatient.queueNumber}</Tag>
                </Space>
              }
              extra={
                <Button type="primary" icon={<SaveOutlined />} onClick={() => form.submit()} loading={loading} size="large" style={{ height: '40px', fontSize: '16px', padding: '0 24px' }}>
                  Lưu kết quả
                </Button>
              }
              headStyle={{ background: '#f0f5ff', borderBottom: '2px solid #1890ff' }}
            >
              {/* Patient info */}
              <Card size="small" style={{ marginBottom: 16, background: '#f0f5ff' }}>
                <Row gutter={16}>
                  <Col span={8}>
                    <Text strong>Thị lực ban đầu:</Text> {selectedPatient.initialVaOd || '?'} / {selectedPatient.initialVaOs || '?'}
                  </Col>
                  <Col span={8}>
                    <Text strong>Có đeo kính:</Text> {selectedPatient.hasGlasses ? 'Có' : 'Không'}
                  </Col>
                  <Col span={8}>
                    <Text strong>Lý do:</Text> {selectedPatient.visitReason || '-'}
                  </Col>
                </Row>
              </Card>

              <Form form={form} layout="vertical" onFinish={handleSave}>
                {/* 1. Khúc xạ khách quan (Skiascopy) */}
                <Card title="1. Khúc xạ khách quan (Skiascopy)" size="small" style={{ marginBottom: 16 }}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Title level={5}>Mắt phải (OD)</Title>
                      <Row gutter={8}>
                        <Col span={8}>
                          <Form.Item label="SPH" name="skiasOdSph">
                            <Input placeholder="-2.00" />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item label="CYL" name="skiasOdCyl">
                            <Input placeholder="-1.00" />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item label="AXIS" name="skiasOdAxis">
                            <Input placeholder="90" />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Col>
                    <Col span={12}>
                      <Title level={5}>Mắt trái (OS)</Title>
                      <Row gutter={8}>
                        <Col span={8}>
                          <Form.Item label="SPH" name="skiasOsSph">
                            <Input placeholder="-2.00" />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item label="CYL" name="skiasOsCyl">
                            <Input placeholder="-1.00" />
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item label="AXIS" name="skiasOsAxis">
                            <Input placeholder="90" />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                  <Form.Item name="hasCycloplegia" valuePropName="checked">
                    <Checkbox>Có liệt điều tiết</Checkbox>
                  </Form.Item>
                </Card>

                {/* 2. Khúc xạ chủ quan (Subjective) */}
                <Card title="2. Khúc xạ chủ quan (Subj. Refraction)" size="small" style={{ marginBottom: 16 }}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Title level={5}>Mắt phải (OD)</Title>
                      <Row gutter={8}>
                        <Col span={6}>
                          <Form.Item label="SPH" name="subjOdSph">
                            <Input placeholder="-2.00" />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item label="CYL" name="subjOdCyl">
                            <Input placeholder="-1.00" />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item label="AXIS" name="subjOdAxis">
                            <Input placeholder="90" />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item label="VA" name="subjOdVa">
                            <Input placeholder="10/10" />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Col>
                    <Col span={12}>
                      <Title level={5}>Mắt trái (OS)</Title>
                      <Row gutter={8}>
                        <Col span={6}>
                          <Form.Item label="SPH" name="subjOsSph">
                            <Input placeholder="-2.00" />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item label="CYL" name="subjOsCyl">
                            <Input placeholder="-1.00" />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item label="AXIS" name="subjOsAxis">
                            <Input placeholder="90" />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item label="VA" name="subjOsVa">
                            <Input placeholder="10/10" />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Card>

                {/* 3. Kính điều chỉnh (Prescription) */}
                <Card title="3. Kính điều chỉnh (Prescription)" size="small" style={{ marginBottom: 16 }}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Title level={5}>Mắt phải (OD)</Title>
                      <Row gutter={8}>
                        <Col span={5}>
                          <Form.Item label="SPH" name="odSph">
                            <Input placeholder="-2.00" />
                          </Form.Item>
                        </Col>
                        <Col span={5}>
                          <Form.Item label="CYL" name="odCyl">
                            <Input placeholder="-1.00" />
                          </Form.Item>
                        </Col>
                        <Col span={5}>
                          <Form.Item label="AXIS" name="odAxis">
                            <Input placeholder="90" />
                          </Form.Item>
                        </Col>
                        <Col span={5}>
                          <Form.Item label="VA" name="odVa">
                            <Input placeholder="10/10" />
                          </Form.Item>
                        </Col>
                        <Col span={4}>
                          <Form.Item label="ADD" name="odAdd">
                            <Input placeholder="+2.00" />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Col>
                    <Col span={12}>
                      <Title level={5}>Mắt trái (OS)</Title>
                      <Row gutter={8}>
                        <Col span={5}>
                          <Form.Item label="SPH" name="osSph">
                            <Input placeholder="-2.00" />
                          </Form.Item>
                        </Col>
                        <Col span={5}>
                          <Form.Item label="CYL" name="osCyl">
                            <Input placeholder="-1.00" />
                          </Form.Item>
                        </Col>
                        <Col span={5}>
                          <Form.Item label="AXIS" name="osAxis">
                            <Input placeholder="90" />
                          </Form.Item>
                        </Col>
                        <Col span={5}>
                          <Form.Item label="VA" name="osVa">
                            <Input placeholder="10/10" />
                          </Form.Item>
                        </Col>
                        <Col span={4}>
                          <Form.Item label="ADD" name="osAdd">
                            <Input placeholder="+2.00" />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                  
                  <Divider />
                  
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item label="Khoảng cách đồng tử (PD)" name="pd">
                        <Input placeholder="62mm" />
                      </Form.Item>
                    </Col>
                    <Col span={16}>
                      <Form.Item label="Loại kính" name="lensType">
                        <Select placeholder="Chọn loại kính">
                          <Select.Option value="da_trong">Kính đa tròng (Progressive)</Select.Option>
                          <Select.Option value="hai_trong">Kính 2 tròng (Bifocal)</Select.Option>
                          <Select.Option value="don_trong_xa">Kính đơn tròng - Nhìn xa</Select.Option>
                          <Select.Option value="don_trong_gan">Kính đơn tròng - Nhìn gần</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item label="Ghi chú" name="notes">
                    <Input.TextArea rows={3} placeholder="Ghi chú thêm..." />
                  </Form.Item>
                </Card>
              </Form>
            </Card>
          ) : (
            <Card>
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
                <EyeOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                <Title level={4}>Chọn bệnh nhân từ danh sách bên trái để bắt đầu đo khúc xạ</Title>
              </div>
            </Card>
          )}
        </Col>
      </Row>
      
      <CreateInvoiceFromRefraction
        visible={invoiceModalVisible}
        onClose={() => {
          setInvoiceModalVisible(false);
          form.resetFields();
          setSelectedPatient(null);
          setSavedRefraction(null);
          loadWaitingPatients();
        }}
        patient={selectedPatient}
        refraction={savedRefraction}
      />
      
      <PrintRefractionSheet
        visible={printModalVisible}
        onClose={() => {
          setPrintModalVisible(false);
          form.resetFields();
          setSelectedPatient(null);
          setSavedRefraction(null);
          loadWaitingPatients();
        }}
        patient={selectedPatient}
        refraction={savedRefraction}
      />
    </div>
  );
}
