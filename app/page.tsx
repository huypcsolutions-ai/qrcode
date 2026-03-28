"use client";
import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Wifi, Link as LinkIcon, CreditCard, Download } from 'lucide-react';

export default function QRGenerator() {
  const [type, setType] = useState('link'); // link, wifi, payment
  const [text, setText] = useState('');
  const [logo, setLogo] = useState<string | null>(null);
  
  // Thông tin bổ sung cho Wifi
  const [wifi, setWifi] = useState({ ssid: '', pass: '', encryption: 'WPA' });

  // Tạo nội dung QR dựa trên loại
  const getQRValue = () => {
    if (type === 'link') return text;
    if (type === 'wifi') return `WIFI:S:${wifi.ssid};T:${wifi.encryption};P:${wifi.pass};;`;
    if (type === 'payment') return `00020101021138540010A000000727012400069704150110${text}...`; // Mẫu đơn giản
    return text;
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (item) => setLogo(item.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const saveHistory = async () => {
    await fetch('/api/history', {
      method: 'POST',
      body: JSON.stringify({ type, content: getQRValue() }),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-8">Trình Tạo QR Code Chuyên Nghiệp</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white p-8 rounded-xl shadow-lg w-full max-w-4xl">
        {/* Cấu hình */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <button onClick={() => setType('link')} className={`p-2 flex-1 rounded ${type === 'link' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}><LinkIcon className="inline mr-2"/>Link</button>
            <button onClick={() => setType('wifi')} className={`p-2 flex-1 rounded ${type === 'wifi' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}><Wifi className="inline mr-2"/>Wifi</button>
            <button onClick={() => setType('payment')} className={`p-2 flex-1 rounded ${type === 'payment' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}><CreditCard className="inline mr-2"/>VietQR</button>
          </div>

          <input 
            type="text" 
            placeholder="Nhập nội dung..." 
            className="w-full border p-2 rounded"
            onChange={(e) => setText(e.target.value)}
          />

          <div>
            <label className="block text-sm font-medium mb-1">Thêm Logo</label>
            <input type="file" onChange={handleLogoUpload} className="text-sm" />
          </div>
          
          <button onClick={saveHistory} className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">Lưu vào Lịch sử</button>
        </div>

        {/* Hiển thị QR */}
        <div className="flex flex-col items-center justify-center bg-gray-100 p-4 rounded-lg">
          <div id="qr-code">
            <QRCodeCanvas
              value={getQRValue()}
              size={256}
              level={"H"} // Level cao để chèn logo không bị lỗi
              imageSettings={logo ? { src: logo, height: 50, width: 50, excavate: true } : undefined}
            />
          </div>
          <p className="mt-4 text-sm text-gray-500 italic">QR Code sẽ tự động cập nhật</p>
        </div>
      </div>
    </div>
  );
}
