import React from "react";

const LocationContext = React.createContext({
    currentSearchLocation: "",
    setCurrentSearchLocation: () => {}
});

export const LocationProvider = LocationContext.Provider;
export const LocationConsumer = LocationContext.Consumer;

export default LocationContext;