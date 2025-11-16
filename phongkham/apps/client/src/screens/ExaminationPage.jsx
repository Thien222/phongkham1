import { useState, useEffect } from 'react';
import { Card, Button, message, Row, Col, Space, Tag, List, Typography, Modal, Divider } from 'antd';
import { EyeOutlined, CheckOutlined, SwapOutlined, DeleteOutlined } from '@ant-design/icons';
import { fetchPatients, updatePatient } from '../lib/api';

const { Title, Text } = Typography;

export function ExaminationPage() {
  const [waitingPatients, setWaitingPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    loadWaitingPatients();
    const interval = setInterval(loadWaitingPatients, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadWaitingPatients = async () => {
    try {
      const data = await fetchPatients('', 'examination', '');
      const waiting = data.filter(p => p.visitStatus !== 'completed');
      setWaitingPatients(waiting);
    } catch (error) {
      message.error('Không thể tải danh sách bệnh nhân');
    }
  };

  const handleComplete = async (patient) => {
    try {
      await updatePatient(patient.id, { visitStatus: 'completed' });
      message.success('Đã hoàn thành khám');
      setSelectedPatient(null);
      loadWaitingPatients();
    } catch (error) {
      message.error('Không thể cập nhật trạng thái');
    }
  };

  const handleTransferToRefraction = async (patient) => {
    Modal.confirm({
      title: 'Chuyển sang khúc xạ',
      content: `Chuyển bệnh nhân ${patient.fullName} sang phòng khúc xạ?`,
      onOk: async () => {
        try {
          // Add refraction to visit purpose
          const currentPurpose = patient.visitPurpose;
          let newPurpose = 'examination,refraction';
          if (currentPurpose === 'both' || currentPurpose.includes('refraction')) {
            newPurpose = currentPurpose;
          }
          
          await updatePatient(patient.id, { 
            visitPurpose: newPurpose,
            visitStatus: 'waiting' 
          });
          message.success('Đã chuyển sang phòng khúc xạ');
          loadWaitingPatients();
        } catch (error) {
          message.error('Không thể chuyển bệnh nhân');
        }
      }
    });
  };

  const handleDelete = async (patient) => {
    Modal.confirm({
      title: 'Xóa bệnh nhân',
      content: `Bạn có chắc muốn xóa ${patient.fullName} khỏi danh sách?`,
      okType: 'danger',
      onOk: async () => {
        try {
          await updatePatient(patient.id, { visitStatus: 'completed' });
          message.success('Đã xóa khỏi danh sách');
          loadWaitingPatients();
        } catch (error) {
          message.error('Không thể xóa bệnh nhân');
        }
      }
    });
  };

  return (
    <div>
      <Row gutter={16}>
        {/* Left: Waiting list */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <EyeOutlined />
                <span>Danh sách chờ khám</span>
                <Tag color="blue">{waitingPatients.length}</Tag>
              </Space>
            }
            headStyle={{ background: '#f0f5ff', borderBottom: '2px solid #1890ff' }}
            bordered={false}
          >
            <List
              dataSource={waitingPatients.slice(0, 10)}
              pagination={false}
              renderItem={(patient) => (
                <Card
                  key={patient.id}
                  size="small"
                  style={{ 
                    marginBottom: 12,
                    background: selectedPatient?.id === patient.id ? '#e6f7ff' : 'white',
                    cursor: 'pointer',
                    border: selectedPatient?.id === patient.id ? '2px solid #1890ff' : '1px solid #d9d9d9',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => setSelectedPatient(patient)}
                >
                  <Space direction="vertical" size={4} style={{ width: '100%' }}>
                    <Space>
                      <Tag color="red" style={{ fontSize: '14px', fontWeight: 'bold', minWidth: '50px', textAlign: 'center' }}>
                        {patient.queueNumber || '-'}
                      </Tag>
                      <Text strong style={{ fontSize: '14px' }}>{patient.fullName}</Text>
                      <Tag color="blue">{patient.code}</Tag>
                    </Space>
                    
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ marginBottom: '4px' }}>
                        <Text type="secondary" style={{ fontSize: '12px' }}>SĐT: </Text>
                        <Text style={{ fontSize: '12px' }}>{patient.phone || '-'}</Text>
                      </div>
                      <div style={{ marginBottom: '4px' }}>
                        <Text type="secondary" style={{ fontSize: '12px' }}>Thị lực: </Text>
                        <Text strong style={{ fontSize: '12px' }}>{patient.initialVaOd || '?'} / {patient.initialVaOs || '?'}</Text>
                      </div>
                      <div style={{ marginBottom: '4px' }}>
                        <Text type="secondary" style={{ fontSize: '12px' }}>Có kính: </Text>
                        <Text style={{ fontSize: '12px' }}>{patient.hasGlasses ? 'Có' : 'Không'}</Text>
                      </div>
                      {patient.visitReason && (
                        <div style={{ marginBottom: '4px' }}>
                          <Text type="secondary" style={{ fontSize: '11px' }}>Lý do: </Text>
                          <Text italic style={{ fontSize: '11px' }}>{patient.visitReason}</Text>
                        </div>
                      )}
                      <Tag color={patient.visitStatus === 'waiting' ? 'orange' : patient.visitStatus === 'in_progress' ? 'blue' : 'green'} style={{ fontSize: '11px', marginTop: '4px' }}>
                        {patient.visitStatus === 'waiting' ? 'Chờ khám' : patient.visitStatus === 'in_progress' ? 'Đang khám' : 'Hoàn thành'}
                      </Tag>
                    </div>
                  </Space>
                </Card>
              )}
              locale={{ emptyText: <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>Không có bệnh nhân chờ khám</div> }}
            />
          </Card>
        </Col>

        {/* Right: Patient details */}
        <Col xs={24} lg={16}>
          {selectedPatient ? (
            <Card
              title={
                <Space>
                  <EyeOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
                  <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Thông tin bệnh nhân</span>
                  <Divider type="vertical" />
                  <Text strong style={{ fontSize: '16px' }}>{selectedPatient.fullName}</Text>
                  <Tag color="blue">{selectedPatient.code}</Tag>
                  <Tag color="red" style={{ fontSize: '14px', fontWeight: 'bold' }}>{selectedPatient.queueNumber}</Tag>
                </Space>
              }
              headStyle={{ background: '#f0f5ff', borderBottom: '2px solid #1890ff' }}
              extra={
                <Space>
                  <Button
                    icon={<CheckOutlined />}
                    type="primary"
                    size="large"
                    onClick={() => handleComplete(selectedPatient)}
                    style={{ height: '40px', fontSize: '16px', padding: '0 24px' }}
                  >
                    Hoàn thành
                  </Button>
                  <Button
                    icon={<SwapOutlined />}
                    size="large"
                    onClick={() => handleTransferToRefraction(selectedPatient)}
                    style={{ height: '40px', fontSize: '16px', padding: '0 24px' }}
                  >
                    Chuyển khúc xạ
                  </Button>
                  <Button
                    icon={<DeleteOutlined />}
                    danger
                    size="large"
                    onClick={() => handleDelete(selectedPatient)}
                    style={{ height: '40px', fontSize: '16px', padding: '0 24px' }}
                  >
                    Xóa
                  </Button>
                </Space>
              }
            >
              <Card size="small" style={{ marginBottom: 16, background: '#f9f9f9' }}>
                <Row gutter={24}>
                  <Col span={8}>
                    <Text strong>Số điện thoại: </Text>
                    <Text>{selectedPatient.phone || '-'}</Text>
                  </Col>
                  <Col span={8}>
                    <Text strong>Thị lực: </Text>
                    <Text strong>{selectedPatient.initialVaOd || '?'} / {selectedPatient.initialVaOs || '?'}</Text>
                  </Col>
                  <Col span={8}>
                    <Text strong>Có kính: </Text>
                    <Text>{selectedPatient.hasGlasses ? 'Có' : 'Không'}</Text>
                  </Col>
                  {selectedPatient.visitReason && (
                    <Col span={24} style={{ marginTop: 12 }}>
                      <Text strong>Lý do khám: </Text>
                      <Text italic>{selectedPatient.visitReason}</Text>
                    </Col>
                  )}
                </Row>
              </Card>
              <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                <Text type="secondary">Chức năng khám bệnh đang được phát triển...</Text>
              </div>
            </Card>
          ) : (
            <Card>
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
                <EyeOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                <Title level={4}>Chọn bệnh nhân từ danh sách bên trái để bắt đầu khám</Title>
              </div>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
}
