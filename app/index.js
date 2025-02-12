import { StyleSheet, Text, View, Button, Image, TouchableOpacity } from "react-native";
import { useRouter, Stack } from "expo-router";
import Toast from 'react-native-toast-message';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function Home() {
  const [ws, setWs] = useState(new WebSocket(process.env.wsurl));
  const [wsClient, setWsClient] = useState('None');

  const navigation = useRouter();

  //TODO - Send Device ID, Close any existing websockets with that ID

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
          title: 'Welcome',
          headerStyle: { backgroundColor: 'white' },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <View style={styles.imageContainer}>
        <Image source={require('../assets/images/WPBLogo.png')} style={styles.stretch} />
      </View>

      <View style={styles.container}>
        <TouchableOpacity style={styles.buttons}
          onPress={() => navigation.push({
            pathname: "/scanner",
            params:{
              WSObject: ws,
              WSClient: wsClient
            }
          })}>
          <Text style={styles.buttonText}>Scanners</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttons}
          onPress={() => navigation.push("/list")}
        >
          <Text style={styles.buttonText}>Guest List</Text>
        </TouchableOpacity>
      </View>
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "space-evenly",
    width: '100%',
    height: '30%'
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "space-evenly",
    width: '100%',
    height: '70%'
  },
  modalName: {
    fontSize: 25,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    paddingBottom: 5
  },
  buttons: {
    borderRadius: 8,
    margin: 5,
    padding: 5,
    elevation: 2,
    backgroundColor: 'black',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)'
  },
  buttonText: {
    fontSize: 20,
    color: 'white',
    margin: 10,
    fontWeight: 'bold'
  },
  stretch: {
    width: '100%',
    height: '30%'
  }
});