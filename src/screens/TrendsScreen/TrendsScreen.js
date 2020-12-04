import React, { useContext, useEffect, useState } from "react";
import moment from "moment";
import { Text, View } from "react-native";
import axios from "axios";
import { BarChart, LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import styles from "./styles";
import LocationContext from "../../Context/LocationContext";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { ActivityIndicator } from "react-native";

const TrendData = (props) => {
  const { currentSearchLocation } = useContext(
    LocationContext
  );

  const [dateLabels, setDateLabels] = useState([]);
  const [globalNewData, setGlobalNewData] = useState({});
  const [fetchedLocationData, setFetchedLocationData] = useState({});
  const [globalTotalData, setGlobalTotalData] = useState({});
  const [loading, setLoading] = useState(true);
  const screenWidth = Dimensions.get("window").width - 5;
  const globalNewLabels = ["New Confirmed", "New Deaths", "New Recovered"];
  const globalTotalLabels = [
    "Total Confirmed",
    "Total Deaths",
    "Total Recovered",
  ];

  useEffect(() => {
    setLoading(true);
    if (currentSearchLocation) {
      getLastTwoWeeksData().then(() => {
        getGlobalData().then(() => {
          setLoading(false);
        });
      });
    }
    else{
      alert('Please search for a location on the \'Where To?\' page')
      props.navigation.navigate("WhereTo");
    }
  }, [currentSearchLocation]);


  const getLastTwoWeeksData = async () => {
    let arrOfDates = [];
    for (let i = 1; i <= 13; i++) {
      arrOfDates.push(moment().subtract(i, "days").startOf("day").format("Do"));
    }
    arrOfDates = arrOfDates.reverse();
    setDateLabels(arrOfDates);

    await parseLocationData(currentSearchLocation.address_components);
  };

  const parseLocationData = async (place) => {
    const componentMap = {
      country: "country",
      locality: "locality",
      administrative_area_level_1: "administrative_area_level_1",
    };
    const parsedData = {};
    for (let i = 0; i < place.length; i++) {
      let types = place[i].types; // get types array of each component

      for (let j = 0; j < types.length; j++) {
        // loop through the types array of each component as types is an array and same thing can be indicated by different name.As you can see in the json object above

        let component_type = types[j];

        // check if this type is in your component map.If so that means you want this component

        if (componentMap.hasOwnProperty(component_type)) {
          parsedData[types[j]] = place[i]["long_name"];
        }
      }
    }

    //ex: {"locality":"Colorado Springs","administrative_area_level_1":"Colorado","country":"United States"}
    const getSpecificLocationDataUrl =
      "https://us-central1-patrol-677d2.cloudfunctions.net/getLocationData";
    const config = {
      method: "post",
      url: getSpecificLocationDataUrl,
      headers: {
        "Content-Type": "application/json",
      },
      data: parsedData,
    };
    await axios(config).then((response) => {
      const fetchedCaseTotals = [];
      for (let i = 0; i < response.data.length; i++) {
        fetchedCaseTotals.push(response.data[i]["Cases"]);
      }
      const fetchedLocationDataToSet = {
        labels: dateLabels,
        datasets: [
          {
            data: fetchedCaseTotals,
          },
        ],
      };
      setFetchedLocationData(fetchedLocationDataToSet);
    });
  };

  const getGlobalData = async () => {
    const globalTrendsUrl =
      "https://us-central1-patrol-677d2.cloudfunctions.net/getGlobalTrends";
    return await axios
      .get(globalTrendsUrl)
      .then((response) => {
        const globalNewDataToSet = {
          labels: globalNewLabels,
          datasets: [
            {
              data: [
                response.data["NewConfirmed"],
                response.data["NewDeaths"],
                response.data["NewRecovered"],
              ],
            },
          ],
        };
        const globalTotalDataToSet = {
          labels: globalTotalLabels,
          datasets: [
            {
              data: [
                response.data["TotalConfirmed"],
                response.data["TotalDeaths"],
                response.data["TotalRecovered"],
              ],
            },
          ],
        };

        setGlobalNewData(globalNewDataToSet);
        setGlobalTotalData(globalTotalDataToSet);
        return;
      })
      .catch((err) => {
        console.log("Error getting global trends: " + err.message);
      });
  };

  return (
    <View style={styles.container}>
      {!loading ? (
        <KeyboardAwareScrollView
          style={{ flex: 1, width: "100%" }}
          keyboardShouldPersistTaps="always"
        >
          <>
            <Text style={styles.title}>Trend Data</Text>
            <Text style={styles.subtitle}>Global Trend Data</Text>
            {globalNewData && (
              <BarChart
                data={globalNewData}
                width={screenWidth}
                height={275}
                yAxisInterval={1000}
                verticalLabelRotation={15}
                showValuesOnTopOfBars={true}
                withHorizontalLabels={false}
                chartConfig={{
                  backgroundColor: "#054cb7",
                  backgroundGradientFrom: "#5075ac",
                  backgroundGradientTo: "#2961b3",
                  decimalPlaces: 0,
                  fillShadowGradientOpacity: 0.6,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,

                  useShadowColorFromDataset: false, // optional
                  data: globalNewData.datasets,
                }}
                style={styles.chartStyle}
              />
            )}
            {globalTotalData && (
              <BarChart
                data={globalTotalData}
                width={screenWidth}
                height={275}
                yAxisInterval={10000}
                verticalLabelRotation={15}
                showValuesOnTopOfBars={true}
                withHorizontalLabels={false}
                chartConfig={{
                  backgroundColor: "#054cb7",
                  backgroundGradientFrom: "#5075ac",
                  backgroundGradientTo: "#2961b3",
                  decimalPlaces: 0,
                  fillShadowGradientOpacity: 0.6,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  useShadowColorFromDataset: false, // optional
                  data: globalTotalData.datasets,
                }}
                style={styles.chartStyle}
              />
            )}
            <Text style={styles.subtitle}>
              Search Location Case Totals (last 2 weeks)
            </Text>
            {fetchedLocationData && (
              <LineChart
                data={fetchedLocationData}
                width={screenWidth}
                height={350}
                verticalLabelRotation={45}
                chartConfig={{
                  backgroundColor: "#054cb7",
                  backgroundGradientFrom: "#5075ac",
                  backgroundGradientTo: "#2961b3",
                  decimalPlaces: 0,
                  fillShadowGradientOpacity: 0.6,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  useShadowColorFromDataset: false, // optional
                  data: globalTotalData.datasets,
                }}
                bezier
              />
            )}
          </>
        </KeyboardAwareScrollView>
      ) : (
        <ActivityIndicator size={"large"} color={"#f5ab33"} />
      )}
    </View>
  );
};

export default TrendData;
