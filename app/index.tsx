import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, PanResponder, Alert } from 'react-native';
import { useGame } from '@/contexts/GameContext';
import { Settings, Clock } from 'lucide-react-native';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const CELL_SIZE = Math.min((width - 80) / 3, 120);

export default function GameScreen() {
  const {
    board,
    currentPlayer,
    winner,
    isDraw,
    gameMode,
    player1Symbol,
    player2Symbol,
    palette,
    gamesPlayed,
    player1Score,
    player2Score,
    eraserMode,
    switchMode,
    speedMode,
    makeMove,
    handleSwitch,
    resetGame,
  } = useGame();

  const insets = useSafeAreaInsets();
  const [showWinAnimation, setShowWinAnimation] = useState<boolean>(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [lastTap, setLastTap] = useState<{ index: number; time: number } | null>(null);
  const [swipeStartCell, setSwipeStartCell] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(2);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [gameStarted, setGameStarted] = useState<boolean>(false);

  useEffect(() => {
    if (winner || isDraw) {
      setShowWinAnimation(true);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.1,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      setShowWinAnimation(false);
    }
  }, [winner, isDraw, scaleAnim]);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const getCellFromPosition = useCallback((x: number, y: number): number | null => {
    const boardElement = boardContainerRef.current;
    if (!boardElement) return null;

    const cellIndex = Math.floor(y / CELL_SIZE) * 3 + Math.floor(x / CELL_SIZE);
    if (cellIndex >= 0 && cellIndex < 9) {
      return cellIndex;
    }
    return null;
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => switchMode && !winner && !isDraw,
      onMoveShouldSetPanResponder: () => switchMode && !winner && !isDraw,
      onPanResponderGrant: (evt, gestureState) => {
        if (!switchMode) return;
        const { locationX, locationY } = evt.nativeEvent;
        const cell = getCellFromPosition(locationX, locationY);
        setSwipeStartCell(cell);
      },
      onPanResponderMove: (evt, gestureState) => {
        if (!switchMode || swipeStartCell === null) return;
        const { locationX, locationY } = evt.nativeEvent;
        const cell = getCellFromPosition(locationX, locationY);
        if (cell !== null && cell !== swipeStartCell) {
          const switched = handleSwitch(cell);
          if (switched) {
            setSwipeStartCell(null);
          }
        }
      },
      onPanResponderRelease: () => {
        setSwipeStartCell(null);
      },
    })
  ).current;

  const boardContainerRef = useRef<View | null>(null);

  const handleCellPress = useCallback((index: number) => {
    if (winner || isDraw) return;

    if (!gameStarted) {
      setGameStarted(true);
    }

    if (switchMode) {
      const opponentSymbol = currentPlayer === 'X' ? player2Symbol : player1Symbol;
      if (board[index] === null) {
        makeMove(index, false);
      } else if (board[index] === opponentSymbol) {
        handleSwitch(index);
      }
      return;
    }

    const now = Date.now();
    const isDoubleTap = lastTap && lastTap.index === index && now - lastTap.time < 300;

    if (eraserMode && isDoubleTap) {
      makeMove(index, true);
      setLastTap(null);
    } else {
      makeMove(index, false);
      setLastTap({ index, time: now });
    }
  }, [winner, isDraw, lastTap, eraserMode, switchMode, makeMove, handleSwitch, board, currentPlayer, player1Symbol, player2Symbol, gameStarted]);

  useEffect(() => {
    if (speedMode && !winner && !isDraw && gameStarted) {
      if (gameMode === 'ai' && currentPlayer === 'O') {
        return;
      }

      setTimeLeft(2);

      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }

      timerIntervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 0.1;
          if (newTime <= 0) {
            if (timerIntervalRef.current) {
              clearInterval(timerIntervalRef.current);
              timerIntervalRef.current = null;
            }
            setTimeout(() => {
              Alert.alert(
                'TIME\'S UP!',
                `${currentPlayer === 'X' ? player1Symbol : player2Symbol} ran out of time and loses!`,
                [
                  {
                    text: 'NEW GAME',
                    onPress: () => resetGame(),
                  },
                ]
              );
            }, 100);
            return 0;
          }
          return newTime;
        });
      }, 100);

      return () => {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
      };
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  }, [speedMode, currentPlayer, winner, isDraw, gameMode, player1Symbol, player2Symbol, resetGame, gameStarted]);

  const handleNewGame = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setGameStarted(false);
    resetGame();
  };

  const currentSymbol = currentPlayer === 'X' ? player1Symbol : player2Symbol;
  const winnerSymbol = winner || '';

  return (
    <View style={[styles.container, { backgroundColor: palette.background, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: palette.foreground }]}>TIC-TAC-TOE</Text>
          <Text style={[styles.subtitle, { color: palette.dim }]}>RETRO REMAKE EDITION</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/settings')}
          style={[styles.settingsButton, { borderColor: palette.foreground }]}
        >
          <Settings size={24} color={palette.foreground} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={[styles.statLabel, { color: palette.dim }]}>GAMES</Text>
          <Text style={[styles.statValue, { color: palette.foreground }]}>{gamesPlayed}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statLabel, { color: palette.dim }]}>P1</Text>
          <Text style={[styles.playerSymbol, { color: palette.foreground }]}>{player1Symbol}</Text>
          <Text style={[styles.statValue, { color: palette.foreground }]}>{player1Score}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statLabel, { color: palette.dim }]}>P2</Text>
          <Text style={[styles.playerSymbol, { color: palette.foreground }]}>{player2Symbol}</Text>
          <Text style={[styles.statValue, { color: palette.foreground }]}>{player2Score}</Text>
        </View>
      </View>

      {!winner && !isDraw && (
        <Animated.View style={[styles.turnIndicator, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={[styles.turnText, { color: palette.foreground }]}>
            {gameMode === 'ai' && currentPlayer === 'O' ? 'AI THINKING...' : `${currentSymbol}'S TURN`}
          </Text>
          {speedMode && !(gameMode === 'ai' && currentPlayer === 'O') && (
            <View style={styles.timerContainer}>
              <Clock size={20} color={timeLeft <= 1 ? palette.accent : palette.foreground} />
              <Text style={[styles.timerText, { color: timeLeft <= 1 ? palette.accent : palette.foreground }]}>
                {timeLeft.toFixed(1)}s
              </Text>
            </View>
          )}
        </Animated.View>
      )}

      {showWinAnimation && (
        <Animated.View style={[styles.winnerBanner, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={[styles.winnerText, { color: palette.foreground }]}>
            {isDraw ? 'DRAW!' : `${winnerSymbol} WINS!`}
          </Text>
        </Animated.View>
      )}

      <View style={styles.boardContainer}>
        <View
          ref={boardContainerRef}
          style={styles.board}
          {...(switchMode ? panResponder.panHandlers : {})}
        >
          {board.map((cell, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.cell,
                {
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  borderColor: palette.foreground,
                },
              ]}
              onPress={() => handleCellPress(index)}
              disabled={Boolean(winner || isDraw || (!eraserMode && !switchMode && !!cell))}
              testID={`cell-${index}`}
            >
              <Text
                style={[
                  styles.cellText,
                  {
                    color: palette.foreground,
                    fontSize: CELL_SIZE * 0.5,
                  },
                ]}
              >
                {cell}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: palette.foreground }]}
          onPress={handleNewGame}
        >
          <Text style={[styles.buttonText, { color: palette.background }]}>NEW GAME</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <View style={[styles.footerCard, { borderColor: palette.foreground }]}>
          <Text style={[styles.footerLabel, { color: palette.dim }]}>GAME MODE</Text>
          <Text style={[styles.footerValue, { color: palette.foreground }]}>
            {gameMode === 'ai' ? 'VS AI' : 'VS PLAYER'}
          </Text>
        </View>

        <View style={[styles.footerCard, { borderColor: palette.foreground }]}>
          <Text style={[styles.footerLabel, { color: palette.dim }]}>COLOR THEME</Text>
          <Text style={[styles.footerValue, { color: palette.foreground }]}>{palette.name}</Text>
        </View>

        {(eraserMode || switchMode || speedMode) && (
          <View style={[styles.footerCard, { borderColor: palette.accent }]}>
            <Text style={[styles.footerLabel, { color: palette.dim }]}>ACTIVE MODES</Text>
            <View style={styles.modesContainer}>
              {eraserMode && (
                <Text style={[styles.modeTag, { color: palette.accent }]}>ERASER</Text>
              )}
              {switchMode && (
                <Text style={[styles.modeTag, { color: palette.accent }]}>SWITCH</Text>
              )}
              {speedMode && (
                <Text style={[styles.modeTag, { color: palette.accent }]}>SPEED</Text>
              )}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginTop: 10,
    marginBottom: 20,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '900' as const,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 4,
    marginTop: 4,
  },
  settingsButton: {
    width: 48,
    height: 48,
    borderWidth: 3,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  statsContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'space-around' as const,
    marginBottom: 15,
  },
  statBox: {
    alignItems: 'center' as const,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 2,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '900' as const,
  },
  playerSymbol: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginTop: 2,
    marginBottom: 2,
  },
  turnIndicator: {
    alignItems: 'center' as const,
    marginBottom: 20,
  },
  turnText: {
    fontSize: 18,
    fontWeight: '900' as const,
    letterSpacing: 2,
  },
  timerContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginTop: 8,
  },
  timerText: {
    fontSize: 24,
    fontWeight: '900' as const,
    letterSpacing: 1,
  },
  winnerBanner: {
    alignItems: 'center' as const,
    marginBottom: 20,
  },
  winnerText: {
    fontSize: 32,
    fontWeight: '900' as const,
    letterSpacing: 3,
  },
  boardContainer: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginVertical: 10,
    marginBottom: 35,
  },
  board: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    width: CELL_SIZE * 3,
    height: CELL_SIZE * 3,
  },
  cell: {
    borderWidth: 4,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  cellText: {
    fontWeight: '900' as const,
  },
  controls: {
    marginTop: 0,
    marginBottom: 15,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center' as const,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '900' as const,
    letterSpacing: 2,
  },
  footer: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 12,
    paddingBottom: 20,
    justifyContent: 'center' as const,
  },
  footerCard: {
    borderWidth: 2,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 100,
    alignItems: 'center' as const,
  },
  footerLabel: {
    fontSize: 9,
    fontWeight: '700' as const,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  footerValue: {
    fontSize: 13,
    fontWeight: '900' as const,
    letterSpacing: 1,
  },
  modesContainer: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 6,
    justifyContent: 'center' as const,
  },
  modeTag: {
    fontSize: 13,
    fontWeight: '900' as const,
    letterSpacing: 1,
  },
});
