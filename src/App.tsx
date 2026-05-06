import React, { useState, useEffect } from 'react';
import { StatusBar, useColorScheme, View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { jwtDecode } from 'jwt-decode';

import { store, RootState } from './store';
import { setCredentials } from './store/slices/authSlice';
import { storage } from './utils/storage';
import { colors } from './theme';
import { RootStackParamList } from './navigation/types';

import LoginScreen from './features/auth/screens/LoginScreen';
import { SupportHomeScreen } from './features/support/screens/SupportHomeScreen';
import { CategoryQuestionsScreen } from './features/support/screens/CategoryQuestionsScreen';
import { AnswerScreen } from './features/support/screens/AnswerScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = await storage.getToken();
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        dispatch(setCredentials({ token, user: decoded }));
      } catch (e) {
        console.error('Invalid token on startup', e);
        await storage.removeToken();
      }
    }
    setInitializing(false);
  };

  if (initializing) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.secondary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.primary,
            headerTitleStyle: { fontWeight: 'bold' },
            headerShadowVisible: false,
          }}
        >
          {!isAuthenticated ? (
            <Stack.Screen 
              name="Login" 
              component={LoginScreen} 
              options={{ headerShown: false }} 
            />
          ) : (
            <>
              <Stack.Screen 
                name="SupportHome" 
                component={SupportHomeScreen} 
                options={{ title: 'Help & Support' }} 
              />
              <Stack.Screen 
                name="CategoryQuestions" 
                component={CategoryQuestionsScreen} 
                options={({ route }) => ({ title: route.params.category.title })}
              />
              <Stack.Screen 
                name="Answer" 
                component={AnswerScreen} 
                options={({ route }) => ({ title: route.params.categoryTitle })}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppNavigator />
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
