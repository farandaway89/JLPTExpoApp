import { Platform } from 'react-native';
import vocabularyData from '../assets/jlpt_vocabulary.json';

// Only import SQLite on native platforms
let SQLite = null;
if (Platform.OS !== 'web') {
  SQLite = require('expo-sqlite');
}

class DatabaseManager {
  constructor() {
    this.db = null;
    this.isInitializing = false;
    this.isInitialized = false;
  }

  async ensureDatabase() {
    // For web platform, use fallback data
    if (Platform.OS === 'web' || !SQLite) {
      console.log('Using fallback data for web platform');
      this.isInitialized = true;
      return null; // Web doesn't need database
    }

    if (this.isInitialized && this.db) {
      return this.db;
    }

    if (this.isInitializing) {
      // Wait for current initialization to complete
      while (this.isInitializing) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return this.db;
    }

    this.isInitializing = true;
    try {
      this.db = await SQLite.openDatabaseAsync('jlpt_vocab.db');
      await this.createTables();
      await this.initializeVocabularyData();
      this.isInitialized = true;
      console.log('Database initialization completed');
      return this.db;
    } catch (error) {
      console.error('Database initialization error:', error);
      this.db = null;
      this.isInitialized = false;
      throw error;
    } finally {
      this.isInitializing = false;
    }
  }

  async createTables() {
    const createWordsTable = `
      CREATE TABLE IF NOT EXISTS words (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        kanji TEXT,
        reading TEXT NOT NULL,
        meaning TEXT NOT NULL,
        english TEXT,
        jlpt_level INTEGER NOT NULL,
        part_of_speech TEXT,
        example TEXT,
        example_meaning TEXT
      );
    `;

    const createLearningProgressTable = `
      CREATE TABLE IF NOT EXISTS learning_progress (
        word_id INTEGER PRIMARY KEY,
        learned_count INTEGER DEFAULT 0,
        correct_count INTEGER DEFAULT 0,
        last_studied DATETIME,
        next_review DATETIME,
        difficulty INTEGER DEFAULT 1,
        FOREIGN KEY (word_id) REFERENCES words (id)
      );
    `;

    const createTestRecordsTable = `
      CREATE TABLE IF NOT EXISTS test_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        jlpt_level INTEGER NOT NULL,
        total_questions INTEGER NOT NULL,
        correct_answers INTEGER NOT NULL,
        test_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        duration INTEGER
      );
    `;

    await this.db.execAsync(createWordsTable);
    await this.db.execAsync(createLearningProgressTable);
    await this.db.execAsync(createTestRecordsTable);
  }

  async initializeVocabularyData() {
    try {
      // Check if data already exists
      const existingWords = await this.db.getFirstAsync('SELECT COUNT(*) as count FROM words');
      if (existingWords && existingWords.count > 0) {
        console.log(`Vocabulary data already initialized with ${existingWords.count} words`);
        return;
      }

      console.log('Initializing vocabulary data...');
      for (const word of vocabularyData) {
        await this.db.runAsync(
          `INSERT INTO words (kanji, reading, meaning, english, jlpt_level, part_of_speech, example, example_meaning)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            word.kanji,
            word.reading,
            word.meaning,
            word.english,
            word.jlpt_level,
            word.part_of_speech,
            word.example,
            word.example_meaning
          ]
        );
      }
      console.log(`Vocabulary data initialized successfully with ${vocabularyData.length} words`);
    } catch (error) {
      console.error('Error initializing vocabulary data:', error);
    }
  }

  async getWordsByLevel(jlptLevel) {
    try {
      // For web or when SQLite is not available, use fallback data
      if (Platform.OS === 'web' || !SQLite) {
        return this.getFallbackWords(jlptLevel);
      }

      const db = await this.ensureDatabase();

      const words = await db.getAllAsync(
        'SELECT * FROM words WHERE jlpt_level = ? ORDER BY RANDOM()',
        [jlptLevel]
      );

      console.log(`Found ${words?.length || 0} words for level ${jlptLevel}`);
      return words || [];
    } catch (error) {
      console.error('Error getting words by level:', error);
      // Return sample data as fallback
      return this.getFallbackWords(jlptLevel);
    }
  }

  getFallbackWords(jlptLevel) {
    // Return sample words as fallback
    const sampleWords = vocabularyData.filter(word => word.jlpt_level === jlptLevel);
    return sampleWords.slice(0, 20);
  }

  async forceReinitializeData() {
    try {
      console.log('Force reinitializing vocabulary data...');
      await this.db.runAsync('DELETE FROM words');
      await this.db.runAsync('DELETE FROM learning_progress');

      for (const word of vocabularyData) {
        await this.db.runAsync(
          `INSERT INTO words (kanji, reading, meaning, english, jlpt_level, part_of_speech, example, example_meaning)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            word.kanji,
            word.reading,
            word.meaning,
            word.english,
            word.jlpt_level,
            word.part_of_speech,
            word.example,
            word.example_meaning
          ]
        );
      }
      console.log(`Force reinitialized with ${vocabularyData.length} words`);
    } catch (error) {
      console.error('Error force reinitializing data:', error);
    }
  }

  async getWordsForReview() {
    try {
      const db = await this.ensureDatabase();
      const words = await db.getAllAsync(`
        SELECT w.*, lp.next_review, lp.difficulty
        FROM words w
        LEFT JOIN learning_progress lp ON w.id = lp.word_id
        WHERE lp.next_review IS NULL OR lp.next_review <= datetime('now')
        ORDER BY lp.difficulty DESC, RANDOM()
        LIMIT 20
      `);
      return words || [];
    } catch (error) {
      console.error('Error getting words for review:', error);
      return vocabularyData.slice(0, 20);
    }
  }

  async updateLearningProgress(wordId, isCorrect) {
    try {
      // For web, just log the progress (no database)
      if (Platform.OS === 'web' || !SQLite) {
        console.log(`Web: Learning progress for word ${wordId}, correct: ${isCorrect}`);
        return;
      }

      const db = await this.ensureDatabase();

      const now = new Date().toISOString();

      // Get current progress
      const current = await db.getFirstAsync(
        'SELECT * FROM learning_progress WHERE word_id = ?',
        [wordId]
      );

      let difficulty = 1;
      let learnedCount = 1;
      let correctCount = isCorrect ? 1 : 0;

      if (current) {
        difficulty = isCorrect ? Math.max(1, current.difficulty - 1) : Math.min(5, current.difficulty + 1);
        learnedCount = current.learned_count + 1;
        correctCount = current.correct_count + (isCorrect ? 1 : 0);
      }

      // Calculate next review time using spaced repetition
      const nextReview = this.calculateNextReview(difficulty);

      await db.runAsync(`
        INSERT OR REPLACE INTO learning_progress
        (word_id, learned_count, correct_count, last_studied, next_review, difficulty)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [wordId, learnedCount, correctCount, now, nextReview, difficulty]);

    } catch (error) {
      console.error('Error updating learning progress:', error);
    }
  }

  calculateNextReview(difficulty) {
    const intervals = [1, 3, 7, 14, 30]; // days
    const intervalIndex = Math.min(difficulty - 1, intervals.length - 1);
    const days = intervals[intervalIndex];

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + days);
    return nextReview.toISOString();
  }

  async saveTestRecord(jlptLevel, totalQuestions, correctAnswers, duration) {
    try {
      const db = await this.ensureDatabase();
      await db.runAsync(
        'INSERT INTO test_records (jlpt_level, total_questions, correct_answers, duration) VALUES (?, ?, ?, ?)',
        [jlptLevel, totalQuestions, correctAnswers, duration]
      );
    } catch (error) {
      console.error('Error saving test record:', error);
    }
  }

  async getTestHistory() {
    try {
      const db = await this.ensureDatabase();
      const history = await db.getAllAsync(
        'SELECT * FROM test_records ORDER BY test_date DESC LIMIT 10'
      );
      return history || [];
    } catch (error) {
      console.error('Error getting test history:', error);
      return [];
    }
  }

  async getStudyStatistics() {
    try {
      // For web, return sample statistics
      if (Platform.OS === 'web' || !SQLite) {
        return {
          totalWords: vocabularyData.length,
          studiedWords: 0,
          studyStreak: 0
        };
      }

      const db = await this.ensureDatabase();

      const totalWords = await db.getFirstAsync('SELECT COUNT(*) as count FROM words');
      const studiedWords = await db.getFirstAsync('SELECT COUNT(*) as count FROM learning_progress');
      const streakResults = await db.getFirstAsync(`
        SELECT COUNT(DISTINCT DATE(last_studied)) as streak
        FROM learning_progress
        WHERE last_studied >= date('now', '-30 days')
      `);

      return {
        totalWords: totalWords?.count || 30,
        studiedWords: studiedWords?.count || 0,
        studyStreak: streakResults?.streak || 0
      };
    } catch (error) {
      console.error('Error getting study statistics:', error);
      return { totalWords: 30, studiedWords: 0, studyStreak: 0 };
    }
  }
}

export default new DatabaseManager();