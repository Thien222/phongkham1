import { useRef, useState, useEffect } from 'react';
import { Modal, Button } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import { useReactToPrint } from 'react-to-print';
import api from '../lib/api';
import dayjs from 'dayjs';

export function PrintRefractionSheet({ refraction, patient, visible, onClose }) {
  const componentRef = useRef();
  const [settings, setSettings] = useState({});

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await api.get('/settings');
        setSettings(response.data);
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };
    if (visible) {
      loadSettings();
    }
  }, [visible]);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    pageStyle: `
      @page {
        size: A5 portrait;
        margin: 10mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `,
    documentTitle: `PhieuKhucXa_${patient?.code || 'N/A'}_${dayjs().format('DDMMYYYY')}`,
  });

  if (!refraction || !patient) return null;

  const lensTypeMap = {
    'da_trong': 'Đơn tròng – nhìn xa',
    'hai_trong': 'Kính 2 tròng',
    'don_trong_xa': 'Kính đơn tròng – nhìn xa',
    'don_trong_gan': 'Kính đơn tròng – nhìn gần'
  };

  return (
    <Modal
      title="In phiếu khúc xạ"
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
        <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={handlePrint}>
          In phiếu
        </Button>
      ]}
    >
      <div
        ref={componentRef}
        style={{
          width: '148mm',
          minHeight: '210mm',
          padding: '10mm',
          fontFamily: 'Arial, sans-serif',
          fontSize: '11pt',
          lineHeight: '1.4',
          backgroundColor: 'white'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5mm' }}>
          <div style={{ fontSize: '10pt', fontWeight: 'bold' }}>
            {settings.refractionSheetClinicName || 'PHÒNG KHÁM MẮT NGOẠI GIỜ'}<br />
            {settings.refractionSheetDoctorName || 'BSCKII. HỨA TRUNG KIÊN'}<br />
            <span style={{ fontSize: '9pt', fontWeight: 'normal' }}>SĐT: {settings.refractionSheetClinicPhone || '0971416421 – 0849274364'}</span>
          </div>
          <div style={{ textAlign: 'right', fontSize: '10pt' }}>
            <strong>KHÁM KHÚC XẠ</strong><br />
            {settings.refractionSheetWorkingHours || 'Từ 8h đến 19h. Thứ hai đến Chủ nhật'}
          </div>
        </div>

        {/* Title */}
        <h2 style={{ textAlign: 'center', fontSize: '16pt', fontWeight: 'bold', margin: '5mm 0' }}>
          {settings.refractionSheetTitle || 'PHIẾU KHÚC XẠ'}
        </h2>
        <p style={{ textAlign: 'center', fontSize: '10pt', marginTop: '-3mm' }}>
          Ngày thực hiện: {dayjs(refraction.examDate).format('DD/MM/YYYY')}
        </p>

        {/* Patient Info */}
        <div style={{ marginBottom: '5mm' }}>
          <table style={{ width: '100%', fontSize: '10pt' }}>
            <tbody>
              <tr>
                <td style={{ width: '70%' }}><strong>Họ và tên:</strong> {patient.fullName}</td>
                <td><strong>Giới tính:</strong> {patient.gender === 'male' ? 'Nam' : patient.gender === 'female' ? 'Nữ' : 'Khác'}</td>
              </tr>
              <tr>
                <td><strong>Ngày sinh:</strong> {patient.birthDate ? dayjs(patient.birthDate).format('DD/MM/YYYY') : ''}</td>
                <td><strong>SĐT:</strong> {patient.phone || ''}</td>
              </tr>
              <tr>
                <td colSpan="2"><strong>Địa chỉ:</strong> {patient.address || settings.refractionSheetClinicAddress || ''}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Main Table */}
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse', 
          fontSize: '9pt',
          marginBottom: '5mm'
        }}>
          <thead>
            <tr>
              <th rowSpan="2" style={{ 
                border: '1px solid #000', 
                padding: '4px', 
                textAlign: 'center',
                width: '30%'
              }}>
                Thị lực không kính/kính cũ (Nếu có)<br />
                <span style={{ fontSize: '8pt', fontStyle: 'italic' }}>(CCV/A with old glasses)</span>
              </th>
              <th colSpan="2" style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>
                Mắt phải <span style={{ fontStyle: 'italic' }}>(OD)</span>
              </th>
              <th rowSpan="2" style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>
                KCĐT<br />
                <span style={{ fontStyle: 'italic' }}>(PD)</span>
              </th>
            </tr>
            <tr>
              <th style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>Mắt trái <span style={{ fontStyle: 'italic' }}>(OS)</span></th>
              <th style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #000', padding: '4px', textAlign: 'center' }}>
                {patient.initialVaOd || '-'} / {patient.initialVaOs || '-'}
                {patient.hasGlasses && <div style={{ fontSize: '8pt' }}>(Có kính)</div>}
              </td>
              <td style={{ border: '1px solid #000', padding: '4px' }}></td>
              <td style={{ border: '1px solid #000', padding: '4px' }}></td>
              <td rowSpan="8" style={{ border: '1px solid #000', padding: '4px', textAlign: 'center', verticalAlign: 'middle' }}>
                {refraction.pd || ''}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Results Table */}
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse', 
          fontSize: '9pt',
          marginBottom: '5mm'
        }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #000', padding: '3px', width: '25%' }}></th>
              <th style={{ border: '1px solid #000', padding: '3px', textAlign: 'center' }}>
                Mắt<br /><span style={{ fontStyle: 'italic' }}>(Eye)</span>
              </th>
              <th style={{ border: '1px solid #000', padding: '3px', textAlign: 'center' }}>
                Độ cận/viễn<br /><span style={{ fontStyle: 'italic' }}>(SPH)</span>
              </th>
              <th style={{ border: '1px solid #000', padding: '3px', textAlign: 'center' }}>
                Độ loạn<br /><span style={{ fontStyle: 'italic' }}>(CYL)</span>
              </th>
              <th style={{ border: '1px solid #000', padding: '3px', textAlign: 'center' }}>
                Trục loạn<br /><span style={{ fontStyle: 'italic' }}>(AXIS)</span>
              </th>
              <th style={{ border: '1px solid #000', padding: '3px', textAlign: 'center' }}>
                Thị lực<br /><span style={{ fontStyle: 'italic' }}>(BCVA)</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Skiascopy */}
            <tr>
              <td rowSpan="2" style={{ border: '1px solid #000', padding: '3px', fontWeight: 'bold' }}>
                Khúc xạ khách quan<br />
                <span style={{ fontStyle: 'italic', fontSize: '8pt' }}>(Skiascopy)<br />
                – Có liệt điều tiết –</span>
                {refraction.hasCycloplegia && <div style={{ fontSize: '8pt', color: '#d00' }}>✓ Có liệt điều tiết</div>}
              </td>
              <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center', fontWeight: 'bold' }}>Mắt phải (OD)</td>
              <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center' }}>{refraction.skiasOdSph || ''}</td>
              <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center' }}>{refraction.skiasOdCyl || ''}</td>
              <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center' }}>{refraction.skiasOdAxis || ''}</td>
              <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center' }}>-</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center', fontWeight: 'bold' }}>Mắt trái (OS)</td>
              <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center' }}>{refraction.skiasOsSph || ''}</td>
              <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center' }}>{refraction.skiasOsCyl || ''}</td>
              <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center' }}>{refraction.skiasOsAxis || ''}</td>
              <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center' }}>-</td>
            </tr>

            {/* Subjective */}
            <tr>
              <td rowSpan="2" style={{ border: '1px solid #000', padding: '3px', fontWeight: 'bold' }}>
                Khúc xạ chủ quan<br />
                <span style={{ fontStyle: 'italic', fontSize: '8pt' }}>(Subj. refraction)</span>
              </td>
              <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center', fontWeight: 'bold' }}>Mắt phải (OD)</td>
              <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center' }}>{refraction.subjOdSph || ''}</td>
              <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center' }}>{refraction.subjOdCyl || ''}</td>
              <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center' }}>{refraction.subjOdAxis || ''}</td>
              <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center' }}>{refraction.subjOdVa || ''}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center', fontWeight: 'bold' }}>Mắt trái (OS)</td>
              <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center' }}>{refraction.subjOsSph || ''}</td>
              <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center' }}>{refraction.subjOsCyl || ''}</td>
              <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center' }}>{refraction.subjOsAxis || ''}</td>
              <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center' }}>{refraction.subjOsVa || ''}</td>
            </tr>
          </tbody>
        </table>

        {/* Prescription Table */}
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse', 
          fontSize: '9pt',
          marginBottom: '5mm'
        }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #000', padding: '3px', width: '15%' }}></th>
              <th style={{ border: '1px solid #000', padding: '3px', textAlign: 'center' }}>
                Mắt<br /><span style={{ fontStyle: 'italic' }}>(Eye)</span>
              </th>
              <th style={{ border: '1px solid #000', padding: '3px', textAlign: 'center' }}>
                Độ cận/viễn<br /><span style={{ fontStyle: 'italic' }}>(SPH)</span>
              </th>
              <th style={{ border: '1px solid #000', padding: '3px', textAlign: 'center' }}>
                Độ loạn<br /><span style={{ fontStyle: 'italic' }}>(CYL)</span>
              </th>
              <th style={{ border: '1px solid #000', padding: '3px', textAlign: 'center' }}>
                Trục loạn<br /><span style={{ fontStyle: 'italic' }}>(AXIS)</span>
              </th>
              <th style={{ border: '1px solid #000', padding: '3px', textAlign: 'center' }}>
                Thị lực<br /><span style={{ fontStyle: 'italic' }}>(BCVA)</span>
              </th>
              <th style={{ border: '1px solid #000', padding: '3px', textAlign: 'center' }}>ADD</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td rowSpan="2" style={{ border: '1px solid #000', padding: '3px', fontWeight: 'bold' }}>
                Kính điều chỉnh<br />
                <span style={{ fontStyle: 'italic', fontSize: '8pt' }}>(Prescription)</span>
              </td>
              <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center', fontWeight: 'bold' }}>Mắt phải (OD)</td>
              <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center' }}>{refraction.odSph || ''}</td>
              <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center' }}>{refraction.odCyl || ''}</td>
              <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center' }}>{refraction.odAxis || ''}</td>
              <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center' }}>{refraction.odVa || ''}</td>
              <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center' }}>{refraction.odAdd || ''}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center', fontWeight: 'bold' }}>Mắt trái (OS)</td>
              <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center' }}>{refraction.osSph || ''}</td>
              <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center' }}>{refraction.osCyl || ''}</td>
              <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center' }}>{refraction.osAxis || ''}</td>
              <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center' }}>{refraction.osVa || ''}</td>
              <td style={{ border: '1px solid #000', padding: '3px', textAlign: 'center' }}>{refraction.osAdd || ''}</td>
            </tr>
            <tr>
              <td colSpan="2" style={{ border: '1px solid #000', padding: '3px', fontWeight: 'bold' }}>
                Loại kính<br />
                <span style={{ fontStyle: 'italic', fontSize: '8pt' }}>(Type)</span>
              </td>
              <td colSpan="5" style={{ border: '1px solid #000', padding: '3px' }}>
                {lensTypeMap[refraction.lensType] || refraction.lensType || ''}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Notes */}
        <div style={{ marginBottom: '5mm', fontSize: '9pt' }}>
          <strong>Ghi chú:</strong>
          <div style={{ marginTop: '2mm' }}>{refraction.notes || ''}</div>
        </div>

        {/* Footer Notes */}
        <div style={{ fontSize: '9pt', marginBottom: '10mm' }}>
          <strong>Lưu ý:</strong>
          <div style={{ marginLeft: '5mm', marginTop: '2mm' }}>
            1. Khách hàng đã được đeo thử kính và cảm thấy thoải mái khi đi lại, không có hiện tượng nhức mắt hay đau đầu. Mức độ thích nghi của mắt người có thể khác nhau, vì vậy thời gian làm quen với kính có thể từ 5–7 ngày.
          </div>
          <div style={{ marginLeft: '5mm', marginTop: '1mm' }}>
            2. Khách hàng đã được tư vấn về độ kính phù hợp, mọi điều chỉnh theo yêu cầu riêng sẽ được thực hiện theo mong muốn của khách sau khi đã được giải thích rõ ràng.
          </div>
        </div>

        {/* Signatures */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15mm' }}>
          <div style={{ textAlign: 'center', width: '45%' }}>
            <strong>Xác nhận của khách hàng</strong>
            <div style={{ height: '15mm', borderBottom: refraction.signature ? 'none' : '1px solid #999', marginTop: '3mm' }}>
              {refraction.signature && (
                <img src={refraction.signature} alt="Chữ ký" style={{ maxWidth: '100%', maxHeight: '15mm' }} />
              )}
            </div>
          </div>
          <div style={{ textAlign: 'center', width: '45%' }}>
            <strong>Người thực hiện</strong>
            <div style={{ height: '15mm', marginTop: '3mm' }}></div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
