import { useFocusEffect, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import LottieView from 'lottie-react-native';
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import Sound from 'react-native-sound';
import Icon from 'react-native-vector-icons/Ionicons';
import ConformationPopup from '../Screens/ConformationPopup';

const TestPage = ({ route }) => {
  const { testName, testId } = route.params;
  const navigation = useNavigation();

  const [selectedOptions, setSelectedOptions] = useState({});
  const [questions, setQuestions] = useState([]);
  const [blast, setBlast] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 🔑 delete confirmation states
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { questionId }

  const handleSelect = (qId, optionIndex, correctIndex) => {
    setBlast(false);
    if (selectedOptions[qId] !== undefined) return;

    setSelectedOptions({
      ...selectedOptions,
      [qId]: optionIndex,
    });

    if (optionIndex === correctIndex) {
      setTotalScore(prev => prev + 1);
      setTimeout(() => setBlast(true), 10);

      const sound = new Sound('wow.mp3', Sound.MAIN_BUNDLE, error => {
        if (!error) {
          sound.play(() => sound.release());
        }
      });
    } else {
      const sound = new Sound('wrong.mp3', Sound.MAIN_BUNDLE, error => {
        if (!error) {
          sound.play(() => sound.release());
        }
      });
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchQuestions();
    }, []),
  );

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      setQuestions([]);

      const response = await axios.get(
        `https://68a169876f8c17b8f5d9c4b0.mockapi.io/get/tests/getQuestions?testId=${Number(
          testId,
        )}`,
      );

      if (response.data && response.data.length > 0) {
        setQuestions(response.data);
      } else {
        setErrorMessage('No questions available for this test.');
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setErrorMessage('No questions found for this test.');
      } else {
        setErrorMessage('Something went wrong. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 🔥 confirm delete
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(
        `https://68a169876f8c17b8f5d9c4b0.mockapi.io/get/tests/getQuestions/${deleteTarget.questionId}`,
      );
      setQuestions(prev => prev.filter(q => q.id !== deleteTarget.questionId));
    } catch (err) {
      console.error('Error deleting question:', err);
    } finally {
      setDeleteTarget(null);
      setModalVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <Text style={styles.header}>{testName}</Text>

        <TouchableOpacity
          style={styles.submitBtn}
          onPress={() => navigation.navigate('CreateQuestion', { testId })}
        >
          <Text style={styles.submitBtnText}>Create Question</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.score}>Total Score: {totalScore}</Text>

      {/* Loading state */}
      {loading && <ActivityIndicator size="large" color="#FF3D00" />}

      {/* Error or No Questions */}
      {!loading && errorMessage ? (
        <View style={styles.noDataContainer}>
          <LottieView
            source={require('../Gif/empty box3.json')}
            autoPlay
            loop
            style={{ width: 300, height: 300 }}
          />
          <Text style={styles.noDataText}>{errorMessage}</Text>
        </View>
      ) : (
        <FlatList
          data={questions}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item, index }) => {
            const selected = selectedOptions[item.id];
            return (
              <View style={styles.questionBlock}>
                <View style={styles.questionHeader}>
                  <Text style={styles.question}>
                    {index + 1}. {item.question}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setDeleteTarget({ questionId: item.id });
                      setModalVisible(true);
                    }}
                  >
                    <Icon name="trash" size={22} color="#2c3e50" />
                  </TouchableOpacity>
                </View>

                {item.options.map((opt, idx) => {
                  let borderColor = '#ccc';
                  if (selected !== undefined) {
                    if (idx === selected) {
                      borderColor = idx === item.correctIndex ? 'green' : 'red';
                    }
                    if (idx === item.correctIndex) {
                      borderColor = 'green';
                    }
                  }
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.option, { borderColor }]}
                      onPress={() =>
                        handleSelect(item.id, idx, item.correctIndex)
                      }
                    >
                      <Text>{opt}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            );
          }}
        />
      )}

      {/* Confetti Blast 🎉 */}
      {blast && (
        <View pointerEvents="none" style={styles.confettiContainer}>
          <LottieView
            source={require('../Gif/Confetti.json')}
            autoPlay
            loop={false}
            style={{ width: '100%', height: '100%' }}
            onAnimationFinish={() => setBlast(false)}
          />
        </View>
      )}

      {/* Confirmation Popup */}
      <ConformationPopup
        visible={modalVisible}
        message="Are you sure you want to delete this question?"
        onCancel={() => setModalVisible(false)}
        onConfirm={handleDeleteConfirm}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#FCDFBB' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  score: {
    fontSize: 18,
    marginBottom: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  submitBtn: {
    backgroundColor: '#FF3D00',
    paddingVertical: 8,
    paddingHorizontal: 7,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    alignSelf: 'center',
  },
  submitBtnText: { color: '#fff', fontWeight: '600' },
  questionBlock: { marginBottom: 20 },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  question: { fontSize: 18, flex: 1, marginRight: 10 },
  option: {
    padding: 12,
    borderWidth: 2,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#FEF3E7',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: { fontSize: 16, color: '#555', marginTop: 10 },
  confettiContainer: {
    position: 'absolute',
    top: -230,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    backgroundColor: 'transparent',
  },
});

export default TestPage;
