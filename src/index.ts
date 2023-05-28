type BranchCallbackBuilder<T, U> = ((item: T) => U) | ((item: T) => Promise<U>);

/**
 * A judge to a branch.
 *
 * It can be a :-
 * * `Function` that receive `item` as argument an returns `boolean`.
 * * A value of the same type as `item`.
 * * A `boolean`.
 */
export type BranchJudge<T> = ((item: T) => boolean | undefined) | T | boolean | Query<T>;

/**
 * A function that will be executed if a branch's `judge` allow it.
 *
 * Can be `sync` and `async`
 */
export type MetchBranchCallback<T> = BranchCallbackBuilder<T, void>;

/**
 * An array of 2 items.
 *
 * * `0` : `BranchJudge<T>`. A judge can be either :-
 *      * `Function` that receive item as argument an returns `boolean`.
 *      * `value` of the same type as `item`.
 *      * `boolean`.
 * * `1` : `MetchBranchCallback<T>`. Function that will be executed if judge allow it
 */
export type MetchBranch<T> = [BranchJudge<T>, MetchBranchCallback<T>]

/**
 * An array of `MatchBranch`
 */
export type MetchBranches<T> = MetchBranch<T>[]

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
 * import {metch, DefaultBranch} from 'metch-case';
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
 *      }]
 *  ], async (item) => {
 *    // Optional Default branch
 *    console.log(await fs.readFile('default.txt', 'utf-8'))
 * })
 * ```
 * @param item Item to be evaluated
 * @param branches An array of `MetchBranch`.
 * @param defaultBranch Optional. Will be executed if all other branches are not match.
 * @returns
 */
export function metch<T>(item: T, branches: MetchBranches<T>, defaultBranch?: MetchBranchCallback<T>) {
    for (const branch of branches) {
        if (evalJudge(item, branch[0])) {
            return branch[1](item);
        }
    }

    if (defaultBranch) {
        defaultBranch(item);
    }
}

/**
 * A closure that takes `T` as argument and returns `U`. can be `sync` or `async`
 * ```
 * <T, U>(item: T) => U
 * ```
 */
export type MetchReturnBranchCallback<T, U> = BranchCallbackBuilder<T, U>;

/**
 * An array of 2 items.
 *
 * * `0` : `BranchJudge<T>`. A judge can be either :-
 *      * `Function` that receive item as argument an returns `boolean`.
 *      * `value` of the same type as `item`.
 *      * `boolean`.
 * * `1` : `MetchReturnBranchCallback<T, U>`. Function that will be executed if judge allow it
 */
export type MetchReturnBranch<T, U> = [
    BranchJudge<T>,
    MetchReturnBranchCallback<T, U>
];

/**
 * An array of `MetchReturnBranches`
 */
export type MetchReturnBranches<T, U> = MetchReturnBranch<T, U>[];

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
 *  import {metchReturn} from 'metch-case';
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
 *      }]
 *  ], async (file) => {
 *      // Compulsary Default Branch
 *      return await fs.readFile('default.txt', 'utf-8')
 *  })
 *
 *  console.log(fileData);
 * ```
 *
 * @param item Item to be evaluated
 * @param branches An array of `MetchReturnBranch`.
 * @param defaultBranch Will be executed if all other branches are not match.
 * @returns
 */
export function metchReturn<T, U>(item: T, branches: MetchReturnBranches<T, U>, defaultBranch: MetchReturnBranchCallback<T, U>): U | Promise<U> {
    for (const branch of branches) {
        if (evalJudge(item, branch[0])) {
            return branch[1](item);
        }
    }

    return defaultBranch(item);
}

/*
 QUERY
*/
interface AndQuery<T> {
    type: 'AND',
    judges: BranchJudge<T>[]
}

interface OrQuery<T> {
    type: 'OR',
    judges: BranchJudge<T>[]
}

/**
 * Act as `AND` / `OR` operator for a branch's judge.
 *
 * ## Example
 * ```
 * const branches: MetchBranches<any> = [
 *      [Query.Or<any>(undefined, null, 1, (path: any) => typeof path !== 'string'), () => {
 *          console.log('value is not a valid string')
 *      }],
 *      [Query.And((path: any) => typeof path === 'string', 'animal'), (item) => {
 *          console.log('value is a string and animal')
 *      }],
 * ];
 *
 * await metch('animal' as any, branches, (item) => {
 *      console.log('default branch')
 * });
 * ```
 *
 * ## Note
 * It is recommended to pass the `item`'s data type when using the `Query`.
 * ```
 * let item: string | undefined = 'hello world';
 * Query.And<string | undefined>(...);
 * Query.Or<string | null>(...);
 * ```
 */
export class Query<T> {
    private query: AndQuery<T> | OrQuery<T>;

    private constructor(type: 'OR' | 'AND', ...judges: BranchJudge<T>[]) {
        this.query = {
            type: type,
            judges: judges
        };
    }

    /**
     * ## Example
     * ```
     * let filePath: string | undefined = returnStringUndefined(undefined);
     * await metch(filePath, [
     *      [Query.Or<string | undefined>('animal.log', 'animal.txt', path => path?.includes('.txt')), async (file) => {
     *          console.log('value is either "animal.log", "animal.txt" or includes ".txt"');
     *      }],
     * ], async (item) => {
     *      throw new Error('file not found');
     * });
     * ```
     * @param judges `...BranchJudge<T>`
     * @returns
     */
    static Or<T>(...judges: BranchJudge<T>[]): Query<T> {
        return new Query('OR', ...judges);
    }

    /**
     * ## Example
     * ```
     * let filePath: string | undefined = returnStringUndefined('animal.txt');
     * await metch(filePath, [
     *      [Query.And<string | undefined>('animal.txt', path => path?.includes('.txt')), async (file) => {
     *          console.log('value is "animal.txt" and includes ".txt"');
     *      }],
     * ], async (item) => {
     *      throw new Error('file not found');
     * });
     * ```
     * @param judges
     * @returns
     */
    static And<T>(...judges: BranchJudge<T>[]): Query<T> {
        return new Query('AND', ...judges);
    }

    /**
     * Evaluate the `item` given with this `Query`
     * @param item - to be evaluated
     * @returns
     */
    evaluate(item: T): boolean {
        if (Query.isAnd(this.query)) {
            return Query.evaluateAnd(item, this.query);
        } else {
            return Query.evaluateOr(item, this.query);
        }
    }

    private static evaluateAnd<T>(item: T, query: AndQuery<T>): boolean {
        for (const judge of query.judges) {
            if (evalJudge(item, judge) === false) {
                return false;
            }
        }
        return true;
    }

    private static evaluateOr<T>(item: T, query: OrQuery<T>): boolean {
        for (const judge of query.judges) {
            if (evalJudge(item, judge) === true) {
                return true;
            }
        }
        return false;
    }

    private static isAnd<T>(query: AndQuery<T> | OrQuery<T>): query is AndQuery<T> {
        return query.type === 'AND';
    }
}

/*
UTILS
*/
function evalJudge<T>(item: T, judge: BranchJudge<T>): boolean {
    return (
        (judgeIsFunction(judge) && judge(item)) ||
        item === judge ||
        (judgeIsBoolean(judge) && judge === true) ||
        (judgeIsQuery(judge) && judge.evaluate(item))
    );
}

function judgeIsFunction<T>(judge: ((item: T) => boolean | undefined) | T | boolean | Query<T>): judge is ((item: T) => boolean) {
    return typeof judge === 'function';
}

function judgeIsBoolean<T>(judge: ((item: T) => boolean | undefined) | T | boolean | Query<T>): judge is boolean {
    return typeof judge === 'boolean';
}

function judgeIsQuery<T>(judge: ((item: T) => boolean | undefined) | T | boolean | Query<T>): judge is Query<T> {
    return judge instanceof Query;
}
