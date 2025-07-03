_Work-in-progress repo, right now this is just a fork of vitest-matchers, which
it is using for all of the good patterns that kayahr put in place_.

# vitest-results

[GitHub] | [NPM]


Vitest extension to make it easier to test [neverthrow](https://github.com/supermacro/neverthrow)
Result and ResultAsync types. Other Result types soon, possibly.


## Usage

* Install dependency:

    ```
    npm install -DE @tmcw/vitest-results
    ```

* Import it in your Vitest test file:

    ```typescript
    @import "@tmcw/vitest-results";
    ```


## Methods

Here's an example of what this provides: you can call `.okv` to confirm
that an expected value is an Ok and unwrap its inner value, and then use
any of vitest's matchers on the inner value. Same for `.errv`.

```ts
describe("ok", () => {
	it("supports unwrapping values", () => {
		expect(ok(1)).okv.toEqual(1);
		expect(err(1)).errv.toEqual(1);
	});
});
```

[Vitest]: https://vitest.dev/
[GitHub]: https://github.com/tmcw/vitest-results
[NPM]: https://www.npmjs.com/package/@tmcw/vitest-results
