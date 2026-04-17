import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { 
  Bot, User, Send, Smartphone, RefreshCcw, ShoppingCart,
  Video, Calendar, Image as ImageIcon, Camera, 
  Mail, Map, Clock, Cloud, 
  FileText, TrendingUp, Book, Store, 
  Radio, Settings, Phone, MessageSquare, Compass, Music,
  Scale, X, Check, ArrowRight
} from 'lucide-react';

const APP_GRID = [
  { bg: 'bg-[#34C759]', icon: Video, color: 'text-white', fill: 'currentColor' }, // FaceTime
  { bg: 'bg-white', icon: Calendar, color: 'text-[#FF3B30]', fill: 'none' }, // Calendar
  { bg: 'bg-white', icon: ImageIcon, color: 'text-[#007AFF]', fill: 'none' }, // Photos
  { bg: 'bg-[linear-gradient(135deg,#A3A3A3,#8E8E93)]', icon: Camera, color: 'text-[#1C1C1E]', fill: 'currentColor' }, // Camera
  
  { bg: 'bg-[#007AFF]', icon: Mail, color: 'text-white', fill: 'currentColor' }, // Mail
  { bg: 'bg-[#34C759]', icon: Map, color: 'text-white', fill: 'none' }, // Maps
  { bg: 'bg-[#1C1C1E]', icon: Clock, color: 'text-white', fill: 'none' }, // Clock
  { bg: 'bg-[#5AC8FA]', icon: Cloud, color: 'text-white', fill: 'currentColor' }, // Weather
  
  { bg: 'bg-[#FFCC00]', icon: FileText, color: 'text-[#1C1C1E]', fill: 'currentColor' }, // Notes
  { bg: 'bg-[#1C1C1E]', icon: TrendingUp, color: 'text-[#34C759]', fill: 'none' }, // Stocks
  { bg: 'bg-[#FF9500]', icon: Book, color: 'text-white', fill: 'currentColor' }, // Books
  { bg: 'bg-[#007AFF]', icon: Store, color: 'text-white', fill: 'none' }, // App Store
  
  { bg: 'bg-[#AF52DE]', icon: Radio, color: 'text-white', fill: 'none' }, // Podcasts
  { bg: 'bg-[#8E8E93]', icon: Settings, color: 'text-white', fill: 'none' }, // Settings
  { bg: 'bg-[#FF9500]', icon: Smartphone, color: 'text-white', fill: 'none' }, // Voice Memos
  { bg: 'bg-[#1C1C1E]', icon: User, color: 'text-white', fill: 'currentColor' }, // Contacts
];

const DOCK_APPS = [
  { bg: 'bg-[#34C759]', icon: Phone, color: 'text-white', fill: 'currentColor' },
  { bg: 'bg-[#34C759]', icon: MessageSquare, color: 'text-white', fill: 'currentColor' },
  { bg: 'bg-[#007AFF]', icon: Compass, color: 'text-white', fill: 'none' },
  { bg: 'bg-[#FF3B30]', icon: Music, color: 'text-white', fill: 'none' },
];

type Message = {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  options?: string[];
  isTyping?: boolean;
};

const QUESTIONS = [
  {
    text: "Dạ chào bạn! Mình là Tuấn, chuyên viên tư vấn. Mình sẽ giúp bạn chọn ra chiếc máy ưng ý nhất. Bạn cho mình xin một vài thông tin nhé!\n\nNgân sách tối đa của bạn là khoảng bao nhiêu ạ?",
    options: ["Dưới 1 triệu", "Khoảng 2 - 4 triệu", "Trên 5 triệu"]
  },
  {
    text: "Dạ vâng! Bạn sẽ dùng điện thoại để làm gì là chính ạ?",
    options: ["Chơi game mượt mà", "Chạy xe/Giao hàng (Cần pin trâu)", "Chỉ nghe gọi, mở Youtube"]
  },
  {
    text: "Tuấn đã nắm được nhu cầu rồi ạ. Mình khảo sát thêm một ý nhỏ: Bạn có ưu tiên dùng hãng nào không, hay hãng nào xài tốt là được ạ?",
    options: ["Mình thích Xiaomi/POCO", "Mình thích OPPO", "Samsung / Hãng khác đều được"]
  }
];

const getAIClient = () => {
  let key = "";
  try {
    // This will work in environments where process is defined (like AI Studio)
    if (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) {
      key = process.env.GEMINI_API_KEY;
    }
  } catch (error) {
    // Ignore reference errors if process isn't polyfilled
  }
  
  if (!key) {
    try {
      // @ts-ignore - Fallback to Vite environment variables for Vercel
      key = import.meta.env.VITE_GEMINI_API_KEY || "";
    } catch (error) {
      // Ignore
    }
  }

  return new GoogleGenAI({ apiKey: key || "MISSING_API_KEY" });
};

const PRODUCTS = [
  // Xiaomi
  { id: 1, name: "Xiaomi POCO C65 8GB/256GB", price: 2.6, brand: "xiaomi", format: "basic", link: "https://s.shopee.vn/8V530QgNkD", specs: { screen: "6.74 inch 90Hz", cpu: "Helio G85", ram: "8GB", storage: "256GB", battery: "5000mAh, 18W" } },
  { id: 2, name: "Xiaomi Redmi 13C 6GB/128GB", price: 2.3, brand: "xiaomi", format: "driver", link: "https://s.shopee.vn/20rZGU57w2", specs: { screen: "6.74 inch 90Hz", cpu: "Helio G85", ram: "6GB", storage: "128GB", battery: "5000mAh, 18W" } },
  { id: 3, name: "Xiaomi Mi 10S 5G", price: 3.4, brand: "xiaomi", format: "game", link: "https://s.shopee.vn/8ASCboheQB", specs: { screen: "6.67 inch AMOLED 90Hz", cpu: "Snapdragon 870", ram: "8GB", storage: "128GB", battery: "4780mAh, 33W" } },
  { id: 4, name: "Xiaomi Redmi 15C 8GB/256GB", price: 3.2, brand: "xiaomi", format: "driver", link: "https://s.shopee.vn/6VJycknznV", specs: { screen: "6.74 inch HD+", cpu: "Helio G99", ram: "8GB", storage: "256GB", battery: "6000mAh, 22.5W" } },
  // OPPO
  { id: 5, name: "OPPO A78 5G 6GB/128GB", price: 2.6, brand: "oppo", format: "basic", link: "https://s.shopee.vn/gMBg2ACdu", specs: { screen: "6.56 inch 90Hz", cpu: "Dimensity 700", ram: "6GB", storage: "128GB", battery: "5000mAh, 33W" } },
  { id: 6, name: "OPPO A53", price: 2.8, brand: "oppo", format: "game", link: "https://s.shopee.vn/8fOTCjfkPC", specs: { screen: "6.5 inch 90Hz", cpu: "Snapdragon 460", ram: "4GB", storage: "128GB", battery: "5000mAh, 18W" } },
  { id: 7, name: "OPPO Reno10 5G", price: 3.8, brand: "oppo", format: "game", link: "https://s.shopee.vn/901JbLeTjE", specs: { screen: "6.7 inch AMOLED 120Hz", cpu: "Dimensity 7050", ram: "8GB", storage: "256GB", battery: "5000mAh, 67W" } },
  { id: 8, name: "OPPO A79 5G 12GB/256GB", price: 4.0, brand: "oppo", format: "basic", link: "https://s.shopee.vn/4qBkdguLBr", specs: { screen: "6.72 inch FHD+ 90Hz", cpu: "Dimensity 6020", ram: "12GB", storage: "256GB", battery: "5000mAh, 33W" } },
  // Other (Samsung, i17, Oukitel)
  { id: 9, name: "Samsung Galaxy A14 6GB/128GB", price: 2.3, brand: "other", format: "basic", link: "https://s.shopee.vn/9fH0OZbwNI", specs: { screen: "6.6 inch PLS LCD", cpu: "Exynos 850", ram: "6GB", storage: "128GB", battery: "5000mAh, 15W" } },
  { id: 10, name: "i17 Ultra Pin khủng", price: 2.9, brand: "other", format: "driver", link: "https://s.shopee.vn/7VCVoakBlb", specs: { screen: "6.8 inch IPS", cpu: "Unisoc T606", ram: "6GB", storage: "128GB", battery: "12000mAh, 18W" } },
  { id: 11, name: "Samsung Galaxy S20 FE", price: 3.5, brand: "other", format: "game", link: "https://s.shopee.vn/1qY94B5lH3", specs: { screen: "6.5 inch Super AMOLED 120Hz", cpu: "Snapdragon 865", ram: "8GB", storage: "256GB", battery: "4500mAh, 25W" } },
  { id: 12, name: "Oukitel F150 B1 Pro", price: 4.2, brand: "other", format: "driver", link: "https://s.shopee.vn/AUq7O6YlhQ", specs: { screen: "6.5 inch FHD+", cpu: "Helio G37", ram: "6GB", storage: "128GB", battery: "10000mAh, 18W" } }
];

function getRecommendation(answers: string[], rejectedIds: number[]) {
  const [budget, usage, brand] = answers;
  
  const b = (budget || "").toLowerCase();
  const u = (usage || "").toLowerCase();
  const br = (brand || "").toLowerCase();

  const isUnder1M = b.includes("dưới 1") || b.includes("1 triệu") || b.includes("1tr") || b.includes("dưới một") || b.includes("1 tr");
  const isOver5M = b.includes("trên 5") || b.includes("hơn 5") || b.includes("5 triệu") || b.includes("5tr");

  let targetBrand = "other";
  if (br.includes("xiaomi") || br.includes("poco")) targetBrand = "xiaomi";
  else if (br.includes("oppo")) targetBrand = "oppo";

  let targetType = "basic";
  if (u.includes("game")) targetType = "game";
  else if (u.includes("xe") || u.includes("giao hàng") || u.includes("pin")) targetType = "driver";

  if (isUnder1M) {
    let cheapestProducts = [...PRODUCTS].sort((a,b) => a.price - b.price);
    let availableCandidates = cheapestProducts.filter(p => !rejectedIds.includes(p.id));
    if (availableCandidates.length === 0) availableCandidates = cheapestProducts;
    
    let selectedProduct = availableCandidates[0];

    let reason = `Dạ Tuấn chia sẻ thật lòng, các dòng điện thoại smartphone dưới 1 triệu hiện nay thường có nhược điểm lớn là cảm ứng rất dễ đơ lag, pin mau chai và rủi ro hỏng vặt rất cao. Thay vì thế, Tuấn khuyên mình nên cố thêm một chút xíu để sở hữu chiếc ${selectedProduct.name} này. Đây là đại diện có mức giá rẻ nhất kho Tuấn (chỉ ${selectedProduct.price} triệu). Mua 1 lần dùng mượt 2-3 năm ổn định mới thực sự là tiết kiệm!`;

    return {
      id: selectedProduct.id,
      phone: selectedProduct.name, 
      reason: reason, 
      link: selectedProduct.link 
    };
  }

  if (isOver5M) {
    let mostExpensiveProducts = [...PRODUCTS].sort((a,b) => b.price - a.price);
    let brandCandidates = mostExpensiveProducts.filter(p => p.brand === targetBrand);
    if (brandCandidates.length > 0) mostExpensiveProducts = brandCandidates;
    let availableCandidates = mostExpensiveProducts.filter(p => !rejectedIds.includes(p.id));
    if (availableCandidates.length === 0) availableCandidates = mostExpensiveProducts;
    
    let selectedProduct = availableCandidates[0];
    let reason = `Dạ với mức tài chính trên 5 triệu thì bạn hoàn toàn có thể mua được mức cấu hình cận cao cấp rồi ạ! Tuấn đặc biệt chọn ra chiếc ${selectedProduct.name} (giá đang Sale rẻ nhất chỉ ${selectedProduct.price} triệu). Cấu hình đảm bảo ăn đứt mọi đối thủ trong tầm giá!`;

    return {
      id: selectedProduct.id,
      phone: selectedProduct.name, 
      reason: reason, 
      link: selectedProduct.link 
    };
  }

  let maxPrice = 3.0; // fallback to 2-3
  if (b.includes("3 - 4") || b.includes("3-4") || b.includes("2 - 4") || b.includes("2-4")) maxPrice = 4.0;
  else if (b.includes("4 - 5") || b.includes("4-5")) maxPrice = 5.0;

  let candidates = PRODUCTS.filter(p => p.brand === targetBrand);
  if (candidates.length === 0) candidates = PRODUCTS;

  let priceFiltered = candidates.filter(p => 
    maxPrice <= 3.0 ? p.price <= 3.0 : (p.price > maxPrice - 1.0 && p.price <= maxPrice)
  );
  if (priceFiltered.length > 0) candidates = priceFiltered;

  let availableCandidates = candidates.filter(p => !rejectedIds.includes(p.id));
  if (availableCandidates.length === 0) {
    availableCandidates = PRODUCTS.filter(p => !rejectedIds.includes(p.id));
  }
  if (availableCandidates.length === 0) availableCandidates = PRODUCTS;

  let selectedProduct = availableCandidates.find(p => p.format === targetType);
  if (!selectedProduct) selectedProduct = availableCandidates[0];

  let reason = "";
  if (targetType === "game") {
    reason = `Dạ mẫu này xài chip rất tốt để chạy game cực kỳ mượt mà, màn hình sáng đẹp. Chiến game liên tục với con này (giá rẻ đỉnh của chóp chỉ ${selectedProduct.price} triệu) là quá hời ạ. Mình bấm vào link để xem cấu hình chi tiết nha!`;
  } else if (targetType === "driver") {
    reason = `Anh/chị chạy xe ngoài đường nguyên ngày thì viên pin siêu khủng của chiếc này là chân ái đó ạ. Giá lại cực mềm cực rẻ chỉ ${selectedProduct.price} triệu giúp mau hoàn vốn ạ.`;
  } else {
    reason = `Dạ với mức ngân sách này thì mẫu ${selectedProduct.name} đang là sự lựa chọn giá rẻ cấu hình khỏe hợp lý tuyệt đối. Thoải mái lưu xem Youtube cả ngày không giật lag. Giá sốc cực hời chỉ ${selectedProduct.price} triệu ạ.`;
  }

  return {
    id: selectedProduct.id,
    phone: selectedProduct.name, 
    reason: reason, 
    link: selectedProduct.link 
  };
}

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

const FloatingBackground = React.memo(() => {
  // Generate random phones
  const [phones] = useState(() => 
    Array.from({ length: 15 }).map((_, i) => {
      const initialRotation = -25 + Math.random() * 50;
      const targetRotation = initialRotation + (Math.random() > 0.5 ? 45 : -45);
      return {
        id: i,
        left: `${Math.random() * 90}%`,
        duration: 35 + Math.random() * 45,
        delay: -(Math.random() * 40), // Negative delay so they are on screen immediately
        width: 90 + Math.random() * 60,
        rotation: initialRotation,
        targetRotation: targetRotation,
        opacity: 0.25 + Math.random() * 0.35,
        seed: `tech-iphone-${i}`
      };
    })
  );

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-slate-950">
      {/* Main Background Real Image (Abstract texture via Picsum) */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000" 
        style={{ 
          backgroundImage: `url('https://picsum.photos/seed/dark-tech-abstract/1920/1080?blur=4')`,
          opacity: 0.35 
        }}
      />
      {/* Dark Gradients to ensure text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950/90 via-indigo-950/70 to-slate-950/95" />
      <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[4px]" />
      
      {/* Subtle centralized glow behind chat */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/20 blur-[150px] rounded-full pointer-events-none" />
      
      {/* Floating real photos styled as phone devices */}
      {phones.map((item) => (
        <motion.div
          key={item.id}
          className="absolute bottom-[-30%] shadow-[0_15px_35px_rgba(0,0,0,0.5)] border border-slate-700/50 bg-slate-800 p-1 md:p-1.5"
          style={{ 
            left: item.left, 
            opacity: item.opacity,
            width: item.width,
            height: item.width * 2.1,
            borderRadius: item.width * 0.18,
          }}
          animate={{
            y: ['0vh', '-130vh'],
            rotate: [item.rotation, item.targetRotation]
          }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          {/* Screen container */}
          <div 
            className="relative w-full h-full bg-slate-950 overflow-hidden"
            style={{ borderRadius: item.width * 0.12 }}
          >
            {/* Fake Notch/Camera */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[35%] h-[5%] bg-slate-900 rounded-b-[40%] z-20 shadow-sm" />
            
            {/* Real photo as screen wallpaper, blurred */}
            <img 
              src={`https://picsum.photos/seed/${item.seed}/200/400`} 
              referrerPolicy="no-referrer" 
              alt="Screen wallpaper" 
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover opacity-70 blur-[3px]" 
            />
            
            {/* Fake App Menu UI */}
            <div className="absolute inset-0 z-10 flex flex-col px-[8%] pt-[18%] pb-[6%]">
              {/* App Grid */}
              <div className="grid grid-cols-4 gap-y-[10%] gap-x-[15%]">
                {APP_GRID.map((app, idx) => {
                  const Icon = app.icon;
                  return (
                    <div key={idx} className={`w-full aspect-square rounded-[22%] shadow-sm flex items-center justify-center overflow-hidden ${app.bg} relative`}>
                      <Icon className={`w-[60%] h-[60%] ${app.color} drop-shadow-sm`} fill={app.fill} strokeWidth={2} />
                      {/* Glossy overlay for realism */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20 pointer-events-none"></div>
                    </div>
                  )
                })}
              </div>
              
              {/* Fake Dock */}
              <div className="mt-auto w-full">
                <div className="bg-white/30 backdrop-blur-md rounded-[30%] flex justify-between items-center p-[6%] border border-white/20">
                  {DOCK_APPS.map((app, idx) => {
                    const Icon = app.icon;
                    return (
                      <div key={idx} className={`w-[19%] aspect-square rounded-[22%] shadow-sm flex items-center justify-center overflow-hidden ${app.bg} relative`}>
                        <Icon className={`w-[60%] h-[60%] ${app.color} drop-shadow-sm`} fill={app.fill} strokeWidth={2} />
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20 pointer-events-none"></div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Screen Glare/Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none z-30"></div>
          </div>
        </motion.div>
      ))}
    </div>
  );
});

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [rejectedIds, setRejectedIds] = useState<number[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isAiMode, setIsAiMode] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [compareIds, setCompareIds] = useState<number[]>([]);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  const handleToggleCompare = (id: number) => {
    setCompareIds(prev => {
      if (prev.includes(id)) return prev.filter(pid => pid !== id);
      if (prev.length >= 3) return prev; // max 3 limit
      return [...prev, id];
    });
  };

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      const { scrollHeight, clientHeight } = messagesContainerRef.current;
      messagesContainerRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial greeting
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      addBotMessage(QUESTIONS[0].text, QUESTIONS[0].options, 800);
    }
  }, []);

  const addBotMessage = (text: string, options?: string[], isTypingDelay = 800) => {
    const id = generateId();
    setMessages(prev => [...prev, { id, sender: 'bot', text: '', isTyping: true }]);
    
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === id ? { ...msg, text, options, isTyping: false } : msg
      ));
    }, isTypingDelay);
  };

  const handleUserAnswer = async (answer: string, isFromButton: boolean = false) => {
    if (!answer.trim() || isAnalyzing) return;
    
    // Remove options from previous bot message
    setMessages(prev => {
      const newMessages = [...prev];
      const lastBotMsgIndex = newMessages.map(m => m.sender).lastIndexOf('bot');
      if (lastBotMsgIndex !== -1) {
        newMessages[lastBotMsgIndex] = { ...newMessages[lastBotMsgIndex], options: undefined };
      }
      return newMessages;
    });

    // Add user message
    const userMsgId = generateId();
    setMessages(prev => [...prev, { id: userMsgId, sender: 'user', text: answer }]);
    setInputValue("");
    
    const lowerAns = answer.toLowerCase();
    
    if (lowerAns.includes("so sánh")) {
      setShowCompare(true);
      setTimeout(() => {
        setMessages(prev => [...prev, { id: generateId(), sender: 'bot', text: "Tuấn đã mở bảng so sánh cho bạn rồi nhé. Bạn có thể bấm chọn tối đa 3 máy bất kỳ để đối chiếu cấu hình chi tiết nha!", options: ["Máy này OK", "Tôi muốn xem máy khác", "Làm lại từ đầu"] }]);
      }, 600);
      return;
    }

    if (lowerAns.includes("tư vấn lại từ đầu") || lowerAns.includes("làm lại từ đầu")) {
      resetChat();
      return;
    }

    if (lowerAns.includes("máy này ok") || lowerAns.includes("ưng") || lowerAns.includes("cảm ơn") || lowerAns.includes("đã chốt")) {
      const finalMsg = "Cảm ơn bạn đã tin tưởng dịch vụ của mình! Đừng quên bấm vào đường link rước ẻm về nhaaa!";
      setTimeout(() => {
        setMessages(prev => [...prev, { id: generateId(), sender: 'bot', text: finalMsg }]);
      }, 500);
      return;
    } else if (lowerAns.includes("tôi muốn xem máy khác") || lowerAns.includes("khác") || lowerAns.includes("không ưng")) {
      handleAnalysis(answers, true); // true to signify retry flow
      return;
    }

    // AI Triggering condition
    if (!isFromButton) {
      setIsAiMode(true);
    } // Once entered AI mode, we don't go back unless resetChat is called

    // If it's pure button flow AND we haven't entered AI mode yet
    if (isFromButton && !isAiMode && currentStep < QUESTIONS.length) {
      const newAnswers = [...answers, answer];
      setAnswers(newAnswers);
      
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);

      if (nextStep < QUESTIONS.length) {
        addBotMessage(QUESTIONS[nextStep].text, QUESTIONS[nextStep].options);
      } else {
        handleAnalysis(newAnswers, false);
      }
      return;
    }

    // Set Analyzing state for AI
    setIsAnalyzing(true);
    const botWaitId = generateId();
    setMessages(prev => [...prev, { id: botWaitId, sender: 'bot', text: 'Đang gõ...', isTyping: true }]);

    try {
      // Create system instruction
      const systemInstruction = `
Bạn là Tuấn, một chuyên viên tư vấn mua điện thoại smartphone giá rẻ (từ 1 đến 5 triệu đồng), pin trâu, chơi game, và chạy Grab/Shipper.
BẠN ĐANG LÀM AFFILIATE, NÊN MỤC TIÊU CUỐI CÙNG LÀ CHUYỂN ĐỔI NGƯỜI DÙNG BẤM VÀO LINK MUA HÀNG BÊN DƯỚI.

QUY TẮC CỐT LÕI (RẤT QUAN TRỌNG):
1. ĐỂ TRÒ CHUYỆN CHÂN THỰC: Khi khách hàng vừa mới đưa ra rải rác nhu cầu ban đầu, TUYỆT ĐỐI KHÔNG vội vàng đưa ra sản phẩm ngay. Hãy thể hiện sự quan tâm bằng cách HỎI THÊM 1 đến 2 câu hỏi khéo léo để đào sâu về thói quen sử dụng, nhằm tạo sự gần gũi. 
(VD: "Dạ cấu hình thì em sẵn rồi, nhưng không biết mình hay cày game gì để Tuấn chọn chip chuẩn nhất cho mình ạ?", "Dạ chạy xe thì pin trâu là chắc chắn rồi, nhưng ngày mình hay chạy ban ngày nắng gắt không để em lựa con màn hình chống lóa sáng rõ cho dễ nhìn app ạ?").
2. CHỐT SALE DỰA TRÊN ĐỘ PHÙ HỢP: CHỈ sau khi đã tương tác hỏi đáp thêm khoảng 1-2 vòng và hiểu rõ ý khách, bạn mới tung ra 1 ĐẾN 2 SẢN PHẨM mang lại tỉ lệ phù hợp cao nhất trong kho.
3. BẠN CHỈ ĐƯỢC TƯ VẤN VỀ ĐIỆN THOẠI DI ĐỘNG. Nếu người dùng hỏi lan man, ngoài lề (như thời tiết, nấu ăn, lịch sử...), hãy khéo léo và HÀI HƯỚC lái câu chuyện về lại việc chọn mua điện thoại. 
4. Dùng ngôn từ thân thiện, nhiệt tình của người bán hàng (xưng hô Tuấn - bạn/anh/chị).
5. Khi tư vấn máy, LUÔN LUÔN kèm theo LINK MUA HÀNG tương ứng trong dữ liệu kho. Tên điện thoại và giá tiền thì bôi đậm (**text**), ghi rõ chữ 'Triệu'.
6. TRẢ LỜI NGẮN GỌN, XÚC TÍCH, DỄ HIỂU. ĐỪNG GIẢI THÍCH DÀI DÒNG QUÁ LÀM KHÁCH LƯỜI ĐỌC.

DANH SÁCH SẢN PHẨM Ở KHO:
- Xiaomi POCO C65 8GB/256GB - Giá 2.6 Triệu - Pin 5000mAh. Link: https://s.shopee.vn/8V530QgNkD
- Xiaomi Redmi 13C 6GB/128GB - Giá 2.3 Triệu - Pin 5000mAh. Link: https://s.shopee.vn/20rZGU57w2
- Xiaomi Mi 10S 5G - Giá 3.4 Triệu - Chơi Game (Snap 870). Link: https://s.shopee.vn/8ASCboheQB
- Xiaomi Redmi 15C 8GB/256GB - Giá 3.2 Triệu - Pin khủng 6000mAh. Link: https://s.shopee.vn/6VJycknznV
- OPPO A78 5G 6GB/128GB - Giá 2.6 Triệu - Pin 5000mAh. Link: https://s.shopee.vn/gMBg2ACdu
- OPPO Reno10 5G - Giá 3.8 Triệu - Chơi Game màn 120Hz. Link: https://s.shopee.vn/901JbLeTjE
- Samsung Galaxy S20 FE - Giá 3.5 Triệu - Chơi Game (Snap 865). Link: https://s.shopee.vn/1qY94B5lH3
- i17 Ultra - Giá 2.9 Triệu - Chạy Grab/Shipper cực trâu với Pin 12000mAh. Link: https://s.shopee.vn/7VCVoakBlb
- Oukitel F150 B1 Pro - Giá 4.2 Triệu - Chạy đường dài siêu bền bỉ Pin 10000mAh. Link: https://s.shopee.vn/AUq7O6YlhQ
      `;

      // Setup history in alternating user/model format
      const validMessages = messages.filter(m => !m.isTyping && m.id !== botWaitId);
      
      const formattedHistory: any[] = [];
      let lastRole = null;

      for (const msg of validMessages) {
        const role = msg.sender === "user" ? "user" : "model";
        const text = msg.text || "Xin chào"; // Fallback to avoid empty parts
        
        if (role === lastRole) {
          // Append to previous part if roles are consecutive (Gemini doesn't allow consecutive same roles)
          formattedHistory[formattedHistory.length - 1].parts[0].text += `\n\n${text}`;
        } else {
          formattedHistory.push({
            role: role,
            parts: [{ text: text }]
          });
          lastRole = role;
        }
      }

      const ai = getAIClient();
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [...formattedHistory, { role: "user", parts: [{ text: answer }] }],
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      setIsAnalyzing(false);
      const reply = response.text || "Xin lỗi, Tuấn đang suy nghĩ chưa ra, bạn thông cảm nói lại giúp Tuấn nhé!";
      
      setMessages(prevMsgs => prevMsgs.map(msg => 
        msg.id === botWaitId ? { ...msg, text: reply, isTyping: false, options: ["Mở bảng so sánh", "Tư vấn lại từ đầu"] } : msg
      ));
      
    } catch (error: any) {
      console.error("Error calling Gemini API:", error);
      console.error("Detailed Error Message:", error?.message);
      setIsAnalyzing(false);
      setMessages(prevMsgs => prevMsgs.map(msg => 
        msg.id === botWaitId ? { ...msg, text: `Xin lỗi, hệ thống AI đang gặp lỗi kết nối (Có thể do thiết lập API Key). Lỗi chi tiết: ${error?.message || 'Không rõ lỗi'}`, isTyping: false } : msg
      ));
    }
  };

  const handleAnalysis = (finalAnswers: string[], isRetry: boolean = false) => {
    setIsAnalyzing(true);
    const id = generateId();
    
    const waitText = isRetry 
      ? 'Dạ, Tuấn đang lọc trong kho một mẫu điện thoại khác phù hợp hơn theo yêu cầu của bạn đây...'
      : 'Dạ, bạn chờ mình một lát để mình quét kho và lọc ra chiếc máy tối ưu nhất nhé...';

    setMessages(prev => [...prev, { id, sender: 'bot', text: waitText, isTyping: true }]);
    
    setTimeout(() => {
      const currentRejected = isRetry ? rejectedIds : [];
      const result = getRecommendation(finalAnswers, currentRejected);
      
      setRejectedIds(prev => isRetry ? [...prev, result.id] : [result.id]);
      
      const resultMessage = isRetry 
        ? `Đây ạ, Tuấn đã tìm ra một mẫu khác chắc chắn sẽ hợp với bạn hơn:\n🔥 **${result.phone}**.\n\nLý do Tuấn đổi sang mẫu này: ${result.reason}\n\n👉 Click vào link bên dưới để chốt ngay nha:\n${result.link}`
        : `Dạ Tuấn đã chọn được rồi ạ! Sản phẩm phù hợp nhất với bạn là:\n🔥 **${result.phone}**.\n\nLý do Tuấn đề xuất máy này: ${result.reason}\n\n👉 Bạn click vào link bên dưới để xem hình ảnh và đặt mua với giá ưu đãi trên Shopee nhé:\n${result.link}`;
      
      const followUpOptions = ["Máy này OK", "Tôi muốn xem máy khác", "⚖️ Mở bảng so sánh", "Tư vấn lại từ đầu"];

      setMessages(prev => prev.map(msg => 
        msg.id === id ? { ...msg, text: resultMessage, options: followUpOptions, isTyping: false } : msg
      ));
      
      setIsAnalyzing(false);
    }, 2800);
  };

  const resetChat = () => {
    setMessages([]);
    setCurrentStep(0);
    setAnswers([]);
    setRejectedIds([]);
    setIsAiMode(false);
    setIsAnalyzing(false);
    addBotMessage(QUESTIONS[0].text, QUESTIONS[0].options, 300);
  };

  const renderMessageText = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-indigo-400 font-medium underline break-all inline-flex items-center gap-1 hover:text-indigo-300 transition-colors"><ShoppingCart className="w-4 h-4" /> {part}</a>;
      }
      
      const boldParts = part.split(/(\*\*.*?\*\*)/g);
      return boldParts.map((bPart, j) => {
        if (bPart.startsWith('**') && bPart.endsWith('**')) {
          return <strong key={`${i}-${j}`} className="font-bold text-indigo-300">{bPart.slice(2, -2)}</strong>;
        }
        return <span key={`${i}-${j}`}>{bPart}</span>;
      });
    });
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center font-sans text-slate-100 overflow-x-hidden w-full">
      {/* Animated Floating Background */}
      <FloatingBackground />

      {/* Main Content Wrapper (Above Background) */}
      <div className="relative z-10 w-full flex flex-col items-center">
        
        {/* Top Section - taking full viewport */}
        <main className="w-full max-w-3xl flex flex-col items-center justify-center min-h-[100dvh] px-4 py-8 md:py-12 gap-4 md:gap-6">
          
          {/* Title Context */}
        <header className="text-center space-y-2 mb-2">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300 drop-shadow-sm"
          >
            Tư Vấn Chọn Máy 1-1
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-indigo-200/80 text-sm md:text-base max-w-xl mx-auto px-4 drop-shadow-sm"
          >
            Trò chuyện trực tiếp cùng chuyên viên để tìm ra chiếc Smartphone ưng ý nhất với nhu cầu và ngân sách của bạn.
          </motion.p>
        </header>

        {/* Glassmorphic Chat Window */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="w-full bg-slate-900/60 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] overflow-hidden flex flex-col flex-1 max-h-[85vh] border border-white/10 relative"
        >
          
          {/* Header */}
          <div className="bg-white/5 border-b border-white/10 p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-indigo-500/40 shadow-sm">
                  <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80" referrerPolicy="no-referrer" alt="Consultant Avatar" fetchPriority="high" className="w-full h-full object-cover" />
                </div>
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 border-2 border-slate-900 rounded-full z-10 translate-x-[10%] translate-y-[10%]"></div>
              </div>
              <div>
                <h2 className="font-bold text-base md:text-lg text-slate-100">Tuấn - Chuyên Viên Tư Vấn</h2>
                <p className="text-indigo-300 text-xs flex items-center gap-1.5 focus:outline-none">
                  Trực tuyến hỗ trợ
                </p>
              </div>
            </div>
            <button 
              onClick={resetChat}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              title="Làm lại từ đầu"
              aria-label="Làm lại từ đầu"
            >
              <RefreshCcw className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Area */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-indigo-500/30">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-[85%] md:max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
                    
                    {/* Avatar */}
                    <div className="flex-shrink-0 mt-auto hidden md:block">
                      {msg.sender === 'bot' ? (
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-indigo-500/50 shadow-sm relative">
                          <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=100&q=80" referrerPolicy="no-referrer" alt="Tuấn Avatar" loading="lazy" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-slate-700 text-slate-300 rounded-full flex items-center justify-center border border-slate-600">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    {/* Message Bubble & Options */}
                    <div className="flex flex-col gap-2 relative">
                      <div 
                        className={`p-3.5 md:p-4 rounded-2xl shadow-sm whitespace-pre-wrap leading-relaxed text-sm md:text-base ${
                          msg.sender === 'user' 
                            ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-br-sm' 
                            : 'bg-slate-800/80 border border-white/5 text-slate-200 rounded-bl-sm shadow-[0_4px_16px_rgba(0,0,0,0.2)]'
                        }`}
                      >
                        {msg.isTyping ? (
                          <div className="flex gap-1.5 items-center h-5 px-3">
                            <motion.div className="w-2.5 h-2.5 bg-indigo-400 rounded-full" animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                            <motion.div className="w-2.5 h-2.5 bg-indigo-400 rounded-full" animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }} />
                            <motion.div className="w-2.5 h-2.5 bg-indigo-400 rounded-full" animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }} />
                          </div>
                        ) : (
                          renderMessageText(msg.text)
                        )}
                      </div>
                      
                      {/* Interactive Options */}
                      {msg.options && !msg.isTyping && (
                        <motion.div 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="flex flex-wrap gap-2 mt-2"
                        >
                          {msg.options.map((opt, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleUserAnswer(opt, true)}
                              className="bg-slate-800/60 backdrop-blur-md border border-indigo-400/40 text-indigo-300 hover:bg-indigo-500 hover:text-white hover:border-indigo-400 px-4 py-2.5 rounded-full text-sm font-medium transition-all shadow-sm"
                            >
                              {opt}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Input Area */}
          <div className="bg-slate-900/40 border-t border-white/10 p-4">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleUserAnswer(inputValue, false);
              }}
              className="flex gap-3 items-center relative"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={isAnalyzing ? "Tuấn đang suy nghĩ..." : "Nhập tin nhắn của bạn..."}
                disabled={isAnalyzing}
                className="flex-1 bg-slate-800/80 border border-white/10 text-white placeholder-slate-400 text-sm rounded-full focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 block w-full p-3.5 px-6 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed shadow-inner"
              />
              <button
                type="submit"
                aria-label="Gửi tin nhắn"
                disabled={!inputValue.trim() || isAnalyzing}
                className="absolute right-2 text-white bg-indigo-600 hover:bg-indigo-500 focus:ring-4 focus:outline-none focus:ring-indigo-500/30 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center justify-center transition-colors disabled:opacity-50 disabled:bg-slate-700 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>
          </div>
        </motion.section>
        </main>

        {/* SEO Content Block (Below the Fold / Viewport) */}
        <section className="w-full bg-slate-950/80 backdrop-blur-xl border-t border-white/10 py-16 px-4 md:px-6 relative z-10 shadow-2xl">
          <article className="mx-auto bg-slate-900/40 rounded-2xl p-6 md:p-8 border border-white/5 text-slate-300 shadow-inner max-w-4xl space-y-6">
            <header className="mb-2 border-b border-indigo-500/20 pb-4">
              <h2 className="text-2xl md:text-3xl font-bold text-indigo-400 mb-2">
              Chuyên Gia Tư Vấn Mua Điện Thoại Giá Rẻ, Pin Trâu, Chơi Game Mượt
            </h2>
            <p className="text-sm md:text-base text-slate-400">
              Cẩm nang tối ưu giúp bạn tìm ra một chiếc smartphone từ 1 triệu đến dưới 5 triệu đồng tốt nhất cho nhu cầu chụp ảnh, chạy Grab/Giao hàng hoặc chiến game 24/7.
            </p>
          </header>

          <section className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-200">Tại sao nên mua điện thoại giá rẻ theo tư vấn của Tuấn?</h3>
            <p className="text-sm md:text-base leading-relaxed">
              Việc tìm kiếm một chiếc <strong>điện thoại giá rẻ</strong> hoạt động trơn tru từ 2 đến 3 năm không phải là điều dễ dàng với vô vàn mẫu mã như Xiaomi, Redmi, OPPO hay Samsung hiện nay. Tuấn là <strong>chuyên gia tư vấn cấu hình điện thoại</strong>, giúp bạn lọc ra những thiết bị sở hữu con chip mạnh mẽ nhất (như Snapdragon, MediaTek Helio), màn hình tần số quét 90Hz-120Hz mượt mà và dung lượng pin khủng 5000mAh.
            </p>
            <p className="text-sm md:text-base leading-relaxed">
              Nếu bạn mua 1 chiếc <strong>điện thoại dưới 1 triệu</strong>, rủi ro đơ lag và thay pin liên tục là rất cao. Đó là lý do Tuấn luôn khuyên người dùng tích lũy thêm một chút để mua các máy tầm <strong>giá 2 triệu - 3 triệu đồng</strong>, nhằm đảm bảo thời gian hoàn vốn tốt nhất khi dùng làm công cụ kiếm tiền hoặc học tập.
            </p>
          </section>

          <section className="grid md:grid-cols-2 gap-6 mt-6">
            <div className="bg-slate-800/50 p-5 rounded-xl border border-white/5 shadow-inner">
              <h3 className="text-lg font-bold text-indigo-300 mb-3 block">Điện thoại cho người giao hàng (Shipper)</h3>
              <ul className="list-disc pl-5 text-sm space-y-2 text-slate-300">
                <li>Ưu tiên số một: <strong className="text-white">Điện thoại pin siêu trâu</strong> (5000mAh đến 6000mAh) hoặc 10.000mAh.</li>
                <li>Công nghệ màn hình sáng rõ khi nhìn dưới ánh nắng chói chang độ sáng cao (Nits lớn).</li>
                <li>Hỗ trợ sạc siêu tốc 33W - 67W để bạn sẵn sàng nhận cuốc xe mà không lo cạn pin dọc đường.</li>
              </ul>
            </div>
            
            <div className="bg-slate-800/50 p-5 rounded-xl border border-white/5 shadow-inner">
              <h3 className="text-lg font-bold text-indigo-300 mb-3 block">Điện thoại chuyên chơi game giá rẻ</h3>
              <ul className="list-disc pl-5 text-sm space-y-2 text-slate-300">
                <li>Trang bị SoC tản nhiệt tốt, cân mượt Liên Quân Mobile, FreeFire, PUBG ở 60FPS.</li>
                <li>Màn hình 120Hz chống giật lác (lag), tái tạo combat sắc nét.</li>
                <li>Lựa chọn hàng đầu ở mức <strong>giá 3 - 5 triệu</strong> với RAM tối thiểu 4GB đến 8GB.</li>
              </ul>
            </div>
          </section>

            <footer className="text-xs text-slate-400 pt-6 mt-4 border-t border-white/5 text-center">
              Từ khóa liên quan: tư vấn điện thoại giá tốt, mua smartphone chính hãng shopee, điện thoại giá rẻ dưới 3 triệu, điện thoại cấu hình cao giá rẻ nhất, mua điện thoại sinh viên.
            </footer>
          </article>
        </section>

      </div>

      {/* Compare Floating Button */}
      <button
        onClick={() => setShowCompare(true)}
        className="fixed bottom-6 right-6 z-40 bg-indigo-600 hover:bg-indigo-500 text-white p-4 mx-2 rounded-full shadow-[0_10px_25px_rgba(79,70,229,0.5)] flex items-center justify-center transition-all focus:ring-4 focus:ring-indigo-500/30 group"
        title="So sánh cấu hình"
        aria-label="Mở bảng so sánh cấu hình"
      >
        <Scale className="w-6 h-6" />
        {compareIds.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#FF3B30] text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">{compareIds.length}</span>
        )}
      </button>

      {/* Compare Modal */}
      <AnimatePresence>
        {showCompare && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-5xl flex flex-col shadow-2xl overflow-hidden max-h-[90vh]"
            >
              <div className="flex justify-between items-center p-5 border-b border-white/10 bg-slate-800/50">
                <h2 className="text-xl font-bold flex items-center gap-2"><Scale className="w-5 h-5 text-indigo-400"/> So Sánh Cấu Hình</h2>
                <button onClick={() => setShowCompare(false)} aria-label="Đóng bảng so sánh" className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X className="w-5 h-5"/></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
                {/* Section: Select Products */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-slate-400">Chọn tối đa 3 sản phẩm để so sánh ({compareIds.length}/3)</h3>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
                    {PRODUCTS.map(p => {
                      const isSelected = compareIds.includes(p.id);
                      return (
                        <button 
                          key={p.id}
                          onClick={() => handleToggleCompare(p.id)}
                          className={`flex-shrink-0 px-4 py-2 border rounded-xl text-sm font-medium transition-all ${isSelected ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-slate-800/50 border-white/5 text-slate-400 hover:bg-slate-800'}`}
                        >
                          {isSelected && <Check className="w-4 h-4 inline-block mr-1.5"/>}
                          {p.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section: Comparison View */}
                {compareIds.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {compareIds.map(id => {
                        const p = PRODUCTS.find(x => x.id === id)!;
                        return (
                          <div key={p.id} className="bg-slate-800/40 border border-white/5 rounded-2xl p-5 relative group">
                            <button onClick={() => handleToggleCompare(p.id)} aria-label={`Xoá ${p.name} khỏi so sánh`} className="absolute top-3 right-3 p-1.5 bg-slate-900/50 hover:bg-[#FF3B30] rounded-full opacity-0 group-hover:opacity-100 transition-all"><X className="w-4 h-4"/></button>
                            <h4 className="font-bold text-lg text-white mb-1 pr-6">{p.name}</h4>
                            <p className="text-indigo-400 font-semibold mb-4">{p.price} Triệu VNĐ</p>
                            
                            <ul className="space-y-3 text-sm">
                              <li className="flex flex-col"><span className="text-slate-400 text-xs uppercase mb-0.5">Màn hình</span><span className="text-slate-200">{p.specs!.screen}</span></li>
                              <li className="flex flex-col"><span className="text-slate-400 text-xs uppercase mb-0.5">Vi xử lý (CPU)</span><span className="text-slate-200">{p.specs!.cpu}</span></li>
                              <li className="flex flex-col"><span className="text-slate-400 text-xs uppercase mb-0.5">RAM</span><span className="text-slate-200">{p.specs!.ram}</span></li>
                              <li className="flex flex-col"><span className="text-slate-400 text-xs uppercase mb-0.5">Bộ nhớ trong</span><span className="text-slate-200">{p.specs!.storage}</span></li>
                              <li className="flex flex-col"><span className="text-slate-400 text-xs uppercase mb-0.5">Pin & Sạc</span><span className="text-slate-200">{p.specs!.battery}</span></li>
                            </ul>
                            
                            <a href={p.link} target="_blank" rel="noopener noreferrer" className="mt-6 w-full flex items-center justify-center gap-2 bg-slate-700/50 hover:bg-slate-700 text-white font-medium py-2.5 rounded-xl transition-colors text-sm">
                              <ShoppingCart className="w-4 h-4"/> Xem trên Shopee
                            </a>
                          </div>
                        );
                    })}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-500 min-h-[300px]">
                    <Scale className="w-16 h-16 mb-4 opacity-20" />
                    <p>Chưa có sản phẩm nào được chọn.</p>
                  </div>
                )}

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
