import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, TouchableOpacity, Text, 
  Modal, ActivityIndicator, StatusBar, Platform 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import ImageViewer from 'react-native-image-zoom-viewer';
import * as NavigationBar from 'expo-navigation-bar';

export default function App() {
  const [images, setImages] = useState([]); 
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync('rgba(0,0,0,0)');
      NavigationBar.setButtonStyleAsync('light');
    }
    // Automatically trigger picker on first launch
    pickImages();
  }, []);

  const pickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8, // Slightly higher quality for better viewing
    });

    if (!result.canceled && result.assets) {
      const formatted = result.assets.map(asset => ({ url: asset.uri }));
      setImages(formatted);
      setCurrentIndex(0);
      setIsViewerVisible(true); // JUMP DIRECTLY TO THIRD STEP
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      
      {/* Background Action Button (if they close the viewer) */}
      <View style={styles.centerContent}>
        <TouchableOpacity style={styles.mainBtn} onPress={pickImages}>
          <Text style={styles.btnText}>Open Gallery</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={isViewerVisible} transparent={true} onRequestClose={() => setIsViewerVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'black' }}>
          <ImageViewer 
            imageUrls={images} 
            index={currentIndex}
            onSwipeDown={() => setIsViewerVisible(false)}
            enableSwipeDown={true}
            onChange={(index) => setCurrentIndex(index)}
            renderHeader={() => (
              <View style={styles.header}>
                <TouchableOpacity style={styles.ghostBtn} onPress={() => setIsViewerVisible(false)}>
                  <Text style={styles.tinyText}>✕ Close</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.ghostBtn} onPress={pickImages}>
                  <Text style={styles.tinyText}>🔄 New Selection</Text>
                </TouchableOpacity>
              </View>
            )}
            renderFooter={() => (
              <View style={styles.footer}>
                <TouchableOpacity 
                  style={styles.shareBtn} 
                  onPress={() => Sharing.shareAsync(images[currentIndex].url)}
                >
                  <Text style={styles.shareText}>📤 Share Image</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  mainBtn: { backgroundColor: '#007AFF', padding: 20, borderRadius: 30 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  header: { 
    position: 'absolute', top: 50, left: 0, right: 0, zIndex: 10,
    flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 
  },
  footer: { width: '100%', alignItems: 'center', paddingBottom: 100 },
  ghostBtn: { backgroundColor: 'rgba(255,255,255,0.15)', padding: 10, borderRadius: 12 },
  shareBtn: { backgroundColor: 'rgba(52, 199, 89, 0.25)', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(52, 199, 89, 0.4)' },
  tinyText: { color: 'white', fontSize: 12, fontWeight: '600' },
  shareText: { color: 'white', fontSize: 14, fontWeight: '800' }
});
