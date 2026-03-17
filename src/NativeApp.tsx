import { StyleSheet, View, SafeAreaView, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';

// The URL of your web app. 
// For testing locally, use your computer's IP address (e.g., http://192.168.x.x:5173)
// For the final online version, use your Netlify URL.
const WEB_URL = 'https://sqd-split.netlify.app'; 

export default function NativeApp() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0b0b0b" />
      <View style={styles.webViewContainer}>
        <WebView 
          source={{ uri: WEB_URL }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0b0b',
  },
  webViewContainer: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: '#0b0b0b',
  },
});
