import { Stack } from "expo-router";
// import * as SplashScreen from "expo-splash-screen";
import { WebSocketProvider } from './WsContext';

// SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  // Ensure any route can link back to `/`
  initialRouteName: "index",
};

const Layout = () => {
  return (
    <WebSocketProvider>
      <Stack initialRouteName="index">
        <Stack.Screen name="index" />
      </Stack>
    </WebSocketProvider>
  )
};

export default Layout;