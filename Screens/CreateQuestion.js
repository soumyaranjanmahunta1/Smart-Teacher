import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import axios from 'axios';
import Toast from 'react-native-toast-message';

const CreateQuestion = ({ route, navigation }) => {
  const { testId } = route.params;

  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(null);

  const handleOptionChange = (text, index) => {
    const newOptions = [...options];
    newOptions[index] = text;
    setOptions(newOptions);
  };

  const handleSave = async () => {
    if (!question || options.some(o => !o) || correctIndex === null) {
      alert('Please fill all fields and select the correct answer.');
      return;
    }

    const payload = {
      testId,
      question,
      options,
      correctIndex,
    };

    try {
      await axios.post(
        `https://68a169876f8c17b8f5d9c4b0.mockapi.io/get/tests/getQuestions`,
        payload,
      );
      console.log(payload);
      Toast.show({
        type: 'success',
        text1: 'Created',
        text2: 'Question created successfully',
      });
      navigation.goBack();
    } catch (error) {
      console.error('Error creating question:', error);
      alert('Failed to create question. Try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Question</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter Question"
        value={question}
        onChangeText={setQuestion}
      />

      {options.map((opt, idx) => (
        <TextInput
          key={idx}
          style={styles.input}
          placeholder={`Option ${idx + 1}`}
          value={opt}
          onChangeText={text => handleOptionChange(text, idx)}
        />
      ))}

      <Text style={styles.label}>Select Correct Answer:</Text>
      <View style={styles.correctOptions}>
        {options.map((_, idx) => (
          <TouchableOpacity
            key={idx}
            style={[
              styles.correctBtn,
              correctIndex === idx && { backgroundColor: 'green' },
            ]}
            onPress={() => setCorrectIndex(idx)}
          >
            <Text style={styles.correctBtnText}>Option {idx + 1}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.submitBtn} onPress={handleSave}>
        <Text style={styles.submitBtnText}>Save Question</Text>
      </TouchableOpacity>
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
  label: { fontSize: 16, marginVertical: 10 },
  correctOptions: { flexDirection: 'row', flexWrap: 'wrap' },
  correctBtn: {
    backgroundColor: '#007BFF',
    padding: 8,
    borderRadius: 6,
    margin: 4,
  },
  correctBtnText: { color: '#fff' },
  submitBtn: {
    backgroundColor: 'green',
    padding: 12,
    borderRadius: 6,
    marginTop: 20,
    alignItems: 'center',
  },
  submitBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});

export default CreateQuestion;
