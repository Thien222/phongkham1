import { useState, useEffect, useRef } from 'react';
import { Button, message } from 'antd';
import { SoundOutlined } from '@ant-design/icons';
import { updatePatient } from '../lib/api';
import api from '../lib/api';
import { useReactToPrint } from 'react-to-print';
import dayjs from 'dayjs';

export function CallAndPrintButton({ 
  patient, 
  destination = 'khám', 
  size = 'middle', 
  type = 'default', 
  ghost = false,
  onSuccess 
}) {
  const printRef = useRef();
  const [settings, setSettings] = useState({});

  // Load voices and settings when component mounts
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
    
    const loadSettings = async () => {
      try {
        const response = await api.get('/settings');
        setSettings(response.data);
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };
    loadSettings();
  }, []);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    pageStyle: `
      @page {
        size: 57mm 50mm;
        margin: 0;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `,
    documentTitle: `PhieuSoThuTu_${patient?.queueNumber || 'STT'}_${dayjs().format('DDMMYYYY')}`,
  });

  const callPatient = () => {
    if (!patient?.queueNumber) {
      return;
    }

    // Extract number from STT format (e.g., "STT001" -> "001" or "không không một")
    const numberPart = patient.queueNumber.replace('STT', '').replace(/^0+/, '') || '0';
    
    // Convert to readable Vietnamese (001 -> "không không một")
    const readableNumber = numberPart.split('').map(digit => {
      const map = {
        '0': 'không',
        '1': 'một',
        '2': 'hai',
        '3': 'ba',
        '4': 'bốn',
        '5': 'năm',
        '6': 'sáu',
        '7': 'bảy',
        '8': 'tám',
        '9': 'chín'
      };
      return map[digit] || digit;
    }).join(' ');
    
    // Vietnamese speech
    const text = `Mời số thứ tự ${readableNumber} vào phòng ${destination}`;
    
    // Check if speech synthesis is supported
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'vi-VN';
      utterance.rate = 0.85; // Slower for clarity
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      // Wait a bit for voices to load, then speak
      setTimeout(() => {
        const voices = window.speechSynthesis.getVoices();
        const viVoice = voices.find(voice => voice.lang.includes('vi') || voice.lang.includes('VN'));
        if (viVoice) {
          utterance.voice = viVoice;
        }
        window.speechSynthesis.speak(utterance);
      }, 100);
    }
  };

  const handleCallAndPrint = async () => {
    if (!patient) {
      message.warning('Không có thông tin bệnh nhân');
      return;
    }

    try {
      // 1. Call patient (voice)
      callPatient();

      // 2. Print ticket
      handlePrint();

      // 3. Update patient status to "in_progress" (đang khám)
      await updatePatient(patient.id, { 
        visitStatus: 'in_progress' 
      });

      message.success(`Đã gọi và in phiếu cho ${patient.fullName}`);

      // Callback to refresh parent component
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error calling patient:', error);
      message.error('Không thể cập nhật trạng thái bệnh nhân');
    }
  };

  if (!patient) return null;

  return (
    <>
      <Button
        icon={<SoundOutlined />}
        onClick={handleCallAndPrint}
        size={size}
        type={type}
        ghost={ghost}
        title={`Gọi ${patient.queueNumber} vào phòng ${destination} và in phiếu`}
      >
        Gọi & In
      </Button>

      {/* Hidden print template - 57mm x 50mm */}
      <div ref={printRef} style={{ display: 'none' }}>
        <div style={{
          width: '57mm',
          height: '50mm',
          padding: '5mm',
          fontFamily: 'Arial, sans-serif',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          boxSizing: 'border-box'
        }}>
          <div style={{ 
            borderBottom: '1px dashed #000', 
            paddingBottom: '5px', 
            marginBottom: '5px', 
            width: '100%' 
          }}>
            <div style={{ fontSize: '11px', fontWeight: 'bold' }}>
              {settings.queueTicketClinicName || 'PHÒNG KHÁM MẮT NGOẠI GIỜ'}
            </div>
            <div style={{ fontSize: '10px' }}>
              {settings.queueTicketDoctorName || 'BSCKII. HỨA TRUNG KIÊN'}
            </div>
          </div>
          
          <div style={{ margin: '10px 0' }}>
            <div style={{ 
              fontSize: '50px', 
              fontWeight: 'bold', 
              lineHeight: '1',
              fontFamily: 'Arial Black, Arial, sans-serif'
            }}>
              {patient.queueNumber || 'STT001'}
            </div>
          </div>
          
          <div style={{ 
            fontSize: '10px', 
            borderTop: '1px dashed #000', 
            paddingTop: '5px', 
            width: '100%' 
          }}>
            <div>{settings.queueTicketNote || 'Khách hàng vui lòng chờ đến STT'}</div>
            <div>Phiếu có hiệu lực trong ngày: {dayjs().format('DD/MM/YYYY')}</div>
          </div>
        </div>
      </div>
    </>
  );
}

