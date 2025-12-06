import { useState } from 'react';
import { Card, Input, Button, Table, Space, Tag, Tabs, Empty } from 'antd';
import { SearchOutlined, HistoryOutlined } from '@ant-design/icons';
import { fetchPatients } from '../lib/api';
import dayjs from 'dayjs';

const { Search } = Input;

export function HistoryPage() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (value) => {
    if (!value.trim()) {
      message.warning('Vui lòng nhập từ khóa tìm kiếm');
      return;
    }
    
    try {
      setLoading(true);
      const data = await fetchPatients(value);
      // Limit to 10 results
      const limitedData = data.slice(0, 10);
      setPatients(limitedData);
      
      if (limitedData.length === 0) {
        message.info('Không tìm thấy bệnh nhân nào');
      } else if (data.length > 10) {
        message.warning(`Tìm thấy ${data.length} kết quả, chỉ hiển thị 10 kết quả đầu tiên`);
      }
      
      if (limitedData.length === 1) {
        setSelectedPatient(limitedData[0]);
      }
    } catch (error) {
      message.error('Không thể tìm kiếm bệnh nhân');
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
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
      title: 'SĐT',
      dataIndex: 'phone',
      key: 'phone',
      width: 120
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'birthDate',
      key: 'birthDate',
      width: 120,
      render: (text) => text ? dayjs(text).format('DD/MM/YYYY') : '-'
    },
    {
      title: 'Lần khám',
      key: 'visits',
      width: 100,
      render: (_, record) => {
        const total = (record._count?.refractions || 0) + (record._count?.examinations || 0);
        return <Tag color="green">{total}</Tag>;
      }
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Button size="small" onClick={() => setSelectedPatient(record)}>
          Xem chi tiết
        </Button>
      )
    }
  ];

  const refractionColumns = [
    {
      title: 'Ngày',
      dataIndex: 'examDate',
      key: 'examDate',
      render: (text) => dayjs(text).format('DD/MM/YYYY')
    },
    {
      title: 'Mắt phải (OD)',
      key: 'od',
      render: (_, record) => (
        <span>{record.odSph} {record.odCyl} x {record.odAxis} ({record.odVa})</span>
      )
    },
    {
      title: 'Mắt trái (OS)',
      key: 'os',
      render: (_, record) => (
        <span>{record.osSph} {record.osCyl} x {record.osAxis} ({record.osVa})</span>
      )
    },
    {
      title: 'Loại kính',
      dataIndex: 'lensType',
      key: 'lensType',
      render: (text) => {
        const typeMap = {
          'da_trong': 'Đa tròng',
          'hai_trong': '2 tròng',
          'don_trong_xa': 'Đơn xa',
          'don_trong_gan': 'Đơn gần'
        };
        return typeMap[text] || '-';
      }
    }
  ];

  const examinationColumns = [
    {
      title: 'Ngày',
      dataIndex: 'examDate',
      key: 'examDate',
      render: (text) => dayjs(text).format('DD/MM/YYYY')
    },
    {
      title: 'Triệu chứng',
      dataIndex: 'symptoms',
      key: 'symptoms'
    },
    {
      title: 'Chẩn đoán',
      dataIndex: 'diagnosis',
      key: 'diagnosis'
    }
  ];

  const invoiceColumns = [
    {
      title: 'Mã HĐ',
      dataIndex: 'code',
      key: 'code',
      render: (text) => <Tag color="purple">{text}</Tag>
    },
    {
      title: 'Ngày',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => dayjs(text).format('DD/MM/YYYY')
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total',
      key: 'total',
      render: (value) => `${value.toLocaleString()}đ`
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'PAID' ? 'green' : status === 'UNPAID' ? 'orange' : 'red'}>
          {status}
        </Tag>
      )
    }
  ];

  return (
    <div>
      <Card
        title={
          <Space>
            <HistoryOutlined />
            <span>Lịch sử khám bệnh</span>
          </Space>
        }
      >
        <Search
          placeholder="Tìm kiếm theo tên, số điện thoại, mã bệnh nhân..."
          enterButton={<Button type="primary" icon={<SearchOutlined />}>Tìm kiếm</Button>}
          size="large"
          onSearch={handleSearch}
          loading={loading}
          style={{ marginBottom: 24 }}
        />

        {patients.length > 0 && (
          <Table
            columns={columns}
            dataSource={patients}
            rowKey="id"
            pagination={{ pageSize: 10, showTotal: (total) => `Tìm thấy ${total} bệnh nhân` }}
            style={{ marginBottom: 24 }}
          />
        )}

        {selectedPatient && (
          <Card
            title={`Lịch sử khám - ${selectedPatient.fullName} (${selectedPatient.code})`}
            style={{ marginTop: 24 }}
          >
            <Tabs
              items={[
                {
                  key: '1',
                  label: `Khúc xạ (${selectedPatient.refractions?.length || 0})`,
                  children: selectedPatient.refractions?.length > 0 ? (
                    <Table
                      columns={refractionColumns}
                      dataSource={selectedPatient.refractions}
                      rowKey="id"
                      pagination={false}
                    />
                  ) : (
                    <Empty description="Chưa có lịch sử khúc xạ" />
                  )
                },
                {
                  key: '2',
                  label: `Khám bệnh (${selectedPatient.examinations?.length || 0})`,
                  children: selectedPatient.examinations?.length > 0 ? (
                    <Table
                      columns={examinationColumns}
                      dataSource={selectedPatient.examinations}
                      rowKey="id"
                      pagination={false}
                    />
                  ) : (
                    <Empty description="Chưa có lịch sử khám bệnh" />
                  )
                },
                {
                  key: '3',
                  label: `Hóa đơn (${selectedPatient.invoices?.length || 0})`,
                  children: selectedPatient.invoices?.length > 0 ? (
                    <Table
                      columns={invoiceColumns}
                      dataSource={selectedPatient.invoices}
                      rowKey="id"
                      pagination={false}
                    />
                  ) : (
                    <Empty description="Chưa có hóa đơn" />
                  )
                }
              ]}
            />
          </Card>
        )}
      </Card>
    </div>
  );
}

