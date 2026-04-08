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
