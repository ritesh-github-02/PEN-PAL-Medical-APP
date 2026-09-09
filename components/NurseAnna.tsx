"use client";

import React from "react";

export interface NurseAnnaProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  isDecorative?: boolean; // When true, screen readers ignore the image
  locale?: string;
}

export const NurseAnna: React.FC<NurseAnnaProps> = ({
  size = "md",
  className = "",
  isDecorative = true, // Default to true (decorative)
  locale = "en",
}) => {
  const sizeClasses = {
    sm: "w-16 sm:w-20 md:w-24 max-h-[140px] sm:max-h-[170px] md:max-h-[190px]",
    md: "w-20 sm:w-24 md:w-28 lg:w-32 max-h-[170px] sm:max-h-[210px] md:max-h-[240px]",
    lg: "w-24 sm:w-28 md:w-32 lg:w-36 max-h-[200px] sm:max-h-[250px] md:max-h-[290px]",
  }[size];

  const altText = locale === "es"
    ? "Ilustración de la enfermera Anna sonriendo"
    : "Illustration of Nurse Anna smiling in blue scrubs";

  return (
    <div
      className={`flex flex-shrink-0 relative items-center justify-center p-1 select-none ${className}`}
      aria-hidden={isDecorative ? "true" : undefined}
    >
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
