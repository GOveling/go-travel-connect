
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const RecentBookingsSection = () => {
  const recentBookings = [
    {
      type: "Flight",
      details: "NYC → Paris",
      date: "Dec 15, 2024",
      status: "Confirmed",
      amount: "$542"
    },
    {
      type: "Hotel",
      details: "Hotel Le Marais",
      date: "Dec 15-20, 2024",
      status: "Confirmed",
      amount: "$890"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Bookings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentBookings.map((booking, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {booking.type}
                </span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  {booking.status}
                </span>
              </div>
              <p className="font-medium text-sm">{booking.details}</p>
              <p className="text-xs text-gray-600">{booking.date}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-green-600">{booking.amount}</p>
              <Button size="sm" variant="ghost" className="text-xs mt-1">
                View Details
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default RecentBookingsSection;
