import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Modal, StatusBar, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Share from 'react-native-share'; // New library for multi-share
import ImageViewer from 'react-native-image-zoom-viewer';
import * as NavigationBar from 'expo-navigation-bar';

export default function App() {
  const [images, setImages] = useState([]); 
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const [isChoiceVisible, setIsChoiceVisible] = useState(false);

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
    try {
      const shareOptions = {
        urls: uris, // This allows multiple images at once!
        failOnCancel: false,
      };
      await Share.open(shareOptions);
    } catch (error) {
      console.log('Error sharing:', error);
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
            <Text style={styles.choiceTitle}>{images.length} Images Selected</Text>
            
            <TouchableOpacity style={styles.choiceBtnView} onPress={() => { setIsChoiceVisible(false); setIsViewerVisible(true); }}>
              <Text style={styles.choiceBtnText}>🖼️ View & Browse (Done)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.choiceBtnShare} onPress={() => { setIsChoiceVisible(false); handleShare(images.map(img => img.url)); }}>
              <Text style={styles.shareBtnText}>📤 Share All Immediately</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsChoiceVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={isViewerVisible} transparent={true}>
        <View style={{ flex: 1, backgroundColor: 'black' }}>
          <ImageViewer 
            imageUrls={images} 
            onSwipeDown={() => setIsViewerVisible(false)}
            enableSwipeDown={true}
            renderFooter={(index) => (
              <View style={styles.footer}>
                <TouchableOpacity style={styles.ghostShare} onPress={() => handleShare([images[index].url])}>
                  <Text style={{color:'white', fontWeight:'800'}}>📤 Share Single</Text>
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
  container: { flex: 1, backgroundColor: '#121212' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  startBtn: { backgroundColor: '#007AFF', paddingVertical: 18, paddingHorizontal: 45, borderRadius: 30 },
  startBtnText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  choiceBox: { backgroundColor: '#1E1E1E', width: '100%', padding: 30, borderTopLeftRadius: 30, borderTopRightRadius: 30, alignItems: 'center' },
  choiceTitle: { color: '#888', fontSize: 14, marginBottom: 20 },
  choiceBtnView: { backgroundColor: '#333', width: '100%', padding: 18, borderRadius: 15, marginBottom: 12, alignItems: 'center' },
  choiceBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
  choiceBtnShare: { backgroundColor: '#34C759', width: '100%', padding: 18, borderRadius: 15, marginBottom: 20, alignItems: 'center' },
  shareBtnText: { color: 'white', fontWeight: '900', fontSize: 17 },
  cancelText: { color: '#FF3B30', fontWeight: 'bold' },
  footer: { width: '100%', alignItems: 'center', paddingBottom: 100 },
  ghostShare: { backgroundColor: 'rgba(52, 199, 89, 0.2)', paddingVertical: 10, paddingHorizontal: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(52, 199, 89, 0.4)' }
});
