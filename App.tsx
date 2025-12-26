import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { PaperProvider } from 'react-native-paper';

// Import your screens
import FullScorecard from './src/screens/FullScorecardScreen';
import HomeScreen from './src/screens/HomeScreen';
import MatchSetupScreen from './src/screens/MatchSetupScreen';
import PreMatchSelection from './src/screens/PreMatchSelection';
import QuickMatchScreen from './src/screens/QuickMatchScreen';
import ScoringDash from './src/screens/ScoringDash';
import TossScreen from './src/screens/TossScreen';

// This creates the Stack object
const Stack = createStackNavigator();

export default function App() {
    return (
        <PaperProvider>
            <NavigationContainer>
                <Stack.Navigator
                    initialRouteName="Home"
                    screenOptions={{
                        headerStyle: { backgroundColor: '#1E293B' },
                        headerTintColor: '#FFF',
                        headerTitleStyle: { fontWeight: 'bold' },
                    }}
                >
                    <Stack.Screen
                        name="Home"
                        component={HomeScreen}
                        options={{ title: 'CRICMASTER PRO' }}
                    />
                    <Stack.Screen name="MatchSetup" component={MatchSetupScreen} options={{ title: 'MATCH SETTINGS' }} />
                    <Stack.Screen
                        name="QuickMatch"
                        component={QuickMatchScreen}
                        options={{ title: 'SQUAD SELECTION' }}
                    />
                    <Stack.Screen name="Toss" component={TossScreen} options={{ title: 'TOSS' }}/>
                    <Stack.Screen name="PreMatch" component={PreMatchSelection} options={{ title: 'SELECT PLAYERS' }} />
                    <Stack.Screen name="ScoringDash" component={ScoringDash} options={{ title: 'LIVE SCORE' }} />
                    <Stack.Screen name="FullScorecard" component={FullScorecard} options={{ title: 'FULL SCORECARD' }} />
                </Stack.Navigator>
            </NavigationContainer>
        </PaperProvider>
    );
}