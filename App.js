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
      await getBasicDetails(result.assets[0].url);
      setIsViewerVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ImageBackground source={BG_IMAGE} style={styles.background} resizeMode="cover">
        <View style={styles.overlay}>
          <TouchableOpacity activeOpacity={0.8} style={styles.glassBtn} onPress={pickImages}>
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
                  <TouchableOpacity activeOpacity={0.7} style={styles.topBtn} onPress={() => setIsViewerVisible(false)}>
                    <Text style={styles.blueText}>✕ Close</Text>
                  </TouchableOpacity>
                  <TouchableOpacity activeOpacity={0.7} style={styles.topBtn} onPress={() => setShowInfo(!showInfo)}>
                    <Text style={styles.whiteText}>{currentIndex + 1}/{images.length} ⓘ Info</Text>
                  </TouchableOpacity>
                  <TouchableOpacity activeOpacity={0.7} style={styles.topBtn} onPress={() => setRotation(r => (r + 90) % 360)}>
                    <Text style={styles.blueText}>⟳ Rotate</Text>
                  </TouchableOpacity>
                </SafeAreaView>
              )
            )}
          />

          {showControls && !showInfo && (
            <View style={styles.footerContainer}>
              <TouchableOpacity 
                activeOpacity={0.85} 
                style={styles.shareBtn} 
                onPress={() => Sharing.shareAsync(images[currentIndex].url)}
              >
                <Text style={styles.shareText}>📤 Share Image</Text>
              </TouchableOpacity>
            </View>
          )}

          {showInfo && (
            <View style={styles.infoSheet}>
              <View style={styles.indicator} />
              <Text style={styles.infoTitle}>Image Properties</Text>
              <View style={styles.line} />
              
              <View style={styles.row}>
                <Text style={styles.label}>Resolution</Text>
                <Text style={styles.value}>{imageDetails.resolution}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>File Size</Text>
                <Text style={styles.value}>{imageDetails.size}</Text>
              </View>
              
              <TouchableOpacity activeOpacity={0.7} style={styles.hideBtn} onPress={() => setShowInfo(false)}>
                <Text style={styles.hideBtnText}>Hide Details</Text>
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
  overlay: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0,0,0,0.15)' 
  },
  glassBtn: { 
    backgroundColor: 'rgba(255,255,255,0.45)', 
    paddingVertical: 16, 
    paddingHorizontal: 32, 
    borderRadius: 30, 
    borderWidth: 1.5, 
    borderColor: 'white',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5
  },
  glassBtnText: { color: '#002855', fontWeight: '800', fontSize: 18, letterSpacing: 0.5 },
  header: { position: 'absolute', top: 45, width: '100%', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15, zIndex: 100 },
  topBtn: { backgroundColor: 'rgba(0,0,0,0.65)', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20 },
  blueText: { color: '#4dabf7', fontWeight: 'bold' },
  whiteText: { color: 'white', fontWeight: 'bold' },
  footerContainer: { position: 'absolute', bottom: 70, width: '100%', alignItems: 'center', zIndex: 100 },
  shareBtn: { 
    backgroundColor: 'white', 
    paddingVertical: 14, 
    paddingHorizontal: 50, 
    borderRadius: 30, 
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8
  },
  shareText: { color: '#111', fontWeight: '800', fontSize: 16 },
  infoSheet: { 
    position: 'absolute', 
    bottom: 0, 
    width: '100%', 
    backgroundColor: 'white', 
    padding: 24, 
    borderTopLeftRadius: 32, 
    borderTopRightRadius: 32, 
    zIndex: 200,
    elevation: 20
  },
  indicator: {
    width: 40,
    height: 5,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 15
  },
  infoTitle: { fontSize: 20, fontWeight: '800', color: '#111', marginBottom: 5 },
  line: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  label: { fontSize: 14, color: '#666', fontWeight: '500' },
  value: { fontSize: 14, color: '#111', fontWeight: '700' },
  hideBtn: { 
    marginTop: 10, 
    backgroundColor: '#1a1a1a', 
    padding: 16, 
    borderRadius: 16, 
    alignItems: 'center' 
  },
  hideBtnText: { color: 'white', fontWeight: '700', fontSize: 15 }
});
