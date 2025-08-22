import axios from 'axios';
import LottieView from 'lottie-react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import React, { useEffect, useState, useRef } from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  FlatList,
  Dimensions,
} from 'react-native';
import Sound from 'react-native-sound';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('window');

const ExamHall = ({ route, navigation }) => {
  const { testName, testId, examDuration } = route.params;
  const [selectedOptions, setSelectedOptions] = useState({});
  const [questions, setQuestions] = useState([]);
  const [blast, setBlast] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [name, setName] = useState('');
  const [showNameModal, setShowNameModal] = useState(true);
  const [timer, setTimer] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [examFinished, setExamFinished] = useState(false);
  const flatListRef = useRef();
  const timerRef = useRef(null);

  const parseDuration = duration => {
    const [h, m, s] = duration.split(':').map(Number);
    return h * 3600 + m * 60 + s;
  };

  const startTimer = timeLeft => {
    let time = timeLeft ?? parseDuration(examDuration);
    setTimer(time);

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      time -= 1;
      setTimer(time);
      AsyncStorage.setItem(`timer_${testId}`, String(time));
      if (time <= 0) {
        clearInterval(timerRef.current);
        handleSubmit();
      }
    }, 1000);
  };

  const handleSelect = (qId, optionIndex, correctIndex) => {
    setBlast(false);
    if (selectedOptions[qId] !== undefined) return;

    const isCorrect = optionIndex === correctIndex;

    setSelectedOptions(prev => {
      const updated = { ...prev, [qId]: optionIndex };
      AsyncStorage.setItem(`answers_${testId}`, JSON.stringify(updated));
      return updated;
    });

    if (isCorrect) {
      const newScore = totalScore + 1;
      setTotalScore(newScore);
      AsyncStorage.setItem(`score_${testId}`, String(newScore)); // ✅ save score
      setTimeout(() => setBlast(true), 10);

      const sound = new Sound('wow.mp3', Sound.MAIN_BUNDLE, error => {
        if (!error) sound.play(() => sound.release());
      });
    } else {
      const sound = new Sound('wrong.mp3', Sound.MAIN_BUNDLE, error => {
        if (!error) sound.play(() => sound.release());
      });
    }
  };

  const handleSubmit = async () => {
    if (examFinished) return;
    setExamFinished(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    try {
      const apiUrl = 'https://68a5f0502a3deed2960f6965.mockapi.io/resultData';
      const { data } = await axios.get(apiUrl);

      const existingExam = data.find(exam => exam.exam === testName);

      if (existingExam) {
        const updatedResults = [
          ...existingExam.results,
          { name, mark: totalScore },
        ];

        await axios.put(`${apiUrl}/${existingExam.id}`, {
          exam: testName,
          results: updatedResults,
        });
      } else {
        await axios.post(apiUrl, {
          exam: testName,
          results: [{ name, mark: totalScore }],
        });
      }
      setShowFinishModal(true);

      // Clear storage
      await AsyncStorage.removeItem(`timer_${testId}`);
      await AsyncStorage.removeItem(`answers_${testId}`);
      await AsyncStorage.removeItem(`name_${testId}`);
      await AsyncStorage.removeItem(`score_${testId}`);
    } catch (error) {
      console.error('Error saving result:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to save result. Try again!',
      });
    }
  };

  useEffect(() => {
    fetchQuestions();
    restoreSession();
  }, []);

  const restoreSession = async () => {
    const savedName = await AsyncStorage.getItem(`name_${testId}`);
    const savedAnswers = await AsyncStorage.getItem(`answers_${testId}`);
    const savedTimer = await AsyncStorage.getItem(`timer_${testId}`);
    const savedScore = await AsyncStorage.getItem(`score_${testId}`);

    if (savedName) {
      setName(savedName);
      setShowNameModal(false);
    }
    if (savedAnswers) setSelectedOptions(JSON.parse(savedAnswers));
    if (savedTimer) startTimer(Number(savedTimer));
    if (savedScore) setTotalScore(Number(savedScore)); // ✅ restore score
  };

  const fetchQuestions = async () => {
    try {
      const response = await axios(
        `https://68a5c4352a3deed2960ec9d6.mockapi.io/questions?testId=${Number(
          testId,
        )}`,
      );
      setQuestions(response.data);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const formatTime = seconds => {
    if (seconds === null) return '';
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      {!showNameModal && (
        <View style={styles.headerRow}>
          <Text style={styles.timer}>{formatTime(timer)}</Text>
          <Text style={styles.examName}>{testName}</Text>
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitBtnText}>Submit</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Questions */}
      <FlatList
        ref={flatListRef}
        data={questions}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => {
          const selected = selectedOptions[item.id];
          return (
            <View style={styles.cardWrapper}>
              <View style={styles.questionCard}>
                <Text style={styles.question}>{item.question}</Text>
                {item.options.map((opt, index) => {
                  let borderColor = '#ccc';
                  if (selected !== undefined) {
                    if (index === selected) {
                      borderColor =
                        index === item.correctIndex ? 'green' : 'red';
                    }
                    if (index === item.correctIndex) {
                      borderColor = 'green';
                    }
                  }
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[styles.option, { borderColor }]}
                      onPress={() =>
                        handleSelect(item.id, index, item.correctIndex)
                      }
                    >
                      <Text style={styles.optionText}>{opt}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        }}
        onMomentumScrollEnd={e => {
          const index = Math.round(
            e.nativeEvent.contentOffset.x /
              e.nativeEvent.layoutMeasurement.width,
          );
          setCurrentIndex(index);
        }}
      />

      {/* Arrows */}
      {!showNameModal && questions.length > 0 && (
        <>
          {currentIndex > 0 && (
            <TouchableOpacity
              style={[styles.arrowContainer, { left: -15 }]}
              onPress={() =>
                flatListRef.current.scrollToIndex({ index: currentIndex - 1 })
              }
            >
              <Icon name="navigate-before" size={70} color="#615445" />
            </TouchableOpacity>
          )}
          {currentIndex < questions.length - 1 && (
            <TouchableOpacity
              style={[styles.arrowContainer, { right: -15 }]}
              onPress={() =>
                flatListRef.current.scrollToIndex({ index: currentIndex + 1 })
              }
            >
              <Icon name="navigate-next" size={70} color="#615445" />
            </TouchableOpacity>
          )}
        </>
      )}

      {/* Confetti */}
      {blast && (
        <View pointerEvents="none" style={styles.confettiWrapper}>
          <LottieView
            source={require('../Gif/Confetti.json')}
            autoPlay
            loop={false}
            style={{ width: '100%', height: '100%' }}
            onAnimationFinish={() => setBlast(false)}
          />
        </View>
      )}

      {/* Name Modal */}
      <Modal visible={showNameModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
              Enter Your Name
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your Name"
              style={styles.input}
            />
            <TouchableOpacity
              style={styles.startBtn}
              onPress={async () => {
                if (name.trim() !== '') {
                  await AsyncStorage.setItem(`name_${testId}`, name);
                  setShowNameModal(false);
                  startTimer();
                } else {
                  Toast.show({
                    type: 'error',
                    text1: 'Required',
                    text2: 'Please enter your name',
                  });
                }
              }}
            >
              <Text style={styles.startBtnText}>Start Exam</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.startBtn,
                { backgroundColor: '#ccc', marginTop: 10 },
              ]}
              onPress={() => navigation.goBack()}
            >
              <Text style={[styles.startBtnText, { color: '#000' }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Finish Modal */}
      <Modal visible={showFinishModal} transparent animationType="fade">
        <View style={styles.finishModalContainer}>
          <View style={styles.finishBox}>
            <TouchableOpacity
              style={styles.closeIcon}
              onPress={() => {
                setShowFinishModal(false);
                navigation.goBack();
              }}
            >
              <Entypo name="circle-with-cross" size={28} color="red" />
            </TouchableOpacity>

            <View style={styles.resultContainer}>
              <LottieView
                source={require('../Gif/Get things done.json')}
                autoPlay
                loop={false}
                style={{ width: 200, height: 200 }}
                pointerEvents="none"
              />

              <View style={styles.scoreContainer}>
                <View style={styles.scoreCircle}>
                  <Text style={styles.scoreAchieved}>{totalScore}</Text>
                  <View style={styles.divider} />
                  <Text style={styles.scoreTotal}>{questions.length}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  finishModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  finishBox: {
    backgroundColor: '#FEF3E7',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: '85%',
    position: 'relative',
  },
  resultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  scoreContainer: {
    marginLeft: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: 'green',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreAchieved: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'green',
  },
  divider: {
    width: '60%',
    height: 2,
    backgroundColor: 'green',
    marginVertical: 5,
  },
  scoreTotal: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'green',
  },
  closeIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    elevation: 10,
  },
  container: { flex: 1, backgroundColor: '#FCDFBB' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    alignItems: 'center',
  },
  timer: { fontSize: 18, fontWeight: 'bold', color: 'red' },
  examName: { fontSize: 20, fontWeight: 'bold' },
  submitBtn: {
    backgroundColor: '#FF3D00',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cardWrapper: {
    width: width,
    alignItems: 'center',
    marginTop: 10,
  },
  questionCard: {
    width: width * 0.9,
    minHeight: height * 0.55,
    backgroundColor: '#FEF3E7',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 5,
  },
  question: {
    fontSize: 20,
    marginBottom: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  option: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: '#FCDFBB',
    width: '100%',
  },
  optionText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  arrowContainer: {
    position: 'absolute',
    top: height * 0.3,
    zIndex: 1000,
  },
  arrow: { fontSize: 32 },
  confettiWrapper: {
    position: 'absolute',
    top: -230,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    width: '100%',
    padding: 10,
    marginVertical: 15,
  },
  startBtn: {
    backgroundColor: '#FF3D00',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  startBtnText: { color: '#fff', fontWeight: 'bold' },
});

export default ExamHall;
