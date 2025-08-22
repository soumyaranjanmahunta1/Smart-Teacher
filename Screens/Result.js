import axios from 'axios';
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import LottieView from 'lottie-react-native';
import { useFocusEffect } from '@react-navigation/native';

const Result = () => {
  const [resultData, setResultData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchResultData = async () => {
    try {
      const response = await axios(
        'https://68a5f0502a3deed2960f6965.mockapi.io/resultData',
      );

      // ✅ Sort each exam's results in descending order by marks
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

  // ✅ Fetch again whenever screen is focused
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchResultData();
    }, []),
  );

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
          renderItem={({ item }) => (
            <View style={styles.examCard}>
              <Text style={styles.examTitle}>{item.exam}</Text>

              {/* Table Header */}
              <View style={[styles.row, styles.headerRow]}>
                <Text style={[styles.cell, styles.headerCell, { flex: 0.5 }]}>
                  #
                </Text>
                <Text style={[styles.cell, styles.headerCell]}>
                  Student Name
                </Text>
                <Text style={[styles.cell, styles.headerCell]}>Marks</Text>
              </View>

              {/* Table Rows */}
              {item.results.map((student, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.row,
                    idx % 2 === 0 ? styles.evenRow : styles.oddRow,
                  ]}
                >
                  <Text style={[styles.cell, { flex: 0.5 }]}>{idx + 1}</Text>
                  <Text style={styles.cell}>{student.name}</Text>
                  <Text style={styles.cell}>{student.mark}</Text>
                </View>
              ))}
            </View>
          )}
        />
      )}
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
  noDataText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#777',
  },
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
  examTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#2c3e50',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  headerRow: {
    backgroundColor: '#FCDFBB',
  },
  cell: {
    flex: 1,
    fontSize: 14,
    color: '#2c3e50',
    textAlign: 'center',
  },
  headerCell: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  evenRow: {
    backgroundColor: '#FEF3E7',
  },
  oddRow: {
    backgroundColor: '#fff',
  },
});

export default Result;
