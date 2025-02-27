import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faArrowDownAZ, width } from '@fortawesome/free-solid-svg-icons/faArrowDownAZ'
import { faArrowDownZA } from '@fortawesome/free-solid-svg-icons/faArrowDownZA'
import { faArrowDown19 } from '@fortawesome/free-solid-svg-icons/faArrowDown19'
import { faXmark } from '@fortawesome/free-solid-svg-icons/faXmark'
import { Stack, useLocalSearchParams, useNavigation, usePathname, useRouter } from "expo-router";
import * as SQLite from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect, useCallback, memo, useContext, useRef } from "react";
import { Text, View, Button, Modal, TouchableHighlight, FlatList, TouchableOpacity, SafeAreaView, TextInput, Pressable } from "react-native";
import styles from "./style";
import { Picker } from '@react-native-picker/picker';
import Constants from 'expo-constants';
import { WebSocketContext } from './WsContext'

let names = [];
let wsClient;

let activeJobType = "None";
let activeStatusType = "None";
let textSearch = ""

export default function List() {
    const db = SQLite.openDatabaseAsync("WPB.db");

    const [isLoading, setIsLoading] = useState(false);
    // const [names, setNames] = useState([]);
    const [displayNames, setDisplayNames] = useState([]);
    const [currentTable, setCurrentTable] = useState(undefined);
    // const [activeJobType, setActiveJobType] = useState("None");
    // const [activeStatusType, setActiveStatusType] = useState("None");
    const [modalVisible, setModalVisible] = useState(false);
    const [modalPerson, setModalPerson] = useState([]);
    const [order, setOrder] = useState("aalph");
    // const [text, onChangeText] = useState('');
    const url = process.env.apilist;
    const url2 = process.env.apisign;

    // eslint-disable-next-line no-undef

    //ws.close();
    const [subscribe, unsubscribe] = useContext(WebSocketContext)

    useEffect(() => {
        const channelName = "lists"
        subscribe(channelName, (message) => {
            if (message.startsWith("client:")) {
                wsClient = message.replace("client:", "")
            }
            if (message.startsWith("status ")) {
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

    const setNamesDb = (namesIn) => {
        names = namesIn
        setDisplayNames(namesIn);
    }

    if (isLoading) {
        return (
            <View style={styles.container}>
                <Text>Loading names</Text>
            </View>
        );
    }

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
            let existingNames = [...names]
            const indexToUpdate = existingNames.findIndex(name => name.id == id);
            existingNames[indexToUpdate].sign = existingNames[indexToUpdate].sign === 1 ? 0 : 1;
            names = existingNames
            updateDisplayName(activeJobType, activeStatusType, textSearch);
        }
        if (src == "int") {
            fetch(url2 + "/" + id, {
                method: "post",
                headers: new Headers({
                    Authorization: process.env.apikey,
                    Client: wsClient,
                }),
                body: JSON.stringify({ session: Constants.sessionId })
            })
                .then((responseData) => {
                    let existingNames = [...names]
                    const indexToUpdate = existingNames.findIndex(
                        (name) => name.id == id,
                    );
                    existingNames[indexToUpdate].sign = status === 1 ? 0 : 1;
                    names = existingNames
                    updateDisplayName(activeJobType, activeStatusType, textSearch);
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
        if (textIn !== "" && textIn !== null && textIn !== undefined) {
            textSearch = textIn;
            // onChangeText(textIn);
            var tempNames = names;
            var existingNames = tempNames.filter((tempNames) => tempNames.name.toLowerCase().includes(textIn.toLowerCase()));
        } else if (textIn === null) {
            textIn = text;
            var tempNames = names;
            var existingNames = tempNames.filter((tempNames) => tempNames.name.toLowerCase().includes(textIn.toLowerCase()));
        } else {
            textSearch = textIn;
            // onChangeText(textIn);
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
                <Pressable
                    style={({pressed}) => [styles.button, {backgroundColor: pressed ? "black" : "white",
                         width: "50%", height: "65%", marginTop: 10, opacity: 0.9 }]}
                    onPress={() => {
                        openSettingsModal(item);
                    }}
                >
                    {({pressed}) => <Text style={[styles.textStyle, { marginTop: -2, color: pressed ? "white" : "", opacity: 1 }]}>Info</Text>}
                </Pressable>
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
            setOrder("aalph")
            const existingNames = names.sort((a, b) => a.id - b.id);
            names = existingNames
            // setNames(existingNames);
            updateDisplayName(activeJobType, activeStatusType, textSearch);
        } else if (order === "aalph") {
            setOrder("zalph")
            const existingNames = names.sort((a, b) => b.name.localeCompare(a.name));
            names = existingNames
            // setNames(existingNames);
            updateDisplayName(activeJobType, activeStatusType, textSearch);
        } else {
            setOrder("num")
            const existingNames = names.sort((a, b) => a.name.localeCompare(b.name));
            names = existingNames
            // setNames(existingNames);
            updateDisplayName(activeJobType, activeStatusType, textSearch);
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
        activeJobType = "None"
        activeStatusType = "None"
        textSearch = ""
        // setActiveJobType("None")
        // setActiveStatusType("None")
        // onChangeText('')
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
                        value={textSearch}
                        onChangeText={textSearch => updateDisplayName(activeJobType, activeStatusType, textSearch)}
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
                <View style={{ flex: 3, minHeight: 50 }}>
                    <Text style={styles.title}>Filter Table</Text>
                    <Picker
                        selectedValue={activeJobType}
                        prompt='Fiter Table'
                        onValueChange={(itemValue, itemIndex) => {
                            activeJobType = itemValue
                            // setActiveJobType(itemValue)
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
                <View style={{ flex: 3, minHeight: 50 }}>
                    <Text style={styles.title}>Filter Status</Text>
                    <Picker
                        selectedValue={activeStatusType}
                        prompt='Filter Status'
                        onValueChange={(itemValue, itemIndex) => {
                            activeStatusType = itemValue
                            // setActiveStatusType(itemValue)
                            updateDisplayName(activeJobType, itemValue, textSearch)
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
            <View style={[styles.rowEntryHeader, { height: "5%", marginLeft: 5, minHeight: "5%" }]}>
                <Text style={{ fontSize: 15 }}>
                    People Here: {displayNames.filter((name) => name.sign === 1).length} / {displayNames.length}
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
                            activeJobType = modalPerson.tables;
                            // setActiveJobType(modalPerson.tables);
                            updateDisplayName(modalPerson.tables, activeStatusType, textSearch);
                            setModalVisible(!modalVisible);
                        }} >
                            <Text style={styles.modalText}>Table: {modalPerson.tables}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            activeStatusType = modalPerson.sign;
                            // setActiveStatusType(modalPerson.sign);
                            tempStat = modalPerson.sign == 1 ? 1 : 0;
                            updateDisplayName(activeJobType, tempStat, textSearch);
                            setModalVisible(!modalVisible);
                        }} >
                            <Text style={styles.modalText}>
                                Status: {modalPerson.sign == 1 ? "Here" : "Not Here"}{" "}
                            </Text>
                        </TouchableOpacity>

                        <Text style={styles.modalText}>ID: {modalPerson.ticket} </Text>
                        <Text style={styles.modalText}>Raffle: {modalPerson.raffle} </Text>

                        <Pressable
                            style={({pressed}) => [styles.buttonBig, {backgroundColor: pressed ? "black" : "white"}]}
                            onPress={() => {
                                switchStatuss(modalPerson.id, modalPerson.sign, "int");
                            }}>
                            {({pressed}) => <Text style={[styles.textStyle, { color: pressed ? "white" : "black", fontSize: 20 }]}>{modalPerson.sign == 1 ? "Sign Out" : "Sign In"}</Text>}
                        </Pressable>

                        {/* <Button title="Delete" onPress={() => {deleteName(modalPerson.id)}} /> */}
                        <Pressable
                            style={({pressed}) => [styles.button, {backgroundColor: pressed ? "black" : "white"}]}
                            onPress={() => {
                                setModalVisible(!modalVisible);
                            }}
                        >
                            {({pressed}) => <Text style={[styles.textStyle, { color: pressed ? "white" : "black" }]}>Close</Text>}
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
