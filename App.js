import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Modal, StatusBar, Platform, SafeAreaView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing'; 
import ImageViewer from 'react-native-image-zoom-viewer';
import * as NavigationBar from 'expo-navigation-bar';

let MultiShare;
try {
  MultiShare = require('react-native-share').default;
} catch (e) {
  MultiShare = null;
}

export default function App() {
  const [images, setImages] = useState([]); 
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const [isChoiceVisible, setIsChoiceVisible] = useState(false);
  const [showControls, setShowControls] = useState(true); // Track if buttons should show

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
      quality: 0.7,
    });

    if (!result.canceled && result.assets) {
      const formatted = result.assets.map(asset => ({ url: asset.uri }));
      setImages(formatted);
      setIsChoiceVisible(true); 
    }
  };

  const handleShare = async (uris) => {
    if (MultiShare && uris.length > 1) {
      try {
        await MultiShare.open({ urls: uris, failOnCancel: false });
      } catch (error) { console.log(error); }
    } else {
      await Sharing.shareAsync(uris[0]);
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

      <Modal visible={isChoiceVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.choiceBox}>
            <Text style={styles.choiceTitle}>Ready to proceed</Text>
            <TouchableOpacity style={styles.choiceBtnView} onPress={() => { setIsChoiceVisible(false); setIsViewerVisible(true); }}>
              <Text style={styles.choiceBtnText}>🖼️ View & Browse</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.choiceBtnShare} onPress={() => { setIsChoiceVisible(false); handleShare(images.map(img => img.url)); }}>
              <Text style={styles.shareBtnText}>📤 Share All ({images.length})</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{marginTop: 10}} onPress={() => setIsChoiceVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={isViewerVisible} transparent={true} onRequestClose={() => setIsViewerVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'black' }}>
          <ImageViewer 
            imageUrls={images} 
            onSwipeDown={() => setIsViewerVisible(false)}
            enableSwipeDown={true}
            onClick={() => setShowControls(!showControls)} // Toggles buttons on tap
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
                <View style={styles.footerOverlay}>
                  <TouchableOpacity 
                    style={styles.minimalShareBtn} 
                    onPress={() => handleShare([images[index].url])}
                  >
                    <Text style={styles.minimalShareText}>📤 Share</Text>
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
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  choiceBox: { backgroundColor: '#1E1E1E', width: '100%', padding: 30, borderTopLeftRadius: 30, borderTopRightRadius: 30, alignItems: 'center', paddingBottom: 50 },
  choiceTitle: { color: '#888', fontSize: 13, marginBottom: 20, textTransform: 'uppercase' },
  choiceBtnView: { backgroundColor: 'rgba(255, 255, 255, 0.1)', width: '100%', padding: 18, borderRadius: 15, marginBottom: 12, alignItems: 'center' },
  choiceBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
  choiceBtnShare: { backgroundColor: 'rgba(52, 199, 89, 0.35)', width: '100%', padding: 20, borderRadius: 15, marginBottom: 15, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(52, 199, 89, 0.5)' },
  shareBtnText: { color: '#ffffff', fontWeight: '900', fontSize: 18 },
  cancelText: { color: '#FF3B30', fontWeight: 'bold' },

  headerContainer: { position: 'absolute', top: 40, left: 0, right: 0, zIndex: 100, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 },
  headerBtn: { backgroundColor: 'rgba(0,0,0,0.4)', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 12 },
  headerBtnText: { color: 'white', fontWeight: 'bold', fontSize: 13 },

  footerOverlay: { position: 'absolute', bottom: 50, left: 20, width: '100%', zIndex: 100 },
  minimalShareBtn: { 
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Even more transparent white/glass look
    paddingVertical: 6, 
    paddingHorizontal: 14, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start'
  },
  minimalShareText: { color: 'white', fontWeight: '600', fontSize: 12 }
});
