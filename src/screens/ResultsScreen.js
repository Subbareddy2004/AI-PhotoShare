import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Image, Dimensions, ActivityIndicator } from 'react-native';
import * as Sharing from 'expo-sharing';

const { width } = Dimensions.get('window');
const imageSize = (width - 40 - 10) / 2;

export default function ResultsScreen({ route, navigation }) {
  const { processedImages, totalImages } = route.params;
  const [selectedImages, setSelectedImages] = useState([]);
  const [sharing, setSharing] = useState(false);

  const toggleImageSelection = (image) => {
    if (selectedImages.includes(image.uri)) {
      setSelectedImages(selectedImages.filter(uri => uri !== image.uri));
    } else {
      setSelectedImages([...selectedImages, image.uri]);
    }
  };

  const shareSelectedPhotos = async () => {
    if (selectedImages.length === 0) {
      alert('Please select photos to share');
      return;
    }

    setSharing(true);
    try {
      await Sharing.shareAsync(selectedImages[0]);
    } catch (error) {
      console.error('Error sharing photos:', error);
      alert('Error sharing photos');
    }
    setSharing(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {totalImages} Photos Selected
      </Text>

      <FlatList
        data={processedImages}
        numColumns={2}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.imageContainer,
              selectedImages.includes(item.uri) && styles.selectedImage,
            ]}
            onPress={() => toggleImageSelection(item)}
          >
            <Image source={{ uri: item.uri }} style={styles.image} />
            {selectedImages.includes(item.uri) && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => index.toString()}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, selectedImages.length === 0 && styles.buttonDisabled]} 
          onPress={shareSelectedPhotos}
          disabled={sharing || selectedImages.length === 0}
        >
          {sharing ? (
            <View style={styles.processingContainer}>
              <ActivityIndicator color="#fff" />
              <Text style={[styles.buttonText, styles.processingText]}>
                Sharing...
              </Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>
              Share Selected ({selectedImages.length} photos)
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  imageContainer: {
    width: imageSize,
    height: imageSize,
    margin: 5,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  selectedImage: {
    borderWidth: 3,
    borderColor: '#007AFF',
  },
  checkmark: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#007AFF',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginTop: 20,
    gap: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  processingText: {
    marginLeft: 8,
  },
});
