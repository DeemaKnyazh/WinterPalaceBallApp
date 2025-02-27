import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Button, Modal, TouchableHighlight, ScrollView, FlatList, TouchableOpacity, Pressable } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { useState, useEffect, useRoute, useContext } from 'react';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import styles from './style';
import { Stack, useRouter } from "expo-router";
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { WebSocketContext } from './WsContext'

let names = [];
let wsClient;

export default function Scanner() {
    const navigation = useRouter();

    const db = SQLite.openDatabaseAsync('WPB.db');
    const [isLoading, setIsLoading] = useState(false);
    const [scanned, setScanned] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalPerson, setModalPerson] = useState([]);

    const [facing, setFacing] = useState("Back");
    const [permission, requestPermission] = useCameraPermissions();

    const url = process.env.apilist
    const url2 = process.env.apisign

    const [subscribe, unsubscribe] = useContext(WebSocketContext)
    useEffect(() => {
        const channelName = "lists"
        subscribe(channelName, (message) => {
            if (message.startsWith("client:")) {
                wsClient = message.replace("client:", "")
            }
            if (message.startsWith("status ")) {
                console.log('testetsets')
                switchStatuss(message.replace("status ", ""), 1, "ext");
            }
        })

        return () => {
            /* unsubscribe from channel during cleanup */
            unsubscribe(channelName)
        }
    }, [subscribe, unsubscribe])

    useEffect(() => {
        fetch(url, {
            method: 'get',
            headers: new Headers({
                'Authorization': process.env.apikey,
            })
        })
            .then((resp) => resp.json())
            .then((json) => names = json)
            .catch((error) => console.error(error))
            .finally(() => setIsLoading(false));
    }, []);

    if (!permission) {
        // Camera permissions are still loading.
        return (
            <View style={styles.container}>
                <Text>Requesting for camera permission</Text>
            </View>)
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet.
        return (
            <View style={styles.container}>
                <Text style={styles.message}>We need your permission to show the camera</Text>
                <Button onPress={requestPermission} title="grant permission" />
            </View>
        );
    }

    function toggleCameraFacing() {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    }

    const showSuccessInToast = (name) => {
        Toast.show({
            type: 'success',    
            text1: name + ' signed in Successfully',
            position: 'top',
            visibilityTime: 50000,
            onHide: setScanned(false)
        });
    }
    const showUsedToast = (name) => {
        Toast.show({
            type: 'error',
            text1: name + ' already signed in!',
            position: 'top',
            visibilityTime: 5000,
        });
    }

    const showUndeToast = (code) => {
        Toast.show({
            type: 'info',
            text1: code + ' doesnt exist',
            position: 'top',
            visibilityTime: 5000,
            onHide: setScanned(false)
        });
    }

    // What happens when we scan the bar code
    const handleBarCodeScanned = ({ type, data }) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
        setScanned(true);
        findName(data);
    };

    if (isLoading) {
        return (
            <View style={styles.container}>
                <Text>Loading names</Text>
            </View>
        );
    }

    const findName = (test) => {
        let existingNames = [...names];
        let indexToUpdate;
        for (let i = 0; i < existingNames.length; i++) {
            if (existingNames[i].ticket == test)
                indexToUpdate = i;
        }
        if (indexToUpdate == undefined) {
            showUndeToast(test)
        }
        else if (existingNames[indexToUpdate].sign == 1) {
            showUsedToast(existingNames[indexToUpdate].name)
            openSettingsModal(existingNames[indexToUpdate]);
        }
        else {
            openSettingsModal(existingNames[indexToUpdate]);
        }
    };

    function switchStatuss(id, status, src){
        if (src == "ext") {
            let existingNames = [...names];
            const indexToUpdate = existingNames.findIndex(name => name.id == id);
            existingNames[indexToUpdate].sign = existingNames[indexToUpdate].sign === 1 ? 0 : 1;
            names = existingNames
            //TODO fix this, display should update when externally changed
            let tempNames = [...existingNames]
            let testing = tempNames[indexToUpdate]
            if(modalPerson.id == testing.id){
                setModalPerson({"id": testing.id, "name": testing.name, "tables": testing.tables, "sign": testing.sign, "ticket": testing.ticket, "raffle": testing.raffle, "year": testing.year})
            }
        }
        if (src == "int") {
            fetch(url2 + "/" + id, {
                method: 'post',
                headers: new Headers({
                    'Authorization': process.env.apikey,
                    'Client': wsClient,
                })
            })
                .then((responseData) => {
                    let existingNames = [...names];
                    const indexToUpdate = existingNames.findIndex(name => name.id == id);
                    existingNames[indexToUpdate].sign = status === 1 ? 0 : 1;
                    names = existingNames
                    setModalVisible(!modalVisible)
                })
                .catch((error) => console.error(error))
        }
    }

    const openSettingsModal = (title) => {
        setModalPerson(title);
        setModalVisible(!modalVisible);
    }

    return (
        <View style={{ width: "100%" }}>
            <Stack.Screen
                options={{
                    title: 'Scanner',
                    headerStyle: { backgroundColor: "#fff" },
                    headerTintColor: "black",
                    headerTitleStyle: {
                        fontWeight: "bold",
                    },
                }}
            />
            <View style={styles.barcodebox}>
                <CameraView style={{ height: 750, width: '100%' }} facing={facing} barcodeScannerSettings={{ barcodeTypes: ["qr"], }} onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
                            <Text style={styles.text}>Flip Camera</Text>
                        </TouchableOpacity>
                    </View>
                </CameraView>
            </View>
            <View style={styles.scannerView}>
                <Text style={styles.modalName}>Last Scan</Text>
                {console.log(modalPerson)}
                <Text style={styles.modalText}>{modalPerson.name}</Text>
                <Text style={styles.modalText}>Table: {modalPerson.tables}</Text>
                <Text style={styles.modalText}>Status: {modalPerson.sign == 1 ? "Here" : "Not Here"} </Text>
                <Text style={styles.modalText}>ID: {modalPerson.ticket} </Text>
                <Text style={styles.modalText}>Raffle: {modalPerson.raffle} </Text>
            </View>
            {/* <Text style={styles.maintext}>{text}</Text> */}
            {/* {scanned && <Button title={'Scan again?'} onPress={() => setScanned(false)} color='tomato' />} */}
            <StatusBar style='auto' />
            <Modal animationType="fade" transparent={true} visible={modalVisible} useNativeDriver={true} hardwareAccelerated={true} >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalName}>{modalPerson.name}</Text>
                        <TouchableOpacity onPress={() => {
                        }} >
                            <Text style={styles.modalText}>Table: {modalPerson.tables}</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalText}>Status: {modalPerson.sign == 1 ? "Here" : "Not Here"} </Text>
                        <Text style={styles.modalText}>ID: {modalPerson.ticket} </Text>
                        <Text style={styles.modalText}>Raffle: {modalPerson.raffle} </Text>

                        {/* <Button title="Delete" onPress={() => {deleteName(modalPerson.id)}} /> */}

                        <Pressable
                            disabled={modalPerson.sign == 1 ? true : false}
                            style={({pressed}) => [styles.buttonBig, {backgroundColor: pressed ? "black" : "white", opacity: modalPerson.sign == 1 ? 0.3 : 1 }]}
                            onPress={() => {
                                switchStatuss(modalPerson.id, modalPerson.sign, "int");
                                setScanned(false)
                            }}>
                            {({pressed}) => <Text style={[styles.textStyle, { color: pressed ? "white" : "black", fontSize: 20 }]}>{modalPerson.sign == 1 ? "Sign Out" : "Sign In"}</Text>}
                        </Pressable>

                        <Pressable
                            style={({pressed}) => [styles.button, {backgroundColor: pressed ? "black" : "white"}]}
                            onPress={() => { setModalVisible(!modalVisible); setScanned(false) }}>
                            {({pressed}) => <Text style={[styles.textStyle, { color: pressed ? "white" : "black" }]}>Close</Text>}
                        </Pressable>
                    </View>
                </View>
            </Modal>
            <Toast />
        </View>
    );
}