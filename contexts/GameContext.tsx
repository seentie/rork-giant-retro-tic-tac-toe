import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { RETRO_PALETTES, RetroPalette } from '@/constants/retroPalettes';

export type GameMode = 'ai' | 'player';
export type Player = 'X' | 'O';
export type Board = (string | null)[];

type GameState = {
  board: Board;
  currentPlayer: Player;
  winner: string | null;
  isDraw: boolean;
  gameMode: GameMode;
  player1Symbol: string;
  player2Symbol: string;
  palette: RetroPalette;
  gamesPlayed: number;
  player1Score: number;
  player2Score: number;
  eraserMode: boolean;
  switchMode: boolean;
  speedMode: boolean;
};

const STORAGE_KEY = '@tictactoe_state';
const MAX_GAMES = 1985;

export const [GameProvider, useGame] = createContextHook(() => {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [winner, setWinner] = useState<string | null>(null);
  const [isDraw, setIsDraw] = useState<boolean>(false);
  const [gameMode, setGameMode] = useState<GameMode>('ai');
  const [player1Symbol, setPlayer1Symbol] = useState<string>('X');
  const [player2Symbol, setPlayer2Symbol] = useState<string>('O');
  const [palette, setPalette] = useState<RetroPalette>(RETRO_PALETTES[0]);
  const [gamesPlayed, setGamesPlayed] = useState<number>(0);
  const [player1Score, setPlayer1Score] = useState<number>(0);
  const [player2Score, setPlayer2Score] = useState<number>(0);
  const [eraserMode, setEraserMode] = useState<boolean>(false);
  const [switchMode, setSwitchMode] = useState<boolean>(false);
  const [speedMode, setSpeedMode] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    loadState();
  }, []);

  const saveState = useCallback(async () => {
    try {
      const state: Partial<GameState> = {
        gamesPlayed,
        player1Score,
        player2Score,
        player1Symbol,
        player2Symbol,
        palette: {
          id: palette.id,
          name: palette.name,
          background: palette.background,
          foreground: palette.foreground,
          dim: palette.dim,
          accent: palette.accent,
        },
        gameMode,
        eraserMode,
        switchMode,
        speedMode,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save game state:', error);
    }
  }, [gamesPlayed, player1Score, player2Score, player1Symbol, player2Symbol, palette, gameMode, eraserMode, switchMode, speedMode]);

  useEffect(() => {
    if (isLoaded) {
      const timeoutId = setTimeout(() => {
        saveState();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isLoaded, saveState]);

  const loadState = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const state: Partial<GameState> = JSON.parse(stored);
        if (state.gamesPlayed !== undefined) setGamesPlayed(state.gamesPlayed);
        if (state.player1Score !== undefined) setPlayer1Score(state.player1Score);
        if (state.player2Score !== undefined) setPlayer2Score(state.player2Score);
        if (state.player1Symbol) setPlayer1Symbol(state.player1Symbol);
        if (state.player2Symbol) setPlayer2Symbol(state.player2Symbol);
        if (state.gameMode) setGameMode(state.gameMode);
        if (state.eraserMode !== undefined) setEraserMode(Boolean(state.eraserMode));
        if (state.switchMode !== undefined) setSwitchMode(Boolean(state.switchMode));
        if (state.speedMode !== undefined) setSpeedMode(Boolean(state.speedMode));
        if (state.palette) {
          const foundPalette = RETRO_PALETTES.find(p => p.id === state.palette?.id);
          if (foundPalette) setPalette(foundPalette);
        }
      }
    } catch (error) {
      console.error('Failed to load game state:', error);
    } finally {
      setIsLoaded(true);
    }
  };



  const checkWinner = (currentBoard: Board): string | null => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (const [a, b, c] of lines) {
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return currentBoard[a];
      }
    }

    return null;
  };

  const handleSwitch = useCallback((index: number) => {
    if (winner || isDraw || !switchMode) return false;

    const opponentSymbol = currentPlayer === 'X' ? player2Symbol : player1Symbol;
    const opponentHasLetters = board.some(cell => cell === opponentSymbol);

    if (!opponentHasLetters) return false;

    if (board[index] === opponentSymbol) {
      const newBoard = [...board];
      const currentSymbol = currentPlayer === 'X' ? player1Symbol : player2Symbol;
      newBoard[index] = currentSymbol;
      setBoard(newBoard);

      const gameWinner = checkWinner(newBoard);
      if (gameWinner) {
        setWinner(gameWinner);
        if (gameWinner === player1Symbol) {
          setPlayer1Score(prev => prev + 1);
        } else {
          setPlayer2Score(prev => prev + 1);
        }
        const newGamesPlayed = gamesPlayed + 1;
        setGamesPlayed(newGamesPlayed >= MAX_GAMES ? 0 : newGamesPlayed);
        return true;
      }

      if (newBoard.every(cell => cell !== null)) {
        setIsDraw(true);
        const newGamesPlayed = gamesPlayed + 1;
        setGamesPlayed(newGamesPlayed >= MAX_GAMES ? 0 : newGamesPlayed);
        return true;
      }

      const nextPlayer: Player = currentPlayer === 'X' ? 'O' : 'X';
      setCurrentPlayer(nextPlayer);
      return true;
    }

    return false;
  }, [board, winner, isDraw, currentPlayer, player1Symbol, player2Symbol, gamesPlayed, switchMode]);

  const makeMove = useCallback((index: number, isDoubleTap: boolean = false) => {
    if (winner || isDraw) return;

    const newBoard = [...board];
    const currentSymbol = currentPlayer === 'X' ? player1Symbol : player2Symbol;
    const opponentSymbol = currentPlayer === 'X' ? player2Symbol : player1Symbol;

    if (eraserMode && isDoubleTap && board[index] === opponentSymbol) {
      newBoard[index] = null;
      setBoard(newBoard);
      const nextPlayer: Player = currentPlayer === 'X' ? 'O' : 'X';
      setCurrentPlayer(nextPlayer);
      return;
    }

    if (board[index]) return;

    newBoard[index] = currentSymbol;
    setBoard(newBoard);

    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      if (gameWinner === player1Symbol) {
        setPlayer1Score(prev => prev + 1);
      } else {
        setPlayer2Score(prev => prev + 1);
      }
      const newGamesPlayed = gamesPlayed + 1;
      setGamesPlayed(newGamesPlayed >= MAX_GAMES ? 0 : newGamesPlayed);
      return;
    }

    if (newBoard.every(cell => cell !== null)) {
      setIsDraw(true);
      const newGamesPlayed = gamesPlayed + 1;
      setGamesPlayed(newGamesPlayed >= MAX_GAMES ? 0 : newGamesPlayed);
      return;
    }

    const nextPlayer: Player = currentPlayer === 'X' ? 'O' : 'X';
    setCurrentPlayer(nextPlayer);
  }, [board, winner, isDraw, currentPlayer, player1Symbol, player2Symbol, gamesPlayed, eraserMode]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    
    if (gameMode === 'ai' && currentPlayer === 'O' && !winner && !isDraw) {
      const availableMoves = board
        .map((cell, index) => (cell === null ? index : null))
        .filter((index): index is number => index !== null);

      if (availableMoves.length === 0) return;

      const aiSymbol = player2Symbol;
      const playerSymbol = player1Symbol;

      const findWinningMove = (symbol: string): number | null => {
        for (const move of availableMoves) {
          const testBoard = [...board];
          testBoard[move] = symbol;
          if (checkWinner(testBoard) === symbol) {
            return move;
          }
        }
        return null;
      };

      const winningMove = findWinningMove(aiSymbol);
      if (winningMove !== null) {
        timeoutId = setTimeout(() => makeMove(winningMove), 500);
        return () => {
          if (timeoutId) clearTimeout(timeoutId);
        };
      }

      const blockingMove = findWinningMove(playerSymbol);
      if (blockingMove !== null) {
        timeoutId = setTimeout(() => makeMove(blockingMove), 500);
        return () => {
          if (timeoutId) clearTimeout(timeoutId);
        };
      }

      if (board[4] === null) {
        timeoutId = setTimeout(() => makeMove(4), 500);
        return () => {
          if (timeoutId) clearTimeout(timeoutId);
        };
      }

      const corners = [0, 2, 6, 8];
      const availableCorners = corners.filter(i => board[i] === null);
      if (availableCorners.length > 0) {
        const randomCorner = availableCorners[Math.floor(Math.random() * availableCorners.length)];
        timeoutId = setTimeout(() => makeMove(randomCorner), 500);
        return () => {
          if (timeoutId) clearTimeout(timeoutId);
        };
      }

      const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
      timeoutId = setTimeout(() => makeMove(randomMove), 500);
      return () => {
        if (timeoutId) clearTimeout(timeoutId);
      };
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [gameMode, currentPlayer, winner, isDraw, board, player1Symbol, player2Symbol, makeMove]);

  const resetGame = useCallback(() => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setIsDraw(false);
  }, []);

  const resetScores = useCallback(() => {
    setPlayer1Score(0);
    setPlayer2Score(0);
  }, []);

  const hardResetAll = useCallback(() => {
    setPlayer1Score(0);
    setPlayer2Score(0);
    setGamesPlayed(0);
  }, []);

  const changeGameMode = useCallback((mode: GameMode) => {
    setGameMode(mode);
    resetGame();
  }, [resetGame]);

  const changeSymbols = useCallback((p1: string, p2: string) => {
    const normalizeSymbol = (symbol: string): string => {
      if (!symbol) return '';
      const trimmed = symbol.trim();
      const emojiMatch = trimmed.match(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u);
      if (emojiMatch) {
        return emojiMatch[0];
      }
      return trimmed.charAt(0).toUpperCase();
    };
    
    setPlayer1Symbol(normalizeSymbol(p1) || 'X');
    setPlayer2Symbol(normalizeSymbol(p2) || 'O');
    resetGame();
  }, [resetGame]);

  const changePalette = useCallback((newPalette: RetroPalette) => {
    setPalette(newPalette);
  }, []);

  const toggleEraserMode = useCallback(() => {
    setEraserMode(prev => !prev);
  }, []);

  const toggleSwitchMode = useCallback(() => {
    setSwitchMode(prev => !prev);
  }, []);

  const toggleSpeedMode = useCallback(() => {
    setSpeedMode(prev => !prev);
  }, []);

  return useMemo(() => ({
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
    resetScores,
    hardResetAll,
    changeGameMode,
    changeSymbols,
    changePalette,
    toggleEraserMode,
    toggleSwitchMode,
    toggleSpeedMode,
  }), [board, currentPlayer, winner, isDraw, gameMode, player1Symbol, player2Symbol, palette, gamesPlayed, player1Score, player2Score, eraserMode, switchMode, speedMode, makeMove, handleSwitch, resetGame, resetScores, hardResetAll, changeGameMode, changeSymbols, changePalette, toggleEraserMode, toggleSwitchMode, toggleSpeedMode]);
});
