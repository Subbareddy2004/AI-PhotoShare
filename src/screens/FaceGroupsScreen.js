import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Image, Dimensions, ActivityIndicator } from 'react-native';
import * as FaceDetector from 'expo-face-detector';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

const { width } = Dimensions.get('window');
const imageSize = (width - 40 - 10) / 2;

export default function FaceGroupsScreen({ route, navigation }) {
  const { processedImages } = route.params;
  const [loading, setLoading] = useState(true);
  const [faceGroups, setFaceGroups] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    processFaces();
  }, []);

  const extractFace = async (imageUri, bounds) => {
    try {
      const { origin, size } = bounds;
      const padding = Math.min(size.width, size.height) * 0.2; // 20% padding

      const manipResult = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          {
            crop: {
              originX: Math.max(0, origin.x - padding),
              originY: Math.max(0, origin.y - padding),
              width: Math.min(size.width + padding * 2),
              height: Math.min(size.height + padding * 2),
            },
          },
        ],
        { compress: 0.8, format: 'jpeg' }
      );

      return manipResult.uri;
    } catch (error) {
      console.error('Error extracting face:', error);
      return null;
    }
  };

  const processFaces = async () => {
    try {
      console.log('Starting face processing...');
      const groups = [];
      let personId = 1;

      for (const image of processedImages) {
        console.log('Processing image:', image.uri);
        
        // For each face in the image
        for (const face of image.faces) {
          // Extract the face region
          const faceImage = await extractFace(image.uri, face.bounds);
          if (!faceImage) continue;

          // Find if this face matches any existing group
          let matchFound = false;
          for (const group of groups) {
            // For now, we'll put all faces from the same image in the same group
            // In a real app, you'd use face recognition here
            if (group.sourceImage === image.uri) {
              group.photos.push({
                uri: image.uri,
                faceUri: faceImage,
                bounds: face.bounds
              });
              matchFound = true;
              break;
            }
          }

          // If no match found, create a new group
          if (!matchFound) {
            groups.push({
              id: personId++,
              name: `Person ${personId}`,
              sourceImage: image.uri,
              thumbnail: faceImage,
              photos: [{
                uri: image.uri,
                faceUri: faceImage,
                bounds: face.bounds
              }]
            });
          }
        }
      }

      console.log('Created groups:', groups.length);
      setFaceGroups(groups);
      setError(null);
    } catch (error) {
      console.error('Error in processFaces:', error);
      setError('Error processing faces. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const navigateToPersonPhotos = (group) => {
    navigation.navigate('PersonPhotos', {
      personName: group.name,
      photos: group.photos,
    });
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Grouping similar faces...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Found {faceGroups.length} People
      </Text>

      <FlatList
        data={faceGroups}
        numColumns={2}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.personContainer}
            onPress={() => navigateToPersonPhotos(item)}
          >
            <Image 
              source={{ uri: item.thumbnail }} 
              style={styles.faceImage}
              onError={(error) => console.error('Image loading error:', error.nativeEvent.error)}
            />
            <Text style={styles.personName}>{item.name}</Text>
            <View style={styles.photoCount}>
              <Text style={styles.photoCountText}>{item.photos.length}</Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No faces detected in photos</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  personContainer: {
    width: imageSize,
    height: imageSize + 40, // Extra space for name
    margin: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    overflow: 'hidden',
  },
  faceImage: {
    width: '100%',
    height: imageSize,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  personName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    padding: 8,
    textAlign: 'center',
  },
  photoCount: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 122, 255, 0.9)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoCountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: 200,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
