import React, { useContext, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import styles from "./styles";
import { firebase } from "../../firebase/config";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import GooglePlacesInput from "../../utils/GooglePlacesInput";
import UserContext from "../../Context/UserContext";
import LocationContext from "../../Context/LocationContext";

export default function ProfileSettingsScreen(props) {
  const { user } = useContext(UserContext);
  const { setCurrentSearchLocation } = useContext(LocationContext);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const resetPasswords = () => {
    setNewPassword("");
    setConfirmPassword("");
  };

  const setDefaultLocationInFirebase = (locationData) => {
    firebase
      .firestore()
      .collection("users")
      .doc(user.id)
      .set({ defaultLocation: locationData }, { merge: true })
      .then(() => {
        alert("Updated default location.");
      })
      .catch((error) => {
        alert(error);
      });
  };

  const onResetPress = () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    firebase
      .auth()
      .currentUser.updatePassword(newPassword)
      .then(() => {
        alert("Password updated.");
        resetPasswords();
      })
      .catch((error) => {
        alert("Error updating password");
        resetPasswords();
      });
  };

  const onLogoutPress = () => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        props.navigation.navigate("Login");
      })

      .catch((error) => {
        alert(error);
      });
  };

  const onDeletePress = () => {
    firebase
      .auth()
      .currentUser.delete()
      .then(() => {
        props.navigation.navigate("Login");
      })
      .catch((err) => {
        Alert.alert("Error deleting account, please contact support");
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Settings</Text>
      <KeyboardAwareScrollView
        style={{ flex: 1, width: "100%" }}
        keyboardShouldPersistTaps="always"
      >
        <Text style={styles.subHeader}>My Default Location</Text>
        <GooglePlacesInput
          setter={setDefaultLocationInFirebase}
          useDefaultLocation={true}
        />

        <Text style={styles.subHeader}>Reset Password</Text>
        <TextInput
          style={styles.input}
          placeholderTextColor={"black"}
          secureTextEntry
          placeholder="New Password"
          onChangeText={(text) => setNewPassword(text)}
          value={newPassword}
          underlineColorAndroid={"transparent"}
          autoCapitalize={"none"}
        />
        <TextInput
          style={styles.input}
          placeholderTextColor={"black"}
          secureTextEntry
          placeholder="Confirm New Password"
          onChangeText={(text) => setConfirmPassword(text)}
          value={confirmPassword}
          underlineColorAndroid={"transparent"}
          autoCapitalize={"none"}
        />
        <TouchableOpacity
          style={[styles.button, styles.marginBottom]}
          onPress={onResetPress}
        >
          <Text style={styles.buttonTitle}>Reset Password</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "red" }]}
          onPress={onLogoutPress}
        >
          <Text style={styles.buttonTitle}>Log out</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "red", marginTop: 80 }]}
          onPress={onDeletePress}
        >
          <Text style={styles.buttonTitle}>Delete Account</Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </View>
  );
}
