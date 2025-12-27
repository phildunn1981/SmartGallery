import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, TouchableOpacity, Text, Modal, 
  StatusBar, Platform, SafeAreaView, Image, ImageBackground 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing'; 
import ImageViewer from 'react-native-image-zoom-viewer';
import * as FileSystem from 'expo-file-system'; // Added for image details
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
      } catch (e) { console.log("Orientation error:", e); }
    }
    initSettings();
  }, []);

  // Function to get file details (size, name, etc.)
  const fetchImageDetails = async (uri) => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (fileInfo.exists) {
        const name = uri.split('/').pop();
        const sizeMB = (fileInfo.size / (1024 * 1024)).toFixed(2);
        const sizeKB = (fileInfo.size / 1024).toFixed(2);
        
        setImageDetails({
          name: name,
          size: fileInfo.size > 1024 * 1024 ? `${sizeMB} MB` : `${sizeKB} KB`,
          extension: name.split('.').pop().toUpperCase(),
          path: uri
        });
      }
    } catch (error) {
      console.log("Error fetching details:", error);
    }
  };

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
      setCurrentIndex(0);
      fetchImageDetails(result.assets[0].uri);
      setTimeout(() => setIsViewerVisible(true), 10); 
    }
  };

  const handleManualRotate = () => {
    setRotation((prev) => (prev + 90) % 360); 
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      
      <ImageBackground source={BG_IMAGE} style={styles.background} resizeMode="cover">
        <View style={styles.overlay}>
          <View style={styles.center}>
            <TouchableOpacity activeOpacity={0.7} style={styles.glassBtn} onPress={pickImages}>
              <Text style={styles.glassBtnText}>+ Select Images</Text>
            </TouchableOpacity>
            <View style={styles.glassSubtitleContainer}>
              <Text style={styles.subtitleText}>Smart Gallery</Text>
            </View>
          </View>
        </View>
      </ImageBackground>

      <Modal 
        visible={isViewerVisible} 
        transparent={false} 
        animationType="fade" 
        onRequestClose={() => setIsViewerVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'black' }}>
          <ImageViewer 
            imageUrls={images} 
            index={currentIndex}
            onSwipeDown={() => setIsViewerVisible(false)}
            enableSwipeDown={true}
            onChange={(index) => {
              setCurrentIndex(index);
              fetchImageDetails(images[index].url);
            }}
            onClick={() => {
              setShowControls(!showControls);
              if(showInfo) setShowInfo(false);
            }}
            renderHeader={() => (
              showControls && (
                <SafeAreaView style={styles.headerContainer}>
                  <TouchableOpacity style={styles.headerBtn} onPress={() => setIsViewerVisible(false)}>
                    <Text style={styles.headerBtnText}>✕ Close</Text>
                  </TouchableOpacity>
                  
                  {/* NEW INFO BUTTON */}
                  <TouchableOpacity style={styles.headerBtn} onPress={() => setShowInfo(!showInfo)}>
                    <Text style={[styles.headerBtnText, {color: '#4dabf7'}]}>ⓘ Info</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.headerBtn} onPress={handleManualRotate}>
                    <Text style={styles.headerBtnText}>⟳ Rotate</Text>
                  </TouchableOpacity>
                </SafeAreaView>
              )
            )}
          />

          {/* IMAGE INFO PANEL (GLASS EFFECT) */}
          {showInfo && imageDetails && (
            <View style={styles.infoPanel}>
              <Text style={styles.infoTitle}>Image Details</Text>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Name:</Text><Text style={styles.infoValue}>{imageDetails.name}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Size:</Text><Text style={styles.infoValue}>{imageDetails.size}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Type:</Text><Text style={styles.infoValue}>{imageDetails.extension}</Text></View>
              <TouchableOpacity style={styles.closeInfoBtn} onPress={() => setShowInfo(false)}>
                <Text style={styles.closeInfoText}>Hide Details</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  background: { flex: 1, width: '100%', height: '100%' },
  overlay: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  center: { alignItems: 'center', marginTop: '45%' },
  glassBtn: { backgroundColor: 'rgba(255, 255, 255, 0.4)', paddingVertical: 18, paddingHorizontal: 40, borderRadius: 20, borderWidth: 1.5, borderColor: 'rgba(255, 255, 255, 0.6)' },
  glassBtnText: { color: '#003366', fontWeight: 'bold', fontSize: 20 },
  glassSubtitleContainer: { marginTop: 20, backgroundColor: 'rgba(0, 0, 0, 0.05)', paddingHorizontal: 20, paddingVertical: 5, borderRadius: 30 },
  subtitleText: { color: '#444', fontSize: 14, fontWeight: '600', letterSpacing: 2 },
  
  // VIEWER HEADER
  headerContainer: { position: 'absolute', top: 40, left: 0, right: 0, zIndex: 100, flexDirection: 'row', justifyContent: 'space-evenly' },
  headerBtn: { backgroundColor: 'rgba(255,255,255,0.15)', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  headerBtnText: { color: 'white', fontWeight: 'bold', fontSize: 14 },

  // INFO PANEL
  infoPanel: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 25,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 20,
  },
  infoTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#000' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, borderBottomWidth: 0.5, borderBottomColor: '#eee', paddingBottom: 5 },
  infoLabel: { color: '#666', fontWeight: '600' },
  infoValue: { color: '#000', flex: 1, textAlign: 'right', marginLeft: 10 },
  closeInfoBtn: { marginTop: 15, backgroundColor: '#000', padding: 12, borderRadius: 15, alignItems: 'center' },
  closeInfoText: { color: '#fff', fontWeight: 'bold' }
});
