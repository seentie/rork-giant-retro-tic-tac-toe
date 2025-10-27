import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useGame } from "@/contexts/GameContext";

export default function NotFoundScreen() {
  const { palette } = useGame();

  return (
    <>
      <Stack.Screen options={{ title: "ERROR 404" }} />
      <View style={[styles.container, { backgroundColor: palette.background }]}>
        <Text style={[styles.title, { color: palette.foreground }]}>404 - NOT FOUND</Text>
        <Text style={[styles.subtitle, { color: palette.dim }]}>THIS SCREEN DOESN&apos;T EXIST</Text>

        <Link href="/" style={[styles.link, { borderColor: palette.foreground }]}>
          <Text style={[styles.linkText, { color: palette.foreground }]}>RETURN HOME</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "900" as const,
    letterSpacing: 2,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "700" as const,
    letterSpacing: 2,
    marginBottom: 40,
  },
  link: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderWidth: 3,
  },
  linkText: {
    fontSize: 16,
    fontWeight: "900" as const,
    letterSpacing: 2,
  },
});
