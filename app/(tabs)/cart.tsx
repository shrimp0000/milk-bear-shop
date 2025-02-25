import React from 'react';
import axios from 'axios';
import Config from '@/constants/config';
import {useCallback, useState, useEffect} from 'react';
import { StyleSheet, Text, TouchableOpacity, View, FlatList, Image, Dimensions, SafeAreaView, Alert } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const Item = ({ id, name, price, image, option, quantity, onCheckout, onDelete }) => (
  <View style={styles.item}>
    <TouchableOpacity 
      style={styles.deleteButton} 
      onPress={() => 
        Alert.alert(
          'Delete Item',
          `Are you sure you want to delete ${name}?`,
          [
            {text: 'Cancel'},
            {text: 'Delete', onPress: () => onDelete(id)},
          ]
        )
      }
    >
      <IconSymbol size={28} name="trash.circle.fill" color="black" />
    </TouchableOpacity>
    <Image source={{ uri: image }} style={styles.image} />
    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
      <View style={{flexDirection: 'row'}}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.option}>*{option}*</Text>
      </View>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => onCheckout(name, option, price)}
        disabled={quantity === 0}
      >
        <Text style={{fontWeight: '600', color: quantity === 0 ? 'lightgrey' : 'black'}}>{quantity === 0? 'Out of Stock' : 'Checkout'}</Text>
      </TouchableOpacity>
    </View>
    {/* <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
      <Text style={styles.price}>Price: {price}</Text>
      <Text>Quantity: {quantity}</Text>
    </View> */}
  </View>
);

export default function Cart() {
  const [itemData, setItemData] = useState([]);
  const [cartData, setCartData] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [itemsResponse, userResponse] = await Promise.all([
        axios.get(`${Config.API_URL}/api/items`),
        axios.get(`${Config.API_URL}/api/cart`, { withCredentials: true }),
      ]);

      setItemData(itemsResponse.data);
      setCartData(userResponse.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (name, option, price) => {
    try {
      const response = await axios.post(`${Config.API_URL}/api/checkout`, {
        name: name,
        option: option,
        price: price,
      }, { 
        withCredentials: true
      });
      if (response.data.status === 'success') {
        Alert.alert('Success', 'Checkout successful');
        fetchData();
      } else {
        Alert.alert('Fail', 'Not enough eggs');
      }
    } catch (error) {
      console.error(error);
    }
  }

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`${Config.API_URL}/api/delete_item_from_cart`, {
        data: { id: id },
        withCredentials: true,
      });
      if (response.data.status === 'success') {
        Alert.alert('Success', 'Item deleted successfully');
        fetchData();
      } else {
        Alert.alert('Fail', 'Failed to delete item');
      }
    } catch (error) {
      console.error(error);
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (!cartData || cartData.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Your Cart is Empty</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => {
    const itemDetails = itemData.find(dataItem => dataItem.name === item.item_name);

    if (!itemDetails) {
      return null;
    }

    return (
      <Item
        id={item._id}
        name={itemDetails.name}
        price={itemDetails.price}
        image={itemDetails.image}
        quantity={itemDetails.options.find(opt => opt.option === item.option).quantity}
        option={item.option}
        onCheckout={handleCheckout}
        onDelete={handleDelete}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>🛒 Cart</Text>
      <FlatList
        data={cartData}
        renderItem={renderItem}
        keyExtractor={item => item._id}
        numColumns={1}
        contentContainerStyle={{ paddingBottom: 50 }}
      />
    </SafeAreaView>
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
    padding: 10,
    marginVertical: 8,
    marginHorizontal: 16,
    width: width - 32,
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
  name: {
    fontSize: 14,
    fontWeight: '800',
    color: '#333',
    marginRight: 10,
  },
  price: {
    fontSize: 14,
    color: '#666',
  },
  option: {
    fontSize: 14,
    color: '#666',
  },
  addButton: {
    padding: 5,
    backgroundColor: '#fdcb6e',
    borderRadius: 25,
  },
  deleteButton: {
    position: 'absolute',
    right: -8,
    top: -8,
    zIndex: 2,
  },
});