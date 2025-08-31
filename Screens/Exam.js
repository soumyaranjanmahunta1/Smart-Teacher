import React, { useCallback, useEffect, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import axios from 'axios';
import LottieView from 'lottie-react-native';
import Toast from 'react-native-toast-message';
import ConformationPopup from '../Screens/ConformationPopup';
import CountdownTimer from '../Component/CountdownTimer';

const ExamCard = ({ item, navigate, onDelete }) => {
  const [isExamLive, setIsExamLive] = useState(false);

  useEffect(() => {
    const checkExamStatus = () => {
      const live = new Date(item.examDate).getTime() <= Date.now();
      setIsExamLive(live);
    };

    checkExamStatus();
    const interval = setInterval(checkExamStatus, 1000);
    return () => clearInterval(interval);
  }, [item.examDate]);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        !isExamLive,
        //  && { opacity: 0.5 }
      ]}
      // disabled={!isExamLive}
      onPress={() =>
        navigate.navigate('ExamHall', {
          testName: item.name,
          testId: item.id,
          examDuration: item.examDuration,
        })
      }
    >
      <View style={styles.cardContent}>
        {/* Right side with exam info */}
        <View style={{ flex: 1, marginLeft: 15 }}>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.level}>Level {item.level}</Text>
          {isExamLive ? (
            <Text style={styles.ready}>Exam is live</Text>
          ) : (
            <CountdownTimer examDate={item.examDate} />
          )}
        </View>
        <View style={styles.iconRow}>
          <TouchableOpacity onPress={() => onDelete(item.id)}>
            <Ionicons name="trash-outline" size={22} color="#2c3e50" />
          </TouchableOpacity>
          <Ionicons name="school-sharp" size={30} color="black" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const Exam = () => {
  const [exam, setExam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const navigate = useNavigation();

  // useEffect(() => {
  //   fetchPosts();
  // }, []);
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchPosts();
    }, []),
  );
  const fetchPosts = async () => {
    try {
      const response = await axios.get(
        'https://68a5c4352a3deed2960ec9d6.mockapi.io/exams',
      );
      setExam(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setTimeout(() => setLoading(false), 1500);
    }
  };

  const handleDeletePress = id => {
    setDeleteTarget(id);
    setModalVisible(true);
  };
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      let relatedQuestions = [];

      try {
        // 1. Try fetching related questions
        const questionsRes = await axios.get(
          `https://68a5c4352a3deed2960ec9d6.mockapi.io/questions?testId=${deleteTarget}`,
        );
        relatedQuestions = questionsRes?.data || [];
      } catch (err) {
        // If 404 or no questions, just continue with empty array
        if (err.response && err.response.status === 404) {
          relatedQuestions = [];
        } else {
          throw err; // rethrow other errors
        }
      }

      // 2. Delete each question (if any)
      if (relatedQuestions.length > 0) {
        await Promise.all(
          relatedQuestions.map(q =>
            axios.delete(
              `https://68a5c4352a3deed2960ec9d6.mockapi.io/questions/${q.id}`,
            ),
          ),
        );
      }

      // 3. Now delete the exam
      await axios.delete(
        `https://68a5c4352a3deed2960ec9d6.mockapi.io/exams/${deleteTarget}`,
      );

      // 4. Update state
      setExam(prev => prev.filter(item => item.id !== deleteTarget));

      Toast.show({
        type: 'success',
        text1: 'Deleted',
        text2: 'Exam & related questions deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting exam/questions:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to delete exam or related questions',
      });
    } finally {
      setDeleteTarget(null);
      setModalVisible(false);
    }
  };

  // const handleDeleteConfirm = async () => {
  //   if (!deleteTarget) return;
  //   try {
  //     await axios.delete(
  //       `https://68a5c4352a3deed2960ec9d6.mockapi.io/exams/${deleteTarget}`,
  //     );
  //     setExam(prev => prev.filter(item => item.id !== deleteTarget));
  //     Toast.show({
  //       type: 'success',
  //       text1: 'Deleted',
  //       text2: 'Exam deleted successfully',
  //     });
  //   } catch (error) {
  //     console.error('Error deleting exam:', error);
  //     Toast.show({
  //       type: 'error',
  //       text1: 'Error',
  //       text2: 'Failed to delete exam',
  //     });
  //   } finally {
  //     setDeleteTarget(null);
  //     setModalVisible(false);
  //   }
  // };

  if (loading) {
    return (
      <View style={styles.splashContainer}>
        <LottieView
          source={require('../Gif/loading.json')}
          autoPlay
          loop
          style={{ width: 350, height: 350 }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Create Exam button */}
      <TouchableOpacity
        style={styles.submitBtn}
        onPress={() => navigate.navigate('CreateExam')}
      >
        <Text style={styles.submitBtnText}>Create Exam</Text>
      </TouchableOpacity>

      {exam.length === 0 ? (
        <View style={styles.noDataContainer}>
          <LottieView
            source={require('../Gif/empty box3.json')}
            autoPlay
            loop
            style={{ width: 350, height: 350 }}
          />
          <Text style={styles.noDataText}>No Exam Available</Text>
        </View>
      ) : (
        <FlatList
          data={exam}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ExamCard
              item={item}
              navigate={navigate}
              onDelete={handleDeletePress}
            />
          )}
        />
      )}

      {/* Confirmation popup */}
      <ConformationPopup
        visible={modalVisible}
        message="Are you sure you want to delete this exam?"
        onCancel={() => setModalVisible(false)}
        onConfirm={handleDeleteConfirm}
      />

      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FCDFBB',
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 70,
    backgroundColor: '#FCDFBB',
  },
  submitBtn: {
    backgroundColor: '#FF3D00',
    paddingVertical: 8,
    paddingHorizontal: 7,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    width: '60%',
    alignSelf: 'center',
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noDataText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#777',
  },
  card: {
    padding: 20,
    marginBottom: 15,
    backgroundColor: '#FEF3E7',
    borderRadius: 10,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: { fontSize: 18, fontWeight: 'bold' },
  level: { fontSize: 14, color: 'gray' },
  ready: { marginTop: 5, color: 'green', fontWeight: '600' },
});

export default Exam;
