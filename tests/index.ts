import { metch, MetchBranches, metchReturn, MetchReturnBranches } from '../src/index';

async function readFile(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      setTimeout(() => {
        switch (path) {
          case "animal.txt":
            resolve('Animal file content');
            break;
          case "default.txt":
            resolve('Default file content');
          default:
            resolve('Unknown file');
        }
      }, 500)
    } catch (err) {
      reject(err);
    }
  })
}

/**
 * METCH TEST SUITES
 */
describe('metch', () => {
  test('should execute the correct branch (async)', async () => {
    let filePath: string | undefined = 'animal.txt';

    await metch(filePath, [
      [undefined, async (file) => {
        return null
      }],
      ['animal.txt', async (file) => {
        const content = await readFile(file!);
        expect(content).toBe('Animal file content');
      }],
      [path => path!.includes('.txt'), async (file) => {
        return null
      }]
    ], async (item) => {
        return null
    });
  });

  test('should execute the correct branch (sync)', () => {
    let filePath: string | undefined = 'data.txt';

    metch(filePath, [
      [undefined, (file) => {
        return null
      }],
      ['animal.txt', (file) => {
        return null
      }],
      [path => path!.includes('.txt'), (file) => {
        expect(file).toBe('data.txt');
      }],
    ], async (item) => {
        return null
    });
  });

  test('should execute the default branch', async () => {
    let filePath: string | undefined = 'invalid';

    await metch(filePath, [
      [undefined, async (file) => {
        return null
      }],
      ['animal.txt', async (file) => {
        return null
      }],
      [path => path!.includes('.txt'), async (file) => {
        return null
      }],
    ], async (item) => {
        const content = await readFile('default.txt');
        expect(content).toBe('Default file content');
    });
  });

  test('should execute the correct branch (async)', async () => {
    const branches: MetchBranches<string> = [];

    // Generate 1000 branches
    for (let i = 0; i < 1000; i++) {
      const filePath = `file_${i}.txt`;

      branches.push([
        filePath,
        async (file: string) => {
          expect(file).toBe(filePath);
        }
      ]);
    }

    await metch('file_999.txt', branches);
  });

  test('should execute the correct branch (async)', async () => {
    const branches: MetchBranches<any> = [
      [undefined, async (item) => {
        return null
      }],
      [null, async (item) => {
        expect(item).toBeNull();
      }],
      [1, (item) => {
        expect(item).toBe(0);
      }],
      ['animal', (item) => {
        expect(item).toBe('animal');
      }],
      [(path: any) => typeof path === 'string' && path.startsWith('prefix_'), async (item) => {
        expect(item).toMatch(/^prefix_/);
      }]
    ];

    await metch('animal', branches, (item) => {
        return null
    });
  });

  test('should execute the default branch when no Metch is found', async () => {
    const branches: MetchBranches<any> = [
      [undefined, async (item) => {
        return null
      }],
      [null, async (item) => {
        return null
      }],
      [0, async (item) => {
        return null
      }],
      ['animal', async (item) => {
        return null
      }],
      [(path: any) => typeof path === 'string' && path.startsWith('prefix_'), async (item) => {
        return null
      }]
    ];

    await metch(123, branches, async (item) => {
        expect(item).toBe(123);
    });
  });
});




















/**
 * METCH RETURN TEST SUITES
 */
describe('metchReturn', () => {
  test('should execute the correct branch (async)', async () => {
    let filePath: string | undefined = 'animal.txt';

    const fileData = await metchReturn<string | undefined, string | null>(filePath, [
      [undefined, async (file) => {
        return null
      }],
      ['animal.txt', async (file) => {
        return await readFile(file!);
      }],
      [path => path!.includes('.txt'), async (file) => {
        return null
      }]
    ], async (item) => {
        return null
    });

    expect(fileData).toBe('Animal file content');
  });

  test('should execute the correct branch (sync)', () => {
    let filePath: string | undefined = 'data.txt';

    metchReturn(filePath, [
      [undefined, (file) => {
        return null
      }],
      ['animal.txt', (file) => {
        return null
      }],
      [path => path!.includes('.txt'), (file) => {
        expect(file).toBe('data.txt');
      }],
    ], async (item) => {
        return null
    });
  });

  test('should execute the default branch', async () => {
    let filePath: string | undefined = 'invalid';

    const fileData: string | null = await metchReturn<string | undefined, string | null>(filePath, [
      [undefined, async (file) => {
        return null
      }],
      ['animal.txt', async (file) => {
        return await readFile('default.txt');
      }],
      [path => path!.includes('.txt'), async (file) => {
        return null
      }],
    ], async (item) => {
        const content = await readFile('default.txt');
        return content
    });

    expect(fileData).toBe('Default file content')
  });

  test('should execute the correct branch (async)', async () => {
    const branches: MetchReturnBranches<string, string> = [];

    // Generate 1000 branches
    for (let i = 0; i < 1000; i++) {
      const filePath = `file_${i}.txt`;

      branches.push([
        filePath,
        async (file: string) => {
          return filePath
        }
      ]);
    }

    const defaultBranch = async (item: string) => {
      return null
    };

    const fileData = await metchReturn('file_999.txt', branches, defaultBranch);
    expect(fileData).toBe('file_999.txt')
  });

  test('should execute the correct branch (async)', async () => {
    let filePath: string | undefined = 'animal.txt';

    const branches: MetchReturnBranches<string | undefined, string | null> = [
      [undefined, async (file) => {
        return null
      }],
      ['animal.txt', async (file) => {
        const content = await readFile(file!);
        return content;
      }],
      [path => path!.includes('.txt'), async (file) => {
        return null
      }]
    ];

    const defaultBranch = async (item: string | undefined) => {
      return null
    };

    const fileData = await metchReturn(filePath, branches, defaultBranch);

    expect(fileData).toBe('Animal file content');
  });

  test('should execute the default branch when no Metch is found', async () => {
    let filePath: string | undefined = 'invalid';

    const branches: MetchReturnBranches<string | undefined, string | null> = [
      [undefined, async (file) => {
        return null
      }],
      ['animal.txt', async (file) => {
        return null
      }],
      [path => path!.includes('.txt'), async (file) => {
        return null
      }]
    ];

    const defaultBranch = async (item: string | undefined) => {
      return await readFile('default.txt');
    };

    const fileData = await metchReturn(filePath, branches, defaultBranch);

    expect(fileData).toBe('Default file content');
  });
});