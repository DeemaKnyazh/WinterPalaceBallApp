import { StatusBar } from 'expo-status-bar';
import { Text, View, TextInput, Button, Modal, TouchableHighlight, ScrollView, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { useState, useEffect, useCallback, memo, useMemo } from 'react';
import styles from './style';
import { Stack, useRouter } from "expo-router";
import {apikey, apilist, apisign} from "@env";

export default function List() {
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
    const [modalPerson, setModalPerson] = useState([]);
    const url = apilist
    const url2 = apisign

    useEffect(() => {
        fetch(url, { 
            method: 'get', 
            headers: new Headers({
                'Authorization': apikey, 
            })})
          .then((resp) => resp.json())
          .then((json) => setDisplayNames(json))
          .catch((error) => console.error(error))
          .finally(() => setIsLoading(false));

          fetch(url, { 
            method: 'get', 
            headers: new Headers({
                'Authorization': apikey, 
            })})
          .then((resp) => resp.json())
          .then((json) => setNames(json))
          .catch((error) => console.error(error))
          .finally(() => setIsLoading(false));
      }, []);

    // useEffect(() => {
    //     db.transaction(tx => {
    //         //tx.executeSql('DELETE TABLE names')
    //         tx.executeSql('CREATE TABLE IF NOT EXISTS names (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, tables INTEGER, sign INTEGER DEFAULT 0, ticket TEXT)')
    //     });

    //     db.transaction(tx => {
    //         tx.executeSql('SELECT * FROM names ORDER BY name', null,
    //             (txObj, resultSet) => setNames(resultSet.rows._array),
    //             (txObj, error) => console.log(error))
    //     });
    //     db.transaction(tx => {
    //         tx.executeSql('SELECT * FROM names ORDER BY name', null,
    //             (txObj, resultSet) => setDisplayNames(resultSet.rows._array),
    //             (txObj, error) => console.log(error))
    //     });
    //     setIsLoading(false);
    // }, [])

    // console.log(names)

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
        let text1 = "WPB"
        let acronym = currentName.split(/\s/).reduce((response,word)=> response+=word.slice(0,1),'')
        let endcronym = currentName.split(/\s/).reduce((response,word)=> response+=word.slice(-2,-1),'')
        const CurrentTicket = text1.concat(acronym, endcronym);
        db.transaction(tx => {
            tx.executeSql('INSERT INTO names (name, sign, tables, ticket) values (?, 0, ?, ?)', [currentName, currentTable, CurrentTicket],
                (txObj, resultSet) => {
                    let existingNames = [...names];
                    existingNames.push({ id: resultSet.insertId, name: currentName, sign: 0, tables: currentTable, ticket: CurrentTicket});
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
        // db.transaction(tx => {
        //     tx.executeSql('UPDATE names SET sign = ? WHERE id = ?', [status === 1 ? 0 : 1, id],
        //         (txObj, resultSet) => {
        //             if (resultSet.rowsAffected > 0) {
        //                 let existingNames = [...names];
        //                 const indexToUpdate = existingNames.findIndex(name => name.id === id);
        //                 existingNames[indexToUpdate].sign = status === 1 ? 0 : 1;
        //                 setNames(existingNames);
        //                 updateDisplayName(activeJobType, activeStatusType);
        //                 setCurrentNameTest(undefined);
        //                 setModalVisible(!modalVisible)
        //             }
        //         },
        //         (txObj, error) => console.log(error)
        //     );
        // });
        fetch(url2+id, { 
            method: 'post', 
            headers: new Headers({
                'Authorization': apikey, 
            })})
            .then((response) => response.json())
            .then((responseData) => {
              console.log(JSON.stringify(responseData));
            })
            .then((responseData) => {
                let existingNames = [...names];
                const indexToUpdate = existingNames.findIndex(name => name.id === id);
                existingNames[indexToUpdate].sign = status === 1 ? 0 : 1;
                setNames(existingNames);
                updateDisplayName(activeJobType, activeStatusType);
                setCurrentNameTest(undefined);
                setModalVisible(!modalVisible)
            })
            .catch((error) => console.error(error))
    }

    const openSettingsModal = (title) => {
        setModalPerson(title);
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

    const Item = memo(({ item, status }) => (
        <View key={item.id} style={styles.row(status)}>
            <Text style={styles.textEntry60}>{item.name}</Text>
            {/* <Text style={styles.textEntry15}>{item.id}</Text> */}
            <Text style={styles.textEntry20}>{item.tables}</Text>
            {/* 45,15,15,25 */}
            {/* <Button title='Delete' onPress={() => deleteName(name.id)} /> */}
            <View style={{ width: "25%", alignItems: 'center' }}>
                    <View style={styles.button}>
                        <Button style={styles.button} title='Info' onPress={() => {openSettingsModal(item)}}/>
                    </View>
                </View>
        </View>
    ));

    const renderItems = useCallback(({ item }) => <Item item={item} status={item.sign} />, []);
    const keyExtractor = useCallback((item) => item.id, [])

    const showNames = () => {
        return (
            <SafeAreaView style={styles.container}>
                <FlatList
                    data={displayNames}
                    renderItem={renderItems}
                    keyExtractor={keyExtractor}
                    initialNumToRender={15}
                    maxToRenderPerBatch={15}
                    updateCellsBatchingPeriod={5}
                    windowSize={5}
                    getItemLayout={(data, index) => (
                        { length: 50, offset: 50 * index, index }
                    )}
                />
            </SafeAreaView>
        );
    }

    return (
        <View style={styles.containerText}>
            {/* <View>
                <TextInput value={currentName} placeholder='name' onChangeText={setCurrentName} />
                <TextInput value={currentTable} placeholder='table' onChangeText={setCurrentTable} />
                <Button title='Add Name' onPress={addName} />
                <TextInput value={currentNameTest} placeholder='key' onChangeText={setCurrentNameTest} />
                <Button title='Show Name' onPress={() => findName(currentNameTest)} />
            </View> */}
            <View>
                <Text style={styles.title}>Filter Table</Text>
                <FlatList data={jobTypes} style={styles.scroll} renderItem={({ item }) => (
                        <TouchableOpacity style={styles.tab(activeJobType, item)} onPress={() => {
                                setActiveJobType(item);
                                updateDisplayName(item, activeStatusType);
                            }}>
                        <Text style={styles.tabText(activeJobType, item)}>{item}</Text>
                        </TouchableOpacity>
                    )}
                    keyExtractor={item => item} contentContainerStyle={{ columnGap: 12 }} horizontal/>
            </View>
            <View>
                <Text style={styles.title}>Filter Status</Text>
                <FlatList data={statusTypes} style={styles.scroll} renderItem={({ item }) => (
                        <TouchableOpacity style={styles.tab(setActiveStatusType, item)} onPress={() => {
                                setActiveStatusType(item);
                                updateDisplayName(activeJobType, item);
                            }}>
                        <Text style={styles.tabText(activeStatusType, item)}>{item}</Text>
                        </TouchableOpacity>
                    )}
                    keyExtractor={item => item} contentContainerStyle={{ columnGap: 12 }} horizontal/>
            </View>
            <View>
                <Text>People Here: {displayNames.filter(name => name.sign === 1).length}/{displayNames.length}</Text>
            </View>
            <View style={styles.rowEntryHeader}>
                    <Text style={styles.textEntry60}>Name</Text>
                    {/* <Text style={styles.textEntry15}>ID</Text> */}
                    <Text style={styles.textEntry20}>Table</Text>
                {/* 45,15,15,25 */}
                <View style={{ width: "25%", alignItems: 'center' }}>
                    <Text style={styles.textEntry}></Text>
                </View>
            </View>
            <View style={{ height: "71.5%", marginTop: 10 }}>
                {showNames()}
            </View>
            <StatusBar style='auto' />
            <Modal animationType="fade" transparent={true} visible={modalVisible} useNativeDriver={true} hardwareAccelerated={true} >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalName}>{modalPerson.name}</Text>
                        <Text style={styles.modalText}>Table: {modalPerson.tables}</Text>
                        <Text style={styles.modalText}>Status: {modalPerson.sign == 1 ? "Here" : "Not Here"} </Text>
                        <Text style={styles.modalText}>ID: {modalPerson.ticket} </Text>
                        <Button title={modalPerson.sign == 1 ? "Sign Out" : "Sign In"} onPress={() => {switchStatuss(modalPerson.id, modalPerson.sign)}} />
                        {/* <Button title="Delete" onPress={() => {deleteName(modalPerson.id)}} /> */}
                        <TouchableHighlight
                            style={[styles.button, styles.buttonClose]}
                            onPress={() => {setModalVisible(!modalVisible) }}>
                            <Text style={styles.textStyle}>Close</Text>
                        </TouchableHighlight>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
