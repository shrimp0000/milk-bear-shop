import React from 'react';
import axios from 'axios';
import Config from '@/constants/config';
import {useState, useEffect} from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, KeyboardAvoidingView, Alert, Button, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import ImageViewer from 'react-native-image-zoom-viewer';
import * as ImagePicker from 'expo-image-picker';

export default function AddToStoreModal() {
  const navigation = useNavigation();

  const [images, setImages] = useState<string[]>([]);
  const [imageResult, setImageResult] = useState<ImagePicker.ImagePickerResult | null>(null);
  // const [imageURLArray, setImageURLArray] = useState<string[]>([]);

  const [item, setItem] = useState({
    name: '',
    price: '',
    description: '',
    options: [],
  });

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

  const addOption = () => {
    setItem((prevItem) => ({
      ...prevItem,
      options: [...prevItem.options, { option: '', quantity: '' }],
    }));
  };

  const removeOption = (index) => {
    setItem({
      ...item,
      options: item.options.filter((_, i) => i !== index)
    });
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

  // console.log(item);
  
  const addItem = async () => {
    try {
      if (!item.name || !item.price || !item.description) {
        Alert.alert('Please fill in all fields');
        return;
      }
      if (item.options.length === 0 || item.options.some(option => !option.option || !option.quantity)) {
        Alert.alert('Please add at least one option');
        return;
      }
      const uploadedImages = await uploadImage();
      if (uploadedImages.length === 0) {
        Alert.alert('Please upload at least one image.');
        return;
      }

      const response = await axios.post(`${Config.API_URL}/api/add_item_to_store`, {
        name: item.name,
        price: item.price,
        description: item.description,
        options: item.options,
        image: uploadedImages[0],
        images: uploadedImages,
      }, {
        withCredentials: true,
      });
      if (response.data.status === 'success') {
        Alert.alert('Item added successfully',
          '',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
        setItem({
          name: '',
          price: '',
          description: '',
          options: [],
        });
        setImages([]);
        setImageResult(null);
        // setImageURLArray([]);
      } else {
        Alert.alert('Failed to add item.');
      }
    } catch (error) {
      Alert.alert('Failed to add item.');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.form}>
            {/* Item Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Item Name</Text>
              <TextInput
                style={styles.input}
                value={item.name}
                onChangeText={(text) => setItem({ ...item, name: text })}
                placeholder="Enter item name"
              />
            </View>

            {/* Price */}
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

            {/* Description */}
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

            {/* Options */}
            {item.options.map((option, index) => (
              <View key={index} style={styles.inputGroup}>
                {/* Option Name */}
                <View style={{flexDirection: 'row'}}>
                  <Text style={styles.label}>Option {index + 1} / Quantity</Text>
                  <TouchableOpacity onPress={() => removeOption(index)} style={styles.removeButton}>
                    <IconSymbol style={{marginLeft: 8}} size={20} name="minus.circle.fill" color="black"/>
                  </TouchableOpacity>
                </View>
                <View style={styles.row}>
                  <TextInput
                    style={[styles.input, styles.optionInput]}
                    value={option.option}
                    onChangeText={(text) => handleChange(index, 'option', text)}
                    placeholder={`Option name`}
                  />

                  {/* Option Quantity */}
                  <TextInput
                    style={[styles.input, styles.quantityInput]}
                    value={option.quantity}
                    onChangeText={(text) => handleChange(index, 'quantity', text)}
                    keyboardType="number-pad"
                    placeholder={`Quantity`}
                  />
                </View>
              </View>
            ))}

            {/* Add Option Button */}
            <TouchableOpacity style={styles.addButton} onPress={addOption}>
              <Text style={styles.addButtonText}>+ Add Option</Text>
            </TouchableOpacity>

            {/* Image Picker */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Item Images</Text>
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
            onPress={addItem}
          >
            <Text style={styles.saveButtonText}>Add Item to Store</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
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
    textArea: {
      height: 100,
      paddingTop: 12,
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
    image: {
      width: 200,
      height: 200,
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: '#ccc',
      marginRight: 2,
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
      fontWeight: '800',
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    optionInput: {
      flex: 0.75,
      marginRight: 8,
    },
    quantityInput: {
      flex: 0.25,
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