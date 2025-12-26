import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, TouchableOpacity, Text, 
  Modal, StatusBar, Platform 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import ImageViewer from 'react-native-image-zoom-viewer';
import * as NavigationBar from 'expo-navigation-bar';

export default function App() {
  const [images, setImages] = useState([]); 
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const [isChoiceVisible, setIsChoiceVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

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
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const formatted = result.assets.map(asset => ({ url: asset.uri }));
      setImages(formatted);
      setIsChoiceVisible(true);
    }
  };

  const handleChoice = async (action) => {
    setIsChoiceVisible(false);
    if (action === 'view') {
      setIsViewerVisible(true);
    } else {
      // Direct share of the first image picked
      if (images.length > 0) {
        await Sharing.shareAsync(images[0].url);
      }
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

      {/* QUICK CHOICE MODAL */}
      <Modal visible={isChoiceVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.choiceBox}>
            <Text style={styles.choiceTitle}>Images Selected ({images.length})</Text>
            
            <TouchableOpacity style={styles.choiceBtnView} onPress={() => handleChoice('view')}>
              <Text style={styles.choiceBtnText}>🖼️ View & Browse (Done)</Text>
            </TouchableOpacity>

            {/* NEW HIGH-CONTRAST GREEN BUTTON */}
            <TouchableOpacity style={styles.choiceBtnShare} onPress={() => handleChoice('share')}>
              <Text style={styles.shareBtnText}>📤 Share Immediately</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsChoiceVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* VIEWER MODAL */}
      <Modal visible={isViewerVisible} transparent={true} onRequestClose={() => setIsViewerVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'black' }}>
          <ImageViewer 
            imageUrls={images} 
            index={currentIndex}
            onSwipeDown={() => setIsViewerVisible(false)}
            enableSwipeDown={true}
            onChange={(index) => setCurrentIndex(index)}
            renderFooter={() => (
              <View style={styles.footer}>
                <TouchableOpacity style={styles.ghostShare} onPress={() => Sharing.shareAsync(images[currentIndex].url)}>
                  <Text style={styles.viewerShareText}>📤 Share This Photo</Text>
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
  choiceTitle: { color: '#888', fontSize: 14, fontWeight: '600', marginBottom: 20, textTransform: 'uppercase' },
  
  choiceBtnView: { backgroundColor: '#333', width: '100%', padding: 18, borderRadius: 15, marginBottom: 12, alignItems: 'center' },
  choiceBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
  
  // THE NEW GREEN SHARE BUTTON
  choiceBtnShare: { backgroundColor: '#34C759', width: '100%', padding: 18, borderRadius: 15, marginBottom: 20, alignItems: 'center', shadowColor: '#34C759', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  shareBtnText: { color: 'white', fontWeight: '900', fontSize: 17 },
  
  cancelBtn: { padding: 10 },
  cancelText: { color: '#FF3B30', fontWeight: 'bold' },

  footer: { width: '100%', alignItems: 'center', paddingBottom: 100 },
  ghostShare: { backgroundColor: 'rgba(52, 199, 89, 0.2)', paddingVertical: 10, paddingHorizontal: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(52, 199, 89, 0.4)' },
  viewerShareText: { color: 'white', fontWeight: '800', fontSize: 14 }
});
