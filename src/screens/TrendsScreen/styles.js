import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    paddingTop: 10,
  },
  title: {
    marginBottom: 30,
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    alignItems: "flex-start",
    fontWeight: "bold",
    marginLeft: 5
  },
  chartStyle: {
    marginVertical: 8,
    borderRadius: 16,
    paddingRight: 10,
  },
});
