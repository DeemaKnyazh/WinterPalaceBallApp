import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faArrowDownAZ } from '@fortawesome/free-solid-svg-icons/faArrowDownAZ'
import { faArrowDownZA } from '@fortawesome/free-solid-svg-icons/faArrowDownZA'
import { faArrowDown19 } from '@fortawesome/free-solid-svg-icons/faArrowDown19'
import { Stack, useRouter } from "expo-router";
import * as SQLite from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect, useCallback, memo } from "react";
import { Text, View, Button, Modal, TouchableHighlight, FlatList, TouchableOpacity, SafeAreaView, } from "react-native";
import styles from "./style";

export default function List() {
    const navigation = useRouter();

    const db = SQLite.openDatabase("WPB.db");

    const [isLoading, setIsLoading] = useState(false);
    const [names, setNames] = useState([]);
    const [displayNames, setDisplayNames] = useState([]);
    const [currentTable, setCurrentTable] = useState(undefined);
    const [activeJobType, setActiveJobType] = useState("None");
    const [activeStatusType, setActiveStatusType] = useState("None");
    const [modalVisible, setModalVisible] = useState(false);
    const [modalPerson, setModalPerson] = useState([]);
    const [order, setOrder] = useState("aalph");
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
        console.log(mystring);
        if (mystring.startsWith("client:")) {
            setWsClient(mystring.replace("client:", ""));
        }
        if (mystring.startsWith("status ")) {
            switchStatuss(mystring.replace("status ", ""), 1, "ext");
        }
    };

    ws.onclose = (e) => { };
    ws.onerror = (e) => { };

    useEffect(() => {
        fetch(url, {
            method: "get",
            headers: new Headers({
                Authorization: process.env.apikey,
            }),
        })
            .then((resp) => resp.json())
            .then((json) => setDisplayNames(json))
            .catch((error) => console.error(error))
            .finally(() => setIsLoading(false));

        fetch(url, {
            method: "get",
            headers: new Headers({
                Authorization: process.env.apikey,
            }),
        })
            .then((resp) => resp.json())
            .then((json) => setNames(json))
            .catch((error) => console.error(error))
            .finally(() => setIsLoading(false));
    }, []);

    const jobTypes = ["None", 1, 2, 3, 4, 5, 6, 7, 8, 9];
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
        if (src == "ext") {
            const existingNames = [...names];
            const indexToUpdate = existingNames.findIndex((name) => name.id == id);
            existingNames[indexToUpdate].sign =
                existingNames[indexToUpdate].sign === 1 ? 0 : 1;
            setNames(existingNames);
            updateDisplayName(activeJobType, activeStatusType);
        }
        if (src == "int") {
            fetch(url2 + id, {
                method: "post",
                headers: new Headers({
                    Authorization: process.env.apikey,
                    Client: wsClient,
                }),
            })
                .then((response) => response.json())
                .then((responseData) => {
                    //console.log(JSON.stringify(responseData));
                })
                .then((responseData) => {
                    const existingNames = [...names];
                    const indexToUpdate = existingNames.findIndex(
                        (name) => name.id == id,
                    );
                    console.log(indexToUpdate, id);
                    existingNames[indexToUpdate].sign = status === 1 ? 0 : 1;
                    setNames(existingNames);
                    console.log(existingNames[indexToUpdate].raffle);
                    console.log(existingNames[indexToUpdate].ticket);
                    updateDisplayName(activeJobType, activeStatusType);
                    setModalVisible(!modalVisible);
                })
                .catch((error) => console.error(error));
        }
    };

    const openSettingsModal = (title) => {
        setModalPerson(title);
        setModalVisible(!modalVisible);
    };

    const updateDisplayName = (table, status) => {
        if (table == "None" && status == "None") {
            const existingNames = names;
            setDisplayNames(existingNames);
        } else if (table == "None") {
            const existingNames = names.filter(
                (name) => name.sign === (status == "Here" ? 1 : 0),
            );
            setDisplayNames(existingNames);
        } else if (status == "None") {
            const existingNames = names.filter((name) => name.tables === table);
            setDisplayNames(existingNames);
        } else {
            const existingNames = names.filter((name) => name.tables === table);
            const existingNames2 = existingNames.filter(
                (name) => name.sign === (status == "Here" ? 1 : 0),
            );
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
            <View style={{ width: "30%", alignItems: "center" }}>
                <Button
                    style={styles.button}
                    title="Info"
                    onPress={() => {
                        openSettingsModal(item);
                    }}
                />
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
        if (order === "num") {
            console.log(order)
            setOrder("aalph")
            const existingNames = names.sort((a, b) => a.id - b.id);
            setNames(existingNames);
            updateDisplayName(activeJobType, activeStatusType);
        }else if (order === "aalph"){
            console.log(order)
            setOrder("zalph")
            const existingNames = names.sort((a, b) => b.name.localeCompare(a.name));
            setNames(existingNames);
            updateDisplayName(activeJobType, activeStatusType);
        }else {
            console.log(order)
            setOrder("num")
            const existingNames = names.sort((a, b) => a.name.localeCompare(b.name));
            setNames(existingNames);
            updateDisplayName(activeJobType, activeStatusType);
        }
        print(order);
    };

    function sortIcon(sort) {
        if(sort == "aalph"){
            return faArrowDown19
        }
        else if(sort == "zalph"){
            return faArrowDownZA
        }
        else{
            return faArrowDownAZ
        }
    }

    return (
        <View style={styles.containerText}>
            <Stack.Screen
                options={{
                    title: "Guest List",
                    headerStyle: { backgroundColor: "#f4511e" },
                    headerTintColor: "#fff",
                    headerTitleStyle: {
                        fontWeight: "bold",
                    },
                    headerRight: () => (
                        <TouchableOpacity activeOpacity={0.5} title={order} onPress={toggleButton} >
                            <FontAwesomeIcon icon={sortIcon(order)} color="black" size={30} />
                        </TouchableOpacity>
                    )
                }}
            />
            <View style={{ height: "11%" }}>
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
            </View>
            <View style={{ height: "11%" }}>
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
            </View>
            <View style={{ height: "3%" }}>
                <Text>
                    People Here: {displayNames.filter((name) => name.sign === 1).length}/
                    {displayNames.length}
                </Text>
            </View>
            <View style={styles.rowEntryHeader}>
                <Text style={styles.textEntry50}>Name</Text>
                {/* <Text style={styles.textEntry15}>ID</Text> */}
                <Text style={styles.textEntry20}>Table</Text>
                {/* 45,15,15,25 */}
                <View style={{ width: "30%", alignItems: "center" }}>
                    <Text style={styles.textEntry} />
                </View>
            </View>
            <View style={{ height: "70%", marginTop: 10 }}>{showNames()}</View>
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
                            updateDisplayName(modalPerson.tables, activeStatusType);
                            setModalVisible(!modalVisible);
                        }} >
                            <Text style={styles.modalText}>Table: {modalPerson.tables}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            setActiveStatusType(modalPerson.status);
                            updateDisplayName(activeJobType, modalPerson.status);
                            setModalVisible(!modalVisible);
                        }} >
                            <Text style={styles.modalText}>
                                Status: {modalPerson.sign == 1 ? "Here" : "Not Here"}{" "}
                            </Text>                       
                        </TouchableOpacity>
                        <Text style={styles.modalText}>ID: {modalPerson.ticket} </Text>
                        <Text style={styles.modalText}>Raffle: {modalPerson.raffle} </Text>
                        <Button
                            title={modalPerson.sign == 1 ? "Sign Out" : "Sign In"}
                            onPress={() => {
                                switchStatuss(modalPerson.id, modalPerson.sign, "int");
                            }}
                        />
                        {/* <Button title="Delete" onPress={() => {deleteName(modalPerson.id)}} /> */}
                        <TouchableHighlight
                            style={[styles.button, styles.buttonClose]}
                            onPress={() => {
                                setModalVisible(!modalVisible);
                            }}
                        >
                            <Text style={styles.textStyle}>Close</Text>
                        </TouchableHighlight>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
