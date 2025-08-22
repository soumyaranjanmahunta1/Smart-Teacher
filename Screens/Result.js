import axios from 'axios';
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import ConformationPopup from '../Screens/ConformationPopup';

const Result = () => {
  const [resultData, setResultData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: "student"/"exam", examIndex, studentIndex? }

  const fetchResultData = async () => {
    try {
      const response = await axios(
        'https://68a5f0502a3deed2960f6965.mockapi.io/resultData',
      );

      const sortedData = response.data.map(exam => ({
        ...exam,
        results: [...exam.results].sort((a, b) => b.mark - a.mark),
      }));

      setResultData(sortedData);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchResultData();
    }, []),
  );

  // ✅ Handle deletion
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      const updatedData = [...resultData];

      if (deleteTarget.type === 'student') {
        const exam = updatedData[deleteTarget.examIndex];
        const studentIndex = deleteTarget.studentIndex;

        // Remove student locally
        exam.results.splice(studentIndex, 1);

        // Update exam on API
        await axios.put(
          `https://68a5f0502a3deed2960f6965.mockapi.io/resultData/${exam.id}`,
          { ...exam, results: exam.results },
        );
      } else if (deleteTarget.type === 'exam') {
        const examId = updatedData[deleteTarget.examIndex].id;

        // Delete exam from API
        await axios.delete(
          `https://68a5f0502a3deed2960f6965.mockapi.io/resultData/${examId}`,
        );

        // Remove exam locally
        updatedData.splice(deleteTarget.examIndex, 1);
      }

      setResultData(updatedData);
    } catch (error) {
      console.error('Error deleting:', error);
    } finally {
      setDeleteTarget(null);
      setModalVisible(false);
    }
  };

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
      {resultData.length === 0 ? (
        <View style={styles.noDataContainer}>
          <LottieView
            source={require('../Gif/empty box3.json')}
            autoPlay
            loop
            style={{ width: 350, height: 350 }}
          />
          <Text style={styles.noDataText}>No Data</Text>
        </View>
      ) : (
        <FlatList
          data={resultData}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index: examIndex }) => (
            <View style={styles.examCard}>
              <View style={styles.examHeader}>
                <Text style={styles.examTitle}>{item.exam}</Text>
                <TouchableOpacity
                  onPress={() => {
                    setDeleteTarget({ type: 'exam', examIndex });
                    setModalVisible(true);
                  }}
                >
                  <Icon name="trash" size={24} color="#2c3e50" />
                </TouchableOpacity>
              </View>

              {/* Table Header */}
              <View style={[styles.row, styles.headerRow]}>
                <Text style={[styles.cell, styles.headerCell, { flex: 0.5 }]}>
                  #
                </Text>
                <Text style={[styles.cell, styles.headerCell]}>
                  Student Name
                </Text>
                <Text style={[styles.cell, styles.headerCell]}>Marks</Text>
                <Text style={[styles.cell, styles.headerCell, { flex: 0.5 }]} />
              </View>

              {/* Table Rows */}
              {item.results.map((student, studentIndex) => (
                <View
                  key={studentIndex}
                  style={[
                    styles.row,
                    studentIndex % 2 === 0 ? styles.evenRow : styles.oddRow,
                  ]}
                >
                  <Text style={[styles.cell, { flex: 0.5 }]}>
                    {studentIndex + 1}
                  </Text>
                  <Text style={styles.cell}>{student.name}</Text>
                  <Text style={styles.cell}>{student.mark}</Text>
                  <TouchableOpacity
                    style={{ flex: 0.5, alignItems: 'center' }}
                    onPress={() => {
                      setDeleteTarget({
                        type: 'student',
                        examIndex,
                        studentIndex,
                      });
                      setModalVisible(true);
                    }}
                  >
                    <Icon name="trash-outline" size={20} color="#2c3e50" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        />
      )}

      {/* Confirmation Modal */}
      <ConformationPopup
        visible={modalVisible}
        message={
          deleteTarget?.type === 'exam'
            ? 'Are you sure you want to delete this exam?'
            : 'Are you sure you want to delete this student?'
        }
        onCancel={() => setModalVisible(false)}
        onConfirm={handleDeleteConfirm}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCDFBB',
    padding: 10,
    paddingTop: 70,
  },
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FCDFBB',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noDataText: { fontSize: 18, fontWeight: 'bold', color: '#777' },
  examCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  examHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  examTitle: { fontSize: 20, fontWeight: 'bold', color: '#2c3e50' },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 8,
    paddingHorizontal: 5,
    alignItems: 'center',
  },
  headerRow: { backgroundColor: '#FCDFBB' },
  cell: { flex: 1, fontSize: 14, color: '#2c3e50', textAlign: 'center' },
  headerCell: { fontWeight: 'bold', textAlign: 'center' },
  evenRow: { backgroundColor: '#FEF3E7' },
  oddRow: { backgroundColor: '#fff' },
});

export default Result;
