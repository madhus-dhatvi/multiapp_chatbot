import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';

import { RootState } from '../../../store';
import { faqsData } from '../../../data/faqs';
import { colors } from '../../../theme';
import { ProfileIndicator } from '../../../components/ProfileIndicator';
import { RootStackParamList } from '../../../navigation/types';
import { RecentOrders } from '../components/RecentOrders';
import { orderService } from '../../../api/orderService';
import { RecentOrder } from '../../../types/order';

type SupportHomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SupportHome'>;

const ChevronRight = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.errorColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M9 18l6-6-6-6" />
  </Svg>
);

export const SupportHomeScreen = () => {
  const navigation = useNavigation<SupportHomeScreenNavigationProp>();
  const user = useSelector((state: RootState) => state.auth.user);
  const [creatingSession, setCreatingSession] = useState(false);
  
  const userRole = user?.role?.toUpperCase() || 'USER';
  const categories = faqsData[userRole] || [];

  const handleOrderPress = async (order: RecentOrder) => {
    if (creatingSession) return;
    try {
      setCreatingSession(true);
      const session = await orderService.createSession({ orderId: order.orderId });
      navigation.navigate('ChatScreen', { session, order });
    } catch (error: any) {
      Alert.alert(
        'Session Error',
        error?.message || 'Failed to start chat session. Please try again.',
      );
    } finally {
      setCreatingSession(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ProfileIndicator />
      
      {/* Loading overlay while creating session */}
      {creatingSession && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="small" color={colors.secondary} />
            <Text style={styles.loadingText}>Starting chat...</Text>
          </View>
        </View>
      )}

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Recent Orders Section — above FAQs */}
        <RecentOrders onOrderPress={handleOrderPress} />

        {/* Divider between sections */}
        <View style={styles.sectionDivider} />

        {/* FAQs Section */}
        <Text style={styles.sectionTitle}>FAQs</Text>
        
        {categories.map((item, index) => (
          <React.Fragment key={item.id}>
            {index > 0 && <View style={styles.separator} />}
            <TouchableOpacity 
              style={styles.categoryRow}
              onPress={() => navigation.navigate('CategoryQuestions', { category: item })}
            >
              <Text style={styles.categoryTitle}>{item.title}</Text>
              <ChevronRight />
            </TouchableOpacity>
          </React.Fragment>
        ))}
      </ScrollView>
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
  scrollContent: {
    paddingBottom: 32,
  },
  sectionDivider: {
    height: 6,
    backgroundColor: colors.backgroundLight,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  loadingText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
});
