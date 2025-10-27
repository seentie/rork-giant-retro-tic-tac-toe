import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Animated } from 'react-native';
import { useGame } from '@/contexts/GameContext';
import { RETRO_PALETTES } from '@/constants/retroPalettes';
import { X, Check, Edit3 } from 'lucide-react-native';
import { useState, useEffect, useRef } from 'react';
import { Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const {
    gameMode,
    player1Symbol,
    player2Symbol,
    palette,
    eraserMode,
    switchMode,
    speedMode,
    changeGameMode,
    changeSymbols,
    changePalette,
    resetScores,
    hardResetAll,
    toggleEraserMode,
    toggleSwitchMode,
    toggleSpeedMode,
  } = useGame();

  const [p1Input, setP1Input] = useState<string>(player1Symbol);
  const [p2Input, setP2Input] = useState<string>(player2Symbol);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setP1Input(player1Symbol);
    setP2Input(player2Symbol);
  }, [player1Symbol, player2Symbol]);

  const handleSymbolsChange = () => {
    if (p1Input && p2Input && p1Input !== p2Input) {
      changeSymbols(p1Input, p2Input);
      setShowConfirmation(true);
      
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setShowConfirmation(false));
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.background, paddingTop: insets.top }]}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View style={styles.header}>
        <Text style={[styles.title, { color: palette.foreground }]}>SETTINGS</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.closeButton, { borderColor: palette.foreground }]}
        >
          <X size={24} color={palette.foreground} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: palette.foreground }]}>HOW TO PLAY</Text>
          <View style={[styles.howToPlayBox, { borderColor: palette.foreground }]}>
            <Text style={[styles.howToPlayText, { color: palette.foreground }]}>
              We used to play the original Mario Bros. as teammates or enemies for fun, and in that same competitive spirit these new rules were created. With these modes, one game could be endless, result in a win, a loss, or a draw. Overall, we hope you have FUN!{"\n\n"}
              • Get three in a row to win{"\n"}
              • Play against AI or a friend{"\n"}
              • Customize your symbols - letters or emojis{"\n"}
              • Choose from retro color palettes{"\n"}
              • Game counter tracks total games played{"\n"}
              • Counter resets to 0 after 1,985 games{"\n"}
              • Eraser mode: Single tap to place, double tap opponent&apos;s letter to erase{"\n"}
              • Switch mode: Tap empty square OR swipe across opponent&apos;s letter to switch it to your letter{"\n"}
              • Speed mode: 2 seconds per move or you lose! Can combine with other modes
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: palette.foreground }]}>GAME MODE</Text>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                {
                  backgroundColor: gameMode === 'ai' ? palette.foreground : 'transparent',
                  borderColor: palette.foreground,
                },
              ]}
              onPress={() => changeGameMode('ai')}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  { color: gameMode === 'ai' ? palette.background : palette.foreground },
                ]}
              >
                VS AI
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modeButton,
                {
                  backgroundColor: gameMode === 'player' ? palette.foreground : 'transparent',
                  borderColor: palette.foreground,
                },
              ]}
              onPress={() => changeGameMode('player')}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  { color: gameMode === 'player' ? palette.background : palette.foreground },
                ]}
              >
                VS PLAYER
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: palette.foreground }]}>SPECIAL MODES</Text>
          <TouchableOpacity
            style={[
              styles.eraserButton,
              {
                backgroundColor: eraserMode ? palette.foreground : 'transparent',
                borderColor: palette.foreground,
              },
            ]}
            onPress={toggleEraserMode}
          >
            <Text
              style={[
                styles.eraserButtonText,
                { color: eraserMode ? palette.background : palette.foreground },
              ]}
            >
              {eraserMode ? 'ERASER MODE ON' : 'ERASER MODE OFF'}
            </Text>
            <Text
              style={[
                styles.eraserDescription,
                { color: eraserMode ? palette.background : palette.dim },
              ]}
            >
              {eraserMode ? 'Double tap to erase opponent' : 'Standard rules only'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.eraserButton,
              {
                backgroundColor: switchMode ? palette.foreground : 'transparent',
                borderColor: palette.foreground,
                marginTop: 12,
              },
            ]}
            onPress={toggleSwitchMode}
          >
            <Text
              style={[
                styles.eraserButtonText,
                { color: switchMode ? palette.background : palette.foreground },
              ]}
            >
              {switchMode ? 'SWITCH MODE ON' : 'SWITCH MODE OFF'}
            </Text>
            <Text
              style={[
                styles.eraserDescription,
                { color: switchMode ? palette.background : palette.dim },
              ]}
            >
              {switchMode ? 'Swipe to switch opponent letters' : 'Swipe mode disabled'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.eraserButton,
              {
                backgroundColor: speedMode ? palette.foreground : 'transparent',
                borderColor: palette.foreground,
                marginTop: 12,
              },
            ]}
            onPress={toggleSpeedMode}
          >
            <Text
              style={[
                styles.eraserButtonText,
                { color: speedMode ? palette.background : palette.foreground },
              ]}
            >
              {speedMode ? 'SPEED MODE ON' : 'SPEED MODE OFF'}
            </Text>
            <Text
              style={[
                styles.eraserDescription,
                { color: speedMode ? palette.background : palette.dim },
              ]}
            >
              {speedMode ? '2 seconds per move!' : 'No time limit'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: palette.foreground }]}>PLAYER SYMBOLS</Text>
          <View style={styles.symbolInputs}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: palette.dim }]}>PLAYER 1</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: palette.foreground,
                      borderColor: palette.foreground,
                    },
                  ]}
                  value={p1Input}
                  onChangeText={setP1Input}
                  maxLength={4}
                  placeholder="X"
                  placeholderTextColor={palette.dim}
                />
                <View style={[styles.editIconContainer, { backgroundColor: palette.foreground }]}>
                  <Edit3 size={16} color={palette.background} strokeWidth={3} />
                </View>
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: palette.dim }]}>PLAYER 2</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: palette.foreground,
                      borderColor: palette.foreground,
                    },
                  ]}
                  value={p2Input}
                  onChangeText={setP2Input}
                  maxLength={4}
                  placeholder="O"
                  placeholderTextColor={palette.dim}
                />
                <View style={[styles.editIconContainer, { backgroundColor: palette.foreground }]}>
                  <Edit3 size={16} color={palette.background} strokeWidth={3} />
                </View>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.applyButton, { backgroundColor: palette.foreground }]}
            onPress={handleSymbolsChange}
          >
            <Text style={[styles.applyButtonText, { color: palette.background }]}>APPLY</Text>
          </TouchableOpacity>
          {showConfirmation && (
            <Animated.View 
              style={[
                styles.confirmationBanner,
                { 
                  backgroundColor: palette.accent,
                  opacity: fadeAnim,
                }
              ]}
            >
              <Check size={20} color={palette.foreground} strokeWidth={3} />
              <Text style={[styles.confirmationText, { color: palette.foreground }]}>
                Characters updated! {p1Input} vs {p2Input}
              </Text>
            </Animated.View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: palette.foreground }]}>COLOR PALETTE</Text>
          <View style={styles.paletteGrid}>
            {RETRO_PALETTES.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={[
                  styles.paletteCard,
                  {
                    backgroundColor: p.background,
                    borderColor: palette.id === p.id ? palette.foreground : p.foreground,
                    borderWidth: palette.id === p.id ? 4 : 2,
                  },
                ]}
                onPress={() => changePalette(p)}
              >
                <Text style={[styles.paletteName, { color: p.foreground }]}>{p.name}</Text>
                <View style={styles.palettePreview}>
                  <View style={[styles.previewBox, { backgroundColor: p.foreground }]} />
                  <View style={[styles.previewBox, { backgroundColor: p.dim }]} />
                  <View style={[styles.previewBox, { backgroundColor: p.accent }]} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: '#FF0000' }]}>DANGER ZONE</Text>
          <TouchableOpacity
            style={[styles.dangerButton, { borderColor: '#FF0000' }]}
            onPress={resetScores}
          >
            <Text style={[styles.dangerButtonText, { color: '#FF0000' }]}>RESET SCORES</Text>
          </TouchableOpacity>
          <View style={styles.hardResetContainer}>
            <Text style={[styles.emergencyText, { color: '#FF0000' }]}>EMERGENCY USE ONLY</Text>
            <TouchableOpacity
              style={[styles.hardResetButton, { borderColor: '#FF0000' }]}
              onPress={hardResetAll}
            >
              <Text style={[styles.dangerButtonText, { color: '#FF0000' }]}>HARD RESET GAME TALLY TO 0</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: palette.foreground }]}>PRIVACY POLICY</Text>
          <View style={[styles.privacyBox, { borderColor: palette.foreground }]}>
            <ScrollView 
              style={styles.privacyScroll} 
              showsVerticalScrollIndicator={true}
              persistentScrollbar={true}
            >
              <Text style={[styles.privacyText, { color: palette.foreground }]}>
                <Text style={styles.privacyBold}>(Last Updated: January 2025){"\n\n"}</Text>
                
                <Text style={styles.privacyBold}>Overview{"\n"}</Text>
                OLD SKOOL APPS (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) respects your privacy. This Privacy Policy explains our data practices for the Tic-Tac-Toe Retro Remake Edition mobile application.{"\n\n"}
                
                <Text style={styles.privacyBold}>Information We Collect{"\n\n"}</Text>
                
                <Text style={styles.privacyBold}>Local Game Data{"\n"}</Text>
                This app stores data locally on your device only:{"\n"}
                • Game scores and statistics{"\n"}
                • Game settings and preferences{"\n"}
                • Player symbols and color theme choices{"\n"}
                • Game mode preferences{"\n\n"}
                
                <Text style={styles.privacyBold}>No Personal Information Collected{"\n"}</Text>
                We do NOT collect, transmit, or store:{"\n"}
                • Personal identification information{"\n"}
                • Email addresses or contact information{"\n"}
                • Location data{"\n"}
                • Device identifiers{"\n"}
                • Usage analytics or tracking data{"\n"}
                • Any information that leaves your device{"\n\n"}
                
                <Text style={styles.privacyBold}>How We Use Your Information{"\n\n"}</Text>
                All game data is stored locally on your device using secure storage to:{"\n"}
                • Save your game progress and scores{"\n"}
                • Remember your preferred settings{"\n"}
                • Provide a personalized gaming experience{"\n"}
                • Allow you to continue games across app sessions{"\n\n"}
                This data never leaves your device and is only accessible by you.{"\n\n"}
                
                <Text style={styles.privacyBold}>Data Storage and Security{"\n\n"}</Text>
                • All data is stored locally using your device&apos;s secure storage{"\n"}
                • No data is transmitted to external servers{"\n"}
                • No accounts or cloud sync features{"\n"}
                • Data is automatically deleted when you uninstall the app{"\n"}
                • You can reset all data anytime using in-app reset options{"\n\n"}
                
                <Text style={styles.privacyBold}>Third-Party Services{"\n\n"}</Text>
                This app does not integrate with any third-party services, analytics, advertising networks, or social media platforms. It operates completely offline once installed.{"\n\n"}
                
                <Text style={styles.privacyBold}>Children&apos;s Privacy{"\n\n"}</Text>
                This app is safe for all ages. Since we do not collect any personal information, there are no privacy concerns for children. The app contains no advertisements, in-app purchases, or external links.{"\n\n"}
                
                <Text style={styles.privacyBold}>Your Rights{"\n\n"}</Text>
                You have complete control over your data:{"\n"}
                • View all stored data within the app settings{"\n"}
                • Reset scores anytime using the reset button{"\n"}
                • Hard reset to clear all game data{"\n"}
                • Uninstall the app to permanently delete all data{"\n\n"}
                
                <Text style={styles.privacyBold}>Changes to This Policy{"\n\n"}</Text>
                We may update this Privacy Policy from time to time. Changes will be posted within the app. Your continued use of the app after changes constitutes acceptance of the updated policy.{"\n\n"}
                
                <Text style={styles.privacyBold}>Contact Us{"\n\n"}</Text>
                If you have questions about this Privacy Policy, please contact us at:{"\n\n"}
                Email: sarah@oldskoolapps.com{"\n"}
                Address: 2114 N Flamingo Road #867, Pembroke Pines, FL 33028{"\n"}
                Phone: (646)-540-9602{"\n\n"}
                App version: 1.0
              </Text>
            </ScrollView>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.footerTitle, { color: palette.foreground }]}>Tic-Tac-Toe</Text>
          <Text style={[styles.footerText, { color: palette.dim }]}>Retro Remake Edition</Text>
          <Text style={[styles.footerText, { color: palette.dim }]}>Copyright © 2025 Old Skool Apps XO</Text>
        </View>

        <View style={{ height: insets.bottom + 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '900' as const,
    letterSpacing: 2,
  },
  closeButton: {
    width: 48,
    height: 48,
    borderWidth: 3,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900' as const,
    letterSpacing: 2,
    marginBottom: 16,
  },
  buttonGroup: {
    flexDirection: 'row' as const,
    gap: 12,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 16,
    borderWidth: 3,
    alignItems: 'center' as const,
  },
  modeButtonText: {
    fontSize: 16,
    fontWeight: '900' as const,
    letterSpacing: 1,
  },
  symbolInputs: {
    flexDirection: 'row' as const,
    gap: 12,
    marginBottom: 16,
  },
  inputGroup: {
    flex: 1,
  },
  inputWrapper: {
    position: 'relative' as const,
  },
  editIconContainer: {
    position: 'absolute' as const,
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 2,
    marginBottom: 8,
  },
  input: {
    borderWidth: 3,
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 24,
    fontWeight: '900' as const,
    textAlign: 'center' as const,
  },
  applyButton: {
    paddingVertical: 16,
    alignItems: 'center' as const,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '900' as const,
    letterSpacing: 2,
  },
  paletteGrid: {
    gap: 12,
  },
  paletteCard: {
    padding: 16,
    borderWidth: 2,
  },
  paletteName: {
    fontSize: 14,
    fontWeight: '900' as const,
    letterSpacing: 1,
    marginBottom: 12,
  },
  palettePreview: {
    flexDirection: 'row' as const,
    gap: 8,
  },
  previewBox: {
    width: 40,
    height: 40,
  },
  dangerButton: {
    paddingVertical: 16,
    borderWidth: 3,
    alignItems: 'center' as const,
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '900' as const,
    letterSpacing: 2,
  },
  hardResetContainer: {
    marginTop: 24,
    gap: 12,
  },
  emergencyText: {
    fontSize: 11,
    fontWeight: '900' as const,
    letterSpacing: 2,
    textAlign: 'center' as const,
  },
  hardResetButton: {
    paddingVertical: 16,
    borderWidth: 3,
    alignItems: 'center' as const,
  },
  howToPlayBox: {
    borderWidth: 3,
    padding: 20,
  },
  howToPlayText: {
    fontSize: 14,
    fontWeight: '700' as const,
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  eraserButton: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderWidth: 3,
    alignItems: 'center' as const,
  },
  eraserButtonText: {
    fontSize: 16,
    fontWeight: '900' as const,
    letterSpacing: 2,
    marginBottom: 8,
  },
  eraserDescription: {
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
  confirmationBanner: {
    marginTop: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 12,
  },
  confirmationText: {
    fontSize: 14,
    fontWeight: '900' as const,
    letterSpacing: 1,
  },
  privacyBox: {
    borderWidth: 3,
    height: 400,
    overflow: 'hidden' as const,
  },
  privacyScroll: {
    padding: 20,
    paddingRight: 12,
  },
  privacyText: {
    fontSize: 13,
    lineHeight: 20,
    letterSpacing: 0.3,
  },
  privacyBold: {
    fontWeight: '900' as const,
  },
  footerTitle: {
    fontSize: 20,
    fontWeight: '900' as const,
    letterSpacing: 2,
    textAlign: 'center' as const,
    marginBottom: 8,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 1,
    textAlign: 'center' as const,
    marginBottom: 4,
  },
});
