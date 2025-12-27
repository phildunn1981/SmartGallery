import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, TouchableOpacity, Text, Modal, 
  StatusBar, Platform, SafeAreaView, Image, ImageBackground 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing'; 
import ImageViewer from 'react-native-image-zoom-viewer';
import * as NavigationBar from 'expo-navigation-bar';
import * as ScreenOrientation from 'expo-screen-orientation';

const BG_IMAGE = require('./assets/fuji.jpg');

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
          await NavigationBar.setBackgroundColorAsync('#ffffff');
          await NavigationBar.setButtonStyleAsync('dark');
        }
      } catch (e) { console.log("Orientation error:", e); }
    }
    initSettings();
  }, []);

  const pickImages = async () => {
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
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      
      <ImageBackground source={BG_IMAGE} style={styles.background} resizeMode="cover">
        <View style={styles.overlay}>
          <View style={styles.center}>
            
            {/* GLASSMORPHISM BUTTON */}
            <TouchableOpacity 
              activeOpacity={0.7} 
              style={styles.glassBtn} 
              onPress={pickImages}
            >
              <Text style={styles.glassBtnText}>+ Select Images</Text>
            </TouchableOpacity>

            {/* GLASSMORPHISM SUBTITLE */}
            <View style={styles.glassSubtitleContainer}>
              <Text style={styles.subtitleText}>Smart Gallery</Text>
            </View>

          </View>
        </View>
      </ImageBackground>

      <Modal 
        visible={isViewerVisible} 
        transparent={false} 
        animationType="none" 
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
                    <Text numberOfLines={1} style={styles.minimalShareText}>📤 Share This Image</Text>
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
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  background: { flex: 1, width: '100%', height: '100%' },
  overlay: { 
    flex: 1, 
    backgroundColor: 'rgba(255,255,255,0.05)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  center: { 
    alignItems: 'center',
    marginTop: '45%' 
  },
  
  // NEW GLASS STYLES
  glassBtn: { 
    backgroundColor: 'rgba(255, 255, 255, 0.4)', // Semi-transparent white
    paddingVertical: 18, 
    paddingHorizontal: 40, 
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)', // Bright border for "edge" effect
    backdropFilter: 'blur(10px)', // Note: Only works on Web/iOS with specific setups, so we use opacity for Android compatibility
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  glassBtnText: { 
    color: '#003366', // Deep blue text to contrast with the glass
    fontWeight: 'bold', 
    fontSize: 20, 
    letterSpacing: 0.5 
  },
  glassSubtitleContainer: {
    marginTop: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  subtitleText: { 
    color: '#444', 
    fontSize: 14, 
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 2
  },

  // VIEWER STYLES
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
    paddingVertical: 12, 
    paddingHorizontal: 22, 
    borderRadius: 25, 
    flexDirection: 'row', 
    alignItems: 'center',
    elevation: 3
  },
  minimalShareText: { color: '#000', fontWeight: 'bold', fontSize: 14 }
});
