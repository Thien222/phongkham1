import { useState, useEffect } from 'react';
import { Modal, Table, Button, Input, InputNumber, message, Space, Divider, Form, DatePicker } from 'antd';
import { createInvoice, validateVoucher } from '../lib/api';
import dayjs from 'dayjs';

export function CreateInvoiceModal({ visible, onClose, patient, products, type = 'glasses' }) {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [processingFee, setProcessingFee] = useState(type === 'glasses' ? 50000 : 0);
  const [shippingFee, setShippingFee] = useState(0);
  const [serviceFee, setServiceFee] = useState(20000);
  const [discount, setDiscount] = useState(0);
  const [validating, setValidating] = useState(false);
  const [creating, setCreating] = useState(false);
  const [notes, setNotes] = useState('');
  const [instructions, setInstructions] = useState('');
  const [dosage, setDosage] = useState('');
  const [followUpDate, setFollowUpDate] = useState(null);
  
  // Update selectedProducts when products prop changes or modal opens
  useEffect(() => {
    if (visible && products && products.length > 0) {
      setSelectedProducts(products);
    } else if (!visible) {
      // Reset state when modal closes
      setSelectedProducts([]);
      setVoucherCode('');
      setVoucherDiscount(0);
      setDiscount(0);
      setNotes('');
      setInstructions('');
      setDosage('');
      setFollowUpDate(null);
    }
  }, [products, visible]);

  const handleRemoveProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
  };

  const handleQuantityChange = (productId, quantity) => {
    setSelectedProducts(selectedProducts.map(p => 
      p.id === productId ? { ...p, quantity } : p
    ));
  };

  const calculateTotals = () => {
    const subtotal = selectedProducts.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
    const fees = processingFee + shippingFee + serviceFee;
    const totalBeforeTax = subtotal + fees;
    const tax = Math.round(totalBeforeTax * 0.1);
    const total = totalBeforeTax + tax - discount - voucherDiscount;
    
    return { subtotal, fees, tax, total, totalBeforeTax };
  };

  const handleValidateVoucher = async () => {
    if (!voucherCode.trim()) {
      message.warning('Vui lòng nhập mã voucher');
      return;
    }

    const { subtotal } = calculateTotals();
    
    setValidating(true);
    try {
      const result = await validateVoucher(voucherCode.trim().toUpperCase(), subtotal);
      if (result.valid) {
        setVoucherDiscount(result.discount);
        message.success(result.message);
      } else {
        message.error(result.message);
        setVoucherDiscount(0);
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Mã voucher không hợp lệ');
      setVoucherDiscount(0);
    } finally {
      setValidating(false);
    }
  };

  const handleCreateInvoice = async () => {
    if (!patient) {
      message.warning('Vui lòng chọn bệnh nhân');
      return;
    }

    if (selectedProducts.length === 0) {
      message.warning('Vui lòng chọn ít nhất một sản phẩm');
      return;
    }

    const { total } = calculateTotals();
    if (total <= 0) {
      message.warning('Tổng tiền không hợp lệ');
      return;
    }

    setCreating(true);
    try {
      const invoiceData = {
        patientId: patient.id,
        type,
        items: selectedProducts.map(p => ({
          productId: p.id,
          quantity: p.quantity || 1,
          unitPrice: p.price
        })),
        discount,
        voucherCode: voucherCode.trim().toUpperCase() || null,
        voucherDiscount,
        processingFee,
        shippingFee,
        serviceFee,
        notes: notes.trim() || null,
        instructions: instructions.trim() || null,
        dosage: dosage.trim() || null,
        followUpDate: followUpDate ? followUpDate.toISOString() : null
      };

      await createInvoice(invoiceData);
      message.success('Đã tạo hóa đơn thành công');
      onClose(true); // Pass true to indicate success
    } catch (error) {
      message.error('Không thể tạo hóa đơn');
      console.error(error);
    } finally {
      setCreating(false);
    }
  };

  const { subtotal, fees, tax, total } = calculateTotals();

  const invoiceTitle = type === 'glasses' ? 'Hóa đơn kính' : 'Hóa đơn thuốc';

  return (
    <Modal
      title={`Tạo ${invoiceTitle}`}
      open={visible}
      onCancel={() => onClose(false)}
      width={900}
      footer={[
        <Button key="cancel" onClick={() => onClose(false)}>
          Hủy
        </Button>,
        <Button key="create" type="primary" loading={creating} onClick={handleCreateInvoice}>
          Tạo hóa đơn
        </Button>
      ]}
    >
      <div>
        <h4>Thông tin bệnh nhân</h4>
        <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 8, marginBottom: 16 }}>
          <p><strong>Họ tên:</strong> {patient?.fullName}</p>
          <p style={{ marginBottom: 0 }}><strong>Mã BN:</strong> {patient?.code}</p>
        </div>

        <h4>Sản phẩm</h4>
        <Table
          dataSource={selectedProducts}
          rowKey="id"
          pagination={false}
          size="small"
          columns={[
            { title: 'STT', key: 'index', width: 60, render: (_, __, idx) => idx + 1 },
            { title: 'Tên sản phẩm', dataIndex: 'name', key: 'name' },
            { 
              title: 'Số lượng', 
              key: 'quantity', 
              width: 120,
              render: (_, record) => (
                <InputNumber 
                  min={1} 
                  value={record.quantity || 1}
                  onChange={(value) => handleQuantityChange(record.id, value)}
                  style={{ width: '100%' }}
                />
              )
            },
            { 
              title: 'Đơn giá', 
              dataIndex: 'price', 
              key: 'price', 
              width: 120,
              render: (price) => `${price.toLocaleString()} đ`
            },
            { 
              title: 'Thành tiền', 
              key: 'total', 
              width: 120,
              render: (_, record) => `${((record.price || 0) * (record.quantity || 1)).toLocaleString()} đ`
            },
            {
              title: '',
              key: 'action',
              width: 80,
              render: (_, record) => (
                <Button size="small" danger onClick={() => handleRemoveProduct(record.id)}>
                  Xóa
                </Button>
              )
            }
          ]}
        />

        <Divider />

        <div style={{ marginBottom: 16 }}>
          <h4>Phí và giảm giá</h4>
          <Space direction="vertical" style={{ width: '100%' }}>
            {type === 'glasses' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Phí gia công:</span>
                <InputNumber
                  value={processingFee}
                  onChange={setProcessingFee}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  addonAfter="đ"
                  style={{ width: 200 }}
                />
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Phí vận chuyển:</span>
              <InputNumber
                value={shippingFee}
                onChange={setShippingFee}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                addonAfter="đ"
                style={{ width: 200 }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Phí dịch vụ:</span>
              <InputNumber
                value={serviceFee}
                onChange={setServiceFee}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                addonAfter="đ"
                style={{ width: 200 }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Giảm giá trực tiếp:</span>
              <InputNumber
                value={discount}
                onChange={setDiscount}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                addonAfter="đ"
                style={{ width: 200 }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <span>Mã voucher:</span>
              <Space>
                <Input
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  placeholder="Nhập mã voucher"
                  style={{ width: 150 }}
                />
                <Button loading={validating} onClick={handleValidateVoucher}>
                  Áp dụng
                </Button>
              </Space>
            </div>
            {voucherDiscount > 0 && (
              <div style={{ color: '#52c41a', textAlign: 'right' }}>
                ✓ Giảm từ voucher: {voucherDiscount.toLocaleString()} đ
              </div>
            )}
          </Space>
        </div>

        <Divider />

        <div style={{ marginBottom: 16 }}>
          <h4>Dặn dò và hướng dẫn</h4>
          <Space direction="vertical" style={{ width: '100%' }}>
            {type === 'medicine' && (
              <div>
                <label style={{ display: 'block', marginBottom: 4 }}>Liều lượng:</label>
                <Input.TextArea
                  rows={2}
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  placeholder="VD: Ngày 2 lần, sáng và tối, mỗi lần 1 viên"
                />
              </div>
            )}
            <div>
              <label style={{ display: 'block', marginBottom: 4 }}>Hướng dẫn sử dụng:</label>
              <Input.TextArea
                rows={2}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder={type === 'glasses' ? 
                  'VD: Đeo kính thường xuyên, tránh để kính tiếp xúc với nhiệt độ cao' : 
                  'VD: Uống sau bữa ăn, không uống cùng rượu, bia'}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4 }}>Ghi chú thêm:</label>
              <Input.TextArea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Các ghi chú khác..."
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4 }}>Hẹn tái khám:</label>
              <DatePicker
                value={followUpDate}
                onChange={setFollowUpDate}
                format="DD/MM/YYYY"
                placeholder="Chọn ngày hẹn tái khám"
                style={{ width: '100%' }}
              />
            </div>
          </Space>
        </div>

        <Divider />

        <div style={{ textAlign: 'right' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Tổng tiền hàng:</span>
              <strong>{subtotal.toLocaleString()} đ</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Tổng phí:</span>
              <strong>{fees.toLocaleString()} đ</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Thuế VAT (10%):</span>
              <strong>{tax.toLocaleString()} đ</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Giảm giá:</span>
              <strong style={{ color: '#ff4d4f' }}>-{discount.toLocaleString()} đ</strong>
            </div>
            {voucherDiscount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Voucher:</span>
                <strong style={{ color: '#52c41a' }}>-{voucherDiscount.toLocaleString()} đ</strong>
              </div>
            )}
            <Divider style={{ margin: '8px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 18 }}><strong>Tổng thanh toán:</strong></span>
              <strong style={{ fontSize: 20, color: '#1890ff' }}>{total.toLocaleString()} đ</strong>
            </div>
          </Space>
        </div>
      </div>
    </Modal>
  );
}

