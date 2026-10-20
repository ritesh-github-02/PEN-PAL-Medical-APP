"use client";

import React, { useState } from "react";
import Slide14MedicalCareScreen from "@/components/questionnaire/Slide14MedicalCareScreen";

export default function Slide14PreviewPage() {
  const [selected, setSelected] = useState<string | undefined>("Yes");
  const [location, setLocation] = useState<string | undefined>("Urgent care");

  return (
    <div className="intervention-frame-outer w-full relative z-10 flex flex-col items-center justify-center my-auto max-w-[420px] md:max-w-[1000px]">
      <div className="tablet-mockup-frame relative bg-[#f4f8ec] p-0 rounded-2xl md:rounded-[2rem] border-0 shadow-md md:shadow-lg flex flex-col mx-auto w-full overflow-hidden">
        <Slide14MedicalCareScreen
          isSpanish={false}
          selected={selected}
          locationSelected={location}
          onSelect={(val: string) => setSelected(val)}
          onLocationSelect={(loc: string) => setLocation(loc)}
          onNext={() => {}}
          onBack={() => {}}
        />
      </div>
    </div>
  );
}
