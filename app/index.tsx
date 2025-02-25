import { Platform, TextInput, StyleSheet, Text, View, TouchableOpacity, Alert, ImageBackground, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import Config from '@/constants/config';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import {useState, useEffect} from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function HomeScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [registerMsg, setRegisterMsg] = useState('Register as Teacher');
  const navigation = useNavigation();

  const handleAuth = async () => {
    if (isRegisterMode) {
      try {
        const response = await axios.post(`${Config.API_URL}/api/register`, {
          username: username,
          password: password,
          is_teacher: registerMsg === 'Register as Teacher',
        }, {
          withCredentials: true,
        });
        if (response.data.status === 'success') {
          Alert.alert('Registration successful!');
          setIsRegisterMode(false);
        } else {
          Alert.alert(response.data.message);
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      try {
        const response = await axios.post(`${Config.API_URL}/api/login`, {
          username: username,
          password: password,
        }, {
          withCredentials: true,
        });
        if (response.data.status === 'success') {
          if (response.data.is_teacher) {
            navigation.navigate('(teacher-tabs)', { screen: 'teacher_home' });
          } else {
            navigation.navigate('(tabs)', { screen: 'home' });
          }
          // set a push notification token
          const pushToken = await registerForPushNotificationsAsync();
          if (pushToken) {
            await axios.post(`${Config.API_URL}/api/register_push_token`, {
              username: username,
              token: pushToken,
            }, {
              withCredentials: true,
            });
          }
        } else {
          Alert.alert('Invalid username or password');
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  function handleRegistrationError(errorMessage: string) {
    alert(errorMessage);
    throw new Error(errorMessage);
  }
  
  async function registerForPushNotificationsAsync() {
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        handleRegistrationError('Permission not granted to get push token for push notification!');
        return;
      }
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      if (!projectId) {
        handleRegistrationError('Project ID not found');
      }
      try {
        const pushTokenString = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;
        console.log(pushTokenString);
        return pushTokenString;
      } catch (e: unknown) {
        handleRegistrationError(`${e}`);
      }
    } else {
      handleRegistrationError('Must use physical device for push notifications');
    }
  }

  const handleAuthPress = () => {
    if (!isRegisterMode) {
      Alert.alert(
        "Are you a teacher?",
        "",
        [
          {
            text: "No",
            onPress: () => {setIsRegisterMode(true); setRegisterMsg('Register as Student');}
          },
          {
            text: "Yes",
            onPress: () => {setIsRegisterMode(true); setRegisterMsg('Register as Teacher');}
          },
        ]
      );
    } else {
      setIsRegisterMode(false);
    }
  }

  return (
    <ImageBackground 
      source={require('@/assets/images/login2.jpg')} // Replace with your image path
      style={{height: '100%', width: '100%'}}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <BlurView intensity={40} style={styles.card}>
              <Text style={styles.title}> WELCOME </Text>
              <TextInput 
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
              />
              <TouchableOpacity
                style={styles.button}
                onPress={handleAuth}
              >
                <Text style={styles.buttonText}>{isRegisterMode ? registerMsg : 'Login'}</Text>
              </TouchableOpacity>

              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>{isRegisterMode ? 'Already have an account? ' : "Don't have an account?" }</Text>
                <TouchableOpacity onPress={() => handleAuthPress()}>
                  <Text style={styles.registerLink}>{isRegisterMode ? 'Login' : 'Register'}</Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    color: 'black',
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 25,
    marginBottom: 20,
    paddingHorizontal: 10,
    backgroundColor: 'transparent',
    fontSize: 16,
    width: '95%',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 5,
    shadowColor: 'white',
  },
  button: {
    backgroundColor: 'white',
    borderRadius: 50,
    alignItems: 'center',
    width: '95%',
    letterSpacing: 1,
    marginBottom: 10,
    height: 50,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    padding: 20,
    borderRadius: 10,
    width: '70%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'grey',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 5, // Shadow for Android
  },
  title: {
    fontSize: 36,
    color: 'white',
    marginVertical: 20,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  registerText: {
    color: '#fff',
    fontSize: 14,
  },
  registerLink: {
    color: '#fff',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
