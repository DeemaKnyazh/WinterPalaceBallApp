import { StyleSheet, Text, View, Button } from "react-native";
import { useRouter, Stack } from "expo-router";
import Toast from 'react-native-toast-message';
import { useState, useEffect } from 'react';
import { apikey, apilist, apisign, wsurl } from "@env";

export default function Home() {

  const navigation = useRouter();

  //TODO - Send Device ID, Close any existing websockets with that ID

  return (

    <View style={styles.container}>
      <Stack.Screen
                options={{
                    title: 'Welcome',
                    headerStyle: { backgroundColor: '#f4511e' },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                }}
            />
      <Button style={styles.button}
        title="Scanner"
        onPress={() => navigation.push("/scanner")}
      />
      
      <Button style={styles.button}
        title="Guest List"
        onPress={() => navigation.push("/list")}
        />
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  modalName: {
    fontSize: 25,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    paddingBottom: 5
  },
  button: {
    borderRadius: 8,
    margin: 5,
    padding: 5,
    elevation: 2,
  },
});