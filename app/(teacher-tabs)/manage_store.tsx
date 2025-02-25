import React from 'react';
import axios from 'axios';
import Config from '@/constants/config';
import {useCallback, useState, useEffect} from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, Image, TouchableOpacity, Modal, Alert } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useNavigation } from '@react-navigation/native';
import ImageViewer from 'react-native-image-zoom-viewer';
import { useFocusEffect } from '@react-navigation/native';
import Dialog from 'react-native-dialog';

const { width } = Dimensions.get('window');

const Item = ({ id, name, price, image, images, navigation, options, description, onDelete }) => {
  const [isModalVisible, setModalVisible] = useState(false);
  console.log(images);

  const handleAddPress = () => {
    navigation.navigate('edit_items', {item_id: id, item_name: name, item_price: price, item_description: description, item_options: options, item_images: images});
  };

  const handleImagePress = () => {
    setModalVisible(true);
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

  const handleDeletePress = async () => {
    const deleteItem = await onDelete(name);
    const response = await handleDeleteImages(images);
  }

  return (
    <View style={styles.item}>
      <TouchableOpacity onPress={handleImagePress}>
        <Image
          source={{ uri: images[0] }}
          style={styles.image}
        />
      </TouchableOpacity>
      <Modal visible={isModalVisible} transparent={true}>
        <ImageViewer
          imageUrls={images.map(url => ({ url }))} // image has to be an array
          enableSwipeDown={true}
          onSwipeDown={() => setModalVisible(false)} // Close on swipe down
        />
        <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </Modal>
      <Text style={styles.editables}>{name}</Text>
      <Text style={styles.editables}>Price: {price}</Text>
      <Text style={styles.editables}>{description}</Text>

      <TouchableOpacity style={styles.addButton} onPress={handleAddPress}>
        <IconSymbol size={28} name="square.and.pencil.circle.fill" color="black"/>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.deleteButton} 
        onPress={() => 
          Alert.alert(
            'Delete Item',
            `Are you sure you want to delete ${name}?`,
            [
              {text: 'Cancel'},
              {text: 'Delete', onPress: () => handleDeletePress()},
            ]
          )
        }
      >
        <IconSymbol size={28} name="trash.circle.fill" color="black" />
      </TouchableOpacity>
    </View>
  );
};


export default function ManageStore() {
  const navigation = useNavigation();
  const [itemdata, setItemData] = useState({});
  const [selfInfo, setSelfInfo] = useState({});

  const fetchItemData = async () => {
    try {
      const response = await axios.get(`${Config.API_URL}/api/items`);
      // console.log(response.data);
      setItemData(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSelfData = async () => {
    try {
      const response = await axios.get(`${Config.API_URL}/api/userinfo`, {
        withCredentials: true,
      });
      if (response.data.status === 'success') {
        setSelfInfo(response.data.userinfo);
      } else {
        console.error('Failed to fetch self data');
      }
    } catch (error) {
      console.error(error);
    }
  }

  const handleDelete = async (name) => {
    try {
      const response = await axios.delete(`${Config.API_URL}/api/remove_item_from_store`, {
        data: { name: name },
        withCredentials: true,
      });
      if (response.data.status === 'success') {
        Alert.alert('Item deleted successfully');
        fetchItemData();
      } else {
        Alert.alert('Failed to delete item');
      }
    } catch (error) {
      Alert.alert('Failed to delete item');
      console.error(error);
    } 
  };

  const openAddItemModal = () => {
    if (!selfInfo.class_id) {
      Alert.alert('You must set your class name before you add an item');
    } else {
      navigation.navigate('add_to_store_modal');
    }
  };

  useFocusEffect(
    useCallback(() => {
      const fetchAll = async () => {
        await Promise.all([fetchItemData(), fetchSelfData()]);
      };
      fetchAll();
    }, [])
  );


  const renderItem = ({ item }) => {
    // console.log(item._id);
    return (
      <Item
        id={item._id}
        name={item.name}
        price={item.price} 
        image={item.image}
        images={item.images}
        options={item.options} 
        description={item.description}
        quantity={item.quantity}
        navigation={navigation}
        onDelete={handleDelete}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Store</Text>
      <TouchableOpacity onPress={openAddItemModal} style={styles.addItemBtn}>
        <Text style={{fontWeight: '800', color: '#FFFFFF'}}>Add Item</Text>
      </TouchableOpacity>
      <FlatList
        data={itemdata}
        renderItem={renderItem}
        keyExtractor={item => item._id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={{ paddingBottom: 50 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f8f1f1',
      paddingTop: 50,
    },
    header: {
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      marginTop: 20,
      marginBottom: 20,
      color: '#333',
    },
    row: {
      flex: 1,
      justifyContent: 'space-around',
    },
    item: {
      backgroundColor: 'white',
      padding: 20,
      marginVertical: 8,
      marginHorizontal: 8,
      width: width / 2 - 24,
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    image: {
      width: '100%',
      height: 120,
      borderRadius: 4,
      marginBottom: 10,
    },
    addButton: {
      position: 'absolute',
      left: -3,
      top: -3,
    },
    deleteButton: {
      position: 'absolute',
      right: -3,
      top: -3,
    },
    input: {
      height: 50,
      borderColor: '#ddd',
      borderWidth: 1,
      borderRadius: 8,
      marginBottom: 16,
      paddingHorizontal: 12,
      backgroundColor: '#fff',
      fontSize: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    addButtonContainer: {
      marginTop: 20,
      marginBottom: 20, 
      backgroundColor: '#f2ea86',
      padding: 10, 
      borderRadius: 8,
    },
    addButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '600',
    },
    closeButton: {
      position: 'absolute',
      top: 40,
      right: 20,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 5,
    },
    closeButtonText: {
      color: 'white',
      fontSize: 16,
    },
    editablesContainer: {
      flexDirection: 'row',
      // justifyContent: 'space-between',
    },
    editButton: {
      marginLeft: 5,
    },
    editables: {
      flex: 1,
      fontSize: 12,
      fontWeight: '600',
      color: '#333',
      marginBottom: 8,
    },
    addItemBtn: {
      position: 'absolute',
      right: 20,
      top: 65,
      borderRadius: 50,
      padding: 10,
      backgroundColor: '#5c5c5c',
    },
  });