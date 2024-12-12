import React, { useRef } from 'react';
import { StyleSheet, TouchableOpacity, FlatList, Dimensions, View, Pressable } from 'react-native';
import { useScreens } from '../../src/stores/screensStore';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import client from '../../src/services/client';

const { width } = Dimensions.get('window');
const HomeScreen: React.FC = () => {
  const flatListRef = useRef<FlatList>(null);
  const { state, dispatch } = useScreens();
  const currentScreen = state.screens[state.currentScreenIndex];

  const viewabilityConfig = React.useMemo(() => ({
    itemVisiblePercentThreshold: 50
  }), []);

  const onViewableItemsChanged = React.useCallback(({ viewableItems }: any) => {
    if (viewableItems[0]) {
      dispatch({ type: 'SET_CURRENT_SCREEN', index: viewableItems[0].index });
    }
  }, [dispatch]);

  const viewabilityConfigCallbackPairs = React.useRef([
    { viewabilityConfig, onViewableItemsChanged },
  ]);

  const handleButtonPress = async (url: string) => {
    try {
      await client.post(url);
      // TODO: Add toast notification for success
    } catch (error) {
      // TODO: Add toast notification for error
      console.error('Button press failed:', error);
    }
  };

  if (!currentScreen) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>No screens configured yet. Go to the Explore tab to import a screen configuration.</ThemedText>
      </ThemedView>
    );
  }

  const renderScreen = ({ item: screen, index }: { item: Screen; index: number }) => (
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
                  width: `${(button.span / 6 * 100) - 0.5}%`,
                  margin: '0.25%',
                }
              ]}
              onPress={() => handleButtonPress(button.url)}>
              <ThemedText style={{color: '#000000'}}>{button.label}</ThemedText>
            </TouchableOpacity>
          ) : (
            <ThemedView
              key={index}
              style={[{
                width: `${(button.span / 6 * 100) - 0.5}%`,
                marginBottom: 4,
                marginTop: 4,
                marginHorizontal: '0.25%',
                height: 2,
                backgroundColor: '#FFFFFF',
                opacity: 0.8,
                alignSelf: 'center'
              }]}
            />
          );
        })}
      </View>
    </View>
  );


  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {state.screens.map((screen, index) => (
          <Pressable
            key={screen.id}
            style={[
              styles.tab,
              index === state.currentScreenIndex && styles.activeTab
            ]}
            onPress={() => {
              flatListRef.current?.scrollToIndex({ index, animated: true });
            }}>
            <ThemedText 
              style={[
                styles.tabText,
                index === state.currentScreenIndex && styles.activeTabText
              ]}>
              {screen.title}
            </ThemedText>
          </Pressable>
        ))}
      </View>
      
      <FlatList
        ref={flatListRef}
        data={state.screens}
        renderItem={renderScreen}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
      />
    </View>
  );
};

export default HomeScreen;


const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    paddingTop: 60,
    paddingHorizontal: 12,
    backgroundColor: '#A1CEDC20',
    paddingBottom: 12,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 16,
  },
  activeTab: {
    backgroundColor: '#A1CEDC',
  },
  tabText: {
    fontSize: 14,
    opacity: 0.7,
  },
  activeTabText: {
    opacity: 1,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
  },
  screenContainer: {
    width,
    padding: 12,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    width: '100%',
    justifyContent: 'flex-start',
    marginHorizontal: '-0.25%',
  },
  button: {
    backgroundColor: '#A1CEDC',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
});
