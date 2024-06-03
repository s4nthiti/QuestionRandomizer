import { StatusBar } from 'expo-status-bar';
import { Button, FlatList, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useState, useEffect } from 'react';
import shuffle from 'lodash/shuffle';
import NameForm from './components/NameForm';
import { quizData, Question } from './quizData';
import AsyncStorage from '@react-native-async-storage/async-storage';

const App: React.FC = () => {
  const [ storedName, setStoredName ] = useState<string | null>(null);
  const [ questions, setQuestions ] = useState<Question[]>([]);
  const [ currentQuestionIndex, setCurrentQuestionIndex ] = useState(0);
  const [ score, setScore ] = useState(0);
  const [ leaderboard, setLeaderboard ] = useState<Leaderboard[]>([]);
  const [ qnaState, setqnaState ] = useState<string | null>('login');
  
  useEffect(() => {

    const retrieveName = async () => {
      try {
        const retrievedName = await AsyncStorage.getItem('userName');
        setStoredName(retrievedName);
        if(retrieveName.length > 0) setqnaState('lobby');
      } catch (error) {
        console.error('Error retrieving name:', error);
      }
    };
    retrieveName();

    const shuffleQuestionsAndAnswers = (questions: Question[]) => {
      return shuffle(questions.map((question: Question) => {
        const shuffledAnswers = shuffle([...question.answers]);
        return { ...question, answers: shuffledAnswers };
      }));
    }

    const fetchLeaderboardData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('leaderboard');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setLeaderboard(parsedData);
        }
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
      }
    };

    const shuffleQandA = shuffleQuestionsAndAnswers(quizData);
    setQuestions(shuffleQandA);
    fetchLeaderboardData();
  }, []);

  const handleSelectAnswer = async (answer: string) => {
    try {
      if(answer === questions[currentQuestionIndex].correctAnswer) {
        setScore(score + 1);
      }
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      if(currentQuestionIndex + 1 >= questions.length) {
        setqnaState('end');
        let leaderBuffer: Leaderboard[] = leaderboard;
        leaderBuffer.push({ name: storedName || '', score: score });
        leaderBuffer.sort((a,b) => {
          return b.score - a.score;
        });
        const jsonValue = JSON.stringify(leaderBuffer);
        await AsyncStorage.setItem('leaderboard', jsonValue);
      }
    } catch (e) {
      console.log("Error while select answer>>", e);
    }
  };

  const handleReset = () => {
    // Reset score and current question index
    setScore(0);
    setCurrentQuestionIndex(0);
    setqnaState('lobby');
  };

  const handleStartQnA = () => {
    setqnaState('start');
  }

  const handleRename = async () => {
    try {
      await AsyncStorage.setItem('userName', '');
      // Optionally, navigate to a login screen or perform other actions
      setStoredName(null);
      setqnaState('login');
    } catch (error) {
      console.error('Error clearing AsyncStorage:', error);
    }
  }

  const handleNameSet = async (text: string) => {
    if (text) {
      try {
        setStoredName(text);
        setqnaState('lobby');
        await AsyncStorage.setItem('userName', text);
        alert(`Name saved: ${text}`);
      } catch (error) {
        console.error('Error saving name:', error);
      }
    } else {
      alert('Please enter your name');
    }
  };
  
  return (
    <View style={styles.container}>
      {/* <Text>{qnaState}</Text> */}
      {qnaState === 'login' && <NameForm onNameSet={handleNameSet}/>}
      {storedName && qnaState === 'lobby' && (
        <>
          <Text style={styles.nameText}>Hello, {storedName}!</Text>
          <TouchableOpacity key={'startButton'} style={styles.startButton} onPress={() => handleStartQnA()}>
            <Text style={styles.startText}>Start Q&A</Text>
          </TouchableOpacity>
          <TouchableOpacity key={'renameButton'} style={styles.renameButton} onPress={() => handleRename()}>
            <Text style={styles.startText}>Rename</Text>
          </TouchableOpacity>
        </>
      )}
      {qnaState === 'start' && (
        <View style={{ padding: 10, width: "80%", height: "80%" }}>
          <View style={{ flexDirection: "row", marginBottom: 50}}>
            <Text style={styles.topLeftName}>Name: {storedName}!</Text>
            <Text style={styles.topRightScore}>Score: {score}</Text>
          </View>
          <Text style={styles.questionText}>Questions {currentQuestionIndex+1}: {questions[currentQuestionIndex].question}</Text>
          {
            questions[currentQuestionIndex].answers.map((choice, index) => {
              return (
                <TouchableOpacity key={`${choice}+${index}`} style={styles.choiceButton} onPress={() => handleSelectAnswer(choice)}>
                  <Text style={styles.startText}>{choice}</Text>
                </TouchableOpacity>
              )
            })
          }
        </View>
      )}
      {qnaState === 'end' && (
        <View style={styles.leaderContainer}>
          <View style={{ padding: 10 }}>
            <Text style={styles.nameText}>End of Q&A</Text>
            <Text style={styles.nameText}>{score}/{questions.length}</Text>
          </View>
          {
            leaderboard.length > 0 && (
              <>
                {leaderboard.map((player, index) => {
                  if(index > 10) return;
                  return (
                    <View style={{ flexDirection: "row", marginBottom: 10 }} key={`${player.name}${index}`}>
                      <Text style={styles.topLeftName}>{index} &gt; Name: {player.name}</Text>
                      <Text style={styles.topRightScore}>Score: {player.score}</Text>
                    </View>
                  )
                })}
              </>
            )
          }
          <TouchableOpacity key={`reset`} style={styles.choiceButton} onPress={() => handleReset()}>
            <Text style={styles.startText}>Reset</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default App;

interface Leaderboard {
  name: string,
  score: number,
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // Make the container take all available space
    justifyContent: 'center', // Center content along the main axis (usually vertical)
    alignItems: 'center', // Center content along the cross axis (usually horizontal)
  },
  contentContainer: {
    padding: 10,
    width: "80%",
    height: "80%"
  },
  leaderContainer: {
    padding: 10,
    width: "80%",
    height: "80%",
    justifyContent: 'center',
  },
  nameText: {
    fontSize: 20,
    textAlign: 'center',
    color: 'black',
  },
  questionText: {
    fontSize: 20,
    color: 'black',
    margin: 10,
  },
  topLeftName: {
    fontSize: 16,
    marginRight: 'auto'
  },
  topRightScore: {
    fontSize: 16,
  },
  startButton: {
    backgroundColor: '#04AA6D', /* Green */
    color: 'white',
    padding: 20,
    textAlign: 'center',
    fontSize: 16,
    margin: 10,
    cursor: 'pointer',
    borderRadius: 5,
  },
  renameButton: {
    backgroundColor: 'orange', /* Green */
    color: 'white',
    padding: 20,
    textAlign: 'center',
    fontSize: 16,
    margin: 10,
    cursor: 'pointer',
    borderRadius: 5,
  },
  choiceButton: {
    backgroundColor: '#04AA6D', /* Green */
    color: 'white',
    padding: 20,
    textAlign: 'center',
    fontSize: 16,
    margin: 10,
    cursor: 'pointer',
    borderRadius: 5,
    width: "100%",
  },
  startText: {
    fontSize: 16,
    textAlign: 'center',
    color: 'white',
  }
});