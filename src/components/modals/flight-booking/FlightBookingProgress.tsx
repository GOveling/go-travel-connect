
interface FlightBookingProgressProps {
  currentStep: 'type' | 'details' | 'summary';
}

const FlightBookingProgress = ({ currentStep }: FlightBookingProgressProps) => {
  const steps = ['type', 'details', 'summary'];

  return (
    <div className="px-4 py-2 bg-gray-50">
      <div className="flex items-center justify-center space-x-2">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center">
            <div className={`w-2 h-2 rounded-full ${
              currentStep === step ? 'bg-blue-500' : 
              steps.indexOf(currentStep) > index ? 'bg-blue-300' : 'bg-gray-300'
            }`} />
            {index < 2 && <div className="w-6 h-px bg-gray-300 mx-1" />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlightBookingProgress;
