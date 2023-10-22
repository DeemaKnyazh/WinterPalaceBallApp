import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Button, Modal, TouchableHighlight, ScrollView, FlatList, TouchableOpacity} from 'react-native';
import * as SQLite from 'expo-sqlite';
import { useState, useEffect } from 'react';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Stack, useRouter } from "expo-router";

export default function App() {
    const navigation = useRouter();
    const db = SQLite.openDatabase('WPB.db');
    const [isLoading, setIsLoading] = useState(false);
    const [names, setNames] = useState([]);
    const [scanned, setScanned] = useState(false);
    const [hasPermission, setHasPermission] = useState(null);

    const [modalVisible, setModalVisible] = useState(false);
    const [modalData, setModalData] = useState([]);
    const [modalTitle, setModalTitle] = useState('');
    const [modalStatus, setModalStatus] = useState('');
    const [modalId, setModalId] = useState('');

    useEffect(() => {
        askForCameraPermission();
        db.transaction(tx => {
            //tx.executeSql('DELETE TABLE names')
            tx.executeSql('CREATE TABLE IF NOT EXISTS names (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, tables INTEGER, sign INTEGER DEFAULT 0)')
        });

        db.transaction(tx => {
            tx.executeSql('SELECT * FROM names', null,
                (txObj, resultSet) => setNames(resultSet.rows._array),
                (txObj, resultSet) => setDisplayNames(resultSet.rows._array),
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

    // What happens when we scan the bar code
    const handleBarCodeScanned = ({ type, data }) => {
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
            if (names[i].id == test)
                existingNames = i;
        }
        openSettingsModal(names[existingNames].name, names[existingNames].tables, names[existingNames].sign, names[existingNames].id);
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
                    }
                },
                (txObj, error) => console.log(error)
            );
        });
    }

    const openSettingsModal = (title, settings, status, id) => {
        setModalTitle(title);
        setModalData(settings);
        setModalStatus(status);
        setModalId(id);
        setModalVisible(!modalVisible);
    }

    return (
        <View style={styles.containerText}>
            <View style={styles.barcodebox}>
                <BarCodeScanner
                    onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                    style={{ height: 400, width: 400 }} />
            </View>
            {/* <Text style={styles.maintext}>{text}</Text> */}
            {/* {scanned && <Button title={'Scan again?'} onPress={() => setScanned(false)} color='tomato' />} */}
            <StatusBar style='auto' />
            <Modal animationType="slide" transparent={true} visible={modalVisible} >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text>{modalTitle}</Text>
                        <Text>Table: {modalData}</Text>
                        <Text>Status: {modalStatus == 1 ? "Here" : "Not Here"} </Text>
                        <Text>ID: {modalId} </Text>
                        <TouchableHighlight
                            style={[styles.button, styles.buttonClose]}
                            onPress={() => { setModalVisible(!modalVisible); setScanned(false) }}>
                            <Text style={styles.textStyle}>Hide Modal</Text>
                        </TouchableHighlight>
                        <Button title='Sign In' onPress={() => {switchStatuss(modalId, modalStatus); setScanned(false) }} />
                    </View>
                </View>
            </Modal>
        </View>
    );
}