import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, TouchableOpacity, Text, Modal, 
  StatusBar, Platform, SafeAreaView, Image, ImageBackground 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing'; 
import ImageViewer from 'react-native-image-zoom-viewer';
import * as FileSystem from 'expo-file-system'; 
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
    async function initSettings() {
      try {
        await ScreenOrientation.unlockAsync(); 
        if (Platform.OS === 'android') {
          await NavigationBar.setBackgroundColorAsync('#ffffff');
          await NavigationBar.setButtonStyleAsync('dark');
        }
      } catch (e) { console.log("Init error:", e); }
    }
    initSettings();
  }, []);

  const fetchImageDetails = async (uri) => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      // Calculating Resolution and Megapixels
      Image.getSize(uri, (width, height) => {
        const name = uri.split('/').pop();
        const megapixels = ((width * height) / 1000000).toFixed(1);
        
        setImageDetails({
          name: name,
          size: fileInfo.size > 1024 * 1024 
            ? `${(fileInfo.size / (1024 * 1024)).toFixed(2)} MB` 
            : `${(fileInfo.size / 1024).toFixed(0)} KB`,
          path: uri,
          resolution: `${width} * ${height} (${megapixels}MP)`,
          modified: new Date(fileInfo.modificationTime * 1000).toLocaleString('en-GB')
        });
      });
    } catch (e) { console.log("Info error:", e); }
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
      setRotation(0); 
      setCurrentIndex(0);
      fetchImageDetails(result.assets[0].uri);
      setIsViewerVisible(true);
    }
  };

  const handleShare = async () => {
    const currentUri = images[currentIndex]?.url;
    if (currentUri && await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(currentUri);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      
      <ImageBackground source={BG_IMAGE} style={styles.background} resizeMode="cover">
        <View style={styles.overlay}>
          <TouchableOpacity activeOpacity={0.7} style={styles.glassBtn} onPress={pickImages}>
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
            onChange={(idx) => {
              setCurrentIndex(idx);
              fetchImageDetails(images[idx].url);
            }}
            renderHeader={() => (
              <SafeAreaView style={styles.header}>
                <TouchableOpacity style={styles.btn} onPress={() => setIsViewerVisible(false)}>
                  <Text style={styles.blueText}>✕ Close</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btn} onPress={() => setShowInfo(!showInfo)}>
                  <Text style={styles.whiteText}>{currentIndex + 1}/{images.length} ⓘ Info</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btn} onPress={() => setRotation((r) => (r + 90) % 360)}>
                  <Text style={styles.blueText}>⟳ Rotate</Text>
                </TouchableOpacity>
              </SafeAreaView>
            )}
            renderFooter={() => (
              <SafeAreaView style={styles.footer}>
                <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
                  <Text style={styles.shareBtnText}>📤 Share Image</Text>
                </TouchableOpacity>
              </SafeAreaView>
            )}
          />

          {showInfo && imageDetails && (
            <View style={styles.infoPanel}>
              <Text style={styles.infoText}><Text style={styles.bold}>Name:</Text> {imageDetails.name}</Text>
              <Text style={styles.infoText}><Text style={styles.bold}>Size:</Text> {imageDetails.size}</Text>
              <Text style={styles.infoText}><Text style={styles.bold}>Path:</Text> {imageDetails.path}</Text>
              <Text style={styles.infoText}><Text style={styles.bold}>Resolution:</Text> {imageDetails.resolution}</Text>
              <Text style={styles.infoText}><Text style={styles.bold}>Last Modified:</Text> {imageDetails.modified}</Text>
              <TouchableOpacity style={styles.closeInfo} onPress={() => setShowInfo(false)}>
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
  glassBtn: { backgroundColor: 'rgba(255,255,255,0.4)', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: 'white' },
  glassBtnText: { color: '#003366', fontWeight: 'bold', fontSize: 18 },
  header: { position: 'absolute', top: 40, width: '100%', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, zIndex: 10 },
  btn: { backgroundColor: 'rgba(0,0,0,0.6)', padding: 10, borderRadius: 12 },
  blueText: { color: '#4dabf7', fontWeight: 'bold' },
  whiteText: { color: 'white', fontWeight: 'bold' },
  footer: { position: 'absolute', bottom: 50, left: 20, zIndex: 10 },
  shareBtn: { backgroundColor: 'white', padding: 12, borderRadius: 25, paddingHorizontal: 20 },
  shareBtnText: { color: 'black', fontWeight: 'bold' },
  infoPanel: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: 'rgba(255,255,255,0.95)', padding: 25, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  infoText: { fontSize: 13, marginBottom: 5, color: '#333' },
  bold: { fontWeight: 'bold' },
  closeInfo: { marginTop: 15, backgroundColor: '#000', padding: 12, borderRadius: 10, alignItems: 'center' }
});
