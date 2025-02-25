import { Text, View, StyleSheet, TouchableOpacity, Image, SafeAreaView, Alert } from 'react-native';
import { Link } from 'expo-router'; 
import {useState, useEffect, useCallback, useMemo} from 'react';
import axios from 'axios';
import Config from '@/constants/config';
import { useNavigation } from '@react-navigation/native';
import Dialog from 'react-native-dialog';
import { Calendar, CalendarUtils } from 'react-native-calendars';

// const INITIAL_DATE = '2023-11-06';

export default function TeacherHome() {
  const navigation = useNavigation();
  const [userData, setUserData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [emojiVisible, setEmojiVisible] = useState(false);
  const [newEmoji, setNewEmoji] = useState('');
  const [classNameVisible, setClassNameVisible] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  // const [selected, setSelected] = useState(INITIAL_DATE);

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

  const handleEditEmojiPress = async () => {
    if (newEmoji) {
      setEmojiVisible(false);
      onEditEmoji(userData.username, newEmoji);
    }
  };

  const onEditEmoji = async (username, newEmoji) => {
    try {
      const response = await axios.post(`${Config.API_URL}/api/set_money_emoji`, {
        username: username,
        new_emoji: newEmoji,
      }, {
        withCredentials: true,
      });
      if (response.data.status === 'success') {
        fetchUserData();
      } else {
        Alert.alert('Failed to set money emoji');
      }
    } catch (error) {
      Alert.alert('Failed to set money emoji');
      console.error(error);
    }
  };

  const handleEditClassNamePress = async () => {
    if (newClassName) {
      setClassNameVisible(false);
      onEditClassName(userData.username, newClassName);
    }
  };

  const onEditClassName = async (username, newClassName) => {
    try {
      const response = await axios.post(`${Config.API_URL}/api/set_class_id`, {
        username: username,
        class_id: newClassName,
      }, {
        withCredentials: true,
      });
      if (response.data.status === 'success') {
        Alert.alert('Class name set successfully');
        fetchUserData();
      } else {
        Alert.alert('Failed to set class name');
      }
    } catch (error) {
      Alert.alert('Failed to set class name');
      console.error(error);
    }
  }

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    isLoading ? (
      <View style={styles.container}>
        <Text style={styles.title}>Loading...</Text>
      </View>
    ) : (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Welcome, {userData.username}!</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Points Icon for Your Kids:</Text>
            <View style={styles.iconContainer}>
              <Text style={styles.emoji_text}>{userData.money_emoji}</Text>
            </View>

            <TouchableOpacity onPress={() => setEmojiVisible(true)} style={styles.button}>
              <Text style={styles.buttonText}>Change Emoji</Text>
            </TouchableOpacity>
            <Dialog.Container visible={emojiVisible}>
              <Dialog.Title>Enter New Emoji</Dialog.Title>
              <Dialog.Input 
                value={newEmoji}
                onChangeText={setNewEmoji}
              />
              <Dialog.Button label="Cancel" onPress={() => setEmojiVisible(false)} />
              <Dialog.Button label="Change" onPress={handleEditEmojiPress} />
            </Dialog.Container>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Class Name</Text>
            <Text style={styles.className}>{userData.class_id ? userData.class_id : "Please Name Your Class"}</Text>
            {!userData.class_id && (
              <TouchableOpacity style={styles.button} onPress={() => setClassNameVisible(true)}>
                <Text style={styles.buttonText}>Set Class Name</Text>
              </TouchableOpacity>
            )}
            <Dialog.Container visible={classNameVisible}>
              <Dialog.Title>Enter Class Name</Dialog.Title>
              <Dialog.Description>You can only set the class name once. Choose wisely.</Dialog.Description>
              <Dialog.Input 
                value={newClassName}
                onChangeText={setNewClassName}
              />
              <Dialog.Button label="Cancel" onPress={() => setClassNameVisible(false)} />
              <Dialog.Button label="Change" onPress={handleEditClassNamePress} />
            </Dialog.Container>
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

      </SafeAreaView>
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
    color: "#4A4A4A",
    marginBottom: 30,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4A4A4A",
    marginBottom: 10,
  },
  iconContainer: {
    backgroundColor: "#f7cac9",
    borderRadius: 50,
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
   className: {
    fontSize: 24,
    fontWeight: "600",
    color: "#4A4A4A",
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#ccccc0",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  logoutButton: {
    backgroundColor: "#5c5c5c",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
  },
  logoutButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  emoji_text: {
    fontSize: 35,
  },
});
