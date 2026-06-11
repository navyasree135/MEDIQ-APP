const { withAppBuildGradle } = require('@expo/config-plugins');

module.exports = function withAndroidXFix(config) {
  return withAppBuildGradle(config, (config) => {
    const buildGradle = config.modResults.contents;
    
    // Add the exclude rules to the bottom of the app/build.gradle
    const injectBlock = `
// Added to fix Duplicate class android.support.v4 vs androidx
configurations.all {
    exclude group: 'com.android.support', module: 'support-compat'
    exclude group: 'com.android.support', module: 'support-core-utils'
    exclude group: 'com.android.support', module: 'support-core-ui'
    exclude group: 'com.android.support', module: 'support-media-compat'
    exclude group: 'com.android.support', module: 'support-fragment'
    exclude group: 'com.android.support', module: 'support-v4'
}
`;

    if (!buildGradle.includes("exclude group: 'com.android.support'")) {
      config.modResults.contents = buildGradle + "\n" + injectBlock;
    }
    
    return config;
  });
};
