<h1 align="center">metch-case</h1>

<p align="center">
Metch is a TypeScript package that provides utility functions for branching and conditional execution based on patterns. It allows you to define multiple branches, evaluate an item against these branches, and execute the corresponding callbacks based on the matching branch.
</p>

<p align="center">
  <a href="https://github.com/najidnadri/metch-case/blob/master/LICENSE">
    <img
      alt="MIT license"
      src="https://img.shields.io/npm/l/metch-case?style=plastic"
    /></a>
  <a href="https://www.npmjs.com/package/metch-case">
    <img
      alt="Downloads per week"
      src="https://img.shields.io/npm/dw/metch-case?style=plastic"
    /></a>
  <a href="https://bundlephobia.com/result?p=metch-case">
    <img
      alt="npm bundle size"
      src="https://img.shields.io/bundlephobia/minzip/metch-case?style=plastic"
    /></a>
  <a href="https://www.npmjs.com/package/metch-case">
    <img
      alt="Version"
      src="https://img.shields.io/npm/v/metch-case?style=plastic"
    /></a>
</p>

# Installation
You can install Metch using npm or yarn:
```bash
npm install metch
```
or
```bash
yarn add metch
```

# Usage
To use Metch in your TypeScript project, import the desired functions from the package:
```typescript
import { metch, metchReturn, DefaultBranch } from 'metch-case';
```

## `metch()`
The `metch` function evaluates an item against a set of branches and executes the callback associated with the first matching branch. It follows a specific order of evaluation where the first matching branch is executed, and subsequent branches are ignored.

### Syntax
```typescript
metch<T>(item: T, branches: MatchBranches<T>): void | Promise<void>
```
* `item`: The item to be evaluated against the branches.
* `branches`: An array of `MatchBranch` objects. Each `MatchBranch` consists of a branch judge or value, and a callback function to be executed if the judge or value matches the item.

### Example
```typescript
import { metch, DefaultBranch } from 'metch-case';
import fs from "fs/promises"

let filePath: string | undefined = 'notValid.txt';

await metch(filePath, [
    [undefined, async (file) => {
        console.log(await fs.readFile("undefined.txt", "utf-8"));
    }], 
    ['animal.txt', async (file) => {
        console.log(await fs.readFile(file!, "utf-8"))
    }], 
    [path => path!.includes('.txt'), async (file) => {
        console.log(await fs.readFile('data.txt', "utf-8"));
    }], 
    [DefaultBranch.Default, async (item) => {
        // Default branch must be placed at the last index
        console.log(await fs.readFile('default.txt', 'utf-8'))
    }]  
]);
```

## `metchReturn()`
The `metchReturn` function evaluates an item against a set of branches, executes the callback associated with the first matching branch, and returns a value. It follows the same evaluation order as `metch`, where the first matching branch is executed and subsequent branches are ignored.

If none of the branches match, the defaultBranch callback is executed.  

### Syntax
```typescript
metchReturn<T, U>(item: T, branches: MatchReturnBranches<T, U>, defaultBranch: MatchReturnDefaultbranch<T, U>): U | Promise<U>
```
* `item`: The item to be evaluated against the branches.
* `branches`: An array of `MatchReturnBranch` objects. Each `MatchReturnBranch` consists of a branch judge or value, and a callback function to be executed if the judge or value matches the item.
* `defaultBranch`: The callback function to be executed if none of the branches match.

### Example
```typescript
import { metchReturn } from 'metch-case';
import fs from "fs/promises"

let filePath: string | undefined = 'animal.txt';

const fileData = await metchReturn(filePath, [
    [undefined, async (file) => {
        return await fs.readFile("undefined.txt", "utf-8");
    }], 
    ['animal.txt', async (file) => {
        return await fs.readFile(file!, "utf-8");
    }], 
    [path => path!.includes('.txt'), async (file) => {
        return await fs.readFile('data.txt', "utf-8");
    }],
], async (file) => {
    // Default Branch
    return await fs.readFile('default.txt', 'utf-8')
});

console.log(fileData);
```