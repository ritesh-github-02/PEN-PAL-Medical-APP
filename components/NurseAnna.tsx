"use client";

import React from "react";

export interface NurseAnnaProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  isDecorative?: boolean; // When true, screen readers silently ignore the image
  locale?: string;
}

export const NurseAnna: React.FC<NurseAnnaProps> = ({ 
  size = "md", 
  className = "", 
  isDecorative = true, // Default to true on all subsequent slides
  locale = "en",
}) => {
  // Matches original responsive sizing for the official illustration
  const sizeClasses = {
    sm: "w-16 sm:w-20 max-h-[140px]",
    md: "w-20 sm:w-24 md:w-28 max-h-[190px]",
    lg: "w-24 sm:w-28 md:w-32 lg:w-36 max-h-[240px]",
  }[size];

  const altText = locale === "es"
    ? "Ilustración de la enfermera Anna sonriendo"
    : "Illustration of Nurse Anna smiling in blue scrubs";

  return (
    <div 
      className={`flex flex-shrink-0 self-center my-auto p-1 select-none ${className}`}
      aria-hidden={isDecorative ? "true" : undefined}
    >
      {/* Official Nurse Anna PNG Artwork */}
      <img
        src="/images/nurse-anna.png"
        alt={isDecorative ? "" : altText}
        role={isDecorative ? "presentation" : "img"}
        aria-hidden={isDecorative ? "true" : undefined}
        aria-label={isDecorative ? undefined : altText}
        className={`${sizeClasses} h-auto object-contain filter drop-shadow-md pointer-events-none`}
      />
    </div>
  );
};

export default NurseAnna;
