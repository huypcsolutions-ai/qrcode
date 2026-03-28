"use client";
import React, { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Wifi, Link as LinkIcon, CreditCard, Download, History } from 'lucide-react';

export default function Home() {
  const [type, setType] = useState('link');
  const [inputValue, setInputValue] = useState('');
  const [logo, setLogo] = useState<string | null>(null);
  const [wifiData, setWifiData] = useState({ ssid: '', pass: '', enc: 'WPA' });
  const [bankData, setBankData] = useState({ bankId: '', account: '', amount: '' });

  // Xử lý tạo nội dung QR tương ứng với từng loại
  const generateQRValue = () => {
    if (type === 'link') return inputValue || 'https://google.com';
    if (type === 'wifi') return `WIFI:S:${wifiData.ssid};T:${wifiData.enc};P:${wifiData.pass};;`;
    if (type === 'payment') {
      // Định dạng đơn giản cho VietQR (Napas247)
      return `00020101021138540010A000000727012400069704150110${bankData.bankId}0208${bankData.account}520400005303704540${bankData.amount || '0'}5802VN6304`;
    }
    return '';
  };

  const handleUploadLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (f) => setLogo(f.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const saveToHistory = async () => {
    const content = generateQRValue();
    try {
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, content }),
      });
      alert("Đã lưu vào lịch sử Cloudflare D1!");
    } catch (err) {
      console.error("Lỗi lưu DB:", err);
    }
  };

  const downloadQR = () => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = url;
      link.download = 'qrcode-chuyen-nghiep.png';
      link.click();
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        
        {/* CỘT TRÁI: NHẬP LIỆU */}
        <div className="flex-1 p-8 border-r border-slate-100">
          <h1 className="text-2xl font-bold text-slate-800 mb-6">QR Code Generator</h1>
          
          <div className="flex gap-2 mb-6">
            <button onClick={() => setType('link')} className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 border transition ${type === 'link' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600'}`}>
              <LinkIcon size={18}/> Link
            </button>
            <button onClick={() => setType('wifi')} className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 border transition ${type === 'wifi' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600'}`}>
              <Wifi size={18}/> Wifi
            </button>
            <button onClick={() => setType('payment')} className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 border transition ${type === 'payment' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600'}`}>
              <CreditCard size={18}/> Bank
            </button>
          </div>

          <div className="space-y-4">
            {type === 'link' && (
              <input type="text" placeholder="Nhập URL (e.g. https://facebook.com)" className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" onChange={(e)=>setInputValue(e.target.value)} />
            )}

            {type === 'wifi' && (
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Tên Wifi (SSID)" className="col-span-2 p-3 border rounded-lg" onChange={(e)=>setWifiData({...wifiData, ssid: e.target.value})} />
                <input type="password" placeholder="Mật khẩu" className="p-3 border rounded-lg" onChange={(e)=>setWifiData({...wifiData, pass: e.target.value})} />
                <select className="p-3 border rounded-lg" onChange={(e)=>setWifiData({...wifiData, enc: e.target.value})}>
                  <option value="WPA">WPA/WPA2</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">Không mật khẩu</option>
                </select>
              </div>
            )}

            {type === 'payment' && (
              <div className="space-y-2">
                <input placeholder="Mã Ngân hàng (Ví dụ: ICB cho Vietinbank)" className="w-full p-3 border rounded-lg" onChange={(e)=>setBankData({...bankData, bankId: e.target.value})} />
                <input placeholder="Số tài khoản" className="w-full p-3 border rounded-lg" onChange={(e)=>setBankData({...bankData, account: e.target.value})} />
                <input type="number" placeholder="Số tiền (không bắt buộc)" className="w-full p-3 border rounded-lg" onChange={(e)=>setBankData({...bankData, amount: e.target.value})} />
              </div>
            )}

            <div className="pt-4 border-t">
              <label className="block text-sm font-medium text-slate-700 mb-2">Thêm Logo thương hiệu</label>
              <input type="file" accept="image/*" onChange={handleUploadLogo} className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: HIỂN THỊ */}
        <div className="w-full md:w-80 bg-slate-50 p-8 flex flex-col items-center justify-center">
          <div className="bg-white p-4 rounded-xl shadow-md mb-6">
            <QRCodeCanvas
              value={generateQRValue()}
              size={200}
              level={"H"}
              imageSettings={logo ? { src: logo, height: 40, width: 40, excavate: true } : undefined}
            />
          </div>
          
          <div className="w-full space-y-3">
            <button onClick={downloadQR} className="w-full flex items-center justify-center gap-2 bg-slate-800 text-white py-3 rounded-lg hover:bg-slate-900 transition">
              <Download size={18}/> Tải về máy
            </button>
            <button onClick={saveToHistory} className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition">
              <History size={18}/> Lưu lịch sử D1
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
