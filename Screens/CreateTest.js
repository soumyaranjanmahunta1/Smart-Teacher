import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

const CreateTest = () => {
  const [testName, setTestName] = useState('');
  const [level, setLevel] = useState('Easy'); // default
  const [loading, setLoading] = useState(false); // ✅ new state
  const navigation = useNavigation();

  const handleSubmit = async () => {
    if (!testName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Required',
        text2: 'Please enter Test name',
      });
      return;
    }

    if (loading) return;
    setLoading(true);

    const payload = {
      name: testName,
      level: level,
    };

    try {
      await axios.post(
        'https://68a169876f8c17b8f5d9c4b0.mockapi.io/get/tests/tests',
        payload,
      );
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Test created successfully!',
      });
      navigation.navigate('MainTabs'); // back to home
    } catch (error) {
      console.error('Error creating test:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to create test',
      });
    } finally {
      setLoading(false); // ✅ re-enable button
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Test Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter test name"
        value={testName}
        onChangeText={setTestName}
      />
      <Text style={styles.label}>Select Level</Text>
      <View style={styles.radioGroup}>
        {['Easy', 'Moderate', 'Hard'].map(option => (
          <TouchableOpacity
            key={option}
            style={styles.radioRow}
            onPress={() => setLevel(option)}
          >
            <View
              style={[
                styles.radioCircle,
                level === option && styles.radioSelected,
              ]}
            />
            <Text style={styles.radioText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.submitBtn, loading && { opacity: 0.6 }]} // dim button when loading
        onPress={handleSubmit}
        disabled={loading} // ✅ disable while loading
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitBtnText}>Create Test</Text>
        )}
      </TouchableOpacity>
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCDFBB',
    padding: 20,
    paddingTop: 60,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#2c3e50',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  radioGroup: {
    marginBottom: 20,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2c3e50',
    marginRight: 10,
  },
  radioSelected: {
    backgroundColor: '#2c3e50',
  },
  radioText: {
    fontSize: 15,
    color: '#2c3e50',
  },
  submitBtn: {
    backgroundColor: '#FF3D00',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    width: '60%',
    alignSelf: 'center',
    marginTop: 20,
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CreateTest;
