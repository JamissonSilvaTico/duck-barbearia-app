import React from "react";
import { Link } from "react-router-dom";
import { useSettings } from "../contexts/SettingsContext";
import { WhatsAppIcon } from "../components/icons";

const HomePage: React.FC = () => {
  const { settings } = useSettings();

  // A simple function to lighten the hex color for hover effect
  const lightenColor = (color: string, percent: number) => {
    try {
      let num = parseInt(color.replace("#", ""), 16),
        amt = Math.round(2.55 * percent),
        R = (num >> 16) + amt,
        G = ((num >> 8) & 0x00ff) + amt,
        B = (num & 0x0000ff) + amt;
      return (
        "#" +
        (
          0x1000000 +
          (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
          (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
          (B < 255 ? (B < 1 ? 0 : B) : 255)
        )
          .toString(16)
          .slice(1)
      );
    } catch (e) {
      return color; // Return original color if parsing fails
    }
  };

  const buttonStyle = {
    backgroundColor: settings.buttonColor,
    "--hover-bg-color": lightenColor(settings.buttonColor, 10),
  } as React.CSSProperties;

  return (
    <>
      <div
        className="min-h-screen flex flex-col items-center justify-center text-white p-4 bg-cover bg-center"
        style={{
          backgroundImage: "url(https://picsum.photos/seed/barber/1920/1080)",
        }}
      >
        <div className="absolute inset-0 bg-black opacity-60"></div>
        <div className="relative z-10 text-center flex flex-col items-center">
          {settings.logo ? (
            <img
              src={settings.logo}
              alt="Duck Barbearia Logo"
              className="max-h-32 mb-4"
            />
          ) : (
            <h1
              className="text-6xl md:text-8xl font-bold text-brand-gold mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Duck Barbearia
            </h1>
          )}

          <p className="text-lg md:text-2xl text-brand-light-gray mb-8 max-w-2xl mx-auto">
            {settings.tagline}
          </p>
          <style>
            {`.custom-button:hover { background-color: var(--hover-bg-color) !important; }`}
          </style>
          <Link
            to="/agendar"
            className="custom-button text-brand-dark font-bold py-3 px-8 rounded-lg text-xl transition duration-300 transform hover:scale-105"
            style={buttonStyle}
          >
            Agendar Agora
          </Link>
        </div>
        <div className="absolute bottom-4 text-center text-sm text-brand-gray z-10">
          <Link to="/admin/login" className="hover:text-brand-gold">
            Acesso Administrativo
          </Link>
        </div>
      </div>

      {settings.whatsappNumber && (
        <a
          href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition z-20"
          aria-label="Fale conosco no WhatsApp"
        >
          <WhatsAppIcon className="w-8 h-8" />
        </a>
      )}
    </>
  );
};

export default HomePage;
