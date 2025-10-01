import React from 'react';
import RegisterForm from './src/components/RegisterForm';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const App = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <RegisterForm />
    </SafeAreaView>
  );
};

export default App;