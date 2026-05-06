import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';

import { RootStackParamList } from '../../../navigation/types';
import { colors } from '../../../theme';

type AnswerScreenRouteProp = RouteProp<RootStackParamList, 'Answer'>;

export const AnswerScreen = () => {
  const route = useRoute<AnswerScreenRouteProp>();
  const { question } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.questionText}>{question.q}</Text>
        <Text style={styles.answerText}>{question.a}</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    padding: 20,
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 16,
  },
  answerText: {
    fontSize: 16,
    color: colors.subHeading,
    lineHeight: 24,
  },
});
