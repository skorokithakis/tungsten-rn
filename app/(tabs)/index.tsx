import React, { useRef, useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  FlatList,
  View,
  Pressable,
  Alert,
  ScrollView,
  Modal,
  TextInput,
  useWindowDimensions,
} from "react-native";
import { parseScreenConfig } from "../../src/services/yaml/parser";
import { Toast } from "../../src/components/Toast";
import { useScreens } from "../../src/stores/screensStore";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import client from "../../src/services/client";
import {
  GestureHandlerRootView,
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from "react-native-reanimated";

const BASE_BUTTON_HEIGHT = 40; // Base height for a button with height: 1

const HomeScreen: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const flatListRef = useRef<FlatList>(null);
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: "success" | "error";
  }>({
    visible: false,
    message: "",
    type: "success",
  });
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const { state, dispatch } = useScreens();
  const currentScreen = state.screens[state.currentScreenIndex];
  const translateX = useSharedValue(0);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ visible: true, message, type });
  };

  const handleButtonPress = async (url: string) => {
    try {
      await client.post(url);
      showToast("Action completed successfully", "success");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Action failed",
        "error"
      );
      console.error("Button press failed:", error);
    }
  };

  const handleScreenChange = (direction: "left" | "right") => {
    const newIndex =
      direction === "left"
        ? Math.min(state.currentScreenIndex + 1, state.screens.length - 1)
        : Math.max(state.currentScreenIndex - 1, 0);

    dispatch({ type: "SET_CURRENT_SCREEN", index: newIndex });
  };

  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      // Reduce threshold in landscape mode
      const threshold = isLandscape ? width * 0.05 : width * 0.2; // 10% in landscape, 20% in portrait
      if (Math.abs(e.translationX) > threshold) {
        if (e.translationX > 0) {
          // Swipe right
          runOnJS(handleScreenChange)("right");
        } else {
          // Swipe left
          runOnJS(handleScreenChange)("left");
        }
      }
      translateX.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const renderScreen = ({
    item: screen,
    index,
  }: {
    item: Screen;
    index: number;
  }) => {
    if (!isLandscape) {
      // Portrait mode - original single column layout
      return (
        <View style={[styles.screenContainer, { width: "100%" }]}>
          <View style={styles.buttonGrid}>
            {screen.ui.map((button, index) => {
              return button.label ? (
                // Add this log to check the button data including height
                console.log("Portrait Button Data:", JSON.stringify(button)),
                <TouchableOpacity
                  key={`${screen.id}-button-${index}`} // Unique key for button
                  style={[
                    styles.button,
                    {
                      height: BASE_BUTTON_HEIGHT * (button.height || 1),
                      width: `${(button.span / 6) * 100 - 1}%`, // Use adjusted width
                      margin: "0.25%",
                    },
                  ]}
                  onPress={() => handleButtonPress(button.url)}
                >
                  <ThemedText style={{ color: "#000000" }}>
                    {button.label}
                  </ThemedText>
                </TouchableOpacity>
              ) : (
                <ThemedView
                  key={`${screen.id}-separator-${index}`} // Unique key for separator
                  style={[
                    {
                      width: `${(button.span / 6) * 100 - 1}%`, // Use adjusted width
                      marginBottom: 4, // Keep separator margins
                      marginTop: 4,
                      marginHorizontal: "0.25%",
                      height: 2,
                      backgroundColor: "#FFFFFF",
                      opacity: 0.8,
                      alignSelf: "center",
                    },
                  ]}
                />
              );
            })}
          </View>
        </View>
      );
    }

    // Landscape mode - two column layout
    const buttons = screen.ui;

    // Calculate rows based on button spans
    let currentRowSpan = 0;
    let rowCount = 0;
    let rowBreakIndices: number[] = [];

    buttons.forEach((button, index) => {
      currentRowSpan += button.span || 0;
      if (currentRowSpan >= 6 || currentRowSpan === 0) {
        // End of row reached or separator encountered
        rowCount++;
        if (currentRowSpan >= 6) {
          rowBreakIndices.push(index);
        }
        currentRowSpan = 0;
      }
    });

    // If there's a partial row at the end
    if (currentRowSpan > 0) {
      rowCount++;
    }

    // Find the middle row
    const midRowIndex = Math.ceil(rowCount / 2);

    // Find the button index that starts the middle row
    let splitIndex = 0;
    let currentRow = 0;
    currentRowSpan = 0;

    for (let i = 0; i < buttons.length; i++) {
      currentRowSpan += buttons[i].span || 0;
      if (currentRowSpan >= 6 || currentRowSpan === 0) {
        currentRow++;
        if (currentRow === midRowIndex) {
          splitIndex = i + 1;
          break;
        }
        currentRowSpan = 0;
      }
    }

    const leftButtons = buttons.slice(0, splitIndex);
    const rightButtons = buttons.slice(splitIndex);

    return (
      <View
        style={[
          styles.screenContainer,
          { width: "100%", flexDirection: "row" },
        ]}
      >
        {/* Left Column */}
        <View style={[styles.buttonGrid, { flex: 1, marginRight: 8 }]}>
          {leftButtons.map((button, index) => {
            return button.label ? (
              // Add this log to check the button data including height
              console.log("Landscape Left Button Data:", JSON.stringify(button)),
              <TouchableOpacity
                key={`${screen.id}-button-${index}`} // Correct unique key for left button
                style={[
                  styles.button,
                  {
                    height: BASE_BUTTON_HEIGHT * (button.height || 1),
                    width: `${(button.span / 6) * 100 - 1}%`, // Keep adjusted width
                    margin: "0.25%",
                  },
                ]}
                onPress={() => handleButtonPress(button.url)}
              >
                <ThemedText style={{ color: "#000000" }}>
                  {button.label}
                </ThemedText>
              </TouchableOpacity>
            ) : (
              <ThemedView
                key={`${screen.id}-separator-${index}`} // Correct unique key for left separator
                style={[
                  {
                    width: `${(button.span / 6) * 100 - 1}%`, // Use adjusted width
                    marginBottom: 4, // Keep separator margins
                    marginTop: 4,
                    marginHorizontal: "0.25%",
                    height: 2,
                    backgroundColor: "#FFFFFF",
                    opacity: 0.8,
                    alignSelf: "center",
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Right Column */}
        <View style={[styles.buttonGrid, { flex: 1, marginLeft: 8 }]}>
          {rightButtons.map((button, index) => {
            return button.label ? (
              // Add this log to check the button data including height
              console.log("Landscape Right Button Data:", JSON.stringify(button)),
              <TouchableOpacity
                key={`${screen.id}-button-${splitIndex + index}`} // Correct unique key for right button
                style={[
                  styles.button,
                  {
                    height: BASE_BUTTON_HEIGHT * (button.height || 1),
                    width: `${(button.span / 6) * 100 - 1}%`, // Keep adjusted width
                    margin: "0.25%",
                  },
                ]}
                onPress={() => handleButtonPress(button.url)}
              >
                <ThemedText style={{ color: "#000000" }}>
                  {button.label}
                </ThemedText>
              </TouchableOpacity>
            ) : (
              <ThemedView
                key={`${screen.id}-separator-${splitIndex + index}`} // Unique key using original index + offset
                style={[
                  {
                    width: `${(button.span / 6) * 100 - 1}%`, // Use adjusted width
                    marginBottom: 4, // Keep separator margins
                    marginTop: 4,
                    marginHorizontal: "0.25%",
                    height: 2,
                    backgroundColor: "#FFFFFF",
                    opacity: 0.8,
                    alignSelf: "center",
                  },
                ]}
              />
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
        }}
      >
        {currentScreen ? (
          <ThemedView style={styles.container}>
            <ScrollView
              horizontal
              style={styles.tabBar}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabBarContent}
            >
              {state.screens.map((screen, index) => (
                <Pressable
                  key={screen.id}
                  style={[
                    styles.tab,
                    index === state.currentScreenIndex && styles.activeTab,
                  ]}
                  onPress={() => {
                    dispatch({ type: "SET_CURRENT_SCREEN", index });
                  }}
                >
                  <ThemedText
                    style={[
                      styles.tabText,
                      index === state.currentScreenIndex &&
                        styles.activeTabText,
                    ]}
                  >
                    {screen.title}
                  </ThemedText>
                </Pressable>
              ))}
            </ScrollView>

            <GestureHandlerRootView style={{ flex: 1 }}>
              <GestureDetector gesture={gesture}>
                <Animated.View style={[{ flex: 1 }, animatedStyle]}>
                  {renderScreen({
                    item: currentScreen,
                    index: state.currentScreenIndex,
                  })}
                </Animated.View>
              </GestureDetector>
            </GestureHandlerRootView>
            <Toast
              visible={toast.visible}
              message={toast.message}
              type={toast.type}
              onHide={() => setToast((prev) => ({ ...prev, visible: false }))}
            />
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  setImportModalVisible(true);
                }}
              >
                <ThemedText>Add Screen</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.deleteButton,
                  !currentScreen && styles.hiddenButton,
                ]}
                disabled={!currentScreen}
                onPress={() => {
                  if (currentScreen) {
                    dispatch({ type: "REMOVE_SCREEN", id: currentScreen.id });
                    showToast("Screen deleted", "success");
                  }
                }}
              >
                <ThemedText style={styles.deleteButtonText}>Delete</ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        ) : (
          <ThemedView style={styles.container}>
            <View style={styles.emptyStateContainer}>
              <ThemedText style={styles.emptyStateText}>
                There are no screens configured. Press 'Add Screen' to download
                a YAML configuration file.
              </ThemedText>
            </View>
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  setImportModalVisible(true);
                }}
              >
                <ThemedText>Add Screen</ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        )}
      </ScrollView>
      {importModalVisible && (
        <Modal
          transparent={true}
          animationType="slide"
          onRequestClose={() => setImportModalVisible(false)}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0,0,0,0.5)",
            }}
          >
            <View
              style={{
                backgroundColor: "#fff",
                padding: 20,
                borderRadius: 8,
                width: "80%",
              }}
            >
              <TextInput
                style={{
                  borderColor: "#ccc",
                  borderWidth: 1,
                  padding: 10,
                  marginBottom: 10,
                }}
                placeholder="Enter YAML URL"
                value={importUrl}
                onChangeText={setImportUrl}
              />
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    setImportModalVisible(false);
                    setImportUrl("");
                  }}
                  style={{ padding: 10 }}
                >
                  <ThemedText style={{ color: "#000000" }}>Cancel</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={async () => {
                    if (importUrl.trim()) {
                      try {
                        const screens = await parseScreenConfig(importUrl);
                        screens.forEach((screen) =>
                          dispatch({ type: "ADD_SCREEN", screen })
                        );
                        showToast("Screen imported successfully", "success");
                      } catch (error) {
                        showToast(
                          error instanceof Error
                            ? error.message
                            : "Import failed",
                          "error"
                        );
                      }
                      setImportModalVisible(false);
                      setImportUrl("");
                    }
                  }}
                  style={{ padding: 10 }}
                >
                  <ThemedText style={{ color: "#000000" }}>Import</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
    paddingBottom: 30,
    backgroundColor: "#A1CEDC20",
    marginTop: "auto",
  },
  tabBar: {
    backgroundColor: "#A1CEDC20",
    paddingTop: 50, // Space for status bar
    maxHeight: 100, // Increased maxHeight gives more space
  },
  tabBarContent: {
    paddingHorizontal: 12,
    paddingBottom: 8,
    flexDirection: "row", // Ensure horizontal layout
    alignItems: "center", // Center items vertically
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 6,
    borderRadius: 12,
    marginTop: 2,
    justifyContent: "center",
  },
  activeTab: {
    backgroundColor: "#A1CEDC",
  },
  tabText: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  activeTabText: {
    opacity: 1,
    fontWeight: "bold",
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: "#A1CEDC",
  },
  deleteButton: {
    backgroundColor: "#FF6B6B",
  },
  deleteButtonText: {
    color: "white",
  },
  hiddenButton: {
    opacity: 0,
    display: "none",
  },
  container: {
    flex: 1,
  },
  screenContainer: {
    padding: 12,
    flex: 1,
    width: "100%",
  },
  buttonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 16,
    width: "100%",
    justifyContent: "flex-start",
    marginHorizontal: "-0.25%",
  },
  button: {
    backgroundColor: "#A1CEDC",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 6, // Add vertical spacing between buttons
    justifyContent: "center", // Keep vertical centering
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyStateText: {
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
  },
});
