import { Analytics } from "@vercel/analytics/react";
import SmoothScroll from "./components/effects/SmoothScroll.jsx";
import CustomCursor from "./components/effects/CustomCursor.jsx";
import MacBook from "./components/MacBook/MacBook.jsx";

export default function App() {
  return (
    <SmoothScroll>
      <Analytics />
      <CustomCursor />
      <main className="bg-[#050507] text-[#f0f0f0] selection:bg-violet-600 selection:text-white">
        <MacBook />
      </main>
    </SmoothScroll>
  );
}
