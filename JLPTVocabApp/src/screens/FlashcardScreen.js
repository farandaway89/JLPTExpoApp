import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { Card, ProgressBar, Button, Surface } from 'react-native-paper';
import DatabaseManager from '../database/DatabaseManager';

const FlashcardScreen = ({ navigation, route }) => {
  const { jlptLevel } = route.params;
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [progress, setProgress] = useState(0);
  const [flipAnimation] = useState(new Animated.Value(0));
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);

  useEffect(() => {
    loadWords();
  }, [jlptLevel]);

  useEffect(() => {
    if (words.length > 0) {
      setProgress((currentIndex + 1) / words.length);
    }
  }, [currentIndex, words.length]);

  const loadWords = async () => {
    try {
      const wordList = await DatabaseManager.getWordsByLevel(jlptLevel);
      if (wordList.length === 0) {
        Alert.alert('알림', '해당 레벨의 단어가 없습니다.');
        navigation.goBack();
        return;
      }
      setWords(wordList.slice(0, 20)); // Limit to 20 words per session
    } catch (error) {
      console.error('Error loading words:', error);
      Alert.alert('오류', '단어를 불러올 수 없습니다.');
    }
  };

  const flipCard = () => {
    Animated.timing(flipAnimation, {
      toValue: showAnswer ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setShowAnswer(!showAnswer);
  };

  const handleAnswer = async (isCorrect) => {
    const currentWord = words[currentIndex];

    // Update database
    await DatabaseManager.updateLearningProgress(currentWord.id, isCorrect);

    // Update local counters
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    } else {
      setIncorrectCount(prev => prev + 1);
    }

    // Move to next word
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
      flipAnimation.setValue(0);
    } else {
      // Session completed
      showSessionResults();
    }
  };

  const showSessionResults = () => {
    const total = correctCount + incorrectCount + 1; // +1 for current word
    const accuracy = Math.round((correctCount / total) * 100);

    Alert.alert(
      '학습 완료! 🎉',
      `총 ${total}개 단어 학습\n정답: ${correctCount}개\n오답: ${incorrectCount + 1}개\n정확도: ${accuracy}%`,
      [
        { text: '홈으로', onPress: () => navigation.navigate('Home') },
        { text: '다시 학습', onPress: resetSession },
      ]
    );
  };

  const resetSession = () => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setCorrectCount(0);
    setIncorrectCount(0);
    flipAnimation.setValue(0);
    loadWords();
  };

  if (words.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text>단어를 불러오는 중...</Text>
      </View>
    );
  }

  const currentWord = words[currentIndex];
  const frontOpacity = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });
  const backOpacity = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={styles.container}>
      {/* Progress Section */}
      <View style={styles.progressSection}>
        <Text style={styles.progressText}>
          {currentIndex + 1} / {words.length}
        </Text>
        <ProgressBar
          progress={progress}
          color="#E91E63"
          style={styles.progressBar}
        />
        <View style={styles.counters}>
          <Text style={styles.correctCount}>✓ {correctCount}</Text>
          <Text style={styles.incorrectCount}>✗ {incorrectCount}</Text>
        </View>
      </View>

      {/* Flashcard */}
      <View style={styles.cardContainer}>
        <TouchableOpacity onPress={flipCard} style={styles.cardTouchable}>
          <Animated.View
            style={[styles.card, styles.cardFront, { opacity: frontOpacity }]}>
            <View style={styles.cardContent}>
              <Text style={styles.kanji}>{currentWord.kanji || currentWord.reading}</Text>
              {currentWord.kanji && (
                <Text style={styles.reading}>{currentWord.reading}</Text>
              )}
              <Text style={styles.partOfSpeech}>{currentWord.part_of_speech}</Text>
              <Text style={styles.tapToFlip}>탭해서 뜻 보기</Text>
            </View>
          </Animated.View>

          <Animated.View
            style={[styles.card, styles.cardBack, { opacity: backOpacity }]}>
            <View style={styles.cardContent}>
              <Text style={styles.meaning}>{currentWord.meaning}</Text>
              {currentWord.english && (
                <Text style={styles.english}>{currentWord.english}</Text>
              )}
              {currentWord.example && (
                <View style={styles.exampleSection}>
                  <Text style={styles.exampleLabel}>예문:</Text>
                  <Text style={styles.example}>{currentWord.example}</Text>
                  {currentWord.example_meaning && (
                    <Text style={styles.exampleMeaning}>
                      {currentWord.example_meaning}
                    </Text>
                  )}
                </View>
              )}
            </View>
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Answer Buttons */}
      {showAnswer && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.answerButton, styles.incorrectButton]}
            onPress={() => handleAnswer(false)}>
            <Text style={styles.buttonText}>✗ 모르겠어요</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.answerButton, styles.correctButton]}
            onPress={() => handleAnswer(true)}>
            <Text style={styles.buttonText}>✓ 알고 있어요</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Hint when card is not flipped */}
      {!showAnswer && (
        <View style={styles.hintContainer}>
          <Surface style={styles.hint}>
            <Text style={styles.hintText}>
              💡 카드를 탭해서 뜻을 확인하세요
            </Text>
          </Surface>
        </View>
      )}
    </View>
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
  },
  progressText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  counters: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  correctCount: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 16,
  },
  incorrectCount: {
    color: '#f44336',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    marginBottom: 20,
  },
  cardTouchable: {
    height: 300,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardFront: {
    backgroundColor: '#FFFFFF',
  },
  cardBack: {
    backgroundColor: '#F8F9FA',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  kanji: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  reading: {
    fontSize: 24,
    color: '#666',
    marginBottom: 16,
  },
  partOfSpeech: {
    fontSize: 14,
    color: '#999',
    backgroundColor: '#E91E63',
    color: 'white',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 20,
  },
  tapToFlip: {
    fontSize: 14,
    color: '#E91E63',
    fontStyle: 'italic',
  },
  meaning: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#E91E63',
    marginBottom: 8,
    textAlign: 'center',
  },
  english: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  exampleSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    width: '100%',
  },
  exampleLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  answerButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  correctButton: {
    backgroundColor: '#4CAF50',
  },
  incorrectButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  hintContainer: {
    alignItems: 'center',
  },
  hint: {
    padding: 12,
    borderRadius: 8,
    elevation: 2,
  },
  hintText: {
    fontSize: 14,
    color: '#666',
  },
});

export default FlashcardScreen;