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
        // Explicitly request Media Library permissions for "Full Access"
        await MediaLibrary.requestPermissionsAsync();
      } catch (e) { console.log("Init Error:", e); }
    }
    init();
  }, []);

  const fetchRealDetails = async (assetId, fallbackUri) => {
    setIsLoadingInfo(true);
    try {
      // Step 1: Query the phone's media database using the specific Asset ID
      const assetInfo = await MediaLibrary.getAssetInfoAsync(assetId);
      
      Image.getSize(fallbackUri, (width, height) => {
        const mp = ((width * height) / 1000000).toFixed(1);
        
        // Step 2: Extract original metadata
        setImageDetails({
          name: assetInfo.filename || fallbackUri.split('/').pop(),
          path: assetInfo.localUri || assetInfo.uri || "Internal Storage Path",
          resolution: `${width} * ${height} (${mp}MP)`,
          // Pulling original modification or creation time
          modified: new Date(assetInfo.modificationTime || assetInfo.creationTime || Date.now()).toLocaleString('en-GB')
        });
      });
    } catch (e) {
      console.log("Metadata Fetch Error:", e);
      // Fallback if the asset is not found in the local database (e.g. cloud only)
      setImageDetails({
        name: fallbackUri.split('/').pop(),
        path: "System Protected / Cloud Path",
        resolution: "Detecting...",
        modified: "Check Gallery App"
      });
    } finally {
      setIsLoadingInfo(false);
    }
  };

  const pickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
      exif: true, // Critical for capturing asset metadata
    });

    if (!result.canceled && result.assets) {
      const formatted = result.assets.map(asset => ({ 
        url: asset.uri, 
        assetId: asset.assetId 
      }));
      setImages(formatted);
      setCurrentIndex(0);
      setRotation(0);
      // Fetch details for the first selected image
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
            <Text style={styles.glassBtnText}>+ Select Images</Text>
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
            renderIndicator={() => null} // Hides the duplicate page counter
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
                  <TouchableOpacity style={styles.btn} onPress={() => setIsViewerVisible(false)}>
                    <Text style={styles.blueText}>✕ Close</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.btn} onPress={() => setShowInfo(!showInfo)}>
                    <Text style={styles.whiteText}>
                      {currentIndex + 1}/{images.length} {isLoadingInfo ? '⌛' : 'ⓘ Info'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.btn} onPress={() => setRotation(r => (r + 90) % 360)}>
                    <Text style={styles.blueText}>⟳ Rotate</Text>
                  </TouchableOpacity>
                </SafeAreaView>
              )
            )}
            renderFooter={() => (
              showControls && (
                <View style={styles.footer}>
                  <TouchableOpacity style={styles.shareBtn} onPress={async () => {
                    if (await Sharing.isAvailableAsync()) {
                        await Sharing.shareAsync(images[currentIndex].url);
                    }
                  }}>
                    <Text style={styles.shareBtnText}>📤 Share Image</Text>
                  </TouchableOpacity>
                </View>
              )
            )}
          />

          {showInfo && imageDetails && (
            <View style={styles.infoPanel}>
              <Text style={styles.infoTitle}>Original File Details</Text>
              <View style={styles.divider} />
              
              <Text style={styles.infoText}><Text style={styles.bold}>Real Name:</Text> {imageDetails.name}</Text>
              <Text style={styles.infoText}><Text style={styles.bold}>Real Path:</Text> {imageDetails.path}</Text>
              <Text style={styles.infoText}><Text style={styles.bold}>Resolution:</Text> {imageDetails.resolution}</Text>
              <Text style={styles.infoText}><Text style={styles.bold}>Date Taken:</Text> {imageDetails.modified}</Text>
              
              <TouchableOpacity style={styles.closeInfo} onPress={() => setShowInfo(false)}>
                <Text style={styles.whiteText}>Hide Details</Text>
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
  glassBtn: { backgroundColor: 'rgba(255,255,255,0.4)', paddingVertical: 18, paddingHorizontal: 35, borderRadius: 30, borderWidth: 1.5, borderColor: 'white' },
  glassBtnText: { color: '#003366', fontWeight: 'bold', fontSize: 20 },
  header: { position: 'absolute', top: 40, width: '100%', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, zIndex: 100 },
  btn: { backgroundColor: 'rgba(0,0,0,0.7)', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20 },
  blueText: { color: '#4dabf7', fontWeight: 'bold' },
  whiteText: { color: 'white', fontWeight: 'bold' },
  footer: { position: 'absolute', bottom: 50, left: 20, zIndex: 100 },
  shareBtn: { backgroundColor: '#ffffff', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 25, elevation: 5 },
  shareBtnText: { color: '#000', fontWeight: 'bold' },
  infoPanel: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: 'white', padding: 30, borderTopLeftRadius: 30, borderTopRightRadius: 30, zIndex: 200 },
  infoTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 5, color: '#222' },
  divider: { height: 1, backgroundColor: '#eee', marginBottom: 15 },
  infoText: { fontSize: 13, marginBottom: 8, color: '#444', lineHeight: 18 },
  bold: { fontWeight: 'bold', color: '#000' },
  closeInfo: { marginTop: 20, backgroundColor: '#1A73E8', padding: 15, borderRadius: 15, alignItems: 'center' }
});
