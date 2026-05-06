import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { useSelector } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';

import { RootState } from '../../../store';
import { faqsData } from '../../../data/faqs';
import { colors } from '../../../theme';
import { ProfileIndicator } from '../../../components/ProfileIndicator';
import { RootStackParamList } from '../../../navigation/types';

type SupportHomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SupportHome'>;

const ChevronRight = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.errorColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M9 18l6-6-6-6" />
  </Svg>
);

export const SupportHomeScreen = () => {
  const navigation = useNavigation<SupportHomeScreenNavigationProp>();
  const user = useSelector((state: RootState) => state.auth.user);
  
  const userRole = user?.role?.toUpperCase() || 'USER';
  const categories = faqsData[userRole] || [];

  return (
    <SafeAreaView style={styles.container}>
      <ProfileIndicator />
      
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>FAQs</Text>
        
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.categoryRow}
              onPress={() => navigation.navigate('CategoryQuestions', { category: item })}
            >
              <Text style={styles.categoryTitle}>{item.title}</Text>
              <ChevronRight />
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.listContainer}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
  },
  listContainer: {
    paddingBottom: 20,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  categoryTitle: {
    fontSize: 16,
    color: colors.primary,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border1,
    marginHorizontal: 16,
  },
});
