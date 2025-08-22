import React, { useEffect, useState } from 'react';
import { Text, StyleSheet } from 'react-native';

const CountdownTimer = ({ examDate }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const target = new Date(examDate);
      const diff = target - now;

      if (diff <= 0) {
        setIsLive(true);
        return null;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    };

    // Initial set
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [examDate]);

  if (isLive) {
    return <Text style={styles.live}>Exam is live</Text>;
  }

  return <Text style={styles.timer}>Starts in {timeLeft}</Text>;
};

const styles = StyleSheet.create({
  timer: {
    fontSize: 16,
    fontWeight: '600',
    color: 'red',
  },
  live: {
    fontSize: 16,
    fontWeight: '600',
    color: 'green',
  },
});

export default CountdownTimer;
