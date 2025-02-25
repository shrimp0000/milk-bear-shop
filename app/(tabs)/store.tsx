import React from 'react';
import axios from 'axios';
import Config from '@/constants/config';
import {useState, useCallback, useEffect} from 'react';
import { Animated, View, Text, StyleSheet, FlatList, Dimensions, Image, TouchableOpacity, Modal, SafeAreaView } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import ImageViewer from 'react-native-image-zoom-viewer';
import Dialog from 'react-native-dialog';

const { width } = Dimensions.get('window');

const Progress = ({ step, steps, height, emoji }) => {
  const [width, setWidth] = React.useState(0);
  const animatedWidth = React.useRef(new Animated.Value(0)).current;
  const animatedColor = React.useRef(new Animated.Value(step >= steps ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: width * (step / steps),
      duration: 500,
      useNativeDriver: false,
    }).start();

    Animated.timing(animatedColor, {
      toValue: step >= steps ? 1 : 0, // 1 for gold, 0 for lightblue
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [step, steps, width]);

  const interpolatedColor = animatedColor.interpolate({
    inputRange: [0, 1],
    outputRange: ['lightblue', 'gold'],
  });

  return (
    <>
      <Text style={{ fontFamily: 'Menlo', fontSize: 12, fontWeight: '900', marginBottom: 4 }}>
      {emoji} {step} / {steps}
      </Text>
      <View
        onLayout={(e) => {
          const newWidth = e.nativeEvent.layout.width;
          setWidth(newWidth); // Get the container's width once it's laid out
        }}
        style={{
          height,
          backgroundColor: 'lightgray',
          borderRadius: height,
          overflow: 'hidden',
          marginBottom: 2,
        }}
      >
        <Animated.View
          style={{
            height,
            backgroundColor: interpolatedColor,
            borderRadius: height,
            width: animatedWidth,
          }}
        />
      </View>
    </>
  );
};

const Item = ({ name, price, image, images, navigation, options, description, quantity, eggs, emoji }) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [isDescriptionVisible, setDescriptionVisible] = useState(false);

  const handleAddPress = () => {
    navigation.navigate('modal', {item_name: name, options: options});
  };

  const handleImagePress = () => {
    setModalVisible(true);
  };

  // const handleDescriptionPress = () => {
  //   isDescriptionVisible ? setDescriptionVisible(false) : setDescriptionVisible(true);
  // };

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
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <View style={{flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">{name}</Text>
          <TouchableOpacity onPress={() => setDescriptionVisible(true)}>
            <IconSymbol size={16} name="info.circle" color="black"/>
          </TouchableOpacity>
          <Dialog.Container visible={isDescriptionVisible}>
            <Dialog.Title>{name}</Dialog.Title>
            <Dialog.Description>{description}</Dialog.Description>
            <Dialog.Button label="Close" onPress={() => setDescriptionVisible(false)} />
          </Dialog.Container>
        </View>
      </View>
      {/* {isDescriptionVisible && (
        <View style={styles.descriptionContainer}>
          <Text>{description}</Text>
        </View>
      )} */}
      {/* <Text style={{ fontFamily: 'Menlo', fontSize: 12, fontWeight: '900', marginBottom: 4 }}>📦 {quantity} left in stock</Text> */}
      <Progress step={eggs} steps={price} height={20} emoji={emoji} />
      <TouchableOpacity style={styles.addButton} onPress={handleAddPress}>
        <IconSymbol size={30} name="plus.app.fill" color="orange" />
      </TouchableOpacity>
    </View>
  );
};


export default function Store() {
  const navigation = useNavigation();
  const [itemdata, setItemData] = useState({});
  const [userData, setUserData] = useState({});

  const fetchItemData = async () => {
    try {
      const response = await axios.get(`${Config.API_URL}/api/items`);
      setItemData(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${Config.API_URL}/api/userinfo`, {
        withCredentials: true,
      });
      if (response.data.status === 'success') {
        setUserData(response.data.userinfo);
      } else {
        console.error('Failed to fetch user data');
      }
    } catch (error) {
      console.error(error);
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchItemData();
      fetchUserData();
    }, [])
  );


  const renderItem = ({ item }) => (
    <Item 
      name={item.name} 
      price={item.price} 
      image={item.image}
      images={item.images}
      options={item.options} 
      navigation={navigation}
      description={item.description}
      quantity={item.quantity}
      eggs={userData.eggs}
      emoji={userData.money_emoji}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>🎁 Store</Text>
      <FlatList
        data={itemdata}
        renderItem={renderItem}
        keyExtractor={item => item.name}
        numColumns={2}
        columnWrapperStyle={styles.row}
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
    name: {
      fontSize: 16,
      fontWeight: '600',
      color: '#333',
      marginBottom: 8,
      marginRight: 3,
      flexShrink: 1, // Allows the text to shrink if needed
    },
    price: {
      fontSize: 14,
      color: '#666',
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
    descriptionContainer: {
      marginBottom: 8, 
      borderRadius: 8, 
      backgroundColor: '#f0f0f0', 
      padding: 8,
      justifyContent: 'center', // Centers content vertically
      alignItems: 'center', // Centers content horizontally
    },
    addButton: {
      position: 'absolute',
      right: -3,
      top: -3,
      zIndex: 1,
    },
  });