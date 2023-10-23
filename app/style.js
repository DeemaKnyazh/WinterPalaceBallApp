import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        height: 'auto',
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        width: "100%"
    },
    row: (sign) => ({
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'stretch',
        justifyContent: 'space-between',
        backgroundColor: sign === 1 ? "#beffbd" : "#ffbdbd",
        borderBottomWidth: 1,
        borderBottomColor: '#d1d1d1',
        height: 50
    }),
    rowEntry: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'stretch',
        justifyContent: 'space-between',
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    textEntry: {
        fontSize: 15,
        fontWeight: 'bold'
    },
    textEntry15: {
        fontSize: 15,
        fontWeight: 'bold',
        width: '15%',
        textAlign: "center"
    },
    textEntry30: {
        fontSize: 15,
        fontWeight: 'bold',
        width: '30%',
        textAlign: "center"
    },
    textEntry55: {
        fontSize: 15,
        fontWeight: 'bold',
        width: '55%',
        textAlign: "center"
    },
    textEntryModal: {
        fontSize: 20,
        textDecorationLine: 'underline'
    },
    buttonClose: {
        backgroundColor: '#2196F3',
    },
    button: {
        borderRadius: 8,
        margin: 5,
        padding: 5,
        elevation: 2,
    },
    containerText: {
        width: "100%",
    },
    barcodebox: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 300,
        width: 'auto',
        overflow: 'hidden',
        borderRadius: 30,
    },
    tab: (activeJobType, item) => ({
        paddingVertical: 12 / 2,
        paddingHorizontal: 12,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: activeJobType === item ? 'green' : "gray",
    }),
    tabText: (activeJobType, item) => ({
        color: activeJobType === item ? 'green' : 'gray',
    }),
    title: {
        fontSize: 20,
        textDecorationLine: 'underline'
    },
    scroll: {
        paddingVertical: 10,
    },
    rowEntryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'stretch',
        justifyContent: 'space-between',
        borderTopColor: '#d1d1d1',
        borderTopWidth: 1,
        paddingTop: 5
    },

});

export default styles;
