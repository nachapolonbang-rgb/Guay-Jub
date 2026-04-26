'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/src/backend/components/Navbar';

const MENU_ITEMS = [
  { name: 'Noodle soup', price: 30, image: "/images/noodle-pink-bowl.png", desc: 'Rich soup with plenty of ingredients.' },
  { name: 'Noodle soup', price: 20, image: "/images/noodle-white-bowl.png", desc: 'Rich soup with plenty of ingredients.' },
  { name: 'Jelly', price: 20, image: "/images/jelly-dessert.png", desc: 'This is a very delicious Thai dessert.' },
];

const SPEECH = ["ยินดีต้อนรับค่ะ! 🍜", "อร่อยแน่นอนค่ะ! 🎉", "รับเมนูไหนดีคะ? 😊"];

export default function Home() {
  const chefImage = "/images/preview.png"; 
  const bgNoodle = "/images/preview-1.png"; 

  const [speechIdx, setSpeechIdx] = useState(0);
  const [showSpeech, setShowSpeech] = useState(false);
  const [cart, setCart] = useState<number[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const show = () => {
      setSpeechIdx(i => (i + 1) % SPEECH.length);
      setShowSpeech(true);
      setTimeout(() => setShowSpeech(false), 2800);
    };
    const t = setTimeout(show, 1500);
    const interval = setInterval(show, 5500);
    return () => { clearTimeout(t); clearInterval(interval); };
  }, []);

  return (
    <div className="min-h-screen text-gray-800 font-sans overflow-x-hidden relative" style={{ backgroundColor: '#FFF9F5' }}>
      
      {/* NAVBAR - ใช้ Component */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative flex flex-col md:flex-row items-center justify-center px-10 pt-10 pb-32 min-h-[650px] z-10">
        <div className="relative w-full md:w-1/2 flex justify-center items-center">
          {/* ชามก๋วยเตี๋ยว */}
          <img 
            src={bgNoodle}
            className="absolute w-[500px] md:w-[650px] z-0 opacity-100 filter drop-shadow-2xl"
            style={{ transform: `translate(${mousePos.x * 3}px, ${mousePos.y * 3}px)` }}
          />

          {/* น้องเชฟพร้อม Speech Bubble */}
          <div className="relative z-10 mt-20 translate-x-10 md:translate-x-20">
            {showSpeech && (
              <div
                className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white border border-gray-100 rounded-2xl px-6 py-2 shadow-xl z-20 whitespace-nowrap font-bold text-[#5a2d0c] text-sm animate-fade-in"
              >
                {SPEECH[speechIdx]}
                <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-gray-100 rotate-45" />
              </div>
            )}

            <img
              src={chefImage}
              className="w-64 md:w-[400px] drop-shadow-2xl cursor-pointer animate-bounce-slow"
              style={{ transform: `translate(${mousePos.x * 2}px, ${mousePos.y * 2}px)` }}
              onClick={() => setShowSpeech(true)}
            />
          </div>
        </div>

        <div className="w-full md:w-1/2 z-10 mt-16 md:mt-0 md:pl-20">
          <div className="animate-fade-in">
            <h1 className="text-[60px] md:text-[80px] font-black mb-4 leading-none text-[#3d200a]">
              Grandma's <br />
              <span className="text-[#e3523d]">restaurant</span>
            </h1>
            <p className="text-[#8b5e3c] mb-10 max-w-sm text-lg leading-relaxed font-medium">
              Get ready to savor Grandma's delicious home-cooked meals and many other special dishes from us.
            </p>
            <div className="flex gap-5">
              <button className="bg-[#e3523d] text-white px-10 py-4 rounded-full font-bold shadow-lg hover:bg-[#c94432] transition-all transform hover:scale-105">Order Now</button>
              <button className="bg-white text-[#3d200a] px-10 py-4 rounded-full font-bold border border-orange-100 hover:bg-orange-50 transition-all">View Menu</button>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section className="px-10 py-24 bg-white relative z-10">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-black text-[#3d200a] mb-4">menu</h2>
          <div className="h-1.5 w-16 bg-[#e3523d] mx-auto rounded-full" />
        </div>
        
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          {MENU_ITEMS.map((item, i) => (
            <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-shadow">
              <img src={item.image} alt={item.name} className="w-full h-56 object-cover" />
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-xl">{item.name}</h3>
                  <span className="font-black text-[#3d200a]">{item.price} $</span>
                </div>
                <p className="text-gray-400 text-xs mb-6 leading-relaxed">{item.desc}</p>
                <button onClick={() => setCart(c => [...c, i])} className="w-full bg-[#f18c8c] hover:bg-[#e3523d] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
                  <span>🛒</span> Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="bg-white py-20 px-10 border-t border-gray-50">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="space-y-6">
            <h4 className="font-black text-xl">Customer reviews</h4>
            <div className="space-y-4 text-sm text-gray-600 font-medium">
              <div className="flex gap-4 items-start">
                <span className="bg-gray-100 p-2 rounded-lg text-lg">📍</span>
                <p>Uthai Thani Province, Lan Sak District, Din Daeng Market.</p>
              </div>
              <div className="flex gap-4 items-center">
                <span className="bg-gray-100 p-2 rounded-lg text-lg">📞</span>
                <p>081 -04080-48</p>
              </div>
              <div className="flex gap-4 items-center">
                <span className="bg-gray-100 p-2 rounded-lg text-lg">🕒</span>
                <p>Saturday, Sunday</p>
              </div>
            </div>
          </div>
          
          {[
            { name: "คุณสมชาย", text: '"It tastes just like Grandma\'s cooking."', color: "bg-green-300" },
            { name: "Customer", text: '"Easy to order, fast delivery, excellent taste."', color: "bg-green-300" }
          ].map((review, idx) => (
            <div key={idx} className="bg-gray-100/60 p-8 rounded-2xl">
              <div className="flex gap-1 text-yellow-400 mb-4">★★★★★</div>
              <p className="text-gray-700 italic mb-8 font-medium">{review.text}</p>
              <div className="flex items-center gap-3 border-t border-gray-200 pt-4">
                <div className={`w-10 h-10 ${review.color} rounded-full shadow-inner`} />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{review.name}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER - แถบสีเทาตามแบบภาพเป๊ะๆ */}
      <footer className="bg-[#D9D9D9] py-5 px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* ซ้าย: โลโก้วงกลม */}
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center p-2 shadow-sm border border-white">
              <img src="/images/logo.png" alt="footer-logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[13px] text-gray-700 leading-none mb-1">กับข้าวแม่</span>
              <span className="text-[10px] text-gray-400 font-medium">homemade</span>
            </div>
          </div>

          {/* กลาง: ข้อความ I hope you like it */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-1">I hope you like it.</h3>
            <p className="text-[9px] text-gray-500 uppercase tracking-widest">© 2026 Grandma's Restaurant. All rights reserved.</p>
          </div>

          {/* ขวา: Social Icons */}
          <div className="flex items-center gap-4">
            <a href="#" className="w-9 h-9 hover:scale-110 transition-transform">
              <img src="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png" alt="FB" />
            </a>
            <a href="#" className="w-9 h-9 hover:scale-110 transition-transform">
              <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg" alt="Line" />
            </a>
            <a href="#" className="w-9 h-9 hover:scale-110 transition-transform">
              <img src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg" alt="IG" />
            </a>
          </div>

        </div>
      </footer>
    </div>
  );
}