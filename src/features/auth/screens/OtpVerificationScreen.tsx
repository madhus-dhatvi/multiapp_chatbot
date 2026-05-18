import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { jwtDecode } from 'jwt-decode';
import { colors } from '../../../theme';
import { authService } from '../../../api/authService';
import { storage } from '../../../utils/storage';
import { setCredentials } from '../../../store/slices/authSlice';
import ZestBotLogo from '../components/ZestBotLogo';
import { RootStackParamList } from '../../../navigation/types';

type OtpNavProp = NativeStackNavigationProp<RootStackParamList, 'OtpVerification'>;
type OtpRouteProp = RouteProp<RootStackParamList, 'OtpVerification'>;

const OtpVerificationScreen = () => {
  const navigation = useNavigation<OtpNavProp>();
  const route = useRoute<OtpRouteProp>();
  const dispatch = useDispatch();

  const { phone } = route.params;

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      Alert.alert('Error', 'Please enter the OTP');
      return;
    }

    if (!/^\d{4,8}$/.test(otp.trim())) {
      Alert.alert('Error', 'Please enter a valid OTP (4–8 digits)');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.verifyOtp({ phone, otp: otp.trim() });
      console.log('Verify OTP Response:', response);

      if (response?.token) {
        try {
          const decoded: any = jwtDecode(response.token);
          console.log('Decoded Token Payload:', decoded);
          dispatch(setCredentials({ token: response.token, user: decoded }));
        } catch (decodeError) {
          console.error('Error decoding JWT token:', decodeError);
          // If we can't decode, we shouldn't consider it a full login since we need the user role.
          Alert.alert('Login Error', 'Invalid token format received.');
          return;
        }
        await storage.saveToken(response.token);
      }

      Alert.alert('Success', response.message);
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    try {
      const response = await authService.sendOtp(phone);
      setOtp('');
      Alert.alert('OTP Resent', response.message || 'A new OTP has been sent to your phone');
    } catch (error: any) {
      Alert.alert('Failed to Resend OTP', error.message);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <ZestBotLogo fill={colors.secondary} width={100} height={85} />
          </View>
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>
            Enter the OTP sent to
          </Text>
          <Text style={styles.phoneDisplay}>{phone}</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>One-Time Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter OTP"
              placeholderTextColor={colors.placeHolder}
              keyboardType="number-pad"
              value={otp}
              onChangeText={setOtp}
              maxLength={8}
              returnKeyType="done"
              onSubmitEditing={handleVerifyOtp}
              autoFocus
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleVerifyOtp}
            disabled={loading || resendLoading}
          >
            {loading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={styles.buttonText}>Verify & Log In</Text>
            )}
          </TouchableOpacity>

          {/* Resend OTP */}
          <View style={styles.resendRow}>
            <Text style={styles.resendLabel}>Didn't receive the OTP? </Text>
            <TouchableOpacity
              onPress={handleResendOtp}
              disabled={loading || resendLoading}
            >
              {resendLoading ? (
                <ActivityIndicator size="small" color={colors.secondary} />
              ) : (
                <Text style={styles.resendLink}>Resend OTP</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Change number */}
          <TouchableOpacity
            style={styles.changeNumberButton}
            onPress={() => navigation.goBack()}
            disabled={loading || resendLoading}
          >
            <Text style={styles.changeNumberText}>← Change Phone Number</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.subHeading,
    textAlign: 'center',
  },
  phoneDisplay: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 4,
    textAlign: 'center',
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 4,
  },
  input: {
    backgroundColor: colors.inputFill,
    borderRadius: 12,
    padding: 16,
    fontSize: 22,
    color: colors.primary,
    borderWidth: 1,
    borderColor: colors.border1,
    textAlign: 'center',
    letterSpacing: 6,
  },
  button: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.background,
    fontSize: 18,
    fontWeight: 'bold',
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendLabel: {
    fontSize: 14,
    color: colors.subHeading,
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.secondary,
    textDecorationLine: 'underline',
  },
  changeNumberButton: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  changeNumberText: {
    fontSize: 14,
    color: colors.subHeading,
    fontWeight: '500',
  },
});

export default OtpVerificationScreen;
