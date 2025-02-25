import React from 'react';
import axios from 'axios';
import Config from '@/constants/config';
import {useCallback, useState, useEffect} from 'react';
import { StyleSheet, Text, TouchableOpacity, View, FlatList, Image, Dimensions, SafeAreaView } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const Item = ({ name, price, image, option, status }) => (
  <View style={styles.item}>
    <Image source={{ uri: image }} style={styles.image} />
    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
      <View style={{flexDirection: 'row'}}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.option}>*{option}*</Text>
      </View>
      <Text style={styles.status}>{status}</Text>
    </View>
    {/* <Text style={styles.price}>{price}</Text> */}
  </View>
);

export default function Orders() {
  const [itemData, setItemData] = useState([]);
  const [orderData, setOrderData] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [itemsResponse, orderResponse] = await Promise.all([
        axios.get(`${Config.API_URL}/api/items`),
        axios.get(`${Config.API_URL}/api/orders`, { withCredentials: true }),
      ]);
      setItemData(itemsResponse.data);
      setOrderData(orderResponse.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
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

  if (!orderData || orderData.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Your have no orders</Text>
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
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>📦 Orders</Text>
      <FlatList
        data={orderData}
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
  checkOutButton: {
    position: 'absolute',
    right: 20,
    bottom: 30,
  //   backgroundColor: '#007AFF',
  //   paddingHorizontal: 12,
  //   paddingVertical: 6,
  //   borderRadius: 15,
  },
  status: {
    fontSize: 14,
    color: 'lightgrey',
  },
});