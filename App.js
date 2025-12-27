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
  const [viewerKey, setViewerKey] = useState(0); // Forces fresh render to fix black screen

  useEffect(() => {
    async function init() {
      await ScreenOrientation.unlockAsync(); 
      if (Platform.OS === 'android') {
        await NavigationBar.setBackgroundColorAsync('#000000');
        await NavigationBar.setButtonStyleAsync('light');
      }
    }
    init();
  }, []);

  const pickImages = async () => {
    setIsViewerVisible(false); // Close first
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const formatted = result.assets.map(asset => ({ url: asset.uri }));
      setImages(formatted);
      setRotation(0);
      setViewerKey(prev => prev + 1); // Update key to reset viewer component
      setTimeout(() => setIsViewerVisible(true), 200); 
    }
  };

  const handleShare = async (uri) => {
    if (uri) await Sharing.shareAsync(uri);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" translucent={false} />
      <View style={styles.center}>
        <TouchableOpacity style={styles.startBtn} onPress={pickImages}>
          <Text style={styles.startBtnText}>+ Select Images</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={isViewerVisible} transparent={false} onRequestClose={() => setIsViewerVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'black' }}>
          <ImageViewer 
            key={viewerKey}
            imageUrls={images} 
            onSwipeDown={() => setIsViewerVisible(false)}
            enableSwipeDown={true}
            onClick={() => setShowControls(!showControls)}
            renderImage={(props) => (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Image source={{ uri: props.source.uri }} 
                  style={{ width: '100%', height: '100%', transform: [{ rotate: `${rotation}deg` }] }} 
                  resizeMode="contain" />
              </View>
            )}
            renderHeader={() => (
              showControls && (
                <SafeAreaView style={styles.headerContainer}>
                  <TouchableOpacity style={styles.headerBtn} onPress={() => setIsViewerVisible(false)}><Text style={styles.headerBtnText}>✕ Back</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.headerBtn} onPress={() => setRotation(r => (r+90)%360)}><Text style={styles.headerBtnText}>⟳ Rotate</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.headerBtn} onPress={pickImages}><Text style={styles.headerBtnText}>🔄 Pick New</Text></TouchableOpacity>
                </SafeAreaView>
              )
            )}
            renderFooter={(index) => (
              showControls && (
                <View style={styles.footerFix}>
                   <TouchableOpacity style={styles.minimalShareBtn} onPress={() => handleShare(images[index].url)}>
                    <Text numberOfLines={1} style={styles.minimalShareText}>📤 Share This One</Text>
                  </TouchableOpacity>
                </View>
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
  startBtn: { backgroundColor: '#007AFF', padding: 18, borderRadius: 30 },
  startBtnText: { color: 'white', fontWeight: 'bold' },
  headerContainer: { position: 'absolute', top: 50, left: 0, right: 0, zIndex: 100, flexDirection: 'row', justifyContent: 'space-evenly' },
  headerBtn: { backgroundColor: 'rgba(0,0,0,0.7)', padding: 10, borderRadius: 12 },
  headerBtnText: { color: 'white', fontSize: 13 },
  footerFix: { 
    position: 'absolute', 
    bottom: 110, // Higher bottom to avoid Android buttons
    left: 25, 
    zIndex: 999 
  },
  minimalShareBtn: { 
    backgroundColor: 'rgba(255, 255, 255, 0.15)', 
    paddingVertical: 12, 
    paddingHorizontal: 25, 
    borderRadius: 25, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.3)',
    flexDirection: 'row'
  },
  minimalShareText: { color: 'white', fontWeight: 'bold' }
});
