import axios from 'axios';
import { Alert } from 'react-native';
import Config from '@/constants/config';

export const handleEditName = async (id: string, name: string, newName: string): Promise<void> => {
  try {
    if (newName) {
      const response = await axios.post(`${Config.API_URL}/api/edit_item_name`, {
        id: id,
        old_name: name,
        new_name: newName,
      }, {
        withCredentials: true,
      });
    }
  } catch (error) {
    console.error(error);
  }
};

export const handleEditDescription = async (id: string, name: string, newDescription: string): Promise<void> => {
  try {
    if (newDescription) {
      const response = await axios.post(`${Config.API_URL}/api/edit_item_description`, {
        id: id,
        name: name,
        new_description: newDescription,
      }, {
        withCredentials: true,
      });
    }
  } catch (error) {
    console.error(error);
  }
};

export const handleEditPrice = async (id: string, name: string, newPrice: string): Promise<void> => {
  const parsedPrice = parseInt(newPrice, 10);

  if (isNaN(parsedPrice)) {
    Alert.alert('Invalid price. Please enter a valid number.');
    return;
  }

  try {
    if (newPrice) {
      const response = await axios.post(`${Config.API_URL}/api/edit_item_price`, {
        id: id,
        name: name,
        new_price: newPrice,
      }, {
        withCredentials: true,
      });
    }
  } catch (error) {
    console.error(error);
  }
};

export const handleEditOptionQuantities = async (id: string, options: any[]): Promise<void> => {
  try {
    if (options) {
      const response = await axios.post(`${Config.API_URL}/api/edit_option`, {
        id: id,
        options: options,
      }, {
        withCredentials: true,
      });
    }
  } catch (error) {
    console.error(error);
  }
}