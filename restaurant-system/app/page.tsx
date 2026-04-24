'use client';

import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

const MENU_ITEMS = [
  { name: 'Noodle soup', price: 30, emoji: '🍜', desc: 'Classic grandma recipe' },
  { name: 'Egg noodle', price: 20, emoji: '🥣', desc: 'Soft & savory' },
  { name: 'Jelly dessert', price: 20, emoji: '🍮', desc: 'Sweet homemade jelly' },
];

const SPEECH = [
  "ยินดีต้อนรับค่ะ! 🍜",
  "วันนี้มีเมนูใหม่ค่ะ ✨",
  "ลองสั่งดูนะคะ 😊",
  "อร่อยแน่นอนค่ะ! 🎉",
];

export default function Home() {
  const imagePath = "/images/preview.png";

  // Mouse tracking
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const smoothX = useSpring(x, { stiffness: 80, damping: 18 });
  const smoothY = useSpring(y, { stiffness: 80, damping: 18 });

  // Speech bubble state
  const [speechIdx, setSpeechIdx] = useState(0);
  const [showSpeech, setShowSpeech] = useState(false);
  const [cart, setCart] = useState<number[]>([]);
  const [cartPop, setCartPop] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const moveX = (e.clientX / window.innerWidth - 0.5) * 2;
      const moveY = (e.clientY / window.innerHeight - 0.5) * 2;
      x.set(moveX * 12);
      y.set(moveY * 12);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [x, y]);

  // Auto speech bubble every 5s
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

  function handleCharClick() {
    setSpeechIdx(i => (i + 1) % SPEECH.length);
    setShowSpeech(true);
    setTimeout(() => setShowSpeech(false), 2500);
  }

  function addToCart(i: number) {
    setCart(c => [...c, i]);
    setCartPop(true);
    setTimeout(() => setCartPop(false), 300);
  }

  return (
    <div className="bg-[#fff8f0] min-h-screen text-gray-800 font-sans">

      {/* Navbar */}
      <nav className="flex justify-between items-center px-10 py-4 bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-orange-100">
        <div className="font-bold text-xl flex items-center gap-2 text-[#5a2d0c]">
          🍜 <span>กันข้าวนม</span>
        </div>
        <div className="flex gap-6 text-sm items-center">
          <button className="hover:text-red-500 transition-colors">Promotions</button>
          <button className="hover:text-red-500 transition-colors">Menu</button>
          <button className="bg-[#c0722a] text-white px-3 py-1 rounded-full text-xs">Member</button>
          {/* Cart badge */}
          <motion.button
            animate={cartPop ? { scale: [1, 1.4, 1] } : {}}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            🛒
            {cart.length > 0 && (
              <motion.span
                key={cart.length}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center"
              >
                {cart.length}
              </motion.span>
            )}
          </motion.button>
          <button className="text-gray-500 text-sm">EN</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex flex-col md:flex-row items-center justify-between px-10 py-16 overflow-hidden min-h-[420px]">

        {/* Decorative blobs */}
        <div className="absolute right-10 top-10 w-72 h-72 bg-orange-200 rounded-full blur-3xl opacity-40 pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-40 h-40 bg-yellow-100 rounded-full blur-2xl opacity-50 pointer-events-none" />

        {/* Hero Text */}
        <motion.div
          className="max-w-lg z-10"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <h1 className="text-5xl font-bold mb-4 leading-tight text-[#5a2d0c]">
            Grandma's <br />
            <span className="text-[#c0722a]">restaurant</span>
          </h1>
          <p className="text-[#7a4a2a] mb-8 leading-relaxed">
            Get ready to savor Grandma's delicious home-cooked meals<br />
            and many other special dishes from us.
          </p>
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.97 }}
              className="bg-[#c0722a] text-white px-7 py-3 rounded-full shadow-md text-sm font-medium"
            >
              Order Now
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.97 }}
              className="bg-white border border-[#c0722a] text-[#5a2d0c] px-7 py-3 rounded-full text-sm font-medium"
            >
              View Menu
            </motion.button>
          </div>
        </motion.div>

        {/* Character + Speech Bubble */}
        <div className="relative z-10 mt-10 md:mt-0 flex flex-col items-center">

          {/* Speech Bubble */}
          <AnimatePresence>
            {showSpeech && (
              <motion.div
                key={speechIdx}
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.9 }}
                transition={{ duration: 0.25 }}
                className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white border border-[#c0722a] rounded-xl px-4 py-2 text-sm text-[#5a2d0c] whitespace-nowrap shadow-sm"
              >
                {SPEECH[speechIdx]}
                <div className="absolute bottom-[-7px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[7px] border-l-transparent border-r-transparent border-t-[#c0722a]" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Character with mouse parallax + idle float */}
          <motion.div
            style={{ x: smoothX, y: smoothY, rotateY: smoothX, rotateX: smoothY }}
            onClick={handleCharClick}
            className="cursor-pointer"
          >
            <motion.img
              src={imagePath}
              alt="chef character"
              className="w-72 drop-shadow-xl"
              animate={{ y: [0, -12, 0], rotate: [0, 1.5, -1.5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.96, rotate: -3 }}
            />
          </motion.div>
        </div>
      </section>

      {/* Menu Section */}
      <section className="px-10 py-16 bg-white/60">
        <motion.h2
          className="text-3xl font-bold text-center mb-2 text-[#5a2d0c]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Our Menu
        </motion.h2>
        <p className="text-center text-[#7a4a2a] mb-10 text-sm">Made with love, just like home</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {MENU_ITEMS.map((item, i) => (
            <motion.div
              key={i}
              className="bg-white p-5 rounded-2xl border border-orange-100 shadow-sm"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              whileHover={{ y: -8, boxShadow: '0 12px 32px rgba(192,114,42,0.15)' }}
            >
              <div className="h-36 flex items-center justify-center bg-[#fff8f0] rounded-xl mb-4 text-5xl">
                {item.emoji}
              </div>
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-semibold text-[#5a2d0c]">{item.name}</h3>
                <span className="text-[#c0722a] font-bold">${item.price}</span>
              </div>
              <p className="text-xs text-gray-400 mb-4">{item.desc}</p>
              <motion.button
                onClick={() => addToCart(i)}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-[#c0722a] text-white py-2 rounded-xl text-sm font-medium hover:bg-[#a05a1e] transition-colors"
              >
                Add to Cart
              </motion.button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-sm text-gray-400 bg-white/40">
        © 2026 Grandma Restaurant · Made with ❤️
      </footer>
    </div>
  );
}