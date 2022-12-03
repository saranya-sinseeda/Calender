import React, { Component } from 'react';
import { Platform, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppWrapper } from '@calendar/components';
import { CalendarNavigation } from '@calendar/navigation';
import * as Calendar from 'expo-calendar';

class App extends Component {
  async componentDidMount() {
    StatusBar.pushStackEntry({
      animated: true,
      barStyle: 'dark-content'
    });
  }

  render = () => (
    <SafeAreaProvider style={{ backgroundColor: '#FFFFFF' }}>
      <AppWrapper>
        <CalendarNavigation />
      </AppWrapper>
    </SafeAreaProvider>
  );
}

export default App;
