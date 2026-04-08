# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Releasing

Build and submit to Google Play with the `./build` script:

```bash
./build internal    # Submit to the internal testing track
./build production  # Submit to the production track
```

This builds a release `.aab` locally and uploads it to Google Play Console. To
make it available to users, go to the [Google Play
Console](https://play.google.com/console), navigate to the appropriate track
under **Testing** or **Production**, and promote the build by creating a new
release with the uploaded bundle.

## Android Auto

The app's screens and buttons automatically appear on Android Auto — no extra
setup required. Any changes made in the app are picked up the next time the car
connects. Tapping a button on the car's display fires the same action as tapping
it on the phone.

## Auto favorites

By default, Android Auto shows your screens as a list to browse. If you mark
specific buttons as favorites, those buttons are shown directly on the root
screen for quick access, with a "Browse all panes" option at the bottom to reach
everything else.

Favorites are configured in the YAML with `auto_favorite: true` on a button:

```yaml
title: Living room
columns: 3
ui:
  - label: Lights on
    span: 3
    url: http://example.com/lights/on
    auto_favorite: true
```

There is no in-app toggle for favorites — they are configured in the YAML only.
