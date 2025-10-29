import { useState, useEffect, useRef } from 'react';
import { Card, Table, Button, Tag, Space, Modal, Divider, Row, Col, Tabs, Input, message } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, PrinterOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { fetchInvoices, updateInvoiceStatus, deleteInvoice, updateInvoiceSignature } from '../lib/api';
import SignatureCanvas from 'react-signature-canvas';
import dayjs from 'dayjs';

const { Search } = Input;

export function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [signatureVisible, setSignatureVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const signatureRef = useRef(null);

  useEffect(() => {
    loadInvoices();
  }, [activeTab]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const status = activeTab === 'all' ? null : activeTab.toUpperCase();
      const data = await fetchInvoices(status);
      setInvoices(data);
    } catch (error) {
      message.error('Không thể tải danh sách hóa đơn');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (record) => {
    setSelectedInvoice(record);
    setDetailsVisible(true);
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateInvoiceStatus(id, status);
      message.success('Đã cập nhật trạng thái hóa đơn');
      loadInvoices();
    } catch (error) {
      message.error('Không thể cập nhật trạng thái');
    }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa hóa đơn này? Số lượng sản phẩm sẽ được hoàn trả vào kho.',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteInvoice(id);
          message.success('Đã xóa hóa đơn');
          loadInvoices();
        } catch (error) {
          message.error('Không thể xóa hóa đơn');
        }
      }
    });
  };

  const handleSignature = (invoice) => {
    setSelectedInvoice(invoice);
    setSignatureVisible(true);
  };

  const handleSaveSignature = async () => {
    if (!signatureRef.current || signatureRef.current.isEmpty()) {
      message.warning('Vui lòng ký trước khi lưu');
      return;
    }

    try {
      const signatureData = signatureRef.current.toDataURL();
      await updateInvoiceSignature(selectedInvoice.id, signatureData);
      message.success('Đã lưu chữ ký');
      setSignatureVisible(false);
      loadInvoices();
    } catch (error) {
      message.error('Không thể lưu chữ ký');
    }
  };

  const handlePrint = (invoice) => {
    const printWindow = window.open('', '_blank');
    const content = generatePrintContent(invoice);
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const generatePrintContent = (invoice) => {
    const items = invoice.items.map((item, idx) => {
      const product = item.product;
      let productDetails = product.name;
      if (product.category === 'glasses' || product.category === 'lenses') {
        if (product.sphRange || product.cylRange) {
          productDetails += `<br><small style="color: #666;">`;
          if (product.sphRange) productDetails += `SPH: ${product.sphRange}`;
          if (product.cylRange) productDetails += ` | CYL: ${product.cylRange}`;
          productDetails += `</small>`;
        }
      }
      if (product.manufacturer) {
        productDetails += `<br><small style="color: #666;">NSX: ${product.manufacturer}</small>`;
      }
      
      return `
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${idx + 1}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${productDetails}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.quantity}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${item.unitPrice.toLocaleString()} đ</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${item.totalPrice.toLocaleString()} đ</td>
        </tr>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Hóa đơn ${invoice.code}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .info { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background-color: #1890ff; color: white; padding: 10px; border: 1px solid #ddd; }
          td { padding: 8px; border: 1px solid #ddd; }
          .total { text-align: right; margin-top: 20px; }
          .signature { margin-top: 40px; display: flex; justify-content: space-between; }
          @media print {
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>PHÒNG KHÁM MẮT</h1>
          <h2>HÓA ĐƠN BÁN HÀNG</h2>
          <p>Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM</p>
          <p>ĐT: (028) 1234-5678</p>
        </div>
        
        <div class="info">
          <h3>Thông tin hóa đơn</h3>
          <p><strong>Số hóa đơn:</strong> ${invoice.code}</p>
          <p><strong>Ngày lập:</strong> ${dayjs(invoice.createdAt).format('DD/MM/YYYY HH:mm')}</p>
          <p><strong>Loại:</strong> ${invoice.type === 'glasses' ? 'Hóa đơn kính' : invoice.type === 'examination' ? 'Hóa đơn khám' : 'Hóa đơn thuốc'}</p>
        </div>
        
        <div class="info">
          <h3>Thông tin bệnh nhân</h3>
          <p><strong>Họ tên:</strong> ${invoice.patient.fullName}</p>
          <p><strong>Mã BN:</strong> ${invoice.patient.code}</p>
          <p><strong>Giới tính:</strong> ${invoice.patient.gender === 'male' ? 'Nam' : invoice.patient.gender === 'female' ? 'Nữ' : 'Khác'}</p>
          <p><strong>Ngày sinh:</strong> ${dayjs(invoice.patient.dob).format('DD/MM/YYYY')}</p>
          <p><strong>Số điện thoại:</strong> ${invoice.patient.phone || 'N/A'}</p>
          <p><strong>Địa chỉ:</strong> ${invoice.patient.address || 'N/A'}</p>
        </div>
        
        <h3>Thông tin khúc xạ</h3>
        <table>
          <tr>
            <th>STT</th>
            <th>Tên sản phẩm</th>
            <th>Số lượng</th>
            <th>Đơn giá</th>
            <th>Thành tiền</th>
          </tr>
          ${items}
        </table>
        
        <div class="total">
          <p><strong>Tổng tiền hàng:</strong> ${invoice.subtotal.toLocaleString()} đ</p>
          <p><strong>Thuế VAT (10%):</strong> ${invoice.tax.toLocaleString()} đ</p>
          <p><strong>Giảm giá:</strong> ${invoice.discount.toLocaleString()} đ</p>
          <h3 style="color: #1890ff;"><strong>Tổng thanh toán:</strong> ${invoice.total.toLocaleString()} đ</h3>
        </div>
        
        ${invoice.dosage || invoice.instructions || invoice.notes || invoice.followUpDate ? `
          <div class="info" style="border: 2px solid #1890ff; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <h3 style="color: #1890ff;">Dặn dò và hướng dẫn</h3>
            ${invoice.dosage ? `<p><strong>Liều lượng:</strong> ${invoice.dosage}</p>` : ''}
            ${invoice.instructions ? `<p><strong>Hướng dẫn sử dụng:</strong> ${invoice.instructions}</p>` : ''}
            ${invoice.notes ? `<p><strong>Ghi chú:</strong> ${invoice.notes}</p>` : ''}
            ${invoice.followUpDate ? `<p><strong>Hẹn tái khám:</strong> ${dayjs(invoice.followUpDate).format('DD/MM/YYYY')}</p>` : ''}
          </div>
        ` : ''}
        
        <div class="signature">
          <div style="text-align: center;">
            <p><strong>Người lập hóa đơn</strong></p>
            <br><br><br>
            <p>Chữ ký</p>
          </div>
          <div style="text-align: center;">
            <p><strong>Người thanh toán</strong></p>
            ${invoice.signature ? `<img src="${invoice.signature}" style="max-width: 200px; height: 80px;" />` : '<br><br><br>'}
            <p>Chữ ký</p>
          </div>
        </div>
        
        <p style="text-align: center; margin-top: 40px; font-style: italic;">Cảm ơn quý khách đã sử dụng dịch vụ!</p>
      </body>
      </html>
    `;
  };

  const columns = [
    {
      title: 'Số hóa đơn',
      dataIndex: 'code',
      key: 'code',
      width: 180,
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Bệnh nhân',
      dataIndex: ['patient', 'fullName'],
      key: 'patientName',
      render: (text, record) => (
        <div>
          <div>{text}</div>
          <small style={{ color: '#888' }}>{record.patient.code}</small>
        </div>
      )
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => {
        const typeMap = {
          'glasses': { text: 'Hóa đơn kính', color: 'blue' },
          'examination': { text: 'Hóa đơn khám', color: 'green' },
          'medicine': { text: 'Hóa đơn thuốc', color: 'orange' }
        };
        const config = typeMap[type] || { text: type, color: 'default' };
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: 'Ngày lập',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (text) => dayjs(text).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total',
      key: 'total',
      width: 130,
      render: (total) => <strong style={{ color: '#1890ff' }}>{total.toLocaleString()} đ</strong>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status) => {
        const statusMap = {
          'UNPAID': { text: 'Chờ thanh toán', color: 'orange' },
          'PAID': { text: 'Đã thanh toán', color: 'green' },
          'CANCELLED': { text: 'Đã hủy', color: 'red' }
        };
        const config = statusMap[status] || { text: status, color: 'default' };
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 220,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button 
            icon={<EyeOutlined />} 
            size="small" 
            onClick={() => handleViewDetails(record)}
          />
          <Button 
            icon={<PrinterOutlined />} 
            size="small" 
            onClick={() => handlePrint(record)}
          />
          {record.status === 'UNPAID' && (
            <>
              <Button 
                icon={<EditOutlined />} 
                size="small" 
                onClick={() => handleSignature(record)}
                title="Ký điện tử"
              />
              <Button 
                icon={<CheckCircleOutlined />} 
                size="small" 
                type="primary"
                onClick={() => handleUpdateStatus(record.id, 'PAID')}
                title="Đánh dấu đã thanh toán"
              />
            </>
          )}
          {record.status !== 'CANCELLED' && (
            <Button 
              icon={<DeleteOutlined />} 
              size="small" 
              danger 
              onClick={() => handleDelete(record.id)}
            />
          )}
        </Space>
      )
    }
  ];

  const filteredInvoices = invoices.filter(inv => 
    searchQuery === '' || 
    inv.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.patient.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabItems = [
    { key: 'all', label: `Tất cả (${invoices.length})` },
    { key: 'unpaid', label: `Chờ thanh toán` },
    { key: 'paid', label: `Đã thanh toán` },
    { key: 'cancelled', label: `Đã hủy` }
  ];

  const stats = {
    total: invoices.length,
    unpaid: invoices.filter(inv => inv.status === 'UNPAID').length,
    paid: invoices.filter(inv => inv.status === 'PAID').length,
    revenue: invoices.filter(inv => inv.status === 'PAID').reduce((sum, inv) => sum + inv.total, 0)
  };

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <div>Tổng hóa đơn</div>
            <h2>{stats.total}</h2>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div>Chờ thanh toán</div>
            <h2 style={{ color: '#fa8c16' }}>{stats.unpaid}</h2>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div>Đã thanh toán</div>
            <h2 style={{ color: '#52c41a' }}>{stats.paid}</h2>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div>Tổng doanh thu</div>
            <h2 style={{ color: '#1890ff' }}>{stats.revenue.toLocaleString()} đ</h2>
          </Card>
        </Col>
      </Row>

      <Card title={<h2 style={{ margin: 0 }}>Quản lý Hóa đơn</h2>}>
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
          <Search
            placeholder="Tìm kiếm hóa đơn..."
            allowClear
            onSearch={setSearchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: 300 }}
          />
        </Space>

        <Table
          columns={columns}
          dataSource={filteredInvoices}
          loading={loading}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (total) => `Tổng ${total} hóa đơn` }}
        />
      </Card>

      <Modal
        title="Chi tiết hóa đơn"
        open={detailsVisible}
        onCancel={() => setDetailsVisible(false)}
        footer={[
          <Button key="print" icon={<PrinterOutlined />} onClick={() => handlePrint(selectedInvoice)}>
            In hóa đơn
          </Button>,
          <Button key="close" onClick={() => setDetailsVisible(false)}>
            Đóng
          </Button>
        ]}
        width={700}
      >
        {selectedInvoice && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <h3>Thông tin hóa đơn</h3>
                <p><strong>Số hóa đơn:</strong> {selectedInvoice.code}</p>
                <p><strong>Ngày lập:</strong> {dayjs(selectedInvoice.createdAt).format('DD/MM/YYYY HH:mm')}</p>
                <p><strong>Trạng thái:</strong> {selectedInvoice.status}</p>
              </Col>
              <Col span={12}>
                <h3>Thông tin bệnh nhân</h3>
                <p><strong>Họ tên:</strong> {selectedInvoice.patient.fullName}</p>
                <p><strong>Mã BN:</strong> {selectedInvoice.patient.code}</p>
                <p><strong>SĐT:</strong> {selectedInvoice.patient.phone || 'N/A'}</p>
              </Col>
            </Row>

            <Divider />

            <h3>Sản phẩm</h3>
      <Table
              dataSource={selectedInvoice.items}
              rowKey="id"
              pagination={false}
              size="small"
        columns={[
                { title: 'STT', key: 'index', width: 60, render: (_, __, idx) => idx + 1 },
                { title: 'Tên sản phẩm', dataIndex: ['product', 'name'], key: 'name' },
                { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity', width: 100 },
                { 
                  title: 'Đơn giá', 
                  dataIndex: 'unitPrice', 
                  key: 'unitPrice', 
                  width: 120,
                  render: (price) => `${price.toLocaleString()} đ`
                },
                { 
                  title: 'Thành tiền', 
                  dataIndex: 'totalPrice', 
                  key: 'totalPrice', 
                  width: 120,
                  render: (price) => `${price.toLocaleString()} đ`
                }
              ]}
            />

            <Divider />

            <Row style={{ textAlign: 'right' }}>
              <Col span={24}>
                <p><strong>Tổng tiền hàng:</strong> {selectedInvoice.subtotal.toLocaleString()} đ</p>
                <p><strong>Thuế VAT (10%):</strong> {selectedInvoice.tax.toLocaleString()} đ</p>
                <p><strong>Giảm giá:</strong> {selectedInvoice.discount.toLocaleString()} đ</p>
                <h3 style={{ color: '#1890ff' }}>
                  <strong>Tổng thanh toán:</strong> {selectedInvoice.total.toLocaleString()} đ
                </h3>
              </Col>
            </Row>

            {selectedInvoice.signature && (
              <>
                <Divider />
                <div style={{ textAlign: 'center' }}>
                  <p><strong>Chữ ký điện tử</strong></p>
                  <img src={selectedInvoice.signature} alt="Signature" style={{ maxWidth: '100%', border: '1px solid #ddd' }} />
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      <Modal
        title="Chữ ký điện tử"
        open={signatureVisible}
        onCancel={() => setSignatureVisible(false)}
        footer={[
          <Button key="clear" onClick={() => signatureRef.current?.clear()}>
            Xóa
          </Button>,
          <Button key="cancel" onClick={() => setSignatureVisible(false)}>
            Hủy
          </Button>,
          <Button key="save" type="primary" onClick={handleSaveSignature}>
            Lưu chữ ký
          </Button>
        ]}
        width={600}
      >
        <div style={{ border: '2px dashed #ddd', borderRadius: 4 }}>
          <SignatureCanvas
            ref={signatureRef}
            canvasProps={{
              width: 550,
              height: 200,
              className: 'signature-canvas',
              style: { width: '100%', height: '200px' }
            }}
          />
        </div>
        <p style={{ marginTop: 8, color: '#888' }}>
          • Vẽ chữ ký bằng chuột hoặc touchpad<br />
          • Hoặc tải ảnh chữ ký có sẵn<br />
          • Chữ ký sẽ được lưu và hiển thị trên hóa đơn
        </p>
      </Modal>
    </div>
  );
}
