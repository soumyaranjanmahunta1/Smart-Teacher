import axios from 'axios';
import LottieView from 'lottie-react-native';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import Sound from 'react-native-sound';
// const questions = [
//   {
//     id: 1,
//     question: 'What is 2 + 2 ?',
//     options: ['2', '3', '4', '5'],
//     correctIndex: 2,
//   },
//   {
//     id: 2,
//     question: 'What is capital of France?',
//     options: ['Berlin', 'Madrid', 'Paris', 'Rome'],
//     correctIndex: 2,
//   },
//   {
//     id: 3,
//     question: 'What is 7 + 2 ?',
//     options: ['9', '3', '4', '5'],
//     correctIndex: 0,
//   },
//   {
//     id: 4,
//     question: 'What is 2 - 2 ?',
//     options: ['2', '3', '0', '5'],
//     correctIndex: 2,
//   },
//   // ... total 10 questions
// ];
const TestPage = ({ route }) => {
  const { testName, testId } = route.params;
  const [selectedOptions, setSelectedOptions] = useState({});
  const [questions, setQuestions] = useState([]);
  const [blast, setBlast] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const handleSelect = (qId, optionIndex, correctIndex) => {
    setBlast(false);
    if (selectedOptions[qId] !== undefined) return; // prevent reselect
    setSelectedOptions({
      ...selectedOptions,
      [qId]: optionIndex,
    });
    if (optionIndex === correctIndex) {
      setTotalScore(prev => prev + 1);
      setBlast(false);
      setTimeout(() => {
        setBlast(true);
      }, 10);
      // Play wow sound
      const sound = new Sound('wow.mp3', Sound.MAIN_BUNDLE, error => {
        if (error) {
          console.log('Failed to load sound', error);
          return;
        }
        sound.play(() => {
          sound.release(); // free up memory after playing
        });
      });
    } else {
      // Play wow sound
      const sound = new Sound('wrong.mp3', Sound.MAIN_BUNDLE, error => {
        if (error) {
          console.log('Failed to load sound', error);
          return;
        }
        sound.play(() => {
          sound.release(); // free up memory after playing
        });
      });
    }
  };
  useEffect(() => {
    fetchQuestions();
  }, []);
  const fetchQuestions = async () => {
    try {
      const response = await axios(
        `https://68a169876f8c17b8f5d9c4b0.mockapi.io/get/tests/getQuestions?testId=${Number(
          testId,
        )}`,
      );
      setQuestions(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.header}>{testName}</Text>
      <Text style={styles.score}>Total Score: {totalScore}</Text>

      <FlatList
        data={questions}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => {
          const selected = selectedOptions[item.id];
          return (
            <View style={styles.questionBlock}>
              <Text style={styles.question}>
                {item.id}. {item.question}
              </Text>
              {item.options.map((opt, index) => {
                let borderColor = '#ccc';
                if (selected !== undefined) {
                  if (index === selected) {
                    borderColor = index === item.correctIndex ? 'green' : 'red';
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
                    <Text>{opt}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        }}
      />
      {blast && (
        <View
          pointerEvents="none" // ✅ wrapper ignores touches
          style={{
            position: 'absolute',
            top: -230,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
            backgroundColor: 'transparent',
          }}
        >
          <LottieView
            source={require('../Gif/Confetti.json')}
            autoPlay
            loop={false}
            style={{
              width: '100%',
              height: '100%',
            }}
            onAnimationFinish={() => setBlast(false)}
          />
        </View>
      )}
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
  questionBlock: { marginBottom: 20 },
  question: { fontSize: 18, marginBottom: 10 },
  option: {
    padding: 12,
    borderWidth: 2,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#FEF3E7',
  },
});
export default TestPage;
