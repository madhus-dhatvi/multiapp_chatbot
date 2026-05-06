import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';

import { RootStackParamList } from '../../../navigation/types';
import { colors } from '../../../theme';

type CategoryQuestionsScreenRouteProp = RouteProp<RootStackParamList, 'CategoryQuestions'>;
type CategoryQuestionsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CategoryQuestions'>;

const ChevronRight = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.errorColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M9 18l6-6-6-6" />
  </Svg>
);

export const CategoryQuestionsScreen = () => {
  const route = useRoute<CategoryQuestionsScreenRouteProp>();
  const navigation = useNavigation<CategoryQuestionsScreenNavigationProp>();
  const { category } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={category.questions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.questionRow}
            onPress={() => navigation.navigate('Answer', { 
              categoryTitle: category.title,
              question: item 
            })}
          >
            <Text style={styles.questionText}>{item.q}</Text>
            <ChevronRight />
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No questions available in this category.</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContainer: {
    paddingBottom: 20,
    paddingTop: 8,
  },
  questionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  questionText: {
    flex: 1,
    fontSize: 16,
    color: colors.primary,
    marginRight: 16,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border1,
    marginHorizontal: 16,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.subHeading,
    fontSize: 16,
  },
});
