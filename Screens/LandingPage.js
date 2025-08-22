import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import axios from 'axios';
import LottieView from 'lottie-react-native';

const LandingPage = ({ navigation }) => {
  const [test, setTest] = useState([]);
  const [loading, setLoading] = useState(true); // 👈 show animation first
  const navigate = useNavigation();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios(
        'https://68a169876f8c17b8f5d9c4b0.mockapi.io/get/tests/tests',
      );
      setTest(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      // 👇 Keep splash for 2.5s, then show LandingPage
      setTimeout(() => setLoading(false), 2500);
    }
  };

  if (loading) {
    return (
      <View style={styles.splashContainer}>
        <LottieView
          source={require('../Gif/study.json')}
          autoPlay
          loop={false}
          style={{ width: 350, height: 350 }}
        />
        <Text style={styles.splashText}>Welcome to Smart Study</Text>
        <Text style={styles.tagLine}>Study Less, Learn More</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {test.length === 0 ? (
        <View style={styles.noDataContainer}>
          <LottieView
            source={require('../Gif/empty box3.json')}
            autoPlay
            loop
            style={{ width: 350, height: 350 }}
          />
          <Text style={styles.noDataText}>No Test Available</Text>
        </View>
      ) : (
        <View>
          <Text style={styles.text}>Available Tests</Text>
          <FlatList
            data={test}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() =>
                  navigate.navigate('TestPage', {
                    testName: item.name,
                    testId: item.id,
                  })
                }
              >
                <View style={styles.cardContent}>
                  <View>
                    <Text style={styles.title}>{item.name}</Text>
                    <Text style={styles.level}>Level {item.level}</Text>
                  </View>
                  <FontAwesome6 name="file-pen" size={30} color="black" />
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
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
  splashText: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#27054F',
  },
  tagLine: {
    fontSize: 16,
    color: '#27054F',
    fontStyle: 'italic',
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 70,
    backgroundColor: '#FCDFBB',
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
    justifyContent: 'space-between', // text left, icon right
    alignItems: 'center',
  },
  text: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 18, fontWeight: 'bold' },
  level: { fontSize: 14, color: 'gray' },
});

export default LandingPage;
