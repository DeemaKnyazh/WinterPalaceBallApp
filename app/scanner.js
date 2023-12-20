import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Button, Modal, TouchableHighlight, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { useState, useEffect } from 'react';
import { BarCodeScanner } from 'expo-barcode-scanner';
import styles from './style';
import { Stack, useRouter } from "expo-router";
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';


export default function Scanner() {
    const navigation = useRouter();
    const db = SQLite.openDatabase('WPB.db');
    const [isLoading, setIsLoading] = useState(false);
    const [names, setNames] = useState([]);
    const [scanned, setScanned] = useState(false);
    const [hasPermission, setHasPermission] = useState('granted');
    const [modalVisible, setModalVisible] = useState(false);
    const [modalPerson, setModalPerson] = useState([]);

    useEffect(() => {
        db.transaction(tx => {
            //tx.executeSql('DELETE TABLE names')
            tx.executeSql('CREATE TABLE IF NOT EXISTS names (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, tables INTEGER, sign INTEGER DEFAULT 0, ticket TEXT)')
        });

        db.transaction(tx => {
            tx.executeSql('SELECT * FROM names', null,
                (txObj, resultSet) => setNames(resultSet.rows._array),
                (txObj, error) => console.log(error))
        });
        setIsLoading(false);
    }, [])

    const jobTypes = ["None", 1, 2, 3, 4, 5, 6, 7, 8, 9]
    const statusTypes = ["None", "Here", "Not Here"]

    const askForCameraPermission = () => {
        (async () => {
            const { status } = await BarCodeScanner.requestPermissionsAsync();
            setHasPermission(status === 'granted');
        })()
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
            onHide: setScanned(false)
        });
    }

    // What happens when we scan the bar code
    const handleBarCodeScanned = ({ type, data }) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
        setScanned(true);
        findName(data);
    };

    // Check permissions and return the screens
    if (hasPermission === null) {
        return (
            <View style={styles.container}>
                <Text>Requesting for camera permission</Text>
            </View>)
    }
    if (hasPermission === false) {
        return (
            <View style={styles.container}>
                <Text style={{ margin: 10 }}>No access to camera</Text>
                <Button title={'Allow Camera'} onPress={() => askForCameraPermission()} />
            </View>)
    }

    if (isLoading) {
        return (
            <View style={styles.container}>
                <Text>Loading names</Text>
            </View>
        );
    }

    const findName = (test) => {
        let existingNames
        for (i = 0; i < names.length; i++) {
            if (names[i].ticket == test)
                existingNames = i;
        }
        if(names[existingNames].sign == 1){
            showUsedToast(names[existingNames].name)
        }
        else{
            openSettingsModal(names[existingNames]);
        }
    };

    const switchStatuss = (id, status) => {
        db.transaction(tx => {
            tx.executeSql('UPDATE names SET sign = ? WHERE id = ?', [status === 1 ? 0 : 1, id],
                (txObj, resultSet) => {
                    if (resultSet.rowsAffected > 0) {
                        let existingNames = [...names];
                        const indexToUpdate = existingNames.findIndex(name => name.id === id);
                        existingNames[indexToUpdate].sign = status === 1 ? 0 : 1;
                        setNames(existingNames);
                        setModalVisible(!modalVisible)
                        showSuccessInToast(existingNames[indexToUpdate].name);
                    }
                },
                (txObj, error) => console.log(error)
            );
        });
    }

    const openSettingsModal = (title) => {
        setModalPerson(title);
        setModalVisible(!modalVisible);
    }

    return (
        <View style={{ width: "100%"}}>
            <View style={styles.barcodebox}>
                <BarCodeScanner
                    onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                    style={{ height: 750, width: "100%" }} />
            </View>
            {/* <Text style={styles.maintext}>{text}</Text> */}
            {/* {scanned && <Button title={'Scan again?'} onPress={() => setScanned(false)} color='tomato' />} */}
            <StatusBar style='auto' />
            <Modal animationType="fade" transparent={true} visible={modalVisible} useNativeDriver={true} hardwareAccelerated={true} >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalName}>{modalPerson.name}</Text>
                        <Text style={styles.modalText}>Table: {modalPerson.tables}</Text>
                        <Text style={styles.modalText}>Status: {modalPerson.sign == 1 ? "Here" : "Not Here"} </Text>
                        <Text style={styles.modalText}>ID: {modalPerson.ticket} </Text>
                        <Button title={modalPerson.sign == 1 ? "Sign Out" : "Sign In"} onPress={() => { switchStatuss(modalPerson.id, modalPerson.sign)}} />
                        <TouchableHighlight
                            style={[styles.button, styles.buttonClose]}
                            onPress={() => { setModalVisible(!modalVisible); setScanned(false) }}>
                            <Text style={styles.textStyle}>Hide Modal</Text>
                        </TouchableHighlight>
                    </View>
                </View>
            </Modal>
            <Toast />
        </View>
    );
}