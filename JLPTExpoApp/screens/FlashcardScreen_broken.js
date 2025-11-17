import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { Card, ProgressBar, Button, Surface, IconButton } from 'react-native-paper';
import * as Speech from 'expo-speech';
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
  const [isTTSPlaying, setIsTTSPlaying] = useState(false);

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
      console.log(`Loading words for JLPT level: ${jlptLevel}`);
      const wordList = await DatabaseManager.getWordsByLevel(jlptLevel);
      console.log(`Loaded ${wordList.length} words`);

      if (wordList.length === 0) {
        Alert.alert(
          '알림',
          '해당 레벨의 단어가 없습니다. 잠시 후 다시 시도해주세요.',
          [
            { text: '다시 시도', onPress: () => setTimeout(loadWords, 1000) },
            { text: '돌아가기', onPress: () => navigation.goBack() }
          ]
        );
        return;
      }
      setWords(wordList.slice(0, 20)); // Limit to 20 words per session
    } catch (error) {
      console.error('Error loading words:', error);
      Alert.alert('오류', '단어를 불러올 수 없습니다.');
    }
  };

  const flipCard = () => {
    if (isTTSPlaying) {
      console.log('🚫 Card flip blocked - TTS is playing');
      return;
    }

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

  const speakJapanese = async (text) => {
    console.log('🔊 MAIN JAPANESE TTS BUTTON PRESSED');
    setIsTTSPlaying(true);

    try {
      console.log('=== Japanese TTS Enhanced Debug ===');
      console.log('Text to speak:', text);

      // Check available voices first
      const voices = await Speech.getAvailableVoicesAsync();
      console.log('Available voices:', voices.length);

      // Find Japanese voices
      const japaneseVoices = voices.filter(voice =>
        voice.language.includes('ja') ||
        voice.language.includes('JP') ||
        voice.name.toLowerCase().includes('japan')
      );
      console.log('Japanese voices found:', japaneseVoices.length);
      japaneseVoices.forEach(voice => console.log('Japanese voice:', voice.name, voice.language));

      // Method 1: Try with specific Japanese voice if available
      if (japaneseVoices.length > 0) {
        try {
          const voice = japaneseVoices[0];
          console.log(`Trying with Japanese voice: ${voice.name} (${voice.language})`);

          await Speech.speak(text, {
            voice: voice.identifier,
            pitch: 1.0,
            rate: 0.8,
            volume: 1.0,
            onDone: () => {
              setIsTTSPlaying(false);
              console.log('Japanese TTS completed');
            },
            onError: () => {
              setIsTTSPlaying(false);
              console.log('Japanese TTS error');
            }
          });

          console.log('SUCCESS: Japanese voice worked!');
          return;
        } catch (voiceError) {
          console.log('Japanese voice failed:', voiceError.message);
        }
      }

      // Method 2: Try with language code
      const languageCodes = ['ja-JP', 'ja', 'jp-JP'];
      for (const lang of languageCodes) {
        try {
          console.log(`Trying language: ${lang}`);
          await Speech.speak(text, {
            language: lang,
            pitch: 1.0,
            rate: 0.8,
            volume: 1.0,
            onDone: () => {
              setIsTTSPlaying(false);
              console.log(`${lang} TTS completed`);
            },
            onError: () => {
              setIsTTSPlaying(false);
              console.log(`${lang} TTS error`);
            }
          });
          console.log(`SUCCESS with language: ${lang}`);
          return;
        } catch (langError) {
          console.log(`Language ${lang} failed:`, langError.message);
        }
      }

      // Method 3: Default fallback
      console.log('Trying default TTS...');
      await Speech.speak(text, {
        pitch: 1.0,
        rate: 0.8,
        volume: 1.0,
        onDone: () => {
          setIsTTSPlaying(false);
          console.log('Default TTS completed');
        },
        onError: () => {
          setIsTTSPlaying(false);
          console.log('Default TTS error');
        }
      });

    } catch (error) {
      console.error('All Japanese TTS methods failed:', error);
      setIsTTSPlaying(false);
    }
  };

  const speakKorean = (text) => {
    try {
      console.log('Korean TTS - Text:', text);

      Speech.speak(text, {
        language: 'ko-KR',
        pitch: 1.0,
        rate: 0.8,
      });

      console.log('Korean TTS started');
    } catch (error) {
      console.error('Korean TTS Error:', error);
    }
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
        <View style={styles.cardTouchable}>
          <Animated.View
            style={[styles.card, styles.cardFront, { opacity: frontOpacity }]}>
            <TouchableOpacity
              onPress={flipCard}
              style={styles.cardBackgroundTouch}
              disabled={isTTSPlaying}
            >
              <View style={styles.cardContent}>
                {/* 일본어 단어와 TTS 버튼 - Pointer Events로 제어 */}
                <View style={styles.wordWithSoundContainer}>
                  <Text style={styles.kanji}>{currentWord.kanji || currentWord.reading}</Text>
                  <View style={styles.soundButtonWrapper} pointerEvents="box-none">
                    <TouchableOpacity
                      style={styles.inCardSoundButton}
                      onPress={() => {
                        console.log('🔊 INLINE MAIN JAPANESE TTS BUTTON PRESSED');
                        speakJapanese(currentWord.kanji || currentWord.reading);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.soundIcon}>🔊</Text>
                    </TouchableOpacity>
                  </View>
                </View>

              {/* 읽기 */}
              {currentWord.kanji && (
                <Text style={styles.reading}>{currentWord.reading}</Text>
              )}

                <Text style={styles.partOfSpeech}>{currentWord.part_of_speech}</Text>
                <Text style={styles.tapToFlip}>탭해서 뜻 보기</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            style={[styles.card, styles.cardBack, { opacity: backOpacity }]}>
            <View style={styles.cardContent}>
              <View style={styles.meaningContainer}>
                <Text style={styles.meaning}>{currentWord.meaning}</Text>
                <TouchableOpacity
                  onPress={() => speakKorean(currentWord.meaning)}
                  style={styles.smallPronunciationButton}
                  activeOpacity={0.7}
                >
                  <Text style={{fontSize: 20, color: '#E91E63'}}>🔊</Text>
                </TouchableOpacity>
              </View>
              {currentWord.english && (
                <Text style={styles.english}>{currentWord.english}</Text>
              )}
              {currentWord.example && (
                <View style={styles.exampleSection}>
                  <View style={styles.exampleHeader}>
                    <Text style={styles.exampleLabel}>예문:</Text>
                    <TouchableOpacity
                      onPress={() => speakJapanese(currentWord.example)}
                      style={styles.examplePronunciationButton}
                      activeOpacity={0.7}
                    >
                      <Text style={{fontSize: 18, color: '#2196F3'}}>🔊</Text>
                    </TouchableOpacity>
                  </View>
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
        </View>
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
    marginBottom: 8,
  },
  soundIcon: {
    fontSize: 20,
    color: '#E91E63',
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
  meaningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  meaning: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#E91E63',
    textAlign: 'center',
    flex: 1,
  },
  smallPronunciationButton: {
    backgroundColor: 'rgba(233, 30, 99, 0.1)',
    borderRadius: 15,
    marginLeft: 8,
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
  exampleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  exampleLabel: {
    fontSize: 12,
    color: '#999',
    flex: 1,
  },
  examplePronunciationButton: {
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    borderRadius: 12,
    marginLeft: 8,
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
  cardBackgroundTouch: {
    flex: 1,
  },
  wordWithSoundContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  soundButtonWrapper: {
    marginLeft: 15,
  },
  inCardSoundButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(233, 30, 99, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
    minHeight: 40,
  },
});

export default FlashcardScreen;