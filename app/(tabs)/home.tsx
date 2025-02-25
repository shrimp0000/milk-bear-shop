import React from 'react';
import axios from 'axios';
import Config from '@/constants/config';
import {useState, useEffect, useCallback, useMemo} from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image, SafeAreaView, Modal, FlatList, Pressable, Alert } from 'react-native';
import { Calendar, CalendarUtils } from 'react-native-calendars';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

// const INITIAL_DATE = '2023-11-06';
const DEFAULT_AVATAR = "https://my-mini-mart-image-bucket.s3.us-east-2.amazonaws.com/a1.jpg"

export default function Home() {
  const navigation = useNavigation();
  const [userData, setUserData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  // const [selected, setSelected] = useState(INITIAL_DATE);
  // const [avatarSource, setAvatarSource] = useState(require('@/assets/images/login.jpg'));
  const [modalVisible, setModalVisible] = useState(false);
  const imageOptions = [
    "https://my-mini-mart-image-bucket.s3.us-east-2.amazonaws.com/a1.jpg",
    "https://my-mini-mart-image-bucket.s3.us-east-2.amazonaws.com/a2.jpg",
  ];

  const handleImageSelect = (image) => {
    saveAvatar(image);
    setModalVisible(false);
  };

  console.log(userData.avatar);
  // const getDate = (count: number) => {
  //   const date = new Date(INITIAL_DATE);
  //   const newDate = date.setDate(date.getDate() + count);
  //   return CalendarUtils.getCalendarDateString(newDate);
  // };

  // const onDayPress = useCallback((day) => {
  //   setSelected(day.dateString);
  // }, []);

  // const marked = useMemo(() => {
  //   return {
  //     [getDate(-1)]: {
  //       dotColor: 'red',
  //       marked: true
  //     },
  //     [selected]: {
  //       selected: true,
  //       disableTouchEvent: true,
  //       selectedColor: 'orange',
  //       selectedTextColor: 'red'
  //     }
  //   };
  // }, [selected]);

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
    } finally {
      setIsLoading(false);
    }
  }

  const handleLogout = async () => {
    try {
      const response = await axios.post(`${Config.API_URL}/api/logout`, {}, {
        withCredentials: true,
      });
      if (response.data.status === 'success') {
        navigation.navigate('index');
      } else {
        Alert.alert('Failed to log out');
      }
    } catch (error) {
      Alert.alert('Failed to log out');
      console.error(error);
    }
  };

  const saveAvatar = async (image) => {
    try {
      const response = await axios.post(`${Config.API_URL}/api/set_avatar`, {
        avatar: image,
      }, {
        withCredentials: true,
      });
      if (response.data.status === 'success') {
        fetchUserData();
      } else {
        Alert.alert('Failed to save avatar');
      }
    } catch (error) {
      Alert.alert('Failed to save avatar');
      console.error(error);
    }
  };

  const leaveClass = async () => {
    Alert.alert('Are you sure you want to leave the class?', '', [
      { text: 'Cancel' },
      { text: 'OK', onPress: () => handleLeaveClass() },
    ]);
  };

  const handleLeaveClass = async () => {
    try {
      const response = await axios.post(`${Config.API_URL}/api/leave_class`, {
        username: userData.username,
      }, {
        withCredentials: true,
      });
      if (response.data.status === 'success') {
        fetchUserData();
      } else {
        Alert.alert('Failed to leave class');
      }
    } catch (error) {
      Alert.alert('Failed to leave class');
      console.error(error);
    }
  };


  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  return (
    isLoading ? (
      <View style={styles.container}>
        <Text style={styles.title}>Loading...</Text>
      </View>
    ) : (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Image source={userData.avatar ? { uri: userData.avatar } : {uri: DEFAULT_AVATAR}} style={styles.avatar} />
          </TouchableOpacity>
          <Modal
            visible={modalVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <FlatList
                data={imageOptions}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <Pressable onPress={() => handleImageSelect(item)}>
                    <Image source={{uri: item}} style={styles.imageOption} />
                  </Pressable>
                )}
              />
              <Pressable style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.closeText}>Close</Text>
              </Pressable>
            </View>
          </Modal>

          <Text style={styles.title}>Welcome, {userData.username}!</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>You Have</Text>
            <Text style={styles.eggCount}>
              <Text style={{ fontWeight: 'bold', color: '#ff7675' }}> {userData.eggs} </Text> {userData.money_emoji}
            </Text>
            <Text style={styles.sectionTail}>Keep up the good performance!</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>You Class is</Text>
            <Text style={styles.className}>{userData.class_id ? userData.class_id : "You don't have a class yet"}</Text>
            {/* {userData.class_id && (
              <TouchableOpacity style={styles.button} onPress={leaveClass}>
                <Text style={styles.buttonText}>Leave Class</Text>
              </TouchableOpacity>
            )} */}
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* <Calendar
          style={styles.calendar}
          theme={{
            calendarBackground: '#C19A6B',
            todayTextColor: '#FFD700',
            arrowColor: 'white',
          }}
          onDayPress={onDayPress}
          markedDates={marked}
        /> */}
      </SafeAreaView >
    )
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f1f1",
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ff7675",
    marginBottom: 30,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4A4A4A",
    marginBottom: 10,
  },
  sectionTail: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4A4A4A",
    marginTop: 10,
  },
  className: {
    fontSize: 24,
    fontWeight: "600",
    color: "#ff7675",
    marginBottom: 15,
  },
  logoutButton: {
    backgroundColor: "#fdcb6e",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
  },
  logoutButtonText: {
    color: "#4A4A4A",
    fontSize: 18,
    fontWeight: "800",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: '#ff7675',
  },
  eggCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fdcb6e',
  },
  calendar: {
    width: '90%',
    alignSelf: 'center',
    borderRadius: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 50,
  },
  imageOption: {
    width: 100,
    height: 100,
    margin: 10,
    borderRadius: 50,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f2ea86',
    borderRadius: 8,
  },
  closeText: {
    color: '#000',
    fontSize: 16,
  },
  button: {
    backgroundColor: "#fdcb6e",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  buttonText: {
    // color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});