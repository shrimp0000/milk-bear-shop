import React, { useState } from 'react';
import axios from 'axios';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { handleEditName, handleEditPrice, handleEditDescription, handleEditOptionQuantities } from '@/apis/edit_item_apis';
import * as ImagePicker from 'expo-image-picker';
import Config from '@/constants/config';

export default function EditItemScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  const itemId = route.params.item_id || '';
  const initialName = route.params.item_name || '';
  const initialPrice = route.params.item_price || '';
  const initialDescription = route.params.item_description || '';
  const initialOptions = route.params.item_options || [];

  const [oldImages, setOldImages] = useState<string[]>(route.params.item_images || []);
  const [deletedImages, setDeletedImages] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [imageResult, setImageResult] = useState<ImagePicker.ImagePickerResult | null>(null);

  const [item, setItem] = useState({
    name: initialName,
    price: initialPrice,
    description: initialDescription,
    options: initialOptions,
  });

  const handleSave = async () => {
    if (!item.name || !item.price || !item.description) {
      Alert.alert('Please fill in all fields');
      return;
    }
    if (item.options.some((option) => !option.quantity)) {
      Alert.alert('Please fill in all option quantities');
      return;
    }
    const image_urls = [...oldImages, ...images];
    if (image_urls.length === 0) {
      Alert.alert('Please have at least one image for the item');
      return;
    }
    try {
      await Promise.all([
        handleEditName(itemId, initialName, item.name),
        handleEditPrice(itemId, initialPrice, item.price),
        handleEditDescription(itemId, initialDescription, item.description),
        handleEditOptionQuantities(itemId, item.options),
        handleDeleteImages(deletedImages),
      ]);
      const uploadedImages = await uploadImage();
      const response = await axios.post(`${Config.API_URL}/api/update_item_images`, {
        id: itemId,
        image_urls: [...oldImages, ...uploadedImages],
      }, {
        withCredentials: true,
      });
      if (response.data.status === 'success') {
        Alert.alert('Item saved successfully!',
          '',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
        setItem({
          name: '',
          price: '',
          description: '',
          options: [],
        });
        setOldImages([]);
        setDeletedImages([]);
        setImages([]);
        setImageResult(null);
      } else {
        Alert.alert('Failed to save changes');
      }
    } catch (error) {
      Alert.alert('Failed to save changes');
    }
  };

  const handleChange = (index: number, field: string, value: string) => {
    const updatedOptions = [...item.options];
    updatedOptions[index] = {
      ...updatedOptions[index],
      [field]: value,
    };
    setItem({
      ...item,
      options: updatedOptions,
    });
  };

  const handleDeleteImages = async (deletedImages: string[]) => {
    if (deletedImages.length === 0) {
      return;
    }
    try {
      const response = await axios.delete(`${Config.API_URL}/api/delete_image`, { 
        data: { image_urls: deletedImages },
      });
    } catch (error) {
      console.error('Error deleting images:', error);
    }
  }

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      const imageUris = result.assets.map(asset => asset.uri);
      setImages(imageUris);
      setImageResult(result);
    }
  };

  const formDataFromImagePicker = (result: ImagePicker.ImagePickerSuccessResult) => {
    const formData = new FormData();
  
    for (const index in result.assets) {
      const asset = result.assets[index];
  
      formData.append(`photo.${index}`, {
        uri: asset.uri,
        name: asset.fileName ?? asset.uri.split("/").pop(),
        type: asset.mimeType,
      });
  
      if (asset.exif) {
        formData.append(`exif.${index}`, JSON.stringify(asset.exif));
      }
    }
  
    return formData;
  }

  const uploadImage = async () => {
    if (!imageResult) {
      return [];
    }
    const formData = formDataFromImagePicker(imageResult);

    try {
      const response = await axios.post(`${Config.API_URL}/api/upload_image`, formData, {
        headers: {
          "Accept": "application/json",
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.status === 200) {
        console.log("Success");
        return response.data.images;
      } else {
        const errorText = await response.text();
        console.log("Failure - Server returned an error:", response.status, errorText);
        return [];
      }
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView style={styles.scrollView}>
          {/* <View style={styles.imageContainer}>
            <Image
              source={{ uri: item.image }}
              style={styles.image}
              resizeMode="cover"
            />
            <TouchableOpacity style={styles.imageButton}>
              <Text style={styles.imageButtonText}>Change Image</Text>
            </TouchableOpacity>
          </View> */}

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Item Name</Text>
              <TextInput
                style={styles.input}
                value={item.name}
                onChangeText={(text) => setItem({ ...item, name: text })}
                placeholder="Enter item name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Price</Text>
              <TextInput
                style={styles.input}
                value={item.price.toString()}
                onChangeText={(text) => setItem({ ...item, price: text })}
                keyboardType="number-pad"
                placeholder="0"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={item.description}
                onChangeText={(text) => setItem({ ...item, description: text })}
                placeholder="Enter item description"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {item.options.map((item, index) => (
              <View key={index} style={styles.inputGroup}>
                <Text style={styles.label}>Quantity of {item.option}</Text>
                {/* <TextInput
                  style={[styles.input, styles.optionInput]}
                  value={item.option}
                  onChangeText={(text) => handleChange(index, 'option', text)}
                  placeholder={`Enter option ${index + 1}`}
                /> */}
                <TextInput
                  style={styles.input}
                  value={item.quantity.toString()}
                  onChangeText={(text) => handleChange(index, 'quantity', text)}
                  keyboardType="numeric"
                  placeholder={`Enter quantity for option ${index + 1}`}
                />
              </View>
            ))}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Item Images</Text>
              <ScrollView horizontal>
                {oldImages.map((uri, index) => (
                  <View key={index} style={styles.imageContainer}>
                    {/* Delete Button */}
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => {
                        setDeletedImages([...deletedImages, uri]);
                        const updatedImages = oldImages.filter((_, i) => i !== index);
                        setOldImages(updatedImages);
                      }}
                    >
                      <IconSymbol size={25} name="minus.circle.fill" color="black"/>
                    </TouchableOpacity>
                    
                    {/* Image */}
                    <Image source={{ uri }} style={styles.image} />
                  </View>
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Images</Text>
              <ScrollView horizontal>
                {images.map((uri, index) => (
                  <Image key={index} source={{ uri }} style={styles.image} />
                ))}
              </ScrollView>
              <TouchableOpacity style={styles.addButton} onPress={pickImage}>
                <Text style={styles.addButtonText}>Browse Images from Photos</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>

        <View style={styles.footer}>
          {/* <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity> */}
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  // imageContainer: {
  //   alignItems: 'center',
  //   padding: 20,
  // },
  // image: {
  //   width: 150,
  //   height: 150,
  //   borderRadius: 10,
  //   marginBottom: 10,
  // },
  imageButton: {
    padding: 10,
    backgroundColor: '#E8F4F8',
    borderRadius: 8,
  },
  imageButtonText: {
    color: '#2980B9',
    fontSize: 16,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#34495E',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionInput: {
    flex: 0.75,
    marginRight: 8,
  },
  quantityInput: {
    flex: 0.25,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  saveButton: {
    backgroundColor: '#5c5c5c',
  },
  cancelButtonText: {
    color: '#7F8C8D',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#FFF',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  image: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#ccc',
    marginRight: 2,
  },
  deleteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    zIndex: 1,
  },
  addButton: {
    backgroundColor: '#ccccc0',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
    marginBottom: 20,
  },
  addButtonText: { 
    color: '#fff', 
    fontSize: 16,
    fontWeight: '600',
  },
});