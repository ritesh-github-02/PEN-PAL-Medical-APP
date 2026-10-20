"use client";

import React, { useState } from "react";
import Slide2MedicineNamingScreen from "@/components/questionnaire/Slide2MedicineNamingScreen";

export default function Slide2PreviewPage() {
  const [selected, setSelected] = useState<string | undefined>("Pink medicine");

  return (
    <div className="w-full h-[100dvh]">
      <Slide2MedicineNamingScreen
        isSpanish={false}
        selected={selected}
        onSelect={(v: string) => setSelected(v)}
        onNext={() => {}}
        onBack={() => {}}
      />
    </div>
  );
}
