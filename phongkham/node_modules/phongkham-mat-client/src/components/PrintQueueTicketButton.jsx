import { useState } from 'react';
import { Button, message } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import { updatePatient } from '../lib/api';
import dayjs from 'dayjs';

export function PrintQueueTicketButton({ patient, onSuccess }) {
    const [loading, setLoading] = useState(false);

    const getRoomName = (purpose) => {
        if (purpose === 'examination') return 'KHÁM BỆNH';
        if (purpose === 'refraction') return 'KHÚC XẠ';
        if (purpose === 'both' || purpose === 'examination,refraction') return 'KHÁM BỆNH & KHÚC XẠ';
        return 'KHÁM';
    };

    const handlePrint = async () => {
        if (!patient || !patient.queueNumber) {
            message.warning('Không có số thứ tự');
            return;
        }

        try {
            setLoading(true);

            // Create a temporary window for printing
            const printWindow = window.open('', '_blank', 'width=400,height=300');

            const roomName = getRoomName(patient.visitPurpose);

            const content = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Phiếu Số ${patient.queueNumber}</title>
          <style>
            @page {
              size: 50mm 30mm;
              margin: 0;
            }
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Arial', sans-serif;
              width: 50mm;
              height: 30mm;
              padding: 2mm;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              background: white;
            }
            
            .border-box {
              border: 2px solid #000;
              padding: 2mm;
              width: 100%;
              text-align: center;
            }
            
            .header {
              margin-bottom: 2mm;
            }
            
            .clinic-name {
              font-size: 7pt;
              font-weight: bold;
              line-height: 1.2;
            }
            
            .room-name {
              font-size: 6pt;
              line-height: 1.2;
            }
            
            .queue-number {
              font-size: 40pt;
              font-weight: bold;
              margin: 2mm 0;
              line-height: 1;
            }
            
            .footer {
              font-size: 5pt;
              line-height: 1.3;
              margin-top: 2mm;
            }
            
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="border-box">
            <div class="header">
              <div class="clinic-name">PHÒNG KHÁM MẮT NGOẠI GIỜ</div>
              <div class="room-name">BSCKII. HỨA TRUNG KIÊN</div>
            </div>
            
            <div class="queue-number">${patient.queueNumber}</div>
            
            <div class="footer">
              <div><strong>Khách hàng vui lòng chờ đến STT</strong></div>
              <div>Phòng: ${roomName}</div>
              <div>Ngày: ${dayjs().format('DD/MM/YYYY')}</div>
            </div>
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                setTimeout(function() {
                  window.close();
                }, 500);
              }, 250);
            };
          </script>
        </body>
        </html>
      `;

            printWindow.document.write(content);
            printWindow.document.close();

            // Mark as printed by updating a flag (optional)
            // You could add a 'printed' field to track this

            message.success('Đã in phiếu số thứ tự');

            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error('Error printing:', error);
            message.error('Không thể in phiếu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            type="primary"
            icon={<PrinterOutlined />}
            onClick={handlePrint}
            loading={loading}
            size="small"
        >
            In phiếu
        </Button>
    );
}
