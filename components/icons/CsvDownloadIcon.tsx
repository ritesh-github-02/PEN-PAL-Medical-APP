import React from 'react';

export function CsvDownloadIcon({ 
  className = 'w-4 h-4', 
  color = '#128a96',
  ...props 
}: React.SVGProps<SVGSVGElement> & { color?: string }) {
  return (
    <svg
      viewBox="0 0 100 115"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 ${className}`}
      {...props}
    >
      {/* Teal Document Shape with Chamfered Top-Right Corner */}
      <path
        d="M 18 0 L 70 0 L 100 30 L 100 97 C 100 106.4 92.4 114 83 114 L 17 114 C 7.6 114 0 106.4 0 97 L 0 17 C 0 7.6 7.6 0 17 0 Z"
        fill={color}
      />
      {/* Corner fold subtle accent */}
      <path
        d="M 70 0 L 70 22 C 70 26.4 73.6 30 78 30 L 100 30 Z"
        fill="#ffffff"
        fillOpacity="0.25"
      />
      {/* Bold CSV Text */}
      <text
        x="50"
        y="58"
        textAnchor="middle"
        fill="#ffffff"
        fontSize="32"
        fontWeight="900"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="1"
      >
        CSV
      </text>
      {/* Bold Downward Arrow */}
      <path
        d="M 50 96 L 31 75 L 43 75 L 43 63 L 57 63 L 57 75 L 69 75 Z"
        fill="#ffffff"
      />
    </svg>
  );
}

export default CsvDownloadIcon;
