import axios from 'axios';
import Config from '@/constants/config';
import {useState, useEffect} from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

export default function Modal() {
  const navigation = useNavigation();
  const route = useRoute();
  const options = route.params.options || [];
  const item_name = route.params.item_name;

  const handleOptionPress = async (option) => {
    // post the option to the user's cart:
    try {
      const response = await axios.post(`${Config.API_URL}/api/add_to_cart`, {
        item_name: item_name,
        option: option,
      }, {
        withCredentials: true,
      });
      if (response.data.status === 'success') {
        Alert.alert('Item added to cart');
      } else {
        Alert.alert('Failed to add item to cart');
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    
    <View style={styles.container}>
      <Text style={styles.title}>Pick an option:</Text>
      {options.map((item, index) => (
        <TouchableOpacity key={index} style={styles.button} onPress={() => handleOptionPress(item.option)}>
          <Text style={styles.buttonText}>🔍 {item.option}</Text>
          <Text style={styles.buttonText}>📦 {item.quantity} left</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#94f1e7', // You can customize this color
    paddingVertical: 12,
    paddingHorizontal: 60,
    marginBottom: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '80%', // Make the buttons take 80% of the screen width
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});