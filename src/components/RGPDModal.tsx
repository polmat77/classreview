import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";

const STORAGE_KEY = "rgpdModalSeen";

export function RGPDModal() {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const hasSeenModal = localStorage.getItem(STORAGE_KEY);
    
    if (!hasSeenModal) {
      // Show modal after 1 second
      const timer = setTimeout(() => {
        setIsVisible(true);
        // Trigger animation after a small delay
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsAnimating(false);
    setTimeout(() => setIsVisible(false), 300);
  };

  const handleLearnMore = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    // Navigation will happen via Link
  };

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isVisible) {
        handleAccept();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-opacity duration-300 ${
        isAnimating ? "opacity-100" : "opacity-0"
      }`}
      style={{ backgroundColor: "rgba(26, 35, 50, 0.85)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="rgpd-modal-title"
      aria-describedby="rgpd-modal-description"
    >
      <div
        className={`bg-white max-w-[500px] w-full rounded-xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-all duration-200 ${
          isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        style={{ transitionDelay: isAnimating ? "100ms" : "0ms" }}
      >
        {/* Lock Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
            <Lock className="w-6 h-6 text-[#f0a830]" />
          </div>
        </div>

        {/* Title */}
        <h2
          id="rgpd-modal-title"
          className="text-xl font-semibold text-[#2c3e50] text-center mb-4"
        >
          Respect de vos données
        </h2>

        {/* Description */}
        <p
          id="rgpd-modal-description"
          className="text-[#2c3e50] text-center leading-relaxed mb-8"
        >
          AIProject4You traite vos données localement dans votre navigateur. 
          Aucune information personnelle d'élèves n'est envoyée à nos serveurs. 
          Vos données restent sous votre contrôle.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleAccept}
            className="w-full sm:w-auto px-8 py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(135deg, #f0a830, #f5c563)",
            }}
          >
            J'ai compris
          </button>
          <Link
            to="/confidentialite"
            onClick={handleLearnMore}
            className="text-[#7dd3e8] hover:text-[#f0a830] transition-colors duration-300 text-sm"
          >
            En savoir plus
          </Link>
        </div>
      </div>
    </div>
  );
}
