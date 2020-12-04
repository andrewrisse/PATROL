import React, { useContext, useEffect, useRef, useState } from "react";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import LocationContext from "../Context/LocationContext";
import UserContext from "../Context/UserContext";


const GooglePlacesInput = (props) => {
  const ref = useRef();
  const { user } = useContext(UserContext);
  const [placeholderLocation, setPlaceholderLocation] = useState(
    props.useDefaultLocation
      ? user.defaultLocation
        ? user.defaultLocation.description
        : "Search"
      : currentSearchLocation
      ? currentSearchLocation.description
      : "Search"
  );
  const { currentSearchLocation, setCurrentSearchLocation } = useContext(
    LocationContext
  );

  useEffect(() => {
    if (props.useDefaultLocation) {
      setPlaceholderLocation(user.defaultLocation.description);
    } else {
      if (currentSearchLocation) {
        setPlaceholderLocation(currentSearchLocation.description);
      }
    }
  }, [user.defaultLocation, currentSearchLocation]);


  return (
    <GooglePlacesAutocomplete
      ref={ref}
      placeholder={placeholderLocation}
      currentLocation={true}
      styles={{
        textInput: { marginLeft: 30, marginRight: 30, marginBottom: 30 },
      }}
      fetchDetails={true}
      onPress={(data, details = null) => {
        // 'details' is provided when fetchDetails = true
        setCurrentSearchLocation({ ...data, ...details });
        props.setter && props.setter({ ...data, ...details });
        ref.current.clear()
      }}
      query={{
        key: '[GOOGLE API KEY HERE]',
        language: "en",
      }}
    />
  );
};

export default GooglePlacesInput;
