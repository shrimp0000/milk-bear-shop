import React from 'react';
import axios from 'axios';
import Config from '@/constants/config';
import {useCallback, useState, useEffect} from 'react';
import { StyleSheet, Text, TouchableOpacity, View, FlatList, Image, Dimensions, SafeAreaView, Alert } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useFocusEffect } from '@react-navigation/native';
import Dialog from 'react-native-dialog';

const { width } = Dimensions.get('window');

const Item = ({ username, eggs, onAddEggs, onRemoveStudent }) => {
  const [addVisible, setAddVisible] = useState(false);
  const [removeVisible, setRemoveVisible] = useState(false);
  const [amountEggs, setAmountEggs] = useState('');

  const handleAddEggs = () => {
    if (amountEggs) {
      onAddEggs(username, eggs, amountEggs);
      Alert.alert('Added points successfully!');
      setAddVisible(false);
      setAmountEggs('');
    }
  };

  const handleRemoveEggs = () => {
    if (amountEggs) {
      const eggsToRemove = parseInt(amountEggs, 10) || 0;
      if (eggsToRemove > eggs) {
        Alert.alert('You cannot remove more points than the student has.');
        return;
      } else {
        onAddEggs(username, eggs, -eggsToRemove);
        Alert.alert('Removed points successfully!');
        setRemoveVisible(false);
        setAmountEggs('');
      }
    }
  };

  const removeStudent = () => {
    onRemoveStudent(username);
    Alert.alert('Removed student successfully!');
  }

  const showAlert = () => {
    Alert.alert(
      'Add or Remove Points?',
      '',
      [
        { text: 'Remove', onPress: () => setRemoveVisible(true) },
        { text: 'Add', onPress: () => setAddVisible(true) },
      ]
    );
  }

  return (
    <View style={styles.item}>
    <Text style={styles.name}>{username}</Text>
    <Text>Points: {eggs}</Text>
    <TouchableOpacity style={styles.addButton} onPress={showAlert}>
      <Text style={{fontWeight: '600', color: "#FFFFFF"}}>Manage Points</Text>
    </TouchableOpacity>
    <Dialog.Container visible={addVisible}>
      <Dialog.Title>Enter Points Amount</Dialog.Title>
      <Dialog.Input 
        value={amountEggs}
        onChangeText={setAmountEggs}
        keyboardType="numeric"
      />
      <Dialog.Button label="Cancel" onPress={() => setAddVisible(false)} />
      <Dialog.Button label="Add" onPress={handleAddEggs} />
    </Dialog.Container>
    <Dialog.Container visible={removeVisible}>
      <Dialog.Title>Enter Points Amount</Dialog.Title>
      <Dialog.Input 
        value={amountEggs}
        onChangeText={setAmountEggs}
        keyboardType="numeric"
      />
      <Dialog.Button label="Cancel" onPress={() => setRemoveVisible(false)} />
      <Dialog.Button label="Remove" onPress={handleRemoveEggs} />
    </Dialog.Container>

    <TouchableOpacity 
      style={styles.deleteButton} 
      onPress={() => 
        Alert.alert(
          'Remove Student',
          `Are you sure you want to remove ${username}? His/her points and items in the cart will be removed. Make sure to deliver all the items before removing the student.`,
          [
            {text: 'Cancel'},
            {text: 'Remove', onPress: () => removeStudent() },
          ]
        )
      }
    >
      <IconSymbol size={28} name="trash.circle.fill" color="black" />
    </TouchableOpacity>
  </View>
  );
};

export default function ManageStudents() {
  const [userData, setUserData] = useState([]);
  const [selfInfo, setSelfInfo] = useState({});
  const [loading, setLoading] = useState(true);

  const [addStudentVisible0, setAddStudentVisible0] = useState(false); // case for no students
  const [username0, setUsername0] = useState('');
  const [addStudentVisible1, setAddStudentVisible1] = useState(false); // case for students exist
  const [username1, setUsername1] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${Config.API_URL}/api/all_users`, { withCredentials: true });
      setUserData(response.data.users);
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

  const addEggs = async (username, eggs, amountEggs) => {
    try {
      const response = await axios.post(`${Config.API_URL}/api/add_eggs`, {
        username: username,
        eggs: eggs,
        added_eggs: amountEggs,
      }, {
        withCredentials: true,
      });
      if (response.data.status === 'success') {
        fetchData();
        setLoading(false);
      } else {
        Alert.alert('Failed to add points');
      }
    } catch (error) {
      Alert.alert('Failed to add points');
      console.error(error);
    }
  };

  const onAddStudent0 = async () => {
    try {
      const response = await axios.post(`${Config.API_URL}/api/add_student_to_class`, {
        username: username0,
        class_id: selfInfo.class_id,
      }, {
        withCredentials: true,
      });
      if (response.data.status === 'success') {
        fetchData();
        setLoading(false);
      } else {
        Alert.alert(response.data.message);
      }
    } catch (error) {
      Alert.alert('Failed to add student');
      console.error(error);
    }
  };

  const onAddStudent1 = async () => {
    try {
      const response = await axios.post(`${Config.API_URL}/api/add_student_to_class`, {
        username: username1,
        class_id: selfInfo.class_id,
      }, {
        withCredentials: true,
      });
      if (response.data.status === 'success') {
        fetchData();
        setLoading(false);
      } else {
        Alert.alert(response.data.message);
      }
    } catch (error) {
      Alert.alert('Failed to add student');
      console.error(error);
    }
  };

  const handleAddStudent0 = () => {
    onAddStudent0();
    setUsername0('');
    setAddStudentVisible0(false);
  };

  const handleAddStudent1 = () => {
    onAddStudent1();
    setUsername1('');
    setAddStudentVisible1(false);
  };

  const onRemoveStudent = async (username) => {
    try {
      const response = await axios.post(`${Config.API_URL}/api/remove_student_from_class`, {
        username: username,
      }, {
        withCredentials: true,
      });
      if (response.data.status === 'success') {
        fetchData();
        setLoading(false);
      } else {
        Alert.alert("Failed to remove student");
      }
    } catch (error) {
      Alert.alert("Failed to remove student");
      console.error(error);
    }
  }

  useFocusEffect(
    useCallback(() => {
      const fetchAll = async () => {
        setLoading(true);
        await Promise.all([fetchData(), fetchSelfData()]);
        setLoading(false);
      };
      fetchAll();
    }, [])
  );

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (!userData || userData.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.header}>No students</Text>
        <TouchableOpacity style={styles.addStudentBtn} onPress={() => {
          if (!selfInfo.class_id) {
            Alert.alert('You must set your class name before you add a student');
          } else {
            setAddStudentVisible0(true)
          }
        }}>
          <Text style={{fontWeight: '800', color: '#FFFFFF'}}> Add </Text>
        </TouchableOpacity>
        <Dialog.Container visible={addStudentVisible0}>
          <Dialog.Title>Enter Student Username</Dialog.Title>
          <Dialog.Input 
            value={username0}
            onChangeText={setUsername0}
          />
          <Dialog.Button label="Cancel" onPress={() => setAddStudentVisible0(false)} />
          <Dialog.Button label="Add" onPress={handleAddStudent0} />
        </Dialog.Container>
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }) => {
    return (
      <Item
        username={item.username}
        eggs={item.eggs}
        onAddEggs={addEggs}
        onRemoveStudent={onRemoveStudent}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Students</Text>
      <TouchableOpacity style={styles.addStudentBtn} onPress={() => {
        if (!selfInfo.class_id) {
          Alert.alert('You must set your class name before you add a student');
        } else {
          setAddStudentVisible1(true)
        }
      }}>
        <Text style={{fontWeight: '800',color: '#FFFFFF'}}> Add </Text>
      </TouchableOpacity>
      <Dialog.Container visible={addStudentVisible1}>
        <Dialog.Title>Enter Student Username</Dialog.Title>
        <Dialog.Input 
          value={username1}
          onChangeText={setUsername1}
        />
        <Dialog.Button label="Cancel" onPress={() => setAddStudentVisible1(false)} />
        <Dialog.Button label="Add" onPress={handleAddStudent1} />
      </Dialog.Container>
      <FlatList
        data={userData}
        renderItem={renderItem}
        keyExtractor={item => item.username}
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
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 40,
  },
  addButton: {
    position: 'absolute',
    right: 5,
    bottom: 5,
    padding: 5,
    backgroundColor: '#ccccc0',
    borderRadius: 25,
  },
  addStudentBtn: {
    position: 'absolute',
    right: 20,
    top: 65,
    borderRadius: 50,
    padding: 10,
    backgroundColor: '#5c5c5c',
  },
  deleteButton: {
    position: 'absolute',
    right: -3,
    top: -3,
  },
});