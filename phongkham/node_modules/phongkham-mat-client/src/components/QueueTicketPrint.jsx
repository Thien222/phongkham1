import { useRef } from 'react';
import { Button } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

export function QueueTicketPrint({ patient, onPrint }) {
    const printRef = useRef();

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        const content = generatePrintContent();

        printWindow.document.write(content);
        printWindow.document.close();
        printWindow.focus();

        setTimeout(() => {
            printWindow.print();
            printWindow.close();
            if (onPrint) onPrint();
        }, 250);
    };

    const getRoomName = (purpose) => {
        if (purpose === 'examination') return 'KHÁM BỆNH';
        if (purpose === 'refraction') return 'KHÚC XẠ';
        return 'KHÁM BỆNH & KHÚC XẠ';
    };

    const generatePrintContent = () => {
        const roomName = getRoomName(patient.visitPurpose);

        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Phiếu Số Thứ Tự - ${patient.queueNumber}</title>
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
          
          .header {
            text-align: center;
            margin-bottom: 1mm;
          }
          
          .clinic-name {
            font-size: 6pt;
            font-weight: bold;
            line-height: 1.2;
          }
          
          .room-name {
            font-size: 5pt;
            line-height: 1.2;
          }
          
          .queue-number {
            font-size: 32pt;
            font-weight: bold;
            text-align: center;
            margin: 1mm 0;
            line-height: 1;
          }
          
          .footer {
            text-align: center;
            font-size: 5pt;
            line-height: 1.3;
            margin-top: 1mm;
          }
          
          .border-box {
            border: 1px solid #000;
            padding: 1mm;
            width: 100%;
          }
        </style>
      </head>
      <body>
        <div class="border-box">
          <div class="header">
            <div class="clinic-name">PHÒNG KHÁM MẮT NGOẠI GIỜ</div>
            <div class="room-name">BSCKII. HỨA TRUNG KIÊN</div>
          </div>
          
          <div class="queue-number">${patient.queueNumber || '---'}</div>
          
          <div class="footer">
            <div><strong>Khách hàng vui lòng chờ đến STT</strong></div>
            <div>Phòng có hiệu lực trong ngày: ${dayjs().format('DD/MM/YYYY')}</div>
          </div>
        </div>
      </body>
      </html>
    `;
    };

    return (
        <Button
            type="primary"
            icon={<PrinterOutlined />}
            onClick={handlePrint}
        >
            In Phiếu
        </Button>
    );
}
