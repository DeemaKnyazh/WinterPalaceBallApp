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
        height: 60
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
        margin: 25,
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
        height: "45%"
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
    textEntry10: {
        fontSize: 15,
        fontWeight: 'bold',
        width: '10%',
        textAlign: "center"
    },
    textEntry15: {
        fontSize: 15,
        fontWeight: 'bold',
        width: '15%',
        textAlign: "center"
    },
    textEntry20: {
        fontSize: 15,
        fontWeight: 'bold',
        width: '20%',
        textAlign: "center"
    },
    textEntry40: {
        fontSize: 15,
        fontWeight: 'bold',
        width: '40%',
        textAlign: 'left',
        marginLeft: 5
    },
    textEntry50: {
        fontSize: 15,
        fontWeight: 'bold',
        width: '50%',
        textAlign: 'left',
        marginLeft: 5
    },
    textEntry60: {
        fontSize: 15,
        fontWeight: 'bold',
        width: '60%',
        textAlign: 'left',
        marginLeft: 5
    },
    modalName: {
        fontSize: 25,
        fontWeight: 'bold',
        textDecorationLine: 'underline',
        paddingTop: 0,
        paddingBottom: 5
    },
    modalText: {
        fontSize: 20,
        paddingVertical: 7,
        paddingHorizontal: 30,
    },
    textEntryModal: {
        fontSize: 20,
        textDecorationLine: 'underline'
    },
    buttonClose: {
        backgroundColor: '#2196F3',
        marginTop: 20
    },
    button: {
        borderRadius: 8,
        margin: 10,
        padding: 10,
        elevation: 2,
        width: "30%",
        marginTop: "10%",
    },
    containerText: {
        width: "100%",
    },
    barcodebox: {
        alignItems: 'center',
        justifyContent: 'center',
        height: '50%',
        width: 'auto',
        overflow: 'hidden'
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
        paddingTop: 5,
        height: "4%"
    },
    home: {
        marginTop: "10%",
        marginBottom: "10%",
    },
    scannerView: {
        margin: 25,
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
        height: "45%"
    },

});

export default styles;
