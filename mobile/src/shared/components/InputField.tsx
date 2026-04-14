import { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, KeyboardTypeOptions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InputFieldProps {
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  label?: string;
}

export default function InputField({
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  label,
}: InputFieldProps) {
  const [visible, setVisible] = useState(!secureTextEntry);

  return (
    <View className="mb-4">
      {label && (
        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginBottom: 6, marginLeft: 2 }}>
          {label}
        </Text>
      )}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: 'rgba(255,255,255,0.08)',
          borderRadius: 14,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.15)',
          paddingHorizontal: 14,
          height: 52,
        }}
      >
        <Ionicons name={icon} size={18} color="rgba(255,255,255,0.5)" style={{ marginRight: 10 }} />
        <TextInput
          style={{ flex: 1, color: 'white', fontSize: 15 }}
          placeholder={placeholder}
          placeholderTextColor="rgba(255,255,255,0.35)"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!visible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setVisible((v) => !v)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons
              name={visible ? 'eye-outline' : 'eye-off-outline'}
              size={18}
              color="rgba(255,255,255,0.5)"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
