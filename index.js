import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';
import App from './src/App';
import NativeApp from './src/NativeApp';

// If running in a native environment (iOS/Android), use the WebView wrapper
// If running in a web environment (Vite/Netlify), use the original React App
if (Platform.OS === 'web') {
  registerRootComponent(App);
} else {
  registerRootComponent(NativeApp);
}
