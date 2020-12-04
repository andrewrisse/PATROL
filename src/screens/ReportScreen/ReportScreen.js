import React, { useContext, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import styles from "./styles";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import GooglePlacesInput from "../../utils/GooglePlacesInput";
import moment from "moment";
import UserContext from "../../Context/UserContext";
import { Picker } from "react-native";
import { firebase } from "../../firebase/config";
import {Alert} from "react-native";
import LocationContext from "../../Context/LocationContext";

const ReportScreen = () => {
  const {user} = useContext(UserContext);
  const {currentSearchLocation, setCurrentSearchLocation} = useContext(LocationContext);
  const [type, setType] = useState("POSITIVE");

  const handleSendReport = () => {
    if (!currentSearchLocation) {
      Alert.alert("Please select a location first!");
      return;
    }
    const reportLocation = {
      latitude: currentSearchLocation.geometry.location.lat,
      longitude: currentSearchLocation.geometry.location.lng || undefined,
    }
    const report = { location: reportLocation, type: type, timestamp: moment().unix() };
    if (type === "POSITIVE") {
      firebase.firestore().collection("reports").add(report);
    } else {
      firebase
        .firestore()
        .collection("users")
        .doc(user.id)
        .set(
          { reports: firebase.firestore.FieldValue.arrayUnion(report) },
          { merge: true }
        )
          .catch(() => {
            alert('Error sending report')
          });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Report</Text>
      <KeyboardAwareScrollView
        style={{ flex: 1, width: "100%" }}
        keyboardShouldPersistTaps="always"
      >
        <GooglePlacesInput placholderLocation={currentSearchLocation && currentSearchLocation.description}/>
        <Picker
          mode={"dropdown"}
          selectedValue={type}
          onValueChange={(itemValue) => setType(itemValue)}
          prompt={"Type of Report:"}
        >
          <Picker.Item label={"Positive"} value={"POSITIVE"} />
          <Picker.Item label={"Visited"} value={"VISITED"} />
        </Picker>
        <TouchableOpacity style={styles.button} onPress={handleSendReport}>
          <Text style={styles.buttonTitle}>Send Report</Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default ReportScreen;
