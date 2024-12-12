import React, { useRef, useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  View,
  Pressable,
  Alert,
  ScrollView,
} from "react-native";
import { parseScreenConfig } from "../../src/services/yaml/parser";
import { Toast } from "../../src/components/Toast";
import { useScreens } from "../../src/stores/screensStore";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import client from "../../src/services/client";

const { width } = Dimensions.get("window");
const HomeScreen: React.FC = () => {
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
  const { state, dispatch } = useScreens();
  const currentScreen = state.screens[state.currentScreenIndex];

  const viewabilityConfig = React.useMemo(
    () => ({
      itemVisiblePercentThreshold: 50,
    }),
    []
  );

  const onViewableItemsChanged = React.useCallback(
    ({ viewableItems }: any) => {
      if (viewableItems[0]) {
        dispatch({ type: "SET_CURRENT_SCREEN", index: viewableItems[0].index });
      }
    },
    [dispatch]
  );

  const viewabilityConfigCallbackPairs = React.useRef([
    { viewabilityConfig, onViewableItemsChanged },
  ]);

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

  if (!currentScreen) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.emptyStateContainer}>
          <ThemedText style={styles.emptyStateText}>
            There are no screens configured. Press 'Add Screen' to download a YAML configuration file.
          </ThemedText>
        </View>
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              Alert.prompt(
                "Import Screen",
                "Enter YAML URL to import:",
                [
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                  {
                    text: "Import",
                    onPress: (url?: string) => {
                      if (url) {
                        parseScreenConfig(url)
                          .then((screens) => {
                            screens.forEach((screen) =>
                              dispatch({ type: "ADD_SCREEN", screen })
                            );
                            showToast(
                              "Screen imported successfully",
                              "success"
                            );
                          })
                          .catch((error) => {
                            showToast(error.message, "error");
                          });
                      }
                    },
                  },
                ],
                "plain-text"
              );
            }}
          >
            <ThemedText>Add Screen</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  const renderScreen = ({
    item: screen,
    index,
  }: {
    item: Screen;
    index: number;
  }) => (
    <View style={styles.screenContainer}>
      <ThemedText type="title">{screen.title}</ThemedText>
      <View style={styles.buttonGrid}>
        {currentScreen.ui.map((button, index) => {
          return button.label ? (
            <TouchableOpacity
              key={index}
              style={[
                styles.button,
                {
                  width: `${(button.span / 6) * 100 - 0.5}%`,
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
              key={index}
              style={[
                {
                  width: `${(button.span / 6) * 100 - 0.5}%`,
                  marginBottom: 4,
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

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        horizontal
        style={styles.tabBar}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabBarContent}
        ref={(scrollView) => {
          if (scrollView && state.currentScreenIndex >= 0) {
            const tabWidth = 100; // Approximate width of each tab
            const screenWidth = width;
            const scrollToX =
              state.currentScreenIndex * tabWidth -
              screenWidth / 2 +
              tabWidth / 2;
            scrollView.scrollTo({
              x: Math.max(0, scrollToX),
              animated: true,
            });
          }
        }}
      >
        {state.screens.map((screen, index) => (
          <Pressable
            key={screen.id}
            style={[
              styles.tab,
              index === state.currentScreenIndex && styles.activeTab,
            ]}
            onPress={() => {
              flatListRef.current?.scrollToIndex({ index, animated: true });
            }}
          >
            <ThemedText
              style={[
                styles.tabText,
                index === state.currentScreenIndex && styles.activeTabText,
              ]}
            >
              {screen.title}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      <View style={{ flex: 1 }}>
        <FlatList
          ref={flatListRef}
          data={state.screens}
          renderItem={renderScreen}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          viewabilityConfigCallbackPairs={
            viewabilityConfigCallbackPairs.current
          }
        />
      </View>
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
            Alert.prompt(
              "Import Screen",
              "Enter YAML URL to import:",
              [
                {
                  text: "Cancel",
                  style: "cancel",
                },
                {
                  text: "Import",
                  onPress: (url?: string) => {
                    if (url) {
                      parseScreenConfig(url)
                        .then((screens) => {
                          screens.forEach((screen) =>
                            dispatch({ type: "ADD_SCREEN", screen })
                          );
                          showToast("Screen imported successfully", "success");
                        })
                        .catch((error) => {
                          showToast(error.message, "error");
                        });
                    }
                  },
                },
              ],
              "plain-text"
            );
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
    maxHeight: 80, // Add maximum height
  },
  tabBarContent: {
    paddingHorizontal: 12,
    paddingBottom: 8,
    flexDirection: 'row', // Ensure horizontal layout
    alignItems: 'center', // Center items vertically
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 6,
    borderRadius: 12,
    height: 24,
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
    width,
    padding: 12,
    flex: 1,
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
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
  },
});
