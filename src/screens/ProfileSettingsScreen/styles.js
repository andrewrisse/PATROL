import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 20,
        alignItems: "center",
    },
    input: {
        height: 48,
        borderRadius: 5,
        overflow: "hidden",
        backgroundColor: "white",
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 30,
        marginRight: 30,
        paddingLeft: 16,
    },
    button: {
        backgroundColor: '#788eec',
        marginLeft: 30,
        marginRight: 30,
        marginTop: 20,
        paddingLeft: 10,
        paddingRight: 10,
        height: 48,
        borderRadius: 5,
        alignItems: "center",
        justifyContent: 'center'
    },
    buttonTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: "bold"
    },
    title: {
        marginBottom: 30,
        fontWeight: "bold"
    },
    subHeader: {
        marginBottom: 10,
        marginLeft: 30,
        fontWeight: "bold"
    },
    marginBottom: {
        marginBottom: 20,
    }
});
