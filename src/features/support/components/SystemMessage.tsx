import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../../../theme';

interface Props {
  text: string;
}

export const SystemMessage = ({ text }: Props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    backgroundColor: colors.secondaryLight,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginVertical: 10,
    maxWidth: '90%',
  },

  text: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.secondary,
    textAlign: 'center',
    fontWeight: '500',
  },
});