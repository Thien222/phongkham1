import { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Space, message, Divider, Table, Modal, Upload, Typography, InputNumber, Tag } from 'antd';
import { SaveOutlined, CloudUploadOutlined, DeleteOutlined, ReloadOutlined, HistoryOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import api from '../lib/api';
import dayjs from 'dayjs';

const { confirm } = Modal;
const { Title, Text } = Typography;

export function SettingsPage() {
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);

  useEffect(() => {
    loadSettings();
    loadBackups();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await api.get('/settings');
      form.setFieldsValue({
        clinicName: response.data.clinicName || 'Phòng khám mắt',
        clinicAddress: response.data.clinicAddress || '123 Đường ABC, Quận XYZ, TP.HCM',
        clinicPhone: response.data.clinicPhone || '(028) 1234-5678',
        clinicEmail: response.data.clinicEmail || 'contact@eyeclinic.com',
        taxRate: parseFloat(response.data.taxRate) || 10,
        lowStockThreshold: parseInt(response.data.lowStockThreshold) || 5,
        maxBackups: parseInt(response.data.maxBackups) || 30,
        backupPath: response.data.backupPath || ''
      });
    } catch (error) {
      console.error('Load settings error:', error);
      message.error('Không thể tải cài đặt');
    }
  };

  const loadBackups = async () => {
    try {
      const response = await api.get('/backup');
      setBackups(response.data);
    } catch (error) {
      console.error('Load backups error:', error);
      message.error('Không thể tải danh sách backup');
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      await api.put('/settings', values);
      message.success('Đã lưu cài đặt');
      loadSettings();
    } catch (error) {
      console.error('Save settings error:', error);
      message.error('Không thể lưu cài đặt');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (values) => {
    try {
      if (values.newPassword !== values.confirmPassword) {
        message.error('Mật khẩu mới không khớp');
        return;
      }

      await api.post('/auth/change-password', {
        username: 'admin',
        oldPassword: values.oldPassword,
        newPassword: values.newPassword
      });

      message.success('Đã đổi mật khẩu thành công');
      passwordForm.resetFields();
    } catch (error) {
      console.error('Change password error:', error);
      message.error(error.response?.data?.message || 'Không thể đổi mật khẩu');
    }
  };

  const handleCreateBackup = async () => {
    try {
      setBackupLoading(true);
      await api.post('/backup');
      message.success('Đã tạo backup thành công');
      loadBackups();
    } catch (error) {
      console.error('Create backup error:', error);
      message.error('Không thể tạo backup');
    } finally {
      setBackupLoading(false);
    }
  };

  const handleDeleteBackup = (fileName) => {
    confirm({
      title: 'Xác nhận xóa',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc muốn xóa backup "${fileName}"?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      async onOk() {
        try {
          await api.delete(`/backup/${fileName}`);
          message.success('Đã xóa backup');
          loadBackups();
        } catch (error) {
          console.error('Delete backup error:', error);
          message.error('Không thể xóa backup');
        }
      }
    });
  };

  const handleRestoreBackup = (fileName) => {
    confirm({
      title: 'Xác nhận khôi phục',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>Bạn có chắc muốn khôi phục database từ backup này?</p>
          <p style={{ color: 'red', fontWeight: 'bold' }}>
            ⚠️ Hành động này sẽ thay thế toàn bộ dữ liệu hiện tại!
          </p>
          <p style={{ fontSize: '12px', color: '#666' }}>
            Lưu ý: Một bản backup của database hiện tại sẽ được tạo tự động trước khi khôi phục.
          </p>
        </div>
      ),
      okText: 'Khôi phục',
      okType: 'danger',
      cancelText: 'Hủy',
      async onOk() {
        try {
          const response = await api.post(`/backup/restore/${fileName}`);
          message.success('Đã khôi phục database thành công. Vui lòng reload trang!');
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } catch (error) {
          console.error('Restore backup error:', error);
          message.error('Không thể khôi phục backup');
        }
      }
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const backupColumns = [
    {
      title: 'Tên file',
      dataIndex: 'fileName',
      key: 'fileName',
      render: (text) => <Text code>{text}</Text>
    },
    {
      title: 'Kích thước',
      dataIndex: 'size',
      key: 'size',
      render: (size) => formatFileSize(size),
      width: 120
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm:ss'),
      width: 180
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<HistoryOutlined />}
            onClick={() => handleRestoreBackup(record.fileName)}
          >
            Khôi phục
          </Button>
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteBackup(record.fileName)}
          />
        </Space>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Thông tin phòng khám */}
      <Card title={<h2 style={{ margin: 0 }}>Thông tin phòng khám</h2>}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="clinicName"
            label="Tên phòng khám"
            rules={[{ required: true, message: 'Vui lòng nhập tên phòng khám' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="clinicAddress"
            label="Địa chỉ"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
          >
            <Input.TextArea rows={2} />
          </Form.Item>

          <Form.Item
            name="clinicPhone"
            label="Số điện thoại"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="clinicEmail"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' }
            ]}
          >
            <Input />
          </Form.Item>

          <Divider>Cài đặt hệ thống</Divider>

          <Form.Item
            name="taxRate"
            label="Thuế VAT (%)"
            rules={[{ required: true, message: 'Vui lòng nhập thuế VAT' }]}
          >
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="lowStockThreshold"
            label="Ngưỡng cảnh báo tồn kho thấp"
            rules={[{ required: true, message: 'Vui lòng nhập ngưỡng cảnh báo' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="maxBackups"
            label="Số lượng backup tối đa lưu trữ"
            rules={[{ required: true, message: 'Vui lòng nhập số lượng backup' }]}
            tooltip="Hệ thống sẽ tự động xóa các backup cũ khi vượt quá số lượng này"
          >
            <InputNumber min={1} max={100} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="backupPath"
            label="Đường dẫn lưu backup"
            tooltip="Để trống sẽ lưu ở thư mục mặc định (./backups). Nếu nhập đường dẫn tuyệt đối, hãy đảm bảo thư mục tồn tại và có quyền ghi."
          >
            <Input placeholder="VD: C:\BackupData\eyeclinic hoặc để trống dùng mặc định" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
              Lưu cài đặt
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* Đổi mật khẩu Admin */}
      <Card title={<h2 style={{ margin: 0 }}>Đổi mật khẩu Admin</h2>}>
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
        >
          <Form.Item
            name="oldPassword"
            label="Mật khẩu cũ"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu cũ' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu mới"
            rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu mới' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
              Đổi mật khẩu
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* Backup và Khôi phục */}
      <Card 
        title={<h2 style={{ margin: 0 }}>Backup và Khôi phục Database</h2>}
        extra={
          <Button 
            type="primary" 
            icon={<CloudUploadOutlined />} 
            onClick={handleCreateBackup}
            loading={backupLoading}
          >
            Tạo Backup
          </Button>
        }
      >
        <div style={{ marginBottom: '16px' }}>
          <Text type="secondary">
            💡 Hệ thống tự động backup mỗi 4 giờ. Bạn cũng có thể tạo backup thủ công bất kỳ lúc nào.
          </Text>
        </div>
        <Table
          columns={backupColumns}
          dataSource={backups}
          rowKey="fileName"
          pagination={{ pageSize: 10 }}
          size="small"
        />
      </Card>
    </div>
  );
}
