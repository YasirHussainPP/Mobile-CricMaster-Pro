import React from 'react';
import { Animated, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { Card, Paragraph, Text, Title } from 'react-native-paper';

const HomeScreen = ({ navigation }: any) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const { width, height } = useWindowDimensions();

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0F172A' }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          padding: 20
        }}
      >
              <View style={styles.container}>
                <Text style={styles.header}>CRICMASTER PRO</Text>
                <Text style={styles.subHeader}>Select your management mode</Text>

                <TouchableOpacity onPress={() => console.log('Tournament clicked')}>
                  <Card style={[styles.card,styles.glow]}>
                    <Card.Content>
                      <Title style={styles.whiteText}>CHAMPIONSHIP</Title>
                      <Paragraph style={styles.grayText}>Multiple teams, league tables, and full automation.</Paragraph>
                    </Card.Content>
                  </Card>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('MatchSetup')}>
                  <Card style={[styles.card,styles.glow]}>
                    <Card.Content>
                      <Title style={styles.whiteText}>QUICK MATCH</Title>
                      <Paragraph style={styles.grayText}>One-off exhibition game between two teams.</Paragraph>
                    </Card.Content>
                  </Card>
                </TouchableOpacity>
              </View>
      </ScrollView>
    </SafeAreaView>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 'auto',
  },
  card: {
    width: '100%', 
    maxWidth: 300,  
    backgroundColor: '#1E293B',
    padding: 20,
    borderRadius: 12,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  title: {
    fontSize: 24, 
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  header: { color: '#FFF', fontSize: 28, fontWeight: '900', textAlign: 'center' },
  subHeader: { color: '#94A3B8', textAlign: 'center', marginBottom: 40 },
  whiteText: { color: '#FFF', fontWeight: 'bold' },
  grayText: { color: '#94A3B8' },
  glow: {
    shadowColor: "#00f2fe",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 20,
  }
});

export default HomeScreen;



// import React from 'react';
// import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
// import { Card, Paragraph, Text, Title } from 'react-native-paper';

// // Notice we added { navigation } here!
// const HomeScreen = ({ navigation }: any) => {
//   const fadeAnim = React.useRef(new Animated.Value(0)).current;

//   React.useEffect(() => {
//     Animated.timing(fadeAnim, {
//       toValue: 1,
//       duration: 1000,
//       useNativeDriver: true,
//     }).start();
//   }, []);
//   return (
//     <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
//       <Card style={[styles.card, styles.glow]}>
//         <View style={styles.container}>
//           <Text style={styles.header}>CRICMASTER PRO</Text>
//           <Text style={styles.subHeader}>Select your management mode</Text>

//           <TouchableOpacity onPress={() => console.log('Tournament clicked')}>
//             <Card style={styles.card}>
//               <Card.Content>
//                 <Title style={styles.whiteText}>CHAMPIONSHIP</Title>
//                 <Paragraph style={styles.grayText}>Multiple teams, league tables, and full automation.</Paragraph>
//               </Card.Content>
//             </Card>
//           </TouchableOpacity>

//           {/* UPDATE THIS PART: */}
//           <TouchableOpacity onPress={() => navigation.navigate('MatchSetup')}>
//             <Card style={styles.card}>
//               <Card.Content>
//                 <Title style={styles.whiteText}>QUICK MATCH</Title>
//                 <Paragraph style={styles.grayText}>One-off exhibition game between two teams.</Paragraph>
//               </Card.Content>
//             </Card>
//           </TouchableOpacity>
//         </View>
//       </Card>
//     </Animated.View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#0F172A', padding: 20, justifyContent: 'center' },
//   header: { color: '#FFF', fontSize: 28, fontWeight: '900', textAlign: 'center' },
//   subHeader: { color: '#94A3B8', textAlign: 'center', marginBottom: 40 },
//   card: { backgroundColor: '#1E293B', marginVertical: 10, padding: 10 },
//   whiteText: { color: '#FFF', fontWeight: 'bold' },
//   grayText: { color: '#94A3B8' },
//   glow: {
//     shadowColor: "#00f2fe",
//     shadowOffset: { width: 0, height: 0 },
//     shadowOpacity: 0.8,
//     shadowRadius: 15,
//     elevation: 20, // For Android
//   }
// });

// export default HomeScreen;
