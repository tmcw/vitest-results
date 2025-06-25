import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		include: ["src/test/**/*.test.ts"],
		reporters: [
			"default",
			[
				"junit",
				{
					outputFile: "lib/test/junit.xml",
					suiteName: "vitest-matchers tests",
				},
			],
		],
		env: {
			NODE_OPTIONS: `${process.env.NODE_OPTIONS ?? ""} --expose-gc`,
		},
		coverage: {
			enabled: true,
			reporter: ["text-summary", "json", "lcov", "clover", "cobertura", "html"],
			reportsDirectory: "lib/test/coverage",
			include: ["src/main/**/*.ts"],
		},
		projects: [
			{
				extends: true,
				test: {
					name: "Node",
				},
			},
		],
	},
});
