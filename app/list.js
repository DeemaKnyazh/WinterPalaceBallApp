import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faArrowDownAZ, width } from '@fortawesome/free-solid-svg-icons/faArrowDownAZ'
import { faArrowDownZA } from '@fortawesome/free-solid-svg-icons/faArrowDownZA'
import { faArrowDown19 } from '@fortawesome/free-solid-svg-icons/faArrowDown19'
import { faXmark } from '@fortawesome/free-solid-svg-icons/faXmark'
import { Stack, useNavigation, useRouter } from "expo-router";
import * as SQLite from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect, useCallback, memo } from "react";
import { Text, View, Button, Modal, TouchableHighlight, FlatList, TouchableOpacity, SafeAreaView, TextInput } from "react-native";
import styles from "./style";
import { Picker } from '@react-native-picker/picker';
import Constants from 'expo-constants';

export default function List() {
    const db = SQLite.openDatabaseAsync("WPB.db");

    const [isLoading, setIsLoading] = useState(false);
    const [names, setNames] = useState([]);
    const [displayNames, setDisplayNames] = useState([]);
    const [currentTable, setCurrentTable] = useState(undefined);
    const [activeJobType, setActiveJobType] = useState("None");
    const [activeStatusType, setActiveStatusType] = useState("None");
    const [modalVisible, setModalVisible] = useState(false);
    const [modalPerson, setModalPerson] = useState([]);
    const [order, setOrder] = useState("aalph");
    const [text, onChangeText] = useState('');
    const url = process.env.apilist;
    const url2 = process.env.apisign;

    // eslint-disable-next-line no-undef
    const [ws, setWs] = useState(new WebSocket(process.env.wsurl));
    //ws.close();
    const [wsClient, setWsClient] = useState("None");

    ws.onopen = () => {
        // connection opened
        console.log("opened");
    };

    ws.onmessage = (e) => {
        // a message was received
        const msg = JSON.stringify(e.data);
        mystring = msg.replace(/["']/g, "");
        if (mystring.startsWith("client:")) {
            setWsClient(mystring.replace("client:", ""));
        }
        if (mystring.startsWith("status ")) {
            switchStatuss(mystring.replace("status ", ""), 1, "ext");
        }
    };

    ws.onclose = (e) => {console.log("closed")};
    ws.onerror = (e) => {console.log("error")};

    useEffect(() => {
        fetch(url, {
            method: "get",
            headers: new Headers({
                Authorization: process.env.apikey,
            }),
        })
            .then((resp) => resp.json())
            .then((json) => setNamesDb(Object.values(json)))
            .catch((error) => console.error(error))
            .finally(() => setIsLoading(false));
    }, []);

    const setNamesDb = (names) => {
        setNames(names);
        setDisplayNames(names);
    }

    const jobTypes = ["None", 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];
    const statusTypes = ["None", "Here", "Not Here"];

    if (isLoading) {
        return (
            <View style={styles.container}>
                <Text>Loading names</Text>
            </View>
        );
    }

    const addName = () => {
        const text1 = "WPB";
        const acronym = currentName
            .split(/\s/)
            .reduce((response, word) => (response += word.slice(0, 1)), "");
        const endcronym = currentName
            .split(/\s/)
            .reduce((response, word) => (response += word.slice(-2, -1)), "");
        const CurrentTicket = text1.concat(acronym, endcronym);
        db.transaction((tx) => {
            tx.executeSql(
                "INSERT INTO names (name, sign, tables, ticket) values (?, 0, ?, ?)",
                [currentName, currentTable, CurrentTicket],
                (txObj, resultSet) => {
                    const existingNames = [...names];
                    existingNames.push({
                        id: resultSet.insertId,
                        name: currentName,
                        sign: 0,
                        tables: currentTable,
                        ticket: CurrentTicket,
                    });
                    setNames(existingNames);
                    setCurrentName(undefined);
                },
                (txObj, error) => console.log(error),
            );
        });
    };

    const findName = (test) => {
        let existingNames;
        for (i = 0; i < names.length; i++) {
            if (names[i].id == test) existingNames = i;
        }
        openSettingsModal(
            names[existingNames].name,
            names[existingNames].tables,
            names[existingNames].sign,
            names[existingNames].id,
        );
    };

    const switchStatuss = (id, status, src) => {
        console.log('test')
        if (src == "ext") {
            const existingNames = [...names];
            const indexToUpdate = existingNames.findIndex((name) => name.id == id);
            existingNames[indexToUpdate].sign =
                existingNames[indexToUpdate].sign === 1 ? 0 : 1;
            setNames(existingNames);
            updateDisplayName(activeJobType, activeStatusType, text);
        }
        if (src == "int") {
            fetch(url2 + "/" + id, {
                method: "post",
                headers: new Headers({
                    Authorization: process.env.apikey,
                    Client: wsClient,
                }),
                body: JSON.stringify({session: Constants.sessionId})
            })
                .then((response) => {
                    console.log(JSON.stringify(response));
                })
                .then((responseData) => {
                    const existingNames = [...names];
                    const indexToUpdate = existingNames.findIndex(
                        (name) => name.id == id,
                    );
                    existingNames[indexToUpdate].sign = status === 1 ? 0 : 1;
                    setNames(existingNames);
                    updateDisplayName(activeJobType, activeStatusType, text);
                    setModalVisible(!modalVisible);
                })
                .catch((error) => console.error(error));
        }
    };

    const openSettingsModal = (title) => {
        setModalPerson(title);
        setModalVisible(!modalVisible);
    };

    const updateDisplayName = (table, status, textIn) => {
        console.log(textIn)
        if (textIn !== "" && textIn !== null && textIn !== undefined) {
            onChangeText(textIn);
            var tempNames = names;
            console.log('test')
            var existingNames = tempNames.filter((tempNames) => tempNames.name.toLowerCase().includes(textIn.toLowerCase()));
        } else if (textIn === null) {
            textIn = text;
            var tempNames = names;
            console.log('test2')
            var existingNames = tempNames.filter((tempNames) => tempNames.name.toLowerCase().includes(textIn.toLowerCase()));
        } else {
            console.log('test3')
            onChangeText(textIn);
            var existingNames = names;
        }

        if (table == "None" && status == "None") {
            setDisplayNames(existingNames);
        } else if (table == "None") {
            setDisplayNames(existingNames
                .filter((name) => name.sign === (status == 1 ? 1 : 0)));
        } else if (status == "None") {
            setDisplayNames(existingNames
                .filter((name) => name.tables === table));
        } else {
            const existingNames2 = existingNames
                .filter((name) => name.tables === table)
                .filter((name) => name.sign === (status == 1 ? 1 : 0));
            setDisplayNames(existingNames2);
        }
    };

    const Item = memo(({ item, status }) => (
        <View key={item.id} style={styles.row(status)}>
            <Text style={styles.textEntry50}>{item.name}</Text>
            {/* <Text style={styles.textEntry15}>{item.id}</Text> */}
            <Text style={styles.textEntry20}>{item.tables}</Text>
            {/* 45,15,15,25 */}
            {/* <Button title='Delete' onPress={() => deleteName(name.id)} /> */}
            <View style={{ width: "30%", alignItems: "center", color: "black" }}>
                <TouchableHighlight
                    style={[styles.button, {width: "50%", height: "65%", marginTop: 10, opacity: 0.9}]}
                    onPress={() => {
                        openSettingsModal(item);
                    }}
                >
                    <Text style={[styles.textStyle, {marginTop: -2, color: "black", opacity: 1}]}>Info</Text>
                </TouchableHighlight>
            </View>
        </View>
    ));

    const renderItems = useCallback(
        ({ item }) => <Item item={item} status={item.sign} />,
        [],
    );
    const keyExtractor = useCallback((item) => item.id, []);

    const showNames = () => {
        return (
            <SafeAreaView style={styles.container}>
                <FlatList
                    data={displayNames}
                    renderItem={renderItems}
                    keyExtractor={keyExtractor}
                    initialNumToRender={15}
                    maxToRenderPerBatch={20}
                    updateCellsBatchingPeriod={4}
                    windowSize={5}
                    getItemLayout={(data, index) => ({
                        length: 50,
                        offset: 50 * index,
                        index,
                    })}
                />
            </SafeAreaView>
        );
    };

    const toggleButton = () => {
        console.log('test')
        if (order === "num") {
            setOrder("aalph")
            const existingNames = names.sort((a, b) => a.id - b.id);
            setNames(existingNames);
            updateDisplayName(activeJobType, activeStatusType, text);
        } else if (order === "aalph") {
            setOrder("zalph")
            const existingNames = names.sort((a, b) => b.name.localeCompare(a.name));
            setNames(existingNames);
            updateDisplayName(activeJobType, activeStatusType, text);
        } else {
            setOrder("num")
            const existingNames = names.sort((a, b) => a.name.localeCompare(b.name));
            setNames(existingNames);
            updateDisplayName(activeJobType, activeStatusType, text);
        }
        print(order);
    };

    function sortIcon(sort) {
        if (sort == "aalph") {
            return faArrowDown19
        }
        else if (sort == "zalph") {
            return faArrowDownZA
        }
        else {
            return faArrowDownAZ
        }
    }

    function clearSearch() {
        setActiveJobType("None")
        setActiveStatusType("None")
        onChangeText('')
        updateDisplayName("None", "None", "")
    }

    return (
        <View style={styles.containerText}>
            <Stack.Screen
                options={{
                    title: "Guest List",
                    headerStyle: { backgroundColor: "#fff" },
                    headerTintColor: "black",
                    headerTitleStyle: {
                        fontWeight: "bold",
                    },
                    headerRight: () => (
                        <>
                            <TouchableOpacity activeOpacity={0.2} title={order} onPressIn={toggleButton} >
                                <FontAwesomeIcon icon={sortIcon(order)} color="black" size={30} />
                            </TouchableOpacity>
                        </>
                    )
                }}
            />

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <View style={{ flex: 8 }}>
                    <TextInput
                        style={styles.input}
                        value={text}
                        onChangeText={text => updateDisplayName(activeJobType, activeStatusType, text)}
                        placeholder='Search...'
                        clearButtonMode='always'
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <TouchableOpacity activeOpacity={0.2} title={order} onPressIn={clearSearch} >
                        <FontAwesomeIcon style={{ paddingTop: 65 }} icon={faXmark} color="black" size={30} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between", marginLeft: 5 }}>
                <View style={{ flex: 3 }}>
                    <Text style={styles.title}>Filter Table</Text>
                    <Picker
                        selectedValue={activeJobType}
                        prompt='Fiter Table'
                        onValueChange={(itemValue, itemIndex) => {
                            setActiveJobType(itemValue)
                            updateDisplayName(itemValue, activeStatusType, text)
                        }}>
                        <Picker.Item label="None" value="None" />
                        <Picker.Item label="1" value={1} />
                        <Picker.Item label="2" value={2} />
                        <Picker.Item label="3" value={3} />
                        <Picker.Item label="4" value={4} />
                        <Picker.Item label="5" value={5} />
                        <Picker.Item label="6" value={6} />
                        <Picker.Item label="7" value={7} />
                        <Picker.Item label="8" value={8} />
                        <Picker.Item label="9" value={9} />
                        <Picker.Item label="10" value={10} />
                        <Picker.Item label="11" value={11} />
                        <Picker.Item label="12" value={12} />
                        <Picker.Item label="13" value={13} />
                        <Picker.Item label="14" value={14} />
                        <Picker.Item label="15" value={15} />
                    </Picker>
                </View>
                <View style={{ flex: 3 }}>
                    <Text style={styles.title}>Filter Status</Text>
                    <Picker
                        selectedValue={activeStatusType}
                        prompt='Filter Status'
                        onValueChange={(itemValue, itemIndex) => {
                            setActiveStatusType(itemValue)
                            updateDisplayName(activeJobType, itemValue, text)
                        }}>
                        <Picker.Item label="None" value="None" />
                        <Picker.Item label="Here" value={1} />
                        <Picker.Item label="Not Here" value={2} />
                    </Picker>
                </View>
            </View>

            {/* <View>
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
                    keyExtractor={(item) => item}
                    contentContainerStyle={{ columnGap: 12 }}
                    horizontal
                />
            </View> */}
            {/* <View>
                <Text style={styles.title}>Filter Status</Text>
                <FlatList
                    data={statusTypes}
                    style={styles.scroll}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.tab(activeStatusType, item)}
                            onPress={() => {
                                setActiveStatusType(item);
                                updateDisplayName(activeJobType, item);
                            }}
                        >
                            <Text style={styles.tabText(activeStatusType, item)}>{item}</Text>
                        </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item}
                    contentContainerStyle={{ columnGap: 12 }}
                    horizontal
                />
            </View> */}
            <View style={[styles.rowEntryHeader, { height: "5%", marginLeft: 5 }]}>
                <Text style={{ fontSize: 15 }}>
                    People Here: {displayNames.filter((name) => name.sign === 1).length}
                </Text>
            </View>
            <View style={[styles.rowEntryHeader, { height: "5%" }]}>
                <Text style={[styles.textEntry50, { fontSize: 20 }]}>Name</Text>
                {/* <Text style={styles.textEntry15}>ID</Text> */}
                <Text style={[styles.textEntry20, { fontSize: 20 }]}>Table</Text>
                {/* 45,15,15,25 */}
                <View style={{ width: "30%", alignItems: "center" }}>
                    <Text style={styles.textEntry} />
                </View>
            </View>
            <View style={{ height: "71%", marginTop: 0 }}>{showNames()}</View>
            <StatusBar style="auto" />
            <Modal
                animationType="fade"
                transparent
                visible={modalVisible}
                useNativeDriver
                hardwareAccelerated
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalName}>{modalPerson.name}</Text>
                        <TouchableOpacity onPress={() => {
                            setActiveJobType(modalPerson.tables);
                            updateDisplayName(modalPerson.tables, activeStatusType, text);
                            setModalVisible(!modalVisible);
                        }} >
                            <Text style={styles.modalText}>Table: {modalPerson.tables}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            setActiveStatusType(modalPerson.sign);
                            tempStat = modalPerson.sign == 1 ? 1 : 0;
                            updateDisplayName(activeJobType, tempStat, text);
                            setModalVisible(!modalVisible);
                        }} >
                            <Text style={styles.modalText}>
                                Status: {modalPerson.sign == 1 ? "Here" : "Not Here"}{" "}
                            </Text>
                        </TouchableOpacity>

                        <Text style={styles.modalText}>ID: {modalPerson.ticket} </Text>
                        <Text style={styles.modalText}>Raffle: {modalPerson.raffle} </Text>

                        <TouchableHighlight
                            style={styles.buttonBig}
                            onPress={() => {
                                switchStatuss(modalPerson.id, modalPerson.sign, "int");
                            }}>
                            <Text style={[styles.textStyle, {color: "black", fontSize: 20}]}>{modalPerson.sign == 1 ? "Sign Out" : "Sign In"}</Text>
                        </TouchableHighlight>

                        {/* <Button title="Delete" onPress={() => {deleteName(modalPerson.id)}} /> */}
                        <TouchableHighlight
                            style={styles.button}
                            onPress={() => {
                                setModalVisible(!modalVisible);
                            }}
                        >
                            <Text style={[styles.textStyle, {color: "black"}]}>Close</Text>
                        </TouchableHighlight>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
