// https://jestjs.io/docs/en/configuration.html
module.exports = {
    projects: [
      {
        displayName: "node",
        testEnvironment: "jest-environment-node-single-context",
        testMatch: [
          "<rootDir>/lib/test/**/*.test.js"
        ]
      },
      {
        displayName: "electron",
        runner: "@kayahr/jest-electron-runner",
        testEnvironment: "@kayahr/jest-electron-runner/environment",
        testMatch: [
          "<rootDir>/lib/test/**/*.test.js"
        ],
        testEnvironmentOptions: {
          electron: {
            options: [
              "js-flags=--expose-gc"
             ],
             disableHardwareAcceleration: true
          }
        }
      }
    ],
    collectCoverageFrom: [
        "<rootDir>/lib/main/**/*.js",
        "!<rootDir>/lib/main/index.js"
    ],
    collectCoverage: false,
    coverageReporters: [
        "clover",
        "json",
        "lcov",
        "text",
        "cobertura"
    ],
    coverageDirectory: "lib/test/coverage",
    reporters: [
        "default",
        [ "jest-junit", { outputDirectory: "lib/test" } ]
    ],
    testTimeout: 15000
};
