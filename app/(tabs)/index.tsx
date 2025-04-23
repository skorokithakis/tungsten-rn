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
import { useScreens, Screen, Button } from "../../src/stores/screensStore";
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
  withTiming, // Ensure withTiming is imported
  runOnJS,
} from "react-native-reanimated";

const BASE_BUTTON_HEIGHT = 40; // Base height for a button with height: 1

// Define the new ButtonComponent outside HomeScreen
interface ButtonComponentProps {
  button: Button; // Use the imported Button type
  screenId: string;
  index: number;
  buttonWidth: number;
  onPress: (url: string) => void; // Function to handle the press action
}

const ButtonComponent: React.FC<ButtonComponentProps> = ({ button, screenId, index, buttonWidth, onPress }) => {
  // Hooks are now at the top level of ButtonComponent
  const buttonOpacity = useSharedValue(1);

  const tapGesture = Gesture.Tap()
    .maxDuration(250)
    .onBegin(() => {
      // Decrease opacity when tap starts (duration 50ms)
      buttonOpacity.value = withTiming(0.6, { duration: 50 });
    })
    .onEnd((_event, success) => {
      // Check if the tap gesture completed successfully
      if (success) {
        // Run the original button press handler on the JS thread
        runOnJS(onPress)(button.url); // Call the passed onPress function
      }
    })
    .onFinalize(() => {
      // Restore opacity when tap ends (duration 150ms)
      buttonOpacity.value = withTiming(1, { duration: 150 });
    });

  // Animated style for opacity feedback
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
  }));

  return (
    <GestureDetector gesture={tapGesture} key={`${screenId}-button-${index}`}>
      {/* Use Animated.View as GestureDetector needs an Animated component */}
      <Animated.View
        style={[
          styles.button, // Access styles defined at the bottom of the file
          { height: BASE_BUTTON_HEIGHT * (button.height || 1), width: buttonWidth },
          buttonAnimatedStyle, // Apply the animated opacity style
        ]}
      >
        <ThemedText style={{ color: "#000000", textAlign: 'center' }}>
          {button.label}
        </ThemedText>
      </Animated.View>
    </GestureDetector>
  );
};


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
      // Keep the generic error log below
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
    .activeOffsetX([-15, 15]) // Increase horizontal threshold
    .failOffsetY([-15, 15])   // Increase vertical threshold
    .onUpdate((e) => {
      // console.log(`[Gesture.Pan] onUpdate: translationX = ${e.translationX}`); // Keep commented out if needed later
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      // console.log(`[Gesture.Pan] onEnd: Ended with translationX = ${e.translationX}, velocityX = ${e.velocityX}`); // Keep commented out if needed later
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

  // Define this helper function within the HomeScreen component or outside it
  const renderButtonOrSeparator = (
    button: Button, screenId: string, index: number, totalColumnsInRow: number, // Renamed parameter
    // Add containerWidth and gapSize parameters
    containerWidth: number,
    gapSize: number
   ) => {
    const isSeparator = !button.label;
    // Separators span all columns, buttons use their defined span
    // const itemSpan = isSeparator ? totalColumnsInRow : button.span; // No longer needed here

    // Check if it's intended as a separator (empty label AND spans the full row)
    if (isSeparator && button.span === totalColumnsInRow) {
      return (
        <ThemedView
          key={`${screenId}-separator-${index}`}
          style={[
            {
              width: '100%', // Separator spans full width of its container
              height: 2,
              backgroundColor: "#FFFFFF",
              opacity: 0.8,
              marginVertical: 8, // Add some vertical margin for separators
            },
          ]}
        />
      );
    } else if (isSeparator) {
      // It has an empty label but doesn't span the row - render nothing
      return null;
    } else {
      // Ensure button span doesn't exceed available columns in this context
      const effectiveSpan = Math.min(button.span, totalColumnsInRow);

      // Calculate exact width based on container width, gaps, and span
      const totalGapSpaceInRow = (totalColumnsInRow - 1) * gapSize;
      const availableWidthForButtons = containerWidth - totalGapSpaceInRow; // Total space purely for button content areas
      // Calculate the width allocated to a single column span
      const widthPerSpan = availableWidthForButtons / totalColumnsInRow;
      // Calculate the final width for this button element:
      // Sum of widths for each span it covers + the gaps between those spans
      let buttonWidth = (widthPerSpan * effectiveSpan) + (gapSize * (effectiveSpan - 1));
      // Floor the result to avoid potential floating point overflows causing wraps
      buttonWidth = Math.floor(buttonWidth);

      // --- DEBUG LOGGING (More Verbose) ---
      // console.log(`Rendering Button: Label='${button.label}' (Type: ${typeof button.label}), Calculated Width=${buttonWidth}`); // Keep previous log
      // --- END DEBUG LOGGING ---

        // Render the dedicated ButtonComponent instead of inline logic
        return (
          <ButtonComponent
            key={`${screenId}-button-${index}`} // Key for list rendering
            button={button}
            screenId={screenId}
            index={index}
            buttonWidth={buttonWidth}
            onPress={handleButtonPress} // Pass the handler function
          />
        );
      }
    };


  // Replace the existing renderScreen function with this:
  const renderScreen = ({ item: screen }: { item: Screen; index: number }) => {
    const screenPadding = styles.screenContainer.padding ?? 0; // Get padding from style
    const gridGap = styles.buttonGrid.gap ?? 0; // Get gap from style
    const items = screen.ui;

    // Calculate the total available width within the screen container (device width minus screen padding)
    const containerWidth = width - (2 * screenPadding);

    // --- DEBUG LOGGING (More Verbose) ---
    // console.log(`Rendering Screen: Title='${screen.title}' (Type: ${typeof screen.title}), Orientation=${isLandscape ? 'Landscape' : 'Portrait'}`); // Keep previous log
    // --- END DEBUG LOGGING ---

    if (!isLandscape) {
      // Portrait mode - single column

      const renderedItems = items.map((item, index) => {
        const element = renderButtonOrSeparator(item, screen.id, index, 6, containerWidth, gridGap); // Pass 6 columns, width, gap
        // Log the type of the rendered element. For components, it might log the function name or 'Object'. For null, it logs 'null'. Strings would log 'string'.
        return element;
      });

      return (
        <View style={[styles.screenContainer, { width: "100%" }]}>
          <View style={styles.buttonGrid}>
            {renderedItems}
          </View>
        </View>
      );
    }

    // Landscape mode - two columns
    // Simple split in the middle
    const landscapeColumnGap = 16; // Gap between the two columns
    // Width of each column container
    const columnContainerWidth = (containerWidth - landscapeColumnGap) / 2; // Use the overall containerWidth
    // Width available for buttons within each column grid (column width minus its internal padding)
    const buttonGridContainerWidth = columnContainerWidth; // Assuming no extra padding inside the column View

    const midIndex = Math.ceil(items.length / 2);
    const leftItems = items.slice(0, midIndex);
    const rightItems = items.slice(midIndex);

    const renderedLeftItems = leftItems.map((item, index) => {
      const element = renderButtonOrSeparator(item, screen.id, index, 6, buttonGridContainerWidth, gridGap); // Pass 6 columns, width, gap
      return element;
    });

    const renderedRightItems = rightItems.map((item, index) => {
      // Use midIndex + index for the key to ensure uniqueness across columns
      const element = renderButtonOrSeparator(item, screen.id, midIndex + index, 6, buttonGridContainerWidth, gridGap); // Pass 6 columns, width, gap
      return element;
    });

    return (
      <View style={[styles.screenContainer, { width: "100%", flexDirection: "row", gap: landscapeColumnGap }]}>
        {/* Left Column */}
        <View style={[styles.buttonGrid, { flex: 1, marginTop: 0 /* Reset margin top */ }]}>
          {renderedLeftItems}
        </View>

        {/* Right Column */}
        <View style={[styles.buttonGrid, { flex: 1, marginTop: 0 /* Reset margin top */ }]}>
          {renderedRightItems}
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
    gap: 4, // Use gap for spacing between items
  },
  button: {
    backgroundColor: "#A1CEDC",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
    // marginBottom: 6, // Handled by gap now
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
