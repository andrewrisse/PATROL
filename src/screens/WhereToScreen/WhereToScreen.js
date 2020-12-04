import React, { useContext, useEffect, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import GooglePlacesInput from "../../utils/GooglePlacesInput";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import styles from "./styles";
import UserContext from "../../Context/UserContext";
import { firebase } from "../../firebase/config";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import moment from "moment";
import LocationContext from "../../Context/LocationContext";
import * as Linking from "expo-linking";

const WhereToScreen = () => {
  const { user, setUser } = useContext(UserContext);
  const { currentSearchLocation, setCurrentSearchLocation } = useContext(
    LocationContext
  );

  const [positiveReports, setPositiveReports] = useState([]);
  const [visitedReports, setVisitedReports] = useState([]);
  const [region, setRegion] = useState({
    latitude: user.defaultLocation
      ? user.defaultLocation.geometry.location.lat
      : 0,
    longitude: user.defaultLocation
      ? user.defaultLocation.geometry.location.lng
      : 0,
    latitudeDelta: 0.04,
    longitudeDelta: 0.05,
  });
  const [loadingPositiveReports, setLoadingPositiveReports] = useState(true);
  const [loadingVisitedReports, setLoadingVisitedReports] = useState(true);

  const handleSetSearchLocation = (locationData) => {
    setCurrentSearchLocation(locationData);
    setRegion({
      latitude: locationData.geometry.location.lat,
      longitude: locationData.geometry.location.lng,
      latitudeDelta: 0.04,
      longitudeDelta: 0.05,
    });
  };

  useEffect(() => {
    if(currentSearchLocation){
      setRegion({
        ...region,
        latitude: currentSearchLocation.geometry.location.lat,
        longitude: currentSearchLocation.geometry.location.lng,
      })
    }

  }, [currentSearchLocation])

  const handlePress = async (url) => {
    Linking.openURL(url);
  };

  const twoWeeksAgo = moment().subtract(14, "days").startOf("day").unix();

  const getPositiveReports = () => {
    setLoadingPositiveReports(true);
    const reportArr = [];
    firebase
      .firestore()
      .collection("reports")
      .get()
      .then((snap) => {
        snap.forEach((report) => {
          const data = report.data();
          if (data.timestamp >= twoWeeksAgo) {
            reportArr.push(report.data());
          }
        });
        setPositiveReports(reportArr);
        setLoadingPositiveReports(false);
      });
  };

  const getVisitedReports = () => {
    setLoadingVisitedReports(true);
    const reportArr = [];
    firebase
      .firestore()
      .collection("users")
      .doc(user.id)
      .get()
      .then((snap) => {
        if (snap.exists) {
          const reports = snap.data().reports;
          if (reports) {
            reports.forEach((report) => {
              if (report.timestamp >= twoWeeksAgo) {
                reportArr.push(report);
              }
            });
            setVisitedReports(reportArr);
            setLoadingVisitedReports(false);
          }
        }
      })
      .catch(() => {
        alert("Error getting visited report locations");
      });
  };

  const refreshReports = () => {
    getVisitedReports();
    getPositiveReports();
  };

  useEffect(() => {
    getPositiveReports();
    getVisitedReports();
  }, []);

  return (
    <View style={styles.container}>
      <Text className={styles.title}>Where to?</Text>
      <KeyboardAwareScrollView
        style={{ flex: 1, width: "100%" }}
        keyboardShouldPersistTaps="always"
      >
        <GooglePlacesInput setter={handleSetSearchLocation} placeholderLocation={currentSearchLocation && currentSearchLocation.description}/>
        {user.defaultLocation && (
          <MapView style={{ width: "100%", height: 350 }} region={region}>
            {!loadingVisitedReports &&
              visitedReports.map((report, index) => (
                <Marker key={index} coordinate={report.location}>
                  <MaterialCommunityIcons
                    name={"map-marker-radius"}
                    size={25}
                  />
                </Marker>
              ))}
            {!loadingPositiveReports &&
              positiveReports.map((report, index) => (
                <Marker key={index} coordinate={report.location}>
                  <Image
                    source={require("../../../assets/smallVirus.png")}
                    style={{ width: 25, height: 25 }}
                    resizeMode={"contain"}
                  />
                </Marker>
              ))}
          </MapView>
        )}
        {currentSearchLocation && currentSearchLocation.url && (
          <TouchableOpacity
            style={styles.button}
            onPress={() => handlePress(currentSearchLocation.url)}
          >
            <Text style={styles.buttonTitle}>Click to View on Google</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.button} onPress={refreshReports}>
          <Text style={styles.buttonTitle}>Refresh</Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default WhereToScreen;
