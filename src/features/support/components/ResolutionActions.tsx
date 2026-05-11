import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';

interface Props {
  disabled?: boolean;
  onResolved: () => void;
  onNotResolved: () => void;
}

export const ResolutionActions = ({
  disabled,
  onResolved,
  onNotResolved,
}: Props) => {
  return (
    <View>
      <TouchableOpacity
        disabled={disabled}
        onPress={onResolved}>
        <Text>✅ Issue Resolved</Text>
      </TouchableOpacity>

      <TouchableOpacity
        disabled={disabled}
        onPress={onNotResolved}>
        <Text>❌ Issue Not Resolved</Text>
      </TouchableOpacity>
    </View>
  );
};