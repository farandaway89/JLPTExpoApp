import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';

const LevelSelectScreen = ({ navigation, route }) => {
  const { mode } = route.params;

  const levels = [
    {
      level: 5,
      name: 'N5 - 기초',
      description: '가장 기본적인 일본어',
      color: '#4CAF50',
      wordCount: '약 800개 단어',
    },
    {
      level: 4,
      name: 'N4 - 초급',
      description: '기초적인 일본어',
      color: '#2196F3',
      wordCount: '약 1,500개 단어',
    },
    {
      level: 3,
      name: 'N3 - 중급',
      description: '일상생활의 일본어',
      color: '#FF9800',
      wordCount: '약 3,000개 단어',
    },
    {
      level: 2,
      name: 'N2 - 중고급',
      description: '폭넓은 일본어',
      color: '#f44336',
      wordCount: '약 6,000개 단어',
    },
    {
      level: 1,
      name: 'N1 - 고급',
      description: '고급 일본어',
      color: '#9E9E9E',
      wordCount: '약 10,000개 단어',
    },
  ];

  const handleLevelSelect = (level) => {
    if (mode === 'flashcard') {
      navigation.navigate('Flashcard', { jlptLevel: level });
    } else if (mode === 'test') {
      navigation.navigate('Test', { jlptLevel: level });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {mode === 'flashcard' ? '플래시카드 학습' : '단어 테스트'}
        </Text>
        <Text style={styles.headerSubtitle}>
          학습할 JLPT 레벨을 선택하세요
        </Text>
      </View>

      {levels.map((levelInfo) => (
        <TouchableOpacity
          key={levelInfo.level}
          onPress={() => handleLevelSelect(levelInfo.level)}>
          <Card style={styles.levelCard}>
            <Card.Content style={styles.cardContent}>
              <View
                style={[
                  styles.levelIndicator,
                  { backgroundColor: levelInfo.color },
                ]}>
                <Text style={styles.levelText}>N{levelInfo.level}</Text>
              </View>
              <View style={styles.levelInfo}>
                <Title style={styles.levelName}>{levelInfo.name}</Title>
                <Paragraph style={styles.levelDescription}>
                  {levelInfo.description}
                </Paragraph>
                <Text style={styles.wordCount}>{levelInfo.wordCount}</Text>
              </View>
              <View style={styles.arrow}>
                <Text style={styles.arrowText}>▶</Text>
              </View>
            </Card.Content>
          </Card>
        </TouchableOpacity>
      ))}

      {/* Info Card */}
      <Card style={styles.infoCard}>
        <Card.Content>
          <Title style={styles.infoTitle}>학습 팁</Title>
          <Paragraph style={styles.infoText}>
            • N5부터 시작해서 단계적으로 학습하세요{'\n'}
            • 매일 조금씩이라도 꾸준히 학습하세요{'\n'}
            • 틀린 단어는 반복해서 복습하세요{'\n'}
            • 예문을 통해 단어의 사용법을 익히세요
          </Paragraph>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E91E63',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  levelCard: {
    marginBottom: 12,
    elevation: 4,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  levelIndicator: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  levelText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  levelInfo: {
    flex: 1,
  },
  levelName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  levelDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  wordCount: {
    fontSize: 12,
    color: '#999',
  },
  arrow: {
    marginLeft: 16,
  },
  arrowText: {
    fontSize: 20,
    color: '#E91E63',
  },
  infoCard: {
    marginTop: 16,
    marginBottom: 24,
    elevation: 2,
  },
  infoTitle: {
    color: '#E91E63',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
});

export default LevelSelectScreen;