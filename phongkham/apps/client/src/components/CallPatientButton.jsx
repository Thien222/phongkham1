import { Button, message } from 'antd';
import { SoundOutlined } from '@ant-design/icons';
import { useEffect } from 'react';

export function CallPatientButton({ patientQueueNumber, destination = 'khám', size = 'middle', type = 'default', ghost = false }) {
  // Load voices when component mounts
  useEffect(() => {
    if ('speechSynthesis' in window) {
      // Trigger voices to load
      window.speechSynthesis.getVoices();
    }
  }, []);

  const handleCall = () => {
    if (!patientQueueNumber) {
      message.warning('Không có số thứ tự bệnh nhân');
      return;
    }

    // Extract number from STT format (e.g., "STT001" -> "001" or "không không một")
    const numberPart = patientQueueNumber.replace('STT', '').replace(/^0+/, '') || '0';
    
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
      
      message.success(`Đã gọi: ${text}`);
    } else {
      message.error('Trình duyệt không hỗ trợ phát giọng nói');
    }
  };

  return (
    <Button
      icon={<SoundOutlined />}
      onClick={handleCall}
      size={size}
      type={type}
      ghost={ghost}
      title={`Mời ${patientQueueNumber} vào phòng ${destination}`}
    >
      Mời
    </Button>
  );
}

