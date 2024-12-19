import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Image, Dimensions, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FaceDetector from 'expo-face-detector';

const { width } = Dimensions.get('window');
const imageSize = (width - 40 - 10) / 3;

export default function HomeScreen({ navigation }) {
  const [images, setImages] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const pickImages = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        alert('Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (!result.canceled) {
        console.log('Selected images:', result.assets.length);
        setImages(result.assets);
        setError(null);
      }
    } catch (error) {
      console.error('Error picking images:', error);
      setError('Error selecting images. Please try again.');
    }
  };

  const detectFaces = async (imageUri) => {
    try {
      console.log('Detecting faces in:', imageUri);
      const options = {
        mode: FaceDetector.FaceDetectorMode.fast,
        detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
        runClassifications: FaceDetector.FaceDetectorClassifications.none,
        minDetectionInterval: 0,
        tracking: false,
      };

      const result = await FaceDetector.detectFacesAsync(imageUri, options);
      console.log('Faces found:', result.faces.length);
      return result.faces;
    } catch (error) {
      console.error('Error detecting faces:', error);
      return [];
    }
  };

  const processImages = async () => {
    if (images.length === 0) {
      alert('Please select some images first');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      console.log('Processing images...');
      const processedImages = [];
      let totalFaces = 0;

      for (const image of images) {
        console.log('Processing image:', image.uri);
        const faces = await detectFaces(image.uri);
        
        if (faces.length > 0) {
          processedImages.push({
            ...image,
            faces,
          });
          totalFaces += faces.length;
        }
      }

      console.log('Total faces found:', totalFaces);
      console.log('Images with faces:', processedImages.length);

      if (processedImages.length === 0) {
        setError('No faces found in selected images. Please try different photos.');
        return;
      }

      navigation.navigate('FaceGroups', { 
        processedImages,
        totalImages: processedImages.length
      });
    } catch (error) {
      console.error('Error processing images:', error);
      setError('Error processing images. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Photos with People</Text>
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      <FlatList
        data={images}
        numColumns={3}
        renderItem={({ item }) => (
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: item.uri }} 
              style={styles.image}
              onError={(error) => console.error('Image loading error:', error.nativeEvent.error)}
            />
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No images selected{'\n'}
            Tap the button below to select photos
          </Text>
        }
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={pickImages}
          disabled={processing}
        >
          <Text style={styles.buttonText}>Add Photos</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, (images.length === 0 || processing) && styles.buttonDisabled]} 
          onPress={processImages}
          disabled={processing || images.length === 0}
        >
          {processing ? (
            <View style={styles.processingContainer}>
              <ActivityIndicator color="#fff" />
              <Text style={[styles.buttonText, styles.processingText]}>
                Finding People...
              </Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>
              Find People ({images.length} photos)
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
  errorText: {
    color: 'red',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
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
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
    lineHeight: 24,
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
