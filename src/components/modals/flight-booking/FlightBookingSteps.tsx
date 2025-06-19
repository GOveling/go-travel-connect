
import { Check } from "lucide-react";

interface Step {
  number: number;
  title: string;
  icon: any;
}

interface FlightBookingStepsProps {
  steps: Step[];
  activeStep: number;
}

const FlightBookingSteps = ({ steps, activeStep }: FlightBookingStepsProps) => {
  return (
    <div className="bg-gradient-to-r from-purple-50 to-orange-50 rounded-xl p-4 border border-purple-200">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = activeStep === step.number;
          const isCompleted = activeStep > step.number;
          
          return (
            <div key={step.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg' 
                    : isActive 
                      ? 'bg-gradient-to-r from-purple-500 to-orange-500 text-white shadow-lg scale-110' 
                      : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                }`}>
                  {isCompleted ? (
                    <Check size={16} />
                  ) : (
                    <Icon size={16} />
                  )}
                </div>
                <span className={`text-xs font-medium mt-2 transition-colors ${
                  isActive || isCompleted ? 'text-purple-700' : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-2 transition-colors ${
                  isCompleted ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FlightBookingSteps;
