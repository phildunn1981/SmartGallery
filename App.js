import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, Image, 
  Modal, ActivityIndicator, StatusBar, SafeAreaView,
  Dimensions, FlatList, Platform 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import ImageViewer from 'react-native-image-zoom-viewer';
import * as NavigationBar from 'expo-navigation-bar';

const { width } = Dimensions.get('window');
const THUMB_SIZE = (width - 40) / 3; 

export default function App() {
  const [selectedImages, setSelectedImages] = useState([]); 
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 1. Force the Android Navigation Bar to be transparent
  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync('rgba(0,0,0,0)'); // Fully transparent
      NavigationBar.setButtonStyleAsync('light'); // Makes home/back icons white
    }
  }, []);

  const pickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.6,
    });

    if (!result.canceled && result.assets) {
      const formattedImages = result.assets.map(asset => ({
        url: asset.uri,
        freeHeight: true 
      }));
      setSelectedImages(formattedImages);
    }
  };

  const shareCurrentImage = async () => {
    if (selectedImages.length > 0) {
      await Sharing.shareAsync(selectedImages[currentIndex].url);
    }
  };

  return (
    <View style={styles.fullScreenContainer}>
      {/* 2. Transparent Top Status Bar */}
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Smart Gallery</Text>

        <View style={styles.gridContainer}>
          {selectedImages.length > 0 ? (
            <FlatList
              data={selectedImages}
              numColumns={3}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <TouchableOpacity onPress={() => { setCurrentIndex(index); setIsViewerVisible(true); }}>
                  <Image source={{ uri: item.url }} style={styles.thumbnail} />
                </TouchableOpacity>
              )}
            />
          ) : (
            <TouchableOpacity style={styles.placeholder} onPress={pickImages}>
              <Text style={styles.placeholderText}>+ Tap to Select Images</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.mainActions}>
          <TouchableOpacity style={styles.ghostBlueBtn} onPress={pickImages}>
            <Text style={styles.tinyBtnText}>Change Selection</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* 3. Enlarged Photo Viewer */}
      <Modal visible={isViewerVisible} transparent={true} onRequestClose={() => setIsViewerVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'black' }}>
          <ImageViewer 
            imageUrls={selectedImages} 
            index={currentIndex}
            onChange={(idx) => setCurrentIndex(idx)}
            enableSwipeDown={true}
            onSwipeDown={() => setIsViewerVisible(false)}
            loadingRender={() => <ActivityIndicator color="white" />}
            
            renderHeader={() => (
              <SafeAreaView style={styles.header}>
                <TouchableOpacity style={styles.ghostDarkBtn} onPress={() => setIsViewerVisible(false)}>
                  <Text style={styles.tinyBtnText}>✕ Back</Text>
                </TouchableOpacity>
              </SafeAreaView>
            )}

            renderFooter={() => (
              <View style={styles.footer}>
                <TouchableOpacity style={styles.ghostGreenBtn} onPress={shareCurrentImage}>
                  <Text style={styles.shareBtnText}>📤 Share</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: { flex: 1, backgroundColor: '#121212' }, // Dark background for better transparency blending
  container: { flex: 1, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '800', marginTop: 40, marginBottom: 15, color: '#fff' },
  gridContainer: { flex: 1, width: '100%', paddingHorizontal: 10 },
  thumbnail: { width: THUMB_SIZE - 10, height: THUMB_SIZE - 10, borderRadius: 8, margin: 5 },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#333', borderRadius: 15, margin: 10 },
  placeholderText: { color: '#888' },
  mainActions: { paddingBottom: 80, paddingTop: 10 },
  tinyBtnText: { color: '#ffffff', fontSize: 13, fontWeight: 'bold' },
  shareBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '800' },
  ghostBlueBtn: {
    backgroundColor: 'rgba(0, 122, 255, 0.3)', 
    paddingVertical: 8, 
    paddingHorizontal: 20, 
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  ghostGreenBtn: { 
    backgroundColor: 'rgba(52, 199, 89, 0.2)', // Tiny and very see-through
    paddingVertical: 6, 
    paddingHorizontal: 18, 
    borderRadius: 15,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.3)'
  },
  ghostDarkBtn: { 
    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
    paddingVertical: 6, 
    paddingHorizontal: 12, 
    borderRadius: 15 
  },
  header: { position: 'absolute', top: 10, left: 15, zIndex: 10 },
  footer: { 
    width: '100%', 
    alignItems: 'center', 
    paddingBottom: 100 // Set to 100 as you requested
  } 
});
