import { useState, useEffect } from 'react';
import { Card, Select, Button, Input, Form, DatePicker, message, Row, Col, Table, Space, Modal, Tag } from 'antd';
import { SearchOutlined, SaveOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { fetchPatients, fetchExaminations, createExamination, updateExamination, deleteExamination } from '../lib/api';
import dayjs from 'dayjs';

const { TextArea } = Input;

export function ExaminationPage() {
  const [patients, setPatients] = useState([]);
  const [examinations, setExaminations] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadPatients();
    loadExaminations();
  }, []);

  const loadPatients = async (q = '') => {
    try {
      // Chỉ lấy bệnh nhân có mục đích khám mắt hoặc cả hai
      const data = await fetchPatients(q, 'examination', 'waiting');
      setPatients(data);
    } catch (error) {
      message.error('Không thể tải danh sách bệnh nhân');
    }
  };

  const loadExaminations = async (patientId = null) => {
    try {
      setLoading(true);
      const data = await fetchExaminations(patientId);
      setExaminations(data);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSelect = (value) => {
    const patient = patients.find(p => p.id === value);
    setSelectedPatient(patient);
    loadExaminations(value);
  };

  const handleSubmit = async (values) => {
    if (!selectedPatient) {
      message.warning('Vui lòng chọn bệnh nhân');
      return;
    }

    try {
      const payload = {
        patientId: selectedPatient.id,
        symptoms: values.symptoms || null,
        diagnosis: values.diagnosis || null,
        treatment: values.treatment || null,
        medications: values.medications || null,
        examDate: values.examDate ? values.examDate.toISOString() : new Date().toISOString()
      };

      if (selectedExam) {
        await updateExamination(selectedExam.id, payload);
        message.success('Đã cập nhật phiếu khám bệnh');
      } else {
        await createExamination(payload);
        message.success('Đã lưu phiếu khám bệnh');
      }
      
      setSelectedExam(null);
      form.resetFields(['symptoms', 'diagnosis', 'treatment', 'medications']);
      loadExaminations(selectedPatient.id);
    } catch (error) {
      message.error('Không thể lưu phiếu khám bệnh');
    }
  };

  const handleEdit = (record) => {
    setSelectedExam(record);
    form.setFieldsValue({
      symptoms: record.symptoms,
      diagnosis: record.diagnosis,
      treatment: record.treatment,
      medications: record.medications,
      examDate: dayjs(record.examDate)
    });
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa phiếu khám này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteExamination(id);
          message.success('Đã xóa phiếu khám');
          loadExaminations(selectedPatient?.id);
        } catch (error) {
          message.error('Không thể xóa phiếu khám');
        }
      }
    });
  };

  const handleViewDetails = (record) => {
    setSelectedExam(record);
    setDetailsVisible(true);
  };

  const columns = [
    {
      title: 'Ngày khám',
      dataIndex: 'examDate',
      key: 'examDate',
      width: 150,
      render: (text) => dayjs(text).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Bệnh nhân',
      dataIndex: ['patient', 'fullName'],
      key: 'patientName',
    },
    {
      title: 'Triệu chứng',
      dataIndex: 'symptoms',
      key: 'symptoms',
      ellipsis: true,
      render: (text) => text || '-'
    },
    {
      title: 'Chẩn đoán',
      dataIndex: 'diagnosis',
      key: 'diagnosis',
      ellipsis: true,
      render: (text) => text || '-'
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button 
            icon={<EyeOutlined />} 
            size="small" 
            onClick={() => handleViewDetails(record)}
          />
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

  return (
    <div>
      <Row gutter={16}>
        <Col span={10}>
          <Card title={<h2 style={{ margin: 0 }}>Phiếu khám bệnh</h2>}>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.Item label="Chọn bệnh nhân" required>
                <Select
                  showSearch
                  placeholder="Tìm kiếm bệnh nhân..."
                  optionFilterProp="children"
                  onChange={handlePatientSelect}
                  onSearch={(value) => loadPatients(value)}
                  filterOption={false}
                  suffixIcon={<SearchOutlined />}
                  value={selectedPatient?.id}
                >
                  {patients.map(patient => (
                    <Select.Option key={patient.id} value={patient.id}>
                      {patient.fullName} ({patient.code})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              {selectedPatient && (
                <Card type="inner" style={{ marginBottom: 16, background: '#f5f5f5' }}>
                  <p><strong>Mã BN:</strong> {selectedPatient.code}</p>
                  <p><strong>SĐT:</strong> {selectedPatient.phone || '-'}</p>
                  <p style={{ marginBottom: 0 }}>
                    <strong>Giới tính:</strong> {selectedPatient.gender === 'male' ? 'Nam' : selectedPatient.gender === 'female' ? 'Nữ' : 'Khác'}
                  </p>
                </Card>
              )}

              <Form.Item name="examDate" label="Ngày khám" initialValue={dayjs()}>
                <DatePicker 
                  showTime 
                  format="DD/MM/YYYY HH:mm" 
                  style={{ width: '100%' }} 
                />
              </Form.Item>

              <Form.Item 
                name="symptoms" 
                label="Triệu chứng"
                rules={[{ required: true, message: 'Vui lòng nhập triệu chứng' }]}
              >
                <TextArea rows={3} placeholder="Nhập triệu chứng..." />
              </Form.Item>

              <Form.Item 
                name="diagnosis" 
                label="Chẩn đoán"
                rules={[{ required: true, message: 'Vui lòng nhập chẩn đoán' }]}
              >
                <TextArea rows={3} placeholder="Nhập chẩn đoán..." />
              </Form.Item>

              <Form.Item name="treatment" label="Điều trị">
                <TextArea rows={3} placeholder="Nhập phương pháp điều trị..." />
              </Form.Item>

              <Form.Item name="medications" label="Thuốc kê đơn">
                <TextArea rows={4} placeholder="Nhập danh sách thuốc và liều lượng..." />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                    {selectedExam ? 'Cập nhật' : 'Lưu phiếu khám'}
                  </Button>
                  {selectedExam && (
                    <Button onClick={() => {
                      setSelectedExam(null);
                      form.resetFields(['symptoms', 'diagnosis', 'treatment', 'medications']);
                      form.setFieldsValue({ examDate: dayjs() });
                    }}>
                      Hủy chỉnh sửa
                    </Button>
                  )}
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col span={14}>
          <Card title={<h2 style={{ margin: 0 }}>Lịch sử khám bệnh</h2>}>
            <Table
              columns={columns}
              dataSource={examinations}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 800 }}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title="Chi tiết phiếu khám"
        open={detailsVisible}
        onCancel={() => {
          setDetailsVisible(false);
          setSelectedExam(null);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setDetailsVisible(false);
            setSelectedExam(null);
          }}>
            Đóng
          </Button>
        ]}
        width={600}
      >
        {selectedExam && (
          <div style={{ lineHeight: 2.2 }}>
            <p><strong>Ngày khám:</strong> {dayjs(selectedExam.examDate).format('DD/MM/YYYY HH:mm')}</p>
            <p><strong>Bệnh nhân:</strong> {selectedExam.patient?.fullName}</p>
            <p><strong>Mã BN:</strong> {selectedExam.patient?.code}</p>
            <hr />
            <p><strong>Triệu chứng:</strong></p>
            <p style={{ whiteSpace: 'pre-wrap', marginLeft: 20 }}>{selectedExam.symptoms || '-'}</p>
            <p><strong>Chẩn đoán:</strong></p>
            <p style={{ whiteSpace: 'pre-wrap', marginLeft: 20 }}>{selectedExam.diagnosis || '-'}</p>
            <p><strong>Điều trị:</strong></p>
            <p style={{ whiteSpace: 'pre-wrap', marginLeft: 20 }}>{selectedExam.treatment || '-'}</p>
            <p><strong>Thuốc kê đơn:</strong></p>
            <p style={{ whiteSpace: 'pre-wrap', marginLeft: 20 }}>{selectedExam.medications || '-'}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
