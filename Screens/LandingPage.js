import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Icon from 'react-native-vector-icons/Ionicons';
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
import ConformationPopup from '../Screens/ConformationPopup'; // 👈 import your popup

const LandingPage = ({ navigation }) => {
  const [test, setTest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const navigate = useNavigation();

  useEffect(() => {
    fetchPosts();
  }, []);
  const handleDeletePress = id => {
    setDeleteTarget(id);
    setModalVisible(true);
  };
  const fetchPosts = async () => {
    try {
      const response = await axios.get(
        'https://68a169876f8c17b8f5d9c4b0.mockapi.io/get/tests/tests',
      );
      setTest(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setTimeout(() => setLoading(false), 2500);
    }
  };
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      // delete from API
      await axios.delete(
        `https://68a169876f8c17b8f5d9c4b0.mockapi.io/get/tests/tests/${deleteTarget}`,
      );

      // delete locally
      setTest(prevTests => prevTests.filter(item => item.id !== deleteTarget));
      setModalVisible(false);
      Toast.show({
        type: 'success',
        text1: 'Deleted',
        text2: 'Test deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to delete test',
      });
    } finally {
      setDeleteTarget(null); // close popup
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
      <TouchableOpacity
        style={styles.submitBtn}
        onPress={() => navigate.navigate('CreateTest')}
      >
        <Text style={styles.submitBtnText}>Create Test</Text>
      </TouchableOpacity>

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
                    <Text style={styles.level}>Level : {item.level}</Text>
                  </View>
                  <View style={styles.iconRow}>
                    <TouchableOpacity
                      onPress={() => handleDeletePress(item.id)}
                    >
                      <Icon name="trash-outline" size={22} color="#2c3e50" />
                    </TouchableOpacity>
                    <FontAwesome6 name="file-pen" size={22} color="#2c3e50" />
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* 👇 Confirmation popup */}
      <ConformationPopup
        visible={modalVisible}
        message="Are you sure you want to delete this test?"
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
    paddingBottom: 100,
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
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
