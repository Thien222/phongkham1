import { Modal, Button } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

export function PrintQueueTicket({ patient, visible, onClose }) {
  const handlePrint = () => {
    window.print();
  };

  if (!patient) return null;

  return (
    <>
      <Modal
        title="In mã số thứ tự"
        open={visible}
        onCancel={onClose}
        footer={[
          <Button key="close" onClick={onClose}>
            Đóng
          </Button>,
          <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={handlePrint}>
            In phiếu
          </Button>
        ]}
        width={300}
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <p>Mã số thứ tự: <strong>{patient.queueNumber}</strong></p>
          <p>Bệnh nhân: {patient.fullName}</p>
          <p>Ngày: {dayjs().format('DD/MM/YYYY HH:mm')}</p>
        </div>
      </Modal>

      {/* Print template - 57mm x 50mm */}
      <div className="print-queue-ticket" style={{ display: 'none' }}>
        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-queue-ticket,
            .print-queue-ticket * {
              visibility: visible;
            }
            .print-queue-ticket {
              position: absolute;
              left: 0;
              top: 0;
              width: 57mm;
              height: 50mm;
              padding: 5mm;
              font-family: Arial, sans-serif;
              display: block !important;
            }
            @page {
              size: 57mm 50mm;
              margin: 0;
            }
          }
        `}</style>
        
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          border: '1px solid #000',
          padding: '5px'
        }}>
          <div style={{ borderBottom: '1px dashed #000', paddingBottom: '5px', marginBottom: '5px', width: '100%' }}>
            <div style={{ fontSize: '11px', fontWeight: 'bold' }}>PHÒNG KHÁM MẮT NGOẠI GIỜ</div>
            <div style={{ fontSize: '10px' }}>BSCKII. HỨA TRUNG KIÊN</div>
          </div>
          
          <div style={{ margin: '10px 0' }}>
            <div style={{ fontSize: '50px', fontWeight: 'bold', lineHeight: '1' }}>
              {patient.queueNumber || 'STT001'}
            </div>
          </div>
          
          <div style={{ fontSize: '10px', borderTop: '1px dashed #000', paddingTop: '5px', width: '100%' }}>
            <div>Khách hàng vui lòng chờ đến STT</div>
            <div>Phiếu có hiệu lực trong ngày: {dayjs().format('DD/MM/YYYY')}</div>
          </div>
        </div>
      </div>
    </>
  );
}


