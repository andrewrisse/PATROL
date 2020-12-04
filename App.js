import "react-native-gesture-handler";
import React, { useEffect, useState } from "react";
import { firebase } from "./src/firebase/config";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  LoginScreen,
  NewsScreen,
  ProfileSettingsScreen,
  RegistrationScreen,
  ReportScreen,
  WhereToScreen,
} from "./src/screens";
import { decode, encode } from "base-64";
import { createStackNavigator } from "@react-navigation/stack";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { UserProvider } from "./src/Context/UserContext";
import TrendsScreen from "./src/screens/TrendsScreen/TrendsScreen";
import { LocationProvider } from "./src/Context/LocationContext";

if (!global.btoa) {
  global.btoa = encode;
}
if (!global.atob) {
  global.atob = decode;
}
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState();
  const loggedInUser = { user, setUser };
  const [currentSearchLocation, setCurrentSearchLocation] = useState();
  const locationValue = { currentSearchLocation, setCurrentSearchLocation };

  useEffect(() => {
    let userDataListener;
    const usersRef = firebase.firestore().collection("users");
    const authListener = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        usersRef
          .doc(user.uid)
          .get()
          .then((document) => {
            const userData = document.data();
            setLoading(false);
            setUser({ ...userData });
            setCurrentSearchLocation(userData.defaultLocation);

            if (user && user.uid) {
              userDataListener = firebase
                .firestore()
                .collection("users")
                .doc(user.uid)
                .onSnapshot((snap) => {
                  if (snap.exists) {
                    console.log("here");
                    setUser({ ...snap.data() });
                  }
                });
            }
          })
          .catch((error) => {
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });

    return function cleanup() {
      authListener();
      userDataListener();
    };
  }, []);

  if (loading) {
    return <></>;
  }

  function TabStack(props) {
    return (
      <Tab.Navigator
        initialRouteName={"WhereTo"}
        tabBarOptions={{
          showLabel: false,
          activeTintColor: "#ffffff",
          inactiveTintColor: "#cdcdcd",
          style: {
            backgroundColor: "#ec8f2b",
          },
          labelStyle: { textAlign: "center", fontSize: 15 },
          indicatorStyle: {
            borderBottomColor: "#87B56A",
            borderBottomWidth: 2,
          },
        }}
      >
        <Tab.Screen
          name={"WhereTo"}
          children={() => <WhereToScreen {...props} />}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name={"map-search"}
                color={color}
                size={size}
              />
            ),
          }}
        />
        <Tab.Screen
          name={"Trends"}
          children={() => <TrendsScreen {...props} />}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name={"chart-areaspline"}
                color={color}
                size={size}
              />
            ),
          }}
        />
        <Tab.Screen
          name={"Report"}
          children={() => <ReportScreen {...props} />}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name={"map-marker-radius"}
                color={color}
                size={size}
              />
            ),
          }}
        />
        <Tab.Screen
          name={"News"}
          children={() => <NewsScreen {...props} />}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name={"newspaper"}
                color={color}
                size={size}
              />
            ),
          }}
        />
        <Tab.Screen
          name={"ProfileSettings"}
          children={() => <ProfileSettingsScreen {...props} />}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name={"settings"}
                color={color}
                size={size}
              />
            ),
          }}
        />
      </Tab.Navigator>
    );
  }

  return (
    <UserProvider value={loggedInUser}>
      <NavigationContainer>
        <LocationProvider value={locationValue}>
          <Stack.Navigator initialRouteName={user ? "Home" : "Login"}>
            <Stack.Screen name={"Home"}>
              {(props) => TabStack(props)}
            </Stack.Screen>

            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Registration" component={RegistrationScreen} />
          </Stack.Navigator>
        </LocationProvider>
      </NavigationContainer>
    </UserProvider>
  );
}
