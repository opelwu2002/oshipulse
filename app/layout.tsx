import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import SupportDonateModal from "@/components/SupportDonateModal";
import ShareModal from "@/components/ShareModal";
import MascotWidget from "@/components/MascotWidget";
import PersonalityQuizModal from "@/components/PersonalityQuizModal";
import AIAssistantWidget from "@/components/AIAssistantWidget";

export const metadata: Metadata = {
  title: "OshiPulse (推しパルス) | 跨國偶像應援聲量競技平台",
  description:
    "宇沛實業 (UPAY Corp.) 打造！跨越美、日、中、台、韓五國應援文化，記錄每一次下剋上逆轉奇蹟，最公平透明的跨界偶像聲量擂台。",
  keywords: [
    "偶像應援",
    "推活",
    "OshiPulse",
    "推しパルス",
    "星街彗星",
    "周杰倫",
    "NewJeans",
    "五條悟",
    "芙莉蓮",
    "催眠麥克風",
    "聲量榜",
    "宇沛實業",
  ],
  authors: [{ name: "宇沛實業股份有限公司 (UPAY Corp.)" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className="scroll-smooth bg-white">
      <body className="min-h-screen flex flex-col bg-white text-slate-900 font-sans antialiased selection:bg-rose-100 selection:text-rose-900">
        <Navbar />
        <main className="flex-1 w-full bg-white">{children}</main>
        <Footer />
        <MobileNav />
        <CartDrawer />
        <SupportDonateModal />
        <ShareModal />
        <MascotWidget />
        <PersonalityQuizModal />
        <AIAssistantWidget />
      </body>
    </html>
  );
}
