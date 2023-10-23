import './wdyr';
import { StatusBar } from 'expo-status-bar';
import { Text, View, TextInput, Button, Modal, TouchableHighlight, ScrollView, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { useState, useEffect, useCallback, memo, useMemo} from 'react';
import styles from './style';
import { Stack, useRouter } from "expo-router";

export default function App() {
    const navigation = useRouter();

    const db = SQLite.openDatabase('WPB.db');
    const [isLoading, setIsLoading] = useState(false);
    const [names, setNames] = useState([]);
    const [currentName, setCurrentName] = useState(undefined);
    const [displayNames, setDisplayNames] = useState([]);
    const [currentTable, setCurrentTable] = useState(undefined);
    const [currentNameTest, setCurrentNameTest] = useState(undefined);
    const [activeJobType, setActiveJobType] = useState('None')
    const [activeStatusType, setActiveStatusType] = useState('None')

    const [modalVisible, setModalVisible] = useState(false);
    const [modalData, setModalData] = useState([]);
    const [modalTitle, setModalTitle] = useState('');
    const [modalStatus, setModalStatus] = useState('');
    const [modalId, setModalId] = useState('');

    useEffect(() => {
        db.transaction(tx => {
            //tx.executeSql('DELETE TABLE names')
            tx.executeSql('CREATE TABLE IF NOT EXISTS names (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, tables INTEGER, sign INTEGER DEFAULT 0)')
        });

        db.transaction(tx => {
            tx.executeSql('SELECT * FROM names', null,
                (txObj, resultSet) => setNames(resultSet.rows._array),
                (txObj, error) => console.log(error))
        });
        db.transaction(tx => {
            tx.executeSql('SELECT * FROM names', null,
                (txObj, resultSet) => setDisplayNames(resultSet.rows._array),
                (txObj, error) => console.log(error))
        });
        setIsLoading(false);
    }, [])

    const jobTypes = ["None", 1, 2, 3, 4, 5, 6, 7, 8, 9]
    const statusTypes = ["None", "Here", "Not Here"]

    if (isLoading) {
        return (
            <View style={styles.container}>
                <Text>Loading names</Text>
            </View>
        );
    }

    const addName = () => {
        db.transaction(tx => {
            tx.executeSql('INSERT INTO names (name, sign, tables) values (?, 0, ?)', [currentName, currentTable],
                (txObj, resultSet) => {
                    let existingNames = [...names];
                    existingNames.push({ id: resultSet.insertId, name: currentName, sign: 0, tables: currentTable });
                    setNames(existingNames);
                    setCurrentName(undefined)
                },
                (txObj, error) => console.log(error)
            );
        });
    }

    // const deleteName = (id) => {
    //     db.transaction(tx => {
    //         tx.executeSql('DELETE FROM names WHERE id = ?', [id],
    //             (txObj, resultSet) => {
    //                 if (resultSet.rowsAffected > 0) {
    //                     let existingNames = [...names].filter(name => name.id !== id);
    //                     setNames(existingNames)
    //                 }
    //             },
    //             (txObj, error) => console.log(error)
    //         );
    //     });
    // };

    const findName = (test) => {
        let existingNames
        for (i = 0; i < names.length; i++) {
            if (names[i].id == test)
                existingNames = i;
        }
        openSettingsModal(names[existingNames].name, names[existingNames].tables, names[existingNames].sign, names[existingNames].id);
        setCurrentNameTest(undefined);
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
                        updateDisplayName(activeJobType, activeStatusType);
                        setCurrentNameTest(undefined);
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

    const updateDisplayName = (table, status) => {
        if (table == 'None' && status == 'None') {
            let existingNames = names
            setDisplayNames(existingNames)
        }
        else if (table == 'None') {
            let existingNames = names.filter(name => name.sign === (status == "Here" ? 1 : 0));
            setDisplayNames(existingNames)
        }
        else if (status == 'None') {
            let existingNames = names.filter(name => name.tables === table);
            setDisplayNames(existingNames)
        }
        else {
            let existingNames = names.filter(name => name.tables === table);
            let existingNames2 = existingNames.filter(name => name.sign === (status == "Here" ? 1 : 0));
            setDisplayNames(existingNames2)
        }
    }

    const Item = memo(({item, status}) => (
            <View key={item.id} style={styles.row(status)}>
                {/* <View style={{ width: "55%", alignItems: 'center' }}> */}
                    <Text style={styles.textEntry55}>{item.name}</Text>
                {/* </View> */}
                {/* <View style={{ width: "30%", alignItems: 'center' }}> */}
                    <Text style={styles.textEntry30}>{item.id}</Text>
                {/* </View> */}
                {/* <View style={{ width: "15%", alignItems: 'center' }}> */}
                    <Text style={styles.textEntry15}>{item.tables}</Text>
                {/* </View> */}
                {/* 45,15,15,25 */}
                {/* <Button title='Delete' onPress={() => deleteName(name.id)} /> */}
                {/* <View style={{ width: "25%", alignItems: 'center' }}>
                    <View style={styles.button}>
                        <Button style={styles.button} title='Info' onPress={() => {openSettingsModal(item.name, item.tables, status, item.id)}}/>
                    </View>
                </View> */}
            </View>
      ));

    const renderItems = useCallback(({item}) => <Item item={item} status={item.sign}/>, []);
    const keyExtractor = useCallback((item) => item.id, [])

    const showNames = () => {
        return (
            <SafeAreaView style={styles.container}>
                <FlatList
                    data={displayNames}
                    renderItem={renderItems}
                    keyExtractor={keyExtractor}
                    initialNumToRender={20}
                    maxToRenderPerBatch={20}
                    updateCellsBatchingPeriod={5}
                    windowSize={6}
                    getItemLayout={(data, index) => (
                        {length: 50, offset: 50 * index, index}
                      )}
                />
            </SafeAreaView>
        );
    }

    return (
        <View style={styles.containerText}>
            <View>
                <TextInput value={currentName} placeholder='name' onChangeText={setCurrentName} />
                <TextInput value={currentTable} placeholder='table' onChangeText={setCurrentTable} />
                <Button title='Add Name' onPress={addName} />
                <TextInput value={currentNameTest} placeholder='key' onChangeText={setCurrentNameTest} />
                <Button title='Show Name' onPress={() => findName(currentNameTest)} />
            </View>
            <View>
                <Text style={styles.title}>Filter Table</Text>
                <FlatList
                    data={jobTypes}
                    style={styles.scroll}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.tab(activeJobType, item)}
                            onPress={() => {
                                setActiveJobType(item);
                                updateDisplayName(item, activeStatusType);
                            }}
                        >
                            <Text style={styles.tabText(activeJobType, item)}>{item}</Text>
                        </TouchableOpacity>
                    )}
                    keyExtractor={item => item}
                    contentContainerStyle={{ columnGap: 12 }}
                    horizontal
                />
            </View>
            <View>
                <Text style={styles.title}>Filter Status</Text>
                <FlatList
                    data={statusTypes}
                    style={styles.scroll}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.tab(setActiveStatusType, item)}
                            onPress={() => {
                                setActiveStatusType(item);
                                updateDisplayName(activeJobType, item);
                            }}
                        >
                            <Text style={styles.tabText(activeStatusType, item)}>{item}</Text>
                        </TouchableOpacity>
                    )}
                    keyExtractor={item => item}
                    contentContainerStyle={{ columnGap: 12 }}
                    horizontal
                />
            </View>
            <View>
                <Text>People Here: {displayNames.filter(name => name.sign === 1).length}/{displayNames.length}</Text>
            </View>
            <View style={styles.rowEntryHeader}>
                <View style={{ width: "55%", alignItems: 'center' }}>
                    <Text style={styles.textEntry}>Name</Text>
                </View>
                <View style={{ width: "30%", alignItems: 'center' }}>
                    <Text style={styles.textEntry}>ID</Text>
                </View>
                <View style={{ width: "15%", alignItems: 'center' }}>
                    <Text style={styles.textEntry}>Table</Text>
                </View>
                {/* 45,15,15,25 */}
                {/* <View style={{ width: "25%", alignItems: 'center' }}>
                    <Text style={styles.textEntry}></Text>
                </View> */}
            </View>
            <View style={{ height: "83%", marginTop: 10 }}>
                {showNames()}
            </View>
            <StatusBar style='auto' />
            <Modal animationType="slide" transparent={true} visible={modalVisible} useNativeDriver={true}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text>{modalTitle}</Text>
                        <Text>Table: {modalData}</Text>
                        <Text>Status: {modalStatus == 1 ? "Here" : "Not Here"} </Text>
                        <Text>ID: {modalId} </Text>
                        <TouchableHighlight
                            style={[styles.button, styles.buttonClose]}
                            onPress={() => {setModalVisible(!modalVisible) }}>
                            <Text style={styles.textStyle}>Hide Modal</Text>
                        </TouchableHighlight>
                        <Button title='Sign In' onPress={() => {switchStatuss(modalId, modalStatus) }} />
                    </View>
                </View>
            </Modal>
        </View>
    );
}