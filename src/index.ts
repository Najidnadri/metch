enum DefaultBranch {
    Default
}

type BranchCallbackBuilder<T, U> = ((item: T) => U) | ((item: T) => Promise<U>);

type MatchBranchBuilder<T, U> = [
    BranchJudge<T> | T | DefaultBranch.Default,
    BranchCallbackBuilder<T, U>
]

type BranchJudge<T> = (item: T) => boolean;

/**
 * An array of 2 items.
 * 
 * index `0`: The comparisor
 * 
 * index `1`: A function that will be executed if comparisor returns `true`.
 */
type MatchBranch<T, U> = MatchBranchBuilder<T, U>

/**
 * An array of `MatchBranch`
 */
type MatchBranches<T> = MatchBranch<T, void>[]

/**
 * Will iterate each branches, evaluate the `item` using the first index field
 * inside the branch and execute the closure inside the branch.
 * 
 * If one the branches match, it will execute the closure field inside the branch and breaks.
 * 
 * Ordering does matter, first one that matches will be the one that will be executed. Others
 * will be ignored.
 * 
 * ### Example
 * ```
 * import {metch, DefaultBranch} from 'metch';
 * import fs from "fs/promises"
 * 
 *  let filePath: string | undefined = 'notValid.txt';
 *
 *  await metch(filePath, [
 *      [undefined, async (file) => {
 *          console.log(await fs.readFile("undefined.txt", "utf-8"));
 *      }], 
 *      ['animal.txt', async (file) => {
 *          console.log(await fs.readFile(file!, "utf-8"))
 *      }], 
 *      [path => path!.includes('.txt'), async (file) => {
 *          console.log(await fs.readFile('data.txt', "utf-8"));
 *      }], 
 *      [DefaultBranch.Default, async (item) => {
 *          // Default branch must be placed at the last index
 *          console.log(await fs.readFile('default.txt', 'utf-8'))
 *      }]  
 *  ])
 * ```
 * @param item 
 * @param branches 
 * @returns 
 */
function metch<T>(item: T, branches: MatchBranches<T>) {
    for (const branch of branches) {
        if (
            (isFunction(branch[0]) && branch[0](item)) ||
            item === branch[0] ||
            branch[0] === DefaultBranch.Default
        ) {
            return branch[1](item);
        } 
    }
}



type MatchReturnBranches<T, U> = MatchReturnBranch<T, U>[];
type MatchReturnBranch<T, U> = [
    BranchJudge<T> | T,
    BranchCallbackBuilder<T, U>
]
type MatchReturnDefaultbranch<T, U> = BranchCallbackBuilder<T, U>;

/**
 * Will **iterate** each branches, **evaluate** the `item` using the first index field
 * inside the branch, **execute** the closure inside the branch and **returns** a value.
 * 
 * If one the branches match, it will execute the closure field inside the branch and breaks.
 * 
 * Ordering does matter, first one that matches will be the one that will be executed. Others
 * will be ignored.
 * 
 * ### Example
 * ```
 *  import {metchReturn} from 'metch';
 *  import fs from "fs/promises"
 * 
 *  let filePath: string | undefined = 'animal.txt';
 *
 *  const fileData = await metchReturn(filePath, [
 *      [undefined, async (file) => {
 *          return await fs.readFile("undefined.txt", "utf-8");
 *      }], 
 *      ['animal.txt', async (file) => {
 *          return await fs.readFile(file!, "utf-8");
 *      }], 
 *      [path => path!.includes('.txt'), async (file) => {
 *          return await fs.readFile('data.txt', "utf-8");
 *      }], 
 *      //[DefaultBranch.Default, (item) => {
 *          // Default branch will not be working here.
 *          // To set a default branch, 
 *          // Pass it to the defaultBranch Parameter
 *      //}]
 *
 *  ], async (file) => {
 *      // Default Branch
 *      return await fs.readFile('default.txt', 'utf-8')
 *  })
 *
 *  console.log(fileData);
 * ```
 * 
 * @param item 
 * @param branches 
 * @param defaultBranch 
 * @returns 
 */
function metchReturn<T, U>(item: T, branches: MatchReturnBranches<T, U>, defaultBranch: MatchReturnDefaultbranch<T, U>): U | Promise<U> {
    for (const branch of branches) {
        if (
            (isFunction(branch[0]) && branch[0](item)) ||
            item === branch[0] ||
            branch[0] === DefaultBranch.Default
        ) {
            return branch[1](item);
        } 
    }

    return defaultBranch(item)
}

export {
    DefaultBranch,
    metch,
    metchReturn,
}

/*
UTILS
*/
function isFunction<T>(branch: BranchJudge<T> | T | DefaultBranch.Default): branch is BranchJudge<T> {
    return typeof branch === 'function'
}