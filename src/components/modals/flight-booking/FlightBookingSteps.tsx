import { LucideIcon } from "lucide-react";

interface Step {
  number: number;
  title: string;
  icon: LucideIcon;
}

interface FlightBookingStepsProps {
  steps: Step[];
  activeStep: number;
}

const FlightBookingSteps = ({ steps, activeStep }: FlightBookingStepsProps) => {
  return (
    <div className="flex justify-between items-center px-4 py-3 bg-gray-50">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              activeStep >= step.number
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            {activeStep > step.number ? "✓" : step.number}
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-8 h-0.5 mx-1 ${
                activeStep > step.number ? "bg-blue-500" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default FlightBookingSteps;
