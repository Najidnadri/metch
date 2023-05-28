import { metch, MetchBranches, metchReturn, MetchReturnBranches, Query } from '../src/index';

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

function returnStringUndefined(item: string | undefined): string | undefined {
  return item
}

/**
 * METCH TEST SUITES
 */
describe('metch', () => {
  test('should execute the correct branch (async)', async () => {
    let filePath: string | undefined = 'animal.txt';

    await metch(filePath, [
      [undefined, async (file) => {
        expect(true).toBe(false);
      }],
      ['animal.txt', async (file) => {
        const content = await readFile(file!);
        expect(content).toBe('Animal file content');
      }],
      [path => path!.includes('.txt'), async (file) => {
        expect(true).toBe(false);
      }]
    ], async (item) => {
      expect(true).toBe(false);
    });
  });

  test('should execute the correct branch (sync)', () => {
    let filePath: string | undefined = 'data.txt';

    metch(filePath, [
      [undefined, (file) => {
        expect(true).toBe(false);
      }],
      ['animal.txt', (file) => {
        expect(true).toBe(false);
      }],
      [path => path!.includes('.txt'), (file) => {
        expect(file).toBe('data.txt');
      }],
    ], async (item) => {
      expect(true).toBe(false);
    });
  });

  test('should execute the default branch', async () => {
    let filePath: string | undefined = 'invalid';

    await metch(filePath, [
      [undefined, async (file) => {
        expect(true).toBe(false);
      }],
      ['animal.txt', async (file) => {
        expect(true).toBe(false);
      }],
      [path => path!.includes('.txt'), async (file) => {
        expect(true).toBe(false);
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
        expect(true).toBe(false);
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
      expect(true).toBe(false);
    });
  });

  test('should execute the default branch when no Metch is found', async () => {
    const branches: MetchBranches<any> = [
      [undefined, async (item) => {
        expect(true).toBe(false);
      }],
      [null, async (item) => {
        expect(true).toBe(false);
      }],
      [0, async (item) => {
        expect(true).toBe(false);
      }],
      ['animal', async (item) => {
        expect(true).toBe(false);
      }],
      [(path: any) => typeof path === 'string' && path.startsWith('prefix_'), async (item) => {
        expect(true).toBe(false);
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




/*
 QUERIES TEST
*/
describe('queries', () => {


  test('Simple query should success', () => {
    const name = 'Jackie Chan'
    const query = Query.And<string>(name => name.startsWith('J'), name => name.endsWith('n'));
    expect(query.evaluate(name)).toBe(true);
  })

  test('Simple query should fail', () => {
    const name = 'Jackie Chan'
    const query = Query.And<string>(name => name.startsWith('N'), name => name.endsWith('any'));
    expect(query.evaluate(name)).toBe(false);
  })

  test('Simple nested query should success', () => {
    const name = 'Jackie Chan'
    const query = Query.And<string>(name => name.startsWith('J'), 'Jackie Chan', Query.Or<string>(name => name.endsWith('n'), false));
    expect(query.evaluate(name)).toBe(true);
  })

  test('Simple nested query should failed', () => {
    const name = 'Jackie Chan'
    const query = Query.And<string>(name => name.startsWith('N'), 'Jackie Chan', Query.Or<string>(name => name.endsWith('ndad'), false));
    expect(query.evaluate(name)).toBe(false);
  })

  test('Complex nested query should success', () => {
    const name = 'Jackie Chan'
    const query = Query.And<string>(
      name => name.startsWith('J'), 
      'Jackie Chan', 
      Query.Or<string>(
        name => name.endsWith('n'), 
        false,
        Query.And<string>(
          name => typeof name === 'string',
          name => name.startsWith('Jackie'),
          Query.Or<string>(
            name => name.endsWith('Chan'),
            name => name.endsWith('Ng')
          )
        )
      )
    );
    expect(query.evaluate(name)).toBe(true);
  })


  test('Complex nested query should failed', () => {
    const name = 'Jackie Chan'
    const query = Query.And<string>(
      name => name.startsWith('J'), 
      'Jackie Chan', 
      Query.Or<string>(
        name => name.endsWith('a'), 
        false,
        Query.And<string>(
          name => typeof name === 'string',
          name => name.startsWith('Jackie'),
          Query.Or<string>(
            name => name.endsWith('Nick'),
            name => name.endsWith('Ng')
          )
        )
      )
    );
    expect(query.evaluate(name)).toBe(false);
  })

})





/*
 QUERIES WITH METCH TEST
*/
describe('queries with metch', () => {


  test('Simple query should success', () => {
    const name = 'Jackie Chan'
    const query = Query.And<string>(name => name.startsWith('J'), name => name.endsWith('n'));
    expect(query.evaluate(name)).toBe(true);
  })

  test('Simple query should fail', () => {
    const name = 'Jackie Chan'
    const query = Query.And<string>(name => name.startsWith('N'), name => name.endsWith('any'));
    expect(query.evaluate(name)).toBe(false);
  })

  test('Simple nested query should success', () => {
    const name = 'Jackie Chan'
    const query = Query.And<string>(name => name.startsWith('J'), 'Jackie Chan', Query.Or<string>(name => name.endsWith('n'), false));
    expect(query.evaluate(name)).toBe(true);
  })

  test('Simple nested query should failed', () => {
    const name = 'Jackie Chan'
    const query = Query.And<string>(name => name.startsWith('N'), 'Jackie Chan', Query.Or<string>(name => name.endsWith('ndad'), false));
    expect(query.evaluate(name)).toBe(false);
  })

  test('Complex nested query should success', () => {
    const name = 'Jackie Chan'
    const query = Query.And<string>(
      name => name.startsWith('J'), 
      'Jackie Chan', 
      Query.Or<string>(
        name => name.endsWith('n'), 
        false,
        Query.And<string>(
          name => typeof name === 'string',
          name => name.startsWith('Jackie'),
          Query.Or<string>(
            name => name.endsWith('Chan'),
            name => name.endsWith('Ng')
          )
        )
      )
    );
    expect(query.evaluate(name)).toBe(true);
  })


  test('Complex nested query should failed', () => {
    const name = 'Jackie Chan'
    const query = Query.And<string>(
      name => name.startsWith('J'), 
      'Jackie Chan', 
      Query.Or<string>(
        name => name.endsWith('a'), 
        false,
        Query.And<string>(
          name => typeof name === 'string',
          name => name.startsWith('Jackie'),
          Query.Or<string>(
            name => name.endsWith('Nick'),
            name => name.endsWith('Ng')
          )
        )
      )
    );
    expect(query.evaluate(name)).toBe(false);
  })

  test('should execute the correct branch (async)', async () => {
    let filePath: string | undefined = returnStringUndefined('animal.txt');

    await metch(filePath, [
      [Query.Or<string | undefined>(undefined, path => path!.includes('.pdf')), async (file) => {
        expect(true).toBe(false);
      }],
      ['animal.txt', async (file) => {
        const content = await readFile(file!);
        expect(content).toBe('Animal file content');
      }],
    ], async (item) => {
      expect(true).toBe(false);
    });
  });

  test('should execute the correct branch (sync)', () => {
    let filePath: string | undefined = returnStringUndefined('data.txt');

    metch(filePath, [
      [Query.Or(undefined, 'animal.txt'), (file) => {
        expect(true).toBe(false);
      }],
      [path => path?.endsWith('.txt'), (path) => {
        expect(path).toBe('data.txt')
      }]
    ], async (item) => {
      expect(true).toBe(false);
    });
  });

  test('should execute the default branch', async () => {
    let filePath: string | undefined = returnStringUndefined(undefined);;

    await metch(filePath, [
      [Query.Or<string | undefined>('asdw', 'animal.txt', path => path?.includes('.txt')), async (file) => {
        expect(true).toBe(false);
      }],
    ], async (item) => {
        const content = await readFile('default.txt');
        expect(content).toBe('Default file content');
    });
  });

  test('should execute the correct branch (async)', async () => {
    const branches: MetchBranches<any> = [
      [Query.Or<any>(undefined, null, 1, (path: any) => typeof path === 'boolean'), () => {
        expect(true).toBe(false)
      }],
      [Query.And((path: any) => typeof path === 'string', 'animal'), (item) => {
        expect(item).toBe('animal');
      }],
    ];

    await metch('animal' as any, branches, (item) => {
      expect(true).toBe(false);
    });
  });

  test('should execute the default branch when no Metch is found', async () => {
    const branches: MetchBranches<any> = [
      [Query.Or<any>(undefined, null, 0, 'animal', (path: any) => typeof path === 'string' && path.startsWith('prefix_')), (item) => {
        expect(true).toBe(false);
      }],
    ];

    await metch(123, branches, async (item) => {
        expect(item).toBe(123);
    });
  });
})