# vitest-matchers

[GitHub] | [NPM]

Some additional [Vitest] matchers I usually use in my projects. Also registers the matchers from [jest-extended].


## Usage

* Install dependency:

    ```
    npm install -DE @kayahr/vitest-matchers
    ```

* Import it in your Vitest test file:

    ```typescript
    @import "@kayahr/vitest-matchers";
    ```


## Matchers

### toEqualCloseTo(value, numDigits?)

Recursive version of [toBeCloseTo()] so you can compare arrays or objects with numeric values with a
specific precision. **numDigits** defaults to 2 if not specified.

```typescript
expect(values).toEqualCloseTo([ 10.3132, 40.1224, 50.1311 ], 4);
```

### toBeEquatable(equalValues, unequalValues)

Checks if the tested object has an `equals` method which correctly implements an equivalence relation on non-null object references (See Java's [object.equals()] method for details).

```typescript
expect(new Color(0, 0, 0)).toBeEquatable(
    [ new Color(0, 0, 0), new Color("black") ],
    [ new Color(1, 0, 0), new Color(0, 1, 0), new Color(0, 0, 1), new Color("white") ]
);
```

### toBeGarbageCollected(destructor, timeout)

Checks if the test object (which must be passed via a `WeakRef`) is correctly garbage collected. For this you have to specify a destructor function which
removes all references to the test object. You can also optionally specify a timeout which defaults to 5000 milliseconds. When the object was not garbage
collected in this time then the test fails.

```typescript
let testSubject: Record<string, unknown> | undefined = { a: 34 };
await expect(new WeakRef(testSubject)).toBeGarbageCollected(() => { testSubject = undefined; });
```

Utilities
---------

### isNodeJS / isBrowser

Checks if test is executed in Node.js or Browser.

```typescript
import { isNodeJS, isBrowser } from "@kayahr/vitest-matchers";

it("test", () => {
    if (isNodeJS()) {
        // Test runs in NodeJS
    } else if (isBrowser()) {
        // Test runs in browser
    }
});
```

### isLinux / isWindows / isMacOS

Checks if test is executed on given platform. in Node.js this is checked by looking at `process.platform`. In Browser it is checked by looking at `navigator.userAgent`.

```typescript
import { isLinux, isWindows, isMacOS } from "@kayahr/vitest-matchers";

it("test", () => {
    if (isLinux()) {
        // Test runs on Linux
    } else if (isWindows()) {
        // Test runs on Windows
    } else if (isMacOS()) {
        // Test runs on macOS
    }
});
```

### resolveURI

This function takes a path relative to the project root and returns a URI which can be used to load a file with `fetch` in a browser. For Node.js this function returns the path unchanged because the project root is the working directory so the path already works fine.

```typescript
import { resolveURI } from "@kayahr/vitest-matchers";

const resolvedURI = resolveURI("src/test/data/test.txt");
```

### resolvePath

This function takes a path relative to the project root and returns the absolute path.

```typescript
import { resolvePath } from "@kayahr/vitest-matchers";

const absolutePath = resolvePath("src/test/data/test.txt");
```

### readFile

This function reads a file from the project. It cannot read files outside the project. Path must be relative to project root.

```typescript
import { readFile } from "@kayahr/vitest-matchers";

const content = await readFile("src/test/data/test.txt");
```

By default the file is read in UTF-8 encoding. You can specify a custom buffer encoding like this:

```typescript
const content = await readFile("src/test/data/test.txt", "latin1");
```

The function can also read binaries via base64 encoding (use a base64 decoder of your choice):

```typescript
const data = decodeBase64(await readFile("src/test/data/test.txt", "base64"));
```

### writeFile

This function writes data to a file inside the project. It cannot write files outside the project. Path must be relative to project root. The path to the output file is recursively created if not already present.

```typescript
import { writeFile } from "@kayahr/vitest-matchers";

await writeFile("lib/.test-files/output.txt", "Content");
```

By default the file is written in UTF-8 encoding. You can specify a custom buffer encoding like this:

```typescript
await writeFile("lib/.test-files/output.txt", "Content", "latin1");
```

The function can also write binary data via base64 encoding (use a base64 encoder of your choice):

```typescript
await writeFile("lib/.test-files/output.bin", encodeBase64(data), "base64");
```

### removeFile

This function removes a file inside the project. It cannot remove files outside the project.

```typescript
import { removeFile } from "@kayahr/vitest-matchers";

await removeFile("lib/.test-files/output.txt");
```

[Vitest]: https://vitest.dev/
[toBeCloseTo()]: https://vitest.dev/api/expect#tobecloseto
[object.equals()]: https://docs.oracle.com/en/java/javase/14/docs/api/java.base/java/lang/Object.html#equals(java.lang.Object)
[GitHub]: https://github.com/kayahr/vitest-matchers
[NPM]: https://www.npmjs.com/package/@kayahr/vitest-matchers
