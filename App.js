import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, TouchableOpacity, Text, Modal, 
  StatusBar, Platform, SafeAreaView, Image, ImageBackground, BackHandler 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing'; 
import ImageViewer from 'react-native-image-zoom-viewer';
import * as NavigationBar from 'expo-navigation-bar';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as FileSystem from 'expo-file-system';

const BG_IMAGE = require('./assets/fuji.jpg');

export default function App() {
  const [images, setImages] = useState([]); 
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [rotation, setRotation] = useState(0); 
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [imageDetails, setImageDetails] = useState({ size: '...', resolution: '...' });

  // Handle Android Back Button
  useEffect(() => {
    const backAction = () => {
      if (isViewerVisible) {
        setIsViewerVisible(false);
        setShowInfo(false);
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, [isViewerVisible]);

  useEffect(() => {
    async function init() {
      await ScreenOrientation.unlockAsync();
      if (Platform.OS === 'android') {
        await NavigationBar.setBackgroundColorAsync('#ffffff');
        await NavigationBar.setButtonStyleAsync('dark');
      }
    }
    init();
  }, []);

  const getBasicDetails = async (uri) => {
    if (!uri) return;
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      const sizeMB = (fileInfo.size / (1024 * 1024)).toFixed(2);
      Image.getSize(uri, (width, height) => {
        const mp = ((width * height) / 1000000).toFixed(1);
        setImageDetails({ size: `${sizeMB} MB`, resolution: `${width} × ${height} (${mp}MP)` });
      });
    } catch (e) { console.log(e); }
  };

  const pickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });
    if (!result.canceled && result.assets) {
      const formatted = result.assets.map(asset => ({ url: asset.uri }));
      setImages(formatted);
      setCurrentIndex(0);
      setRotation(0);
      setShowInfo(false);
      await getBasicDetails(result.assets[0].uri);
      setIsViewerVisible(true);
    }
  };

  // Shared function for Lens and General Sharing
  const handleShare = async () => {
    const currentImage = images[currentIndex].url;
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(currentImage);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ImageBackground source={BG_IMAGE} style={styles.background} resizeMode="cover">
        <View style={styles.overlay}>
          <TouchableOpacity activeOpacity={0.7} style={styles.glassBtn} onPress={pickImages}>
            <Text style={styles.glassBtnText}>+ Open Gallery</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>

      <Modal visible={isViewerVisible} transparent={false} animationType="fade" onRequestClose={() => setIsViewerVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'black' }}>
          <ImageViewer 
            imageUrls={images} 
            index={currentIndex}
            onSwipeDown={() => setIsViewerVisible(false)}
            enableSwipeDown
            onClick={() => { setShowControls(!showControls); if (showInfo) setShowInfo(false); }}
            renderIndicator={() => null}
            onChange={(idx) => {
              setCurrentIndex(idx);
              setRotation(0);
              getBasicDetails(images[idx].url);
            }}
            renderImage={(props) => (
              <Image {...props} style={[props.style, { transform: [{ rotate: `${rotation}deg` }] }]} />
            )}
            renderHeader={() => (
              showControls && (
                <SafeAreaView style={styles.header}>
                  <TouchableOpacity style={styles.topBtn} onPress={() => setIsViewerVisible(false)}>
                    <Text style={styles.blueText}>✕ Close</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.topBtn} onPress={() => setShowInfo(!showInfo)}>
                    <Text style={styles.whiteText}>{currentIndex + 1}/{images.length} ⓘ Info</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.topBtn} onPress={() => setRotation(r => (r + 90) % 360)}>
                    <Text style={styles.blueText}>⟳ Rotate</Text>
                  </TouchableOpacity>
                </SafeAreaView>
              )
            )}
          />

          {/* MAIN SHARE BUTTON (For WhatsApp, Lens, Facebook, etc.) */}
          {showControls && !showInfo && (
            <View style={styles.footerContainer}>
              <TouchableOpacity activeOpacity={0.8} style={styles.shareBtn} onPress={handleShare}>
                <Text style={styles.shareText}>📤 Share / Search Image</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* INFO PANEL */}
          {showInfo && (
            <View style={styles.infoSheet}>
              <Text style={styles.infoTitle}>Image Properties</Text>
              <View style={styles.line} />
              <Text style={styles.detail}><Text style={styles.bold}>Resolution:</Text> {imageDetails.resolution}</Text>
              <Text style={styles.detail}><Text style={styles.bold}>File Size:</Text> {imageDetails.size}</Text>
              
              {/* GOOGLE LENS SHORTCUT */}
              <TouchableOpacity style={styles.lensBtn} onPress={handleShare}>
                <Text style={styles.lensBtnText}>🔍 Search with Google Lens</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.hideBtn} onPress={() => setShowInfo(false)}>
                <Text style={styles.whiteText}>Hide Info</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1 },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.1)' },
  glassBtn: { backgroundColor: 'rgba(255,255,255,0.4)', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 30, borderWidth: 1, borderColor: 'white' },
  glassBtnText: { color: '#002855', fontWeight: 'bold', fontSize: 18 },
  header: { position: 'absolute', top: 45, width: '100%', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15, zIndex: 100 },
  topBtn: { backgroundColor: 'rgba(0,0,0,0.7)', padding: 10, borderRadius: 20 },
  blueText: { color: '#339af0', fontWeight: 'bold' },
  whiteText: { color: 'white', fontWeight: 'bold' },
  footerContainer: { position: 'absolute', bottom: 70, width: '100%', alignItems: 'center', zIndex: 100 },
  shareBtn: { backgroundColor: 'white', paddingVertical: 14, paddingHorizontal: 40, borderRadius: 30, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 },
  shareText: { color: 'black', fontWeight: 'bold', fontSize: 16 },
  infoSheet: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: 'white', padding: 30, borderTopLeftRadius: 30, borderTopRightRadius: 30, zIndex: 200 },
  infoTitle: { fontSize: 18, fontWeight: 'bold', color: '#111' },
  line: { height: 1, backgroundColor: '#eee', marginVertical: 15 },
  detail: { fontSize: 15, marginBottom: 10, color: '#333' },
  bold: { fontWeight: 'bold', color: '#000' },
  lensBtn: { backgroundColor: '#4285F4', padding: 15, borderRadius: 15, alignItems: 'center', marginBottom: 10 },
  lensBtnText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  hideBtn: { backgroundColor: '#222', padding: 15, borderRadius: 15, alignItems: 'center' }
});
