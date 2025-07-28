const TripComWidget = () => {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-foreground">Buscar Vuelos</h3>
      <div className="w-full flex justify-center">
        <iframe 
          src="https://www.trip.com/partners/ad/S4621472?Allianceid=6829152&SID=242267565&trip_sub1=" 
          className="border-0"
          style={{ width: "320px", height: "480px" }}
          title="Trip.com Flight Search"
          scrolling="no"
        />
      </div>
    </div>
  );
};

export default TripComWidget;