import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Image, 
  Modal, 
  Dimensions, 
  StatusBar,
  ActivityIndicator 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import ImageViewer from 'react-native-image-zoom-viewer';

export default function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isViewerVisible, setIsViewerVisible] = useState(false);

  // Function to pick image from phone gallery
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  // Function to share the current image
  const shareImage = async () => {
    if (selectedImage) {
      await Sharing.shareAsync(selectedImage);
    }
  };

  // Prepare images for the Zoom Viewer
  const images = selectedImage ? [{ url: selectedImage }] : [];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <Text style={styles.title}>Smart Gallery</Text>

      <View style={styles.imageContainer}>
        {selectedImage ? (
          <TouchableOpacity onPress={() => setIsViewerVisible(true)}>
            <Image source={{ uri: selectedImage }} style={styles.previewImage} />
            <Text style={styles.hintText}>Tap to zoom</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>No image selected</Text>
          </View>
        )}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>Open Gallery</Text>
        </TouchableOpacity>

        {selectedImage && (
          <TouchableOpacity style={[styles.button, styles.shareButton]} onPress={shareImage}>
            <Text style={styles.buttonText}>Share</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Full-screen Zoom Modal */}
      <Modal visible={isViewerVisible} transparent={true} onRequestClose={() => setIsViewerVisible(false)}>
        <ImageViewer 
          imageUrls={images} 
          enableSwipeDown={true}
          onSwipeDown={() => setIsViewerVisible(false)}
          loadingRender={() => <ActivityIndicator color="white" size="large" />}
          renderHeader={() => (
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setIsViewerVisible(false)}
            >
              <Text style={styles.closeButtonText}>✕ Close</Text>
            </TouchableOpacity>
          )}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  imageContainer: {
    width: '100%',
    height: 400,
    backgroundColor: '#e0e0e0',
    borderRadius: 15,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  previewImage: {
    width: Dimensions.get('window').width - 40,
    height: 400,
    resizeMode: 'contain',
  },
  placeholder: {
    alignItems: 'center',
  },
  placeholderText: {
    color: '#888',
    fontSize: 16,
  },
  hintText: {
    textAlign: 'center',
    marginTop: 10,
    color: '#666',
    fontSize: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 30,
    gap: 15,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  shareButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 99,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
