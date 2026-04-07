const {
  withAndroidManifest,
  withAppBuildGradle,
  withDangerousMod,
  createRunOncePlugin,
} = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const KOTLIN_FILES = [
  "TungstenCarAppService.kt",
  "TungstenSession.kt",
  "MainCarScreen.kt",
  "ButtonListScreen.kt",
  "CarDataStore.kt",
  "CarActionExecutor.kt",
];

function withAndroidAutoManifest(config) {
  return withAndroidManifest(config, async (config) => {
    const manifest = config.modResults;
    const application = manifest.manifest.application[0];

    // Add car app service
    if (!application.service) application.service = [];

    const serviceExists = application.service.some(
      (s) =>
        s.$["android:name"] === ".androidauto.TungstenCarAppService"
    );

    if (!serviceExists) {
      application.service.push({
        $: {
          "android:name": ".androidauto.TungstenCarAppService",
          "android:exported": "true",
        },
        "intent-filter": [
          {
            action: [
              {
                $: { "android:name": "androidx.car.app.CarAppService" },
              },
            ],
            category: [
              {
                $: { "android:name": "androidx.car.app.category.IOT" },
              },
            ],
          },
        ],
      });
    }

    // Add automotive app description metadata
    if (!application["meta-data"]) application["meta-data"] = [];

    const autoMetaExists = application["meta-data"].some(
      (m) =>
        m.$["android:name"] === "com.google.android.gms.car.application"
    );

    if (!autoMetaExists) {
      application["meta-data"].push({
        $: {
          "android:name": "com.google.android.gms.car.application",
          "android:resource": "@xml/automotive_app_desc",
        },
      });
    }

    // Add minCarAppApiLevel metadata
    const apiLevelMetaExists = application["meta-data"].some(
      (m) =>
        m.$["android:name"] === "androidx.car.app.minCarAppApiLevel"
    );

    if (!apiLevelMetaExists) {
      application["meta-data"].push({
        $: {
          "android:name": "androidx.car.app.minCarAppApiLevel",
          "android:value": "1",
        },
      });
    }

    return config;
  });
}

function withAndroidAutoBuildGradle(config) {
  return withAppBuildGradle(config, async (config) => {
    const gradle = config.modResults.contents;

    if (!gradle.includes("androidx.car.app:app")) {
      config.modResults.contents = gradle.replace(
        /dependencies\s*\{/,
        'dependencies {\n    implementation "androidx.car.app:app:1.7.0"'
      );
    }

    return config;
  });
}

function withAndroidAutoSourceFiles(config) {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const androidRoot = path.join(projectRoot, "android");
      const packagePath = "io/stavros/tungstenrn/androidauto";
      const srcDir = path.join(
        androidRoot,
        "app/src/main/java",
        packagePath
      );
      const xmlDir = path.join(
        androidRoot,
        "app/src/main/res/xml"
      );
      const pluginSrcDir = path.join(
        projectRoot,
        "plugins/android-auto"
      );

      // Create directories
      fs.mkdirSync(srcDir, { recursive: true });
      fs.mkdirSync(xmlDir, { recursive: true });

      // Copy Kotlin source files
      for (const file of KOTLIN_FILES) {
        fs.copyFileSync(
          path.join(pluginSrcDir, file),
          path.join(srcDir, file)
        );
      }

      // Copy XML resource
      fs.copyFileSync(
        path.join(pluginSrcDir, "automotive_app_desc.xml"),
        path.join(xmlDir, "automotive_app_desc.xml")
      );

      return config;
    },
  ]);
}

function withAndroidAuto(config) {
  config = withAndroidAutoManifest(config);
  config = withAndroidAutoBuildGradle(config);
  config = withAndroidAutoSourceFiles(config);
  return config;
}

module.exports = createRunOncePlugin(
  withAndroidAuto,
  "withAndroidAuto",
  "1.0.0"
);
