import { StyleSheet, Text, View, Button } from "react-native";
import { useRouter, stack } from "expo-router";
import Toast from 'react-native-toast-message';

export default function Home() {
  const navigation = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.modalName}>Welcome!</Text>
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