import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Modal, StatusBar, Platform, SafeAreaView, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing'; 
import ImageViewer from 'react-native-image-zoom-viewer';
import * as NavigationBar from 'expo-navigation-bar';
import * as ScreenOrientation from 'expo-screen-orientation';

export default function App() {
  const [images, setImages] = useState([]); 
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [rotation, setRotation] = useState(0); 

  useEffect(() => {
    async function initSettings() {
      try {
        await ScreenOrientation.unlockAsync(); 
        if (Platform.OS === 'android') {
          await NavigationBar.setBackgroundColorAsync('#000000');
          await NavigationBar.setButtonStyleAsync('light');
        }
      } catch (e) { console.log("Orientation error:", e); }
    }
    initSettings();
  }, []);

  const pickImages = async () => {
    // We reset visibility so the viewer component remounts with new data
    setIsViewerVisible(false);

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const formatted = result.assets.map(asset => ({ url: asset.uri }));
      setImages(formatted);
      setRotation(0); 
      // SPEED FIX: Reduced delay to 10ms for near-instant transition
      setTimeout(() => setIsViewerVisible(true), 10); 
    }
  };

  const handleManualRotate = () => {
    setRotation((prev) => (prev + 90) % 360); 
  };

  const handleShare = async (uri) => {
    if (uri) {
      await Sharing.shareAsync(uri);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" translucent={false} />
      
      <View style={styles.center}>
        <TouchableOpacity style={styles.startBtn} onPress={pickImages}>
          <Text style={styles.startBtnText}>+ Select Images</Text>
        </TouchableOpacity>
      </View>

      <Modal 
        visible={isViewerVisible} 
        transparent={false} 
        animationType="none" // SPEED FIX: Instant appearance without sliding/fading
        onRequestClose={() => setIsViewerVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'black' }}>
          <ImageViewer 
            imageUrls={images} 
            onSwipeDown={() => setIsViewerVisible(false)}
            enableSwipeDown={true}
            onClick={() => setShowControls(!showControls)}
            renderImage={(props) => (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Image 
                  source={{ uri: props.source.uri }} 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    transform: [{ rotate: `${rotation}deg` }] 
                  }} 
                  resizeMode="contain"
                />
              </View>
            )}
            renderHeader={() => (
              showControls && (
                <SafeAreaView style={styles.headerContainer}>
                  <TouchableOpacity style={styles.headerBtn} onPress={() => setIsViewerVisible(false)}>
                    <Text style={styles.headerBtnText}>✕ Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.headerBtn} onPress={handleManualRotate}>
                    <Text style={styles.headerBtnText}>⟳ Rotate</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.headerBtn} onPress={pickImages}>
                    <Text style={styles.headerBtnText}>🔄 Pick New</Text>
                  </TouchableOpacity>
                </SafeAreaView>
              )
            )}
            renderFooter={(index) => (
              showControls && (
                <SafeAreaView style={styles.footerFix}>
                   <TouchableOpacity 
                    style={styles.minimalShareBtn} 
                    onPress={() => handleShare(images[index].url)}
                  >
                    <Text numberOfLines={1} style={styles.minimalShareText}>📤 Share This One</Text>
                  </TouchableOpacity>
                </SafeAreaView>
              )
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  startBtn: { backgroundColor: '#007AFF', paddingVertical: 18, paddingHorizontal: 45, borderRadius: 30 },
  startBtnText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  headerContainer: { position: 'absolute', top: 40, left: 0, right: 0, zIndex: 100, flexDirection: 'row', justifyContent: 'space-evenly', paddingHorizontal: 10 },
  headerBtn: { backgroundColor: 'rgba(0,0,0,0.6)', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12 },
  headerBtnText: { color: 'white', fontWeight: 'bold', fontSize: 13 },
  footerFix: { 
    position: 'absolute', 
    bottom: Platform.OS === 'android' ? 100 : 80, 
    left: 20, 
    zIndex: 999 
  },
  minimalShareBtn: { 
    backgroundColor: 'rgba(255, 255, 255, 0.15)', 
    paddingVertical: 12, 
    paddingHorizontal: 22, 
    borderRadius: 25, 
    borderWidth: 1, 
    borderColor: 'rgba(255, 255, 255, 0.3)', 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  minimalShareText: { color: 'white', fontWeight: 'bold', fontSize: 14 }
});
