import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Modal, StatusBar, Platform, SafeAreaView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing'; 
import ImageViewer from 'react-native-image-zoom-viewer';
import * as NavigationBar from 'expo-navigation-bar';

export default function App() {
  const [images, setImages] = useState([]); 
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync('rgba(0,0,0,0)');
      NavigationBar.setButtonStyleAsync('light');
    }
  }, []);

  const pickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const formatted = result.assets.map(asset => ({ url: asset.uri }));
      setImages(formatted);
      // Directly show the viewer, skipping the "Ready to Proceed" modal
      setIsViewerVisible(true); 
    }
  };

  const handleShare = async (uri) => {
    if (uri) {
      await Sharing.shareAsync(uri);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      
      <View style={styles.center}>
        <TouchableOpacity style={styles.startBtn} onPress={pickImages}>
          <Text style={styles.startBtnText}>+ Select Images</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={isViewerVisible} transparent={true} onRequestClose={() => setIsViewerVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'black' }}>
          <ImageViewer 
            imageUrls={images} 
            onSwipeDown={() => setIsViewerVisible(false)}
            enableSwipeDown={true}
            onClick={() => setShowControls(!showControls)}
            renderHeader={() => (
              showControls && (
                <SafeAreaView style={styles.headerContainer}>
                  <TouchableOpacity style={styles.headerBtn} onPress={() => setIsViewerVisible(false)}>
                    <Text style={styles.headerBtnText}>✕ Back</Text>
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
                   <TouchableOpacity 
                    style={styles.minimalShareBtn} 
                    onPress={() => handleShare(images[index].url)}
                  >
                    {/* Keeps the transparent horizontal style you liked */}
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
  startBtn: { backgroundColor: '#007AFF', paddingVertical: 18, paddingHorizontal: 45, borderRadius: 30 },
  startBtnText: { color: 'white', fontWeight: 'bold', fontSize: 18 },

  headerContainer: { position: 'absolute', top: 40, left: 0, right: 0, zIndex: 100, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 },
  headerBtn: { backgroundColor: 'rgba(0,0,0,0.6)', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 12 },
  headerBtnText: { color: 'white', fontWeight: 'bold', fontSize: 13 },

  footerFix: { 
    position: 'absolute', 
    bottom: 80, 
    left: 20,
    alignItems: 'flex-start',
    zIndex: 999 
  },
  minimalShareBtn: { 
    backgroundColor: 'rgba(255, 255, 255, 0.08)', 
    paddingVertical: 12, 
    paddingHorizontal: 20, 
    borderRadius: 25, 
    borderWidth: 0.8, 
    borderColor: 'rgba(255, 255, 255, 0.2)',
    flexDirection: 'row',
    alignItems: 'center'
  },
  minimalShareText: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 14,
    flexWrap: 'nowrap'
  }
});
