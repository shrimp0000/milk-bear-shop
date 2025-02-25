import React from 'react';
import axios from 'axios';
import Config from '@/constants/config';
import {useCallback, useState, useEffect} from 'react';
import { StyleSheet, Text, TouchableOpacity, View, FlatList, Image, Dimensions, SafeAreaView, Alert } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const Item = ({ name, price, image, option, status, username, onConfirmDelivery }) => (
  <View style={styles.item}>
    <Image source={{ uri: image }} style={styles.image} />
    <View style={{flexDirection: 'row', marginBottom: 8}}>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.option}>{option}</Text>
    </View>
    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
      <Text>Ordered by: {username}</Text>
      <TouchableOpacity style={styles.confirmButton} onPress={() => onConfirmDelivery(username, name, option)}>
        <Text style={{ fontWeight: '600', color: '#FFFFFF'}}>Confirm delivery</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default function ManageOrders() {
  const [itemData, setItemData] = useState([]);
  const [allOrderData, setAllOrderData] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [itemsResponse, orderResponse] = await Promise.all([
        axios.get(`${Config.API_URL}/api/items`),
        axios.get(`${Config.API_URL}/api/all_orders`, { withCredentials: true }),
      ]);
      setItemData(itemsResponse.data);
      setAllOrderData(orderResponse.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelivery = async (username, name, option) => {
    try {
      const response = await axios.post(`${Config.API_URL}/api/confirm_delivery`, {
        username: username,
        name: name,
        option: option,
      }, {
        withCredentials: true,
      });
      if (response.data.status === 'success') {
        Alert.alert('Delivery confirmed');
        fetchData();
      } else {
        Alert.alert('Failed to confirm delivery');
      }
    } catch (error) {
      console.error(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (!allOrderData || allOrderData.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>No pending orders</Text>
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
        name={itemDetails.name}
        price={itemDetails.price}
        image={itemDetails.image}
        option={item.option}
        status={item.status}
        username={item.username}
        onConfirmDelivery={handleConfirmDelivery}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Orders</Text>
      <FlatList
        data={allOrderData}
        renderItem={renderItem}
        keyExtractor={item => item._id}
        numColumns={1}
        contentContainerStyle={{ paddingBottom: 80 }}
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
  option: {
    fontSize: 14,
    color: '#666',
  },
  checkOutButton: {
    position: 'absolute',
    right: 20,
    bottom: 30,
  },
  confirmButton: {
    position: 'absolute',
    right: 1,
    bottom: 1,
    padding: 5,
    backgroundColor: '#ccccc0',
    borderRadius: 25,
  },
});