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
  const [viewerKey, setViewerKey] = useState(0); 

  useEffect(() => {
    async function init() {
      try {
        await ScreenOrientation.unlockAsync(); 
        if (Platform.OS === 'android') {
          await NavigationBar.setBackgroundColorAsync('#000000');
          await NavigationBar.setButtonStyleAsync('light');
        }
      } catch (e) { console.error(e); }
    }
    init();
  }, []);

  const pickImages = async () => {
    setIsViewerVisible(false); // Close viewer to clear memory
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const formatted = result.assets.map(asset => ({ url: asset.uri }));
      setImages(formatted);
      setRotation(0);
      setViewerKey(k => k + 1); // Refresh the component to fix black screen
      setTimeout(() => setIsViewerVisible(true), 200); 
    }
  };

  const handleShare = async (uri) => {
    if (uri) await Sharing.shareAsync(uri);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <View style={styles.center}>
        <TouchableOpacity style={styles.startBtn} onPress={pickImages}>
          <Text style={styles.startBtnText}>+ Select Images</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={isViewerVisible} transparent={false} animationType="fade">
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
                  <TouchableOpacity style={styles.headerBtn} onPress={() => setIsViewerVisible(false)}>
                    <Text style={styles.headerBtnText}>✕ Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.headerBtn} onPress={() => setRotation(r => (r+90)%360)}>
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
  startBtn: { backgroundColor: '#007AFF', paddingVertical: 20, paddingHorizontal: 50, borderRadius: 35 },
  startBtnText: { color: 'white', fontWeight: 'bold', fontSize: 18 },

  headerContainer: { position: 'absolute', top: 50, left: 0, right: 0, zIndex: 100, flexDirection: 'row', justifyContent: 'space-evenly' },
  headerBtn: { backgroundColor: 'rgba(0,0,0,0.8)', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 15 },
  headerBtnText: { color: 'white', fontWeight: 'bold', fontSize: 12 },

  footerFix: { 
    position: 'absolute', 
    bottom: 120, // INCREASED: Keeps button above Android's navigation bar
    left: 20, 
    zIndex: 999 
  },
  minimalShareBtn: { 
    backgroundColor: 'rgba(255, 255, 255, 0.15)', 
    height: 50, 
    paddingHorizontal: 30, 
    borderRadius: 25, 
    borderWidth: 1.2, 
    borderColor: 'rgba(255, 255, 255, 0.4)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  minimalShareText: { color: 'white', fontWeight: 'bold', fontSize: 15, flexWrap: 'nowrap' }
});
