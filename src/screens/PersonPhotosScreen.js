import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Image, Dimensions, Share } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const { width } = Dimensions.get('window');
const imageSize = (width - 40 - 10) / 2;

export default function PersonPhotosScreen({ route, navigation }) {
  const { personName, photos } = route.params;
  const [selectedPhotos, setSelectedPhotos] = useState(new Set());

  const togglePhotoSelection = (photo) => {
    const newSelection = new Set(selectedPhotos);
    if (newSelection.has(photo.uri)) {
      newSelection.delete(photo.uri);
    } else {
      newSelection.add(photo.uri);
    }
    setSelectedPhotos(newSelection);
  };

  const sharePhotos = async () => {
    try {
      const photosToShare = photos.filter(photo => selectedPhotos.has(photo.uri));
      
      if (photosToShare.length === 0) {
        alert('Please select photos to share');
        return;
      }

      // Share the selected photos
      const shareResult = await Share.share({
        message: `Photos of ${personName}`,
        urls: photosToShare.map(photo => photo.uri)
      });

      if (shareResult.action === Share.sharedAction) {
        console.log('Shared successfully');
      }
    } catch (error) {
      console.error('Error sharing photos:', error);
      alert('Error sharing photos');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{personName}</Text>
        <Text style={styles.subtitle}>
          {photos.length} Photo{photos.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={photos}
        numColumns={2}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.photoContainer,
              selectedPhotos.has(item.uri) && styles.selectedPhoto
            ]}
            onPress={() => togglePhotoSelection(item)}
          >
            <Image 
              source={{ uri: item.uri }} 
              style={styles.photo}
              onError={(error) => console.error('Image loading error:', error.nativeEvent.error)}
            />
            {selectedPhotos.has(item.uri) && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No photos available</Text>
        }
      />

      {selectedPhotos.size > 0 && (
        <TouchableOpacity 
          style={styles.shareButton} 
          onPress={sharePhotos}
        >
          <Text style={styles.shareButtonText}>
            Share {selectedPhotos.size} Photo{selectedPhotos.size !== 1 ? 's' : ''}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  photoContainer: {
    width: imageSize,
    height: imageSize,
    margin: 10,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  selectedPhoto: {
    borderWidth: 3,
    borderColor: '#007AFF',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  shareButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
});
