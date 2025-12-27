import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, TouchableOpacity, Text, Modal, 
  StatusBar, Platform, SafeAreaView, Image, ImageBackground, ActivityIndicator 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [imageDetails, setImageDetails] = useState(null);
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        await ScreenOrientation.unlockAsync();
        if (Platform.OS === 'android') {
          await NavigationBar.setBackgroundColorAsync('#ffffff');
          await NavigationBar.setButtonStyleAsync('dark');
        }
        // Requesting Full Access to Media Library
        await MediaLibrary.requestPermissionsAsync();
      } catch (e) { console.log("Init Error:", e); }
    }
    init();
  }, []);

  const fetchRealDetails = async (assetId, fallbackUri) => {
    setIsLoadingInfo(true);
    try {
      // Deep Discovery Logic
      let assetInfo = null;
      if (assetId) {
        assetInfo = await MediaLibrary.getAssetInfoAsync(assetId);
      }

      // If the path looks like a 'Cache' path, try to find the real asset in the library
      if (!assetInfo || assetInfo.localUri?.includes('ImagePicker')) {
        const assets = await MediaLibrary.getAssetsAsync({ first: 50, mediaType: 'photo' });
        const realAsset = assets.assets.find(a => a.id === assetId || fallbackUri.includes(a.filename));
        if (realAsset) {
          assetInfo = await MediaLibrary.getAssetInfoAsync(realAsset.id);
        }
      }

      Image.getSize(fallbackUri, (width, height) => {
        const mp = ((width * height) / 1000000).toFixed(1);
        
        setImageDetails({
          // Real Filename from MediaStore
          name: assetInfo?.filename || fallbackUri.split('/').pop(),
          // Real Local Storage Path
          path: assetInfo?.localUri || assetInfo?.uri || "System Protected Path",
          resolution: `${width} * ${height} (${mp}MP)`,
          // Actual Original Date
          modified: assetInfo?.modificationTime 
            ? new Date(assetInfo.modificationTime).toLocaleString('en-GB') 
            : new Date().toLocaleString('en-GB')
        });
      });
    } catch (e) {
      console.log("Metadata Error:", e);
    } finally {
      setIsLoadingInfo(false);
    }
  };

  const pickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
      exif: true,
    });

    if (!result.canceled && result.assets) {
      const formatted = result.assets.map(asset => ({ 
        url: asset.uri, 
        assetId: asset.assetId 
      }));
      setImages(formatted);
      setCurrentIndex(0);
      setRotation(0);
      if (result.assets[0].assetId) {
        fetchRealDetails(result.assets[0].assetId, result.assets[0].uri);
      }
      setIsViewerVisible(true);
      setShowControls(true);
    }
  };

  const toggleControls = () => {
    setShowControls(!showControls);
    if (showInfo) setShowInfo(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      
      <ImageBackground source={BG_IMAGE} style={styles.background} resizeMode="cover">
        <View style={styles.overlay}>
          <TouchableOpacity activeOpacity={0.8} style={styles.glassBtn} onPress={pickImages}>
            <Text style={styles.glassBtnText}>+ Open Gallery</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>

      <Modal visible={isViewerVisible} transparent={false} animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'black' }}>
          <ImageViewer 
            imageUrls={images} 
            index={currentIndex}
            onSwipeDown={() => setIsViewerVisible(false)}
            enableSwipeDown={true}
            onClick={toggleControls}
            renderIndicator={() => null}
            onChange={(idx) => {
              setCurrentIndex(idx);
              setRotation(0);
              fetchRealDetails(images[idx].assetId, images[idx].url);
            }}
            renderImage={(props) => (
              <Image 
                {...props} 
                style={[props.style, { transform: [{ rotate: `${rotation}deg` }] }]} 
              />
            )}
            renderHeader={() => (
              showControls && (
                <SafeAreaView style={styles.header}>
                  <TouchableOpacity style={styles.topBtn} onPress={() => setIsViewerVisible(false)}>
                    <Text style={styles.blueText}>✕ Close</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.topBtn} onPress={() => setShowInfo(!showInfo)}>
                    <Text style={styles.whiteText}>
                      {currentIndex + 1}/{images.length} {isLoadingInfo ? '⌛' : 'ⓘ Info'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.topBtn} onPress={() => setRotation(r => (r + 90) % 360)}>
                    <Text style={styles.blueText}>⟳ Rotate</Text>
                  </TouchableOpacity>
                </SafeAreaView>
              )
            )}
            renderFooter={() => (
              showControls && (
                <View style={styles.footer}>
                  <TouchableOpacity style={styles.shareBtn} onPress={async () => {
                    if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(images[currentIndex].url);
                  }}>
                    <Text style={styles.shareText}>📤 Share Image</Text>
                  </TouchableOpacity>
                </View>
              )
            )}
          />

          {showInfo && imageDetails && (
            <View style={styles.infoSheet}>
              <Text style={styles.infoTitle}>Media Metadata</Text>
              <View style={styles.line} />
              
              <Text style={styles.detail}><Text style={styles.bold}>File Name:</Text> {imageDetails.name}</Text>
              <Text style={styles.detail}><Text style={styles.bold}>Storage Path:</Text> {imageDetails.path}</Text>
              <Text style={styles.detail}><Text style={styles.bold}>Resolution:</Text> {imageDetails.resolution}</Text>
              <Text style={styles.detail}><Text style={styles.bold}>Date Taken:</Text> {imageDetails.modified}</Text>
              
              <TouchableOpacity style={styles.hideBtn} onPress={() => setShowInfo(false)}>
                <Text style={styles.whiteText}>Close Details</Text>
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
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)' },
  glassBtn: { backgroundColor: 'rgba(255,255,255,0.4)', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 30, borderWidth: 1, borderColor: 'white' },
  glassBtnText: { color: '#002855', fontWeight: 'bold', fontSize: 18 },
  header: { position: 'absolute', top: 45, width: '100%', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15, zIndex: 100 },
  topBtn: { backgroundColor: 'rgba(0,0,0,0.7)', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 25 },
  blueText: { color: '#339af0', fontWeight: 'bold' },
  whiteText: { color: 'white', fontWeight: 'bold' },
  footer: { position: 'absolute', bottom: 50, width: '100%', alignItems: 'center', zIndex: 100 },
  shareBtn: { backgroundColor: 'white', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25, elevation: 10 },
  shareText: { color: 'black', fontWeight: 'bold' },
  infoSheet: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: 'white', padding: 25, borderTopLeftRadius: 25, borderTopRightRadius: 25, zIndex: 200 },
  infoTitle: { fontSize: 18, fontWeight: 'bold', color: '#111' },
  line: { height: 1, backgroundColor: '#eee', marginVertical: 12 },
  detail: { fontSize: 13, marginBottom: 8, color: '#333', lineHeight: 18 },
  bold: { fontWeight: 'bold', color: '#000' },
  hideBtn: { marginTop: 15, backgroundColor: '#222', padding: 15, borderRadius: 15, alignItems: 'center' }
});
