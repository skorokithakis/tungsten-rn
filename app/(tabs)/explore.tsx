import { StyleSheet, TextInput, TouchableOpacity, Alert } from "react-native";
import { useState } from "react";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { parseScreenConfig } from "../../src/services/yaml/parser";
import { useScreens } from "../../src/stores/screensStore";

export default function TabTwoScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      style={{ flex: 1 }}
    >
      <ThemedText type="title">Import Screen</ThemedText>
      <ThemedText>
        Paste a YAML configuration URL below to import a new screen.
      </ThemedText>
      <ImportScreenSection />
    </ParallaxScrollView>
  );
}

function ImportScreenSection() {
  const [url, setUrl] = useState("");
  const { dispatch } = useScreens();

  const handleImport = async () => {
    try {
      const screens = await parseScreenConfig(url);
      for (const screen of screens) {
        dispatch({ type: "ADD_SCREEN", screen });
      }
      Alert.alert(
        "Success",
        `${screens.length} screen(s) imported and saved successfully`
      );
      setUrl("");
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to import screen"
      );
    }
  };

  return (
    <ThemedView style={styles.importSection}>
      <TextInput
        style={styles.input}
        value={url}
        onChangeText={setUrl}
        placeholder="Enter YAML URL"
        placeholderTextColor="#999"
      />
      <TouchableOpacity
        style={styles.importButton}
        onPress={handleImport}
        disabled={!url.trim()}
      >
        <ThemedText>Import</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  importSection: {
    marginVertical: 16,
    gap: 8,
  },
  input: {
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 8,
    color: "#000",
  },
  importButton: {
    backgroundColor: "#A1CEDC",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
});
