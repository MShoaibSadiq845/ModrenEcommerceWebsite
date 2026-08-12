import type { Metadata } from "next";
import "./globals.css";
import { ReduxProvider } from "@/store/provider";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "SHOP.CO | E-Commerce Platform & Admin Dashboard",
  description: "Pixel-perfect e-commerce platform with dynamic RTK Query API layer, NestJS backend, MongoDB, and real-time Socket.IO sales alerts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-white text-black min-h-screen">
        <ReduxProvider>
          {children}
          <Toaster position="top-right" reverseOrder={false} />
        </ReduxProvider>
      </body>
    </html>
  );
}
