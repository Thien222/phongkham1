import { Card, Typography, Empty } from 'antd';

export function IncidentsPage() {
  return (
    <Card title={<h2 style={{ margin: 0 }}>Quản lý Sự cố</h2>}>
      <Empty 
        description="Tính năng đang được phát triển"
        style={{ padding: '60px 0' }}
      >
        <Typography.Text type="secondary">
          Tính năng quản lý sự cố và cảnh báo hệ thống sẽ được bổ sung trong phiên bản tiếp theo.
        </Typography.Text>
      </Empty>
    </Card>
  );
}
