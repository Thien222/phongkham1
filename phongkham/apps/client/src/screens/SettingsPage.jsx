import { Card, Form, Input, Button, Space, message, Divider } from 'antd';
import { SaveOutlined } from '@ant-design/icons';

export function SettingsPage() {
  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    console.log('Settings:', values);
    message.success('Đã lưu cài đặt');
  };

  return (
    <Card title={<h2 style={{ margin: 0 }}>Cài đặt hệ thống</h2>}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          clinicName: 'Phòng khám mắt',
          clinicAddress: '123 Đường ABC, Quận XYZ, TP.HCM',
          clinicPhone: '(028) 1234-5678',
          clinicEmail: 'contact@eyeclinic.com'
        }}
      >
        <Divider>Thông tin phòng khám</Divider>
        
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
          initialValue={10}
        >
          <Input type="number" />
        </Form.Item>

        <Form.Item
          name="lowStockThreshold"
          label="Ngưỡng cảnh báo tồn kho thấp"
          initialValue={5}
        >
          <Input type="number" />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
              Lưu cài đặt
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
}
