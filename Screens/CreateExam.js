import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import DateTimePicker from '@react-native-community/datetimepicker';

const CreateExam = () => {
  const [examName, setExamName] = useState('');
  const [level, setLevel] = useState('Easy');
  const [examDate, setExamDate] = useState(new Date());
  const [duration, setDuration] = useState({ hours: 0, minutes: 0 });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();

  const formatDuration = ({ hours, minutes }) => {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
      2,
      '0',
    )}:00`;
  };

  const handleSubmit = async () => {
    if (!examName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Required',
        text2: 'Please enter exam name',
      });
      return;
    }

    if (loading) return;
    setLoading(true);

    const payload = {
      name: examName,
      level,
      examDate: examDate.toISOString(), // ✅ ISO format
      examDuration: formatDuration(duration), // ✅ hh:mm:ss
    };

    try {
      await axios.post(
        'https://68a5c4352a3deed2960ec9d6.mockapi.io/exams',
        payload,
      );
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Exam created successfully!',
      });
      navigation.goBack();
    } catch (error) {
      console.error('Error creating exam:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to create exam',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Exam Name */}
      <Text style={styles.label}>Exam Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter exam name"
        value={examName}
        onChangeText={setExamName}
      />

      {/* Level Selection */}
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

      {/* Date Picker */}
      <Text style={styles.label}>Exam Date</Text>
      <TouchableOpacity
        style={styles.dateBtn}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.dateText}>
          {examDate.toLocaleDateString()} {examDate.toLocaleTimeString()}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={examDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setExamDate(selectedDate);
          }}
        />
      )}
      <TouchableOpacity
        style={styles.dateBtn}
        onPress={() => setShowTimePicker(true)}
      >
        <Text style={styles.dateText}>Select Time</Text>
      </TouchableOpacity>
      {showTimePicker && (
        <DateTimePicker
          value={examDate}
          mode="time"
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedTime) => {
            setShowTimePicker(false);
            if (selectedTime) {
              let newDate = new Date(examDate);
              newDate.setHours(selectedTime.getHours());
              newDate.setMinutes(selectedTime.getMinutes());
              setExamDate(newDate);
            }
          }}
        />
      )}

      {/* Duration Input */}
      <Text style={styles.label}>Exam Duration (hh:mm)</Text>
      <View style={styles.durationRow}>
        <TextInput
          style={styles.durationInput}
          placeholder="Hours"
          keyboardType="numeric"
          value={String(duration.hours)}
          onChangeText={val =>
            setDuration({ ...duration, hours: parseInt(val) || 0 })
          }
        />
        <TextInput
          style={styles.durationInput}
          placeholder="Minutes"
          keyboardType="numeric"
          value={String(duration.minutes)}
          onChangeText={val =>
            setDuration({ ...duration, minutes: parseInt(val) || 0 })
          }
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitBtn, loading && { opacity: 0.6 }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitBtnText}>Create Exam</Text>
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
  dateBtn: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  dateText: {
    color: '#2c3e50',
  },
  durationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  durationInput: {
    flex: 0.45,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#fff',
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

export default CreateExam;
