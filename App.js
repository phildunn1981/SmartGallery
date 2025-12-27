import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, TouchableOpacity, Text, Modal, 
  StatusBar, Platform, SafeAreaView, Image, ImageBackground 
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

  useEffect(() => {
    async function init() {
      await ScreenOrientation.unlockAsync();
      if (Platform.OS === 'android') {
        await NavigationBar.setBackgroundColorAsync('#ffffff');
        await NavigationBar.setButtonStyleAsync('dark');
      }
      // Requesting the "Full Access" permission on startup
      await MediaLibrary.requestPermissionsAsync();
    }
    init();
  }, []);

  const fetchRealDetails = async (assetId, fallbackUri) => {
    try {
      // Accessing the REAL file data from the phone's database
      const assetInfo = await MediaLibrary.getAssetInfoAsync(assetId);
      
      Image.getSize(fallbackUri, (width, height) => {
        const mp = ((width * height) / 1000000).toFixed(1);
        
        setImageDetails({
          name: assetInfo.filename, // REAL FILENAME (e.g., IMG_1234.jpg)
          path: assetInfo.localUri || assetInfo.uri, // REAL STORAGE PATH
          resolution: `${width} * ${height} (${mp}MP)`,
          // REAL MODIFIED DATE from the original file metadata
          modified: new Date(assetInfo.modificationTime || assetInfo.creationTime).toLocaleString('en-GB') 
        });
      });
    } catch (e) {
      console.log("Error fetching real metadata:", e);
    }
  };

  const pickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      const formatted = result.assets.map(asset => ({ 
        url: asset.uri, 
        assetId: asset.assetId 
      }));
      setImages(formatted);
      setCurrentIndex(0);
      fetchRealDetails(result.assets[0].assetId, result.assets[0].uri);
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
          <TouchableOpacity style={styles.glassBtn} onPress={pickImages}>
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
            renderIndicator={() => null}
            onChange={(idx) => {
              setCurrentIndex(idx);
              setRotation(0);
              fetchRealDetails(images[idx].assetId, images[idx].url);
            }}
            renderImage={(props) => (
              <Image {...props} style={[props.style, { transform: [{ rotate: `${rotation}deg` }] }]} />
            )}
            renderHeader={() => (
              showControls && (
                <SafeAreaView style={styles.header}>
                  <TouchableOpacity style={styles.btn} onPress={() => setIsViewerVisible(false)}>
                    <Text style={styles.blueText}>✕ Close</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.btn} onPress={() => setShowInfo(!showInfo)}>
                    <Text style={styles.whiteText}>{currentIndex + 1}/{images.length} ⓘ Info</Text>
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
                    if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(images[currentIndex].url);
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
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.1)' },
  glassBtn: { backgroundColor: 'rgba(255,255,255,0.4)', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: 'white' },
  glassBtnText: { color: '#003366', fontWeight: 'bold', fontSize: 18 },
  header: { position: 'absolute', top: 40, width: '100%', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, zIndex: 100 },
  btn: { backgroundColor: 'rgba(0,0,0,0.6)', padding: 10, borderRadius: 12 },
  blueText: { color: '#4dabf7', fontWeight: 'bold' },
  whiteText: { color: 'white', fontWeight: 'bold' },
  footer: { position: 'absolute', bottom: 50, left: 20, zIndex: 100 },
  shareBtn: { backgroundColor: '#ffffff', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 25 },
  shareBtnText: { color: '#000', fontWeight: 'bold' },
  infoPanel: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: 'white', padding: 25, borderTopLeftRadius: 25, borderTopRightRadius: 25 },
  infoTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  infoText: { fontSize: 12, marginBottom: 6, color: '#333' },
  bold: { fontWeight: 'bold' },
  closeInfo: { marginTop: 15, backgroundColor: '#000', padding: 12, borderRadius: 12, alignItems: 'center' }
});
