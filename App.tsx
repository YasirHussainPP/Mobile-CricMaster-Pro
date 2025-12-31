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
import TeamSquadEntryScreen from './src/screens/TeamSquadEntryScreen';
import TossScreen from './src/screens/TossScreen';
import TournamentDashboard from './src/screens/TournamentDashboard';
import TournamentSetupScreen from './src/screens/TournamentSetupScreen';

// This creates the Stack object
const Stack = createStackNavigator();

export default function App() {
    return (
        <PaperProvider>
            <NavigationContainer>
                <Stack.Navigator
                    initialRouteName="Home"
                    screenOptions={{
                        headerStyle: { backgroundColor: '#4f668bff' },
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
                    <Stack.Screen name="TournamentSetup" component={TournamentSetupScreen} options={{ title: 'TOURNAMENT SETUP' }} />
                    <Stack.Screen name="TeamSquadEntry" component={TeamSquadEntryScreen} options={{ title: 'TEAM SQUAD ENTRY' }} />
                    <Stack.Screen name="TournamentDashboard" component={TournamentDashboard} options={{ title: 'TOURNAMENT DASHBOARD' }} />
                </Stack.Navigator>
            </NavigationContainer>
        </PaperProvider>
    );
}