import { useState, useEffect } from 'react';
import { Card, Table, Button, Input, Modal, Form, DatePicker, Select, message, Space, Tag, Checkbox } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { fetchPatients, createPatient, updatePatient, deletePatient } from '../lib/api';
import dayjs from 'dayjs';

const { Search } = Input;

export function ReceptionPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async (q = '') => {
    try {
      setLoading(true);
      const data = await fetchPatients(q);
      setPatients(data);
    } catch (error) {
      message.error('Không thể tải danh sách bệnh nhân');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    loadPatients(value);
  };

  const handleAdd = () => {
    setSelectedPatient(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setSelectedPatient(record);
    // Convert visitPurpose string to array for checkbox
    let visitPurposeValue = record.visitPurpose;
    if (visitPurposeValue && visitPurposeValue.includes(',')) {
      visitPurposeValue = visitPurposeValue.split(',');
    } else if (visitPurposeValue === 'both') {
      visitPurposeValue = ['examination', 'refraction'];
    } else {
      visitPurposeValue = [visitPurposeValue];
    }
    
    form.setFieldsValue({
      ...record,
      birthDate: record.birthDate ? dayjs(record.birthDate) : null,
      visitPurpose: visitPurposeValue
    });
    setModalVisible(true);
  };

  const handleViewDetails = (record) => {
    setSelectedPatient(record);
    setDetailsVisible(true);
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa bệnh nhân này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deletePatient(id);
          message.success('Đã xóa bệnh nhân');
          loadPatients(searchQuery);
        } catch (error) {
          message.error('Không thể xóa bệnh nhân');
        }
      }
    });
  };

  const handleSubmit = async (values) => {
    try {
      // Convert visitPurpose array to string
      let visitPurpose = 'both';
      if (values.visitPurpose && Array.isArray(values.visitPurpose)) {
        if (values.visitPurpose.length === 0) {
          message.warning('Vui lòng chọn ít nhất một mục đích khám');
          return;
        }
        visitPurpose = values.visitPurpose.sort().join(',');
      } else if (values.visitPurpose) {
        visitPurpose = values.visitPurpose;
      }
      
      const data = {
        ...values,
        visitPurpose,
        birthDate: values.birthDate ? values.birthDate.toISOString() : null
      };
      
      if (selectedPatient) {
        await updatePatient(selectedPatient.id, data);
        message.success('Đã cập nhật thông tin bệnh nhân');
      } else {
        await createPatient(data);
        message.success('Đã thêm bệnh nhân mới');
      }
      
      setModalVisible(false);
      loadPatients(searchQuery);
    } catch (error) {
      message.error('Không thể lưu thông tin bệnh nhân');
    }
  };

  const columns = [
    {
      title: 'Mã BN',
      dataIndex: 'code',
      key: 'code',
      width: 150,
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      key: 'gender',
      width: 100,
      render: (text) => text === 'male' ? 'Nam' : text === 'female' ? 'Nữ' : 'Khác'
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      width: 130
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'birthDate',
      key: 'birthDate',
      width: 120,
      render: (text) => text ? dayjs(text).format('DD/MM/YYYY') : '-'
    },
    {
      title: 'Mục đích',
      dataIndex: 'visitPurpose',
      key: 'visitPurpose',
      width: 120,
      render: (purpose) => {
        const purposeMap = {
          'examination': { text: 'Khám mắt', color: 'blue' },
          'refraction': { text: 'Cắt kính', color: 'green' },
          'both': { text: 'Cả hai', color: 'purple' }
        };
        
        // Handle multiple purposes
        if (purpose && purpose.includes(',')) {
          const purposes = purpose.split(',');
          return (
            <Space size={4}>
              {purposes.map(p => {
                const config = purposeMap[p] || { text: p, color: 'default' };
                return <Tag key={p} color={config.color}>{config.text}</Tag>;
              })}
            </Space>
          );
        }
        
        const config = purposeMap[purpose] || { text: purpose, color: 'default' };
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'visitStatus',
      key: 'visitStatus',
      width: 120,
      render: (status) => {
        const statusMap = {
          'waiting': { text: 'Chờ khám', color: 'orange' },
          'in_progress': { text: 'Đang khám', color: 'blue' },
          'completed': { text: 'Hoàn thành', color: 'green' }
        };
        const config = statusMap[status] || { text: status, color: 'default' };
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: 'Ngày đăng ký',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (text) => dayjs(text).format('DD/MM/YYYY HH:mm')
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
      <Card 
        title={<h2 style={{ margin: 0 }}>Quản lý Tiếp tân</h2>}
        extra={
          <Space>
            <Search
              placeholder="Tìm kiếm bệnh nhân..."
              allowClear
              onSearch={handleSearch}
              style={{ width: 300 }}
              prefix={<SearchOutlined />}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Thêm bệnh nhân
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={patients}
          loading={loading}
          rowKey="id"
          scroll={{ x: 1000 }}
          pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (total) => `Tổng ${total} bệnh nhân` }}
        />
      </Card>

      <Modal
        title={selectedPatient ? 'Sửa thông tin bệnh nhân' : 'Thêm bệnh nhân mới'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input placeholder="Nhập họ và tên" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item
            name="gender"
            label="Giới tính"
          >
            <Select placeholder="Chọn giới tính">
              <Select.Option value="male">Nam</Select.Option>
              <Select.Option value="female">Nữ</Select.Option>
              <Select.Option value="other">Khác</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="birthDate"
            label="Ngày sinh"
          >
            <DatePicker 
              format="DD/MM/YYYY" 
              placeholder="Chọn ngày sinh"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="address"
            label="Địa chỉ"
          >
            <Input.TextArea rows={3} placeholder="Nhập địa chỉ" />
          </Form.Item>

          <Form.Item
            name="visitPurpose"
            label="Mục đích khám"
            rules={[{ required: true, message: 'Vui lòng chọn mục đích khám' }]}
            initialValue={['examination', 'refraction']}
          >
            <Checkbox.Group>
              <Space direction="vertical">
                <Checkbox value="examination">Khám mắt</Checkbox>
                <Checkbox value="refraction">Cắt kính / Khúc xạ</Checkbox>
              </Space>
            </Checkbox.Group>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                {selectedPatient ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Thông tin chi tiết bệnh nhân"
        open={detailsVisible}
        onCancel={() => setDetailsVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailsVisible(false)}>Đóng</Button>
        ]}
        width={600}
      >
        {selectedPatient && (
          <div style={{ lineHeight: 2 }}>
            <p><strong>Mã bệnh nhân:</strong> {selectedPatient.code}</p>
            <p><strong>Họ tên:</strong> {selectedPatient.fullName}</p>
            <p><strong>Giới tính:</strong> {selectedPatient.gender === 'male' ? 'Nam' : selectedPatient.gender === 'female' ? 'Nữ' : 'Khác'}</p>
            <p><strong>Số điện thoại:</strong> {selectedPatient.phone || '-'}</p>
            <p><strong>Ngày sinh:</strong> {selectedPatient.birthDate ? dayjs(selectedPatient.birthDate).format('DD/MM/YYYY') : '-'}</p>
            <p><strong>Địa chỉ:</strong> {selectedPatient.address || '-'}</p>
            <p><strong>Ngày đăng ký:</strong> {dayjs(selectedPatient.createdAt).format('DD/MM/YYYY HH:mm')}</p>
            {selectedPatient._count && (
              <>
                <p><strong>Số lần khám khúc xạ:</strong> {selectedPatient._count.refractions || 0}</p>
                <p><strong>Số lần khám bệnh:</strong> {selectedPatient._count.examinations || 0}</p>
                <p><strong>Số hóa đơn:</strong> {selectedPatient._count.invoices || 0}</p>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
