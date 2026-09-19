import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "Keeplay - Diário Cultural, Gamificação & Comunidade",
  description: "Acompanhe séries, filmes, livros e jogos com status específicos, diário de consumo, missões mensais, conquistas secretas, listas personalizadas, feed de amigos e retrospectiva Wrapped no Keeplay.",
};

export const viewport = {
  themeColor: "#080a0f",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={plusJakartaSans.variable}>
      <body>
        <canvas id="confettiCanvas"></canvas>
        <div className="ambient-background">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
        </div>
        {children}
      </body>
    </html>
  );
}
