import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Card, ProgressBar, Button } from 'react-native-paper';
import DatabaseManager from '../database/DatabaseManager';

const TestScreen = ({ navigation, route }) => {
  const { jlptLevel } = route.params;
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [startTime] = useState(new Date());
  const [options, setOptions] = useState([]);

  const QUESTIONS_PER_TEST = 10;

  useEffect(() => {
    loadTestWords();
  }, [jlptLevel]);

  useEffect(() => {
    if (words.length > 0 && currentIndex < words.length) {
      generateOptions();
    }
  }, [currentIndex, words]);

  const loadTestWords = async () => {
    try {
      const wordList = await DatabaseManager.getWordsByLevel(jlptLevel);
      if (wordList.length === 0) {
        Alert.alert('알림', '해당 레벨의 단어가 없습니다.');
        navigation.goBack();
        return;
      }

      // Randomly select questions
      const shuffled = wordList.sort(() => 0.5 - Math.random());
      setWords(shuffled.slice(0, QUESTIONS_PER_TEST));
    } catch (error) {
      console.error('Error loading test words:', error);
      Alert.alert('오류', '테스트 단어를 불러올 수 없습니다.');
    }
  };

  const generateOptions = async () => {
    const currentWord = words[currentIndex];
    const allWords = await DatabaseManager.getWordsByLevel(jlptLevel);

    // Get wrong answers
    const wrongAnswers = allWords
      .filter(word => word.id !== currentWord.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(word => word.meaning);

    // Combine correct and wrong answers
    const allOptions = [currentWord.meaning, ...wrongAnswers];

    // Shuffle options
    const shuffledOptions = allOptions.sort(() => 0.5 - Math.random());
    setOptions(shuffledOptions);
    setSelectedAnswer(null);
  };

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    const currentWord = words[currentIndex];
    const isCorrect = selectedAnswer === currentWord.meaning;

    // Record answer
    const answerRecord = {
      word: currentWord,
      selectedAnswer,
      correctAnswer: currentWord.meaning,
      isCorrect,
    };

    setUserAnswers([...userAnswers, answerRecord]);

    if (isCorrect) {
      setCorrectAnswers(correctAnswers + 1);
    }

    // Update learning progress
    DatabaseManager.updateLearningProgress(currentWord.id, isCorrect);

    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Test completed
      completeTest();
    }
  };

  const completeTest = () => {
    const endTime = new Date();
    const duration = Math.floor((endTime - startTime) / 1000); // seconds

    // Save test record
    DatabaseManager.saveTestRecord(
      jlptLevel,
      QUESTIONS_PER_TEST,
      correctAnswers + (selectedAnswer === words[currentIndex].meaning ? 1 : 0),
      duration
    );

    // Navigate to results
    navigation.replace('TestResult', {
      jlptLevel,
      totalQuestions: QUESTIONS_PER_TEST,
      correctAnswers: correctAnswers + (selectedAnswer === words[currentIndex].meaning ? 1 : 0),
      userAnswers: [...userAnswers, {
        word: words[currentIndex],
        selectedAnswer,
        correctAnswer: words[currentIndex].meaning,
        isCorrect: selectedAnswer === words[currentIndex].meaning,
      }],
      duration,
    });
  };

  if (words.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text>테스트를 준비하는 중...</Text>
      </View>
    );
  }

  const currentWord = words[currentIndex];
  const progress = (currentIndex + 1) / words.length;

  return (
    <ScrollView style={styles.container}>
      {/* Progress Section */}
      <View style={styles.progressSection}>
        <Text style={styles.progressText}>
          문제 {currentIndex + 1} / {words.length}
        </Text>
        <ProgressBar
          progress={progress}
          color="#E91E63"
          style={styles.progressBar}
        />
        <Text style={styles.levelText}>JLPT N{jlptLevel} 테스트</Text>
      </View>

      {/* Question Card */}
      <Card style={styles.questionCard}>
        <Card.Content style={styles.questionContent}>
          <Text style={styles.questionNumber}>Q{currentIndex + 1}</Text>
          <Text style={styles.questionText}>다음 단어의 뜻은?</Text>

          <View style={styles.wordContainer}>
            <Text style={styles.kanji}>
              {currentWord.kanji || currentWord.reading}
            </Text>
            {currentWord.kanji && (
              <Text style={styles.reading}>{currentWord.reading}</Text>
            )}
            <Text style={styles.partOfSpeech}>{currentWord.part_of_speech}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionButton,
              selectedAnswer === option && styles.selectedOption,
            ]}
            onPress={() => handleAnswerSelect(option)}>
            <Text
              style={[
                styles.optionText,
                selectedAnswer === option && styles.selectedOptionText,
              ]}>
              {String.fromCharCode(65 + index)}. {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Next Button */}
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleNextQuestion}
          disabled={!selectedAnswer}
          style={styles.nextButton}
          contentStyle={styles.nextButtonContent}>
          {currentIndex < words.length - 1 ? '다음 문제' : '테스트 완료'}
        </Button>
      </View>

      {/* Example Section */}
      {currentWord.example && (
        <Card style={styles.exampleCard}>
          <Card.Content>
            <Text style={styles.exampleLabel}>💡 예문 참고</Text>
            <Text style={styles.example}>{currentWord.example}</Text>
            {currentWord.example_meaning && (
              <Text style={styles.exampleMeaning}>
                {currentWord.example_meaning}
              </Text>
            )}
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressSection: {
    marginBottom: 20,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  levelText: {
    fontSize: 14,
    color: '#666',
  },
  questionCard: {
    marginBottom: 20,
    elevation: 4,
  },
  questionContent: {
    alignItems: 'center',
    padding: 20,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E91E63',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
  },
  wordContainer: {
    alignItems: 'center',
  },
  kanji: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  reading: {
    fontSize: 20,
    color: '#666',
    marginBottom: 12,
  },
  partOfSpeech: {
    fontSize: 12,
    color: 'white',
    backgroundColor: '#E91E63',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    elevation: 2,
  },
  selectedOption: {
    borderColor: '#E91E63',
    backgroundColor: '#FCE4EC',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedOptionText: {
    color: '#E91E63',
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  nextButton: {
    backgroundColor: '#E91E63',
  },
  nextButtonContent: {
    paddingVertical: 8,
  },
  exampleCard: {
    marginBottom: 20,
    elevation: 2,
  },
  exampleLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E91E63',
    marginBottom: 8,
  },
  example: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  exampleMeaning: {
    fontSize: 14,
    color: '#666',
  },
});

export default TestScreen;