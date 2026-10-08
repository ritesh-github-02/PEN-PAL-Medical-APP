"use client";

import React from "react";

export interface NurseAnnaProps {
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  className?: string;
  imgClassName?: string;
  isDecorative?: boolean; // When true, screen readers silently ignore the image
  locale?: string;
}

export const NurseAnna: React.FC<NurseAnnaProps> = ({ 
  size = "md", 
  className = "", 
  imgClassName = "",
  isDecorative = true, // Default to true on all subsequent slides
  locale = "en",
}) => {
  // Matches original responsive sizing for the official illustration with high-DPI clarity
  const sizeClasses = {
    sm: "w-16 sm:w-20 max-h-[140px]",
    md: "w-20 sm:w-24 md:w-28 max-h-[190px]",
    lg: "w-24 sm:w-28 md:w-32 lg:w-36 max-h-[240px]",
    xl: "w-32 sm:w-40 md:w-48 lg:w-56 max-h-[320px] sm:max-h-[360px]",
    hero: "w-44 sm:w-56 md:w-64 lg:w-72 max-h-[380px] sm:max-h-[440px]",
  }[size];

  const altText = locale === "es"
    ? "Ilustración de la enfermera Anna sonriendo"
    : "Illustration of Nurse Anna smiling in blue scrubs";

  return (
    <div 
      className={`flex flex-shrink-0 self-center my-auto p-1 select-none ${className}`}
      aria-hidden={isDecorative ? "true" : undefined}
    >
      {/* Official Nurse Anna PNG Artwork with optimized subpixel contrast rendering */}
      <img
        src="/images/nurse-anna.png"
        alt={isDecorative ? "" : altText}
        role={isDecorative ? "presentation" : "img"}
        aria-hidden={isDecorative ? "true" : undefined}
        aria-label={isDecorative ? undefined : altText}
        style={{
          imageRendering: "-webkit-optimize-contrast",
        }}
        className={`${imgClassName || sizeClasses} h-auto object-contain drop-shadow-xs pointer-events-none`}
      />
    </div>
  );
};

export default NurseAnna;
