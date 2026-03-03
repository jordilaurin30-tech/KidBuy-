import "./globals.css";
import CartProviderShell from "../components/cart/cart-provider-shell";
import TopRightLoginShimmer from "@/app/components/TopRightLoginShimmer";
import TopRightLoginShimmerOnlyHome from "@/app/components/TopRightLoginShimmerOnlyHome";
import KidBuyAssistantOverlay from "@/app/components/KidBuyAssistantOverlay";
import DailyWelcomeAssistant from "@/app/components/DailyWelcomeAssistant";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <TopRightLoginShimmerOnlyHome />
        <CartProviderShell>
          {children}
        </CartProviderShell>

        {/* Global assistant overlay + daily greeting (center screen) */}
        <KidBuyAssistantOverlay />
        <DailyWelcomeAssistant />
      </body>
    </html>
  );
}