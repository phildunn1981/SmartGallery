import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, Alert, StatusBar } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import ImageViewer from 'react-native-image-zoom-viewer';

export default function App() {
  const [photos, setPhotos] = useState([]);
  const [showViewer, setShowViewer] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Opens the phone gallery to pick multiple images
  const pickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      const formattedPhotos = result.assets.map(asset => ({ url: asset.uri }));
      setPhotos(formattedPhotos);
    }
  };

  // Shares the currently viewed photo with other apps
  const handleShare = async () => {
    if (photos.length > 0) {
      const currentPhoto = photos[currentIndex].url;
      await Sharing.shareAsync(currentPhoto);
    }
  };

  // Safe Delete: Removes photo from app list to avoid Android system errors
  const handleDelete = () => {
    Alert.alert("Remove Photo", "Remove this photo from the app view?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Remove", 
        style: "destructive", 
        onPress: () => {
          const newPhotos = [...photos];
          newPhotos.splice(currentIndex, 1);
          setPhotos(newPhotos);

          if (newPhotos.length === 0) {
            setShowViewer(false);
          } else if (currentIndex >= newPhotos.length) {
            setCurrentIndex(newPhotos.length - 1);
          }
        } 
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Smart Gallery</Text>
      </View>
      
      <View style={styles.center}>
        <TouchableOpacity style={styles.mainButton} onPress={pickImages}>
          <Text style={styles.buttonText}>+ SELECT PHOTOS</Text>
        </TouchableOpacity>
        
        {photos.length > 0 && (
          <View style={styles.statusBox}>
            <Text style={styles.statusText}>{photos.length} photos selected</Text>
            <TouchableOpacity 
              style={styles.viewBtn} 
              onPress={() => setShowViewer(true)}
            >
              <Text style={styles.viewBtnText}>VIEW LARGE PHOTOS</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Pro Zoom Viewer Modal */}
      <Modal visible={showViewer} transparent={true} animationType="fade">
        <ImageViewer 
          imageUrls={photos}
          index={currentIndex}
          onCancel={() => setShowViewer(false)}
          onChange={(index) => setCurrentIndex(index)}
          backgroundColor="white"
          renderHeader={() => (
            <View style={styles.viewerHeader}>
              <TouchableOpacity style={styles.backBtn} onPress={() => setShowViewer(false)}>
                <Text style={styles.backText}>← Back</Text>
              </TouchableOpacity>
              
              <View style={styles.rightIcons}>
                <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
                  <Text style={styles.iconText}>📤</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.iconBtn, {backgroundColor: '#ffe5e5'}]} onPress={handleDelete}>
                  <Text style={styles.iconText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          renderIndicator={(index, total) => (
            <View style={styles.indicatorContainer}>
              <Text style={styles.indicatorText}>{index} of {total}</Text>
            </View>
          )}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff', paddingTop: 40 },
  header: { height: 60, justifyContent: 'center', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  title: { fontSize: 20, fontWeight: '700', color: '#333' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  mainButton: { backgroundColor: '#28a745', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 30 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  statusBox: { alignItems: 'center', marginTop: 30 },
  statusText: { fontSize: 16, color: '#666', marginBottom: 15 },
  viewBtn: { backgroundColor: '#007AFF', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 15 },
  viewBtnText: { color: 'white', fontWeight: 'bold' },
  viewerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 50, paddingHorizontal: 20, zIndex: 99 },
  backBtn: { padding: 10, backgroundColor: '#f0f0f0', borderRadius: 20 },
  backText: { color: '#007AFF', fontWeight: 'bold' },
  rightIcons: { flexDirection: 'row' },
  iconBtn: { marginLeft: 10, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 20 },
  iconText: { fontSize: 18 },
  indicatorContainer: { position: 'absolute', bottom: 40, width: '100%', alignItems: 'center' },
  indicatorText: { color: '#333', fontWeight: 'bold', backgroundColor: '#f0f0f0', paddingVertical: 5, paddingHorizontal: 15, borderRadius: 12 }
});