import React from "react";

type Step = { id: number; title: string; description: string };

export default function Stepper({ steps, currentStep }: { steps: Step[]; currentStep: number }) {
  return (
    <div className="flex items-center justify-center lg:justify-between">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div
            className={`flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-full 
              ${currentStep > index + 1 ? 'bg-[#BB7333] text-white' :
                currentStep === index + 1 ? 'bg-[#BB7333] text-white' :
                'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400'}`}
          >
            {step.id}
          </div>
          {index < steps.length - 1 && (
            <div className={` w-4 md:w-10 lg:w-14 h-1 mx-2 lg:mx-2 ${currentStep > index + 1 ? 'bg-[#BB7333]' : 'bg-zinc-200 dark:bg-zinc-700'}`} />
          )}
        </div>
      ))}
    </div>
  );
}
