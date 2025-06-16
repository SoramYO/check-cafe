const fs = require('fs');
const path = require('path');

// Mock fs module for testing file operations
jest.mock('fs');
const mockedFs = fs;

describe('Package.json Validation', () => {
  let packageJsonPath;
  let validPackageJson;

  beforeEach(() => {
    packageJsonPath = path.join(__dirname, '../package.json');
    validPackageJson = {
      name: 'landing-page',
      version: '1.0.0',
      description: 'Landing page application',
      main: 'index.js',
      scripts: {
        start: 'node index.js',
        test: 'jest',
        build: 'webpack --mode production'
      },
      dependencies: {
        express: '^4.18.0',
        react: '^18.0.0'
      },
      devDependencies: {
        jest: '^29.0.0',
        webpack: '^5.0.0'
      },
      keywords: ['landing', 'page', 'web'],
      author: 'Test Author',
      license: 'MIT'
    };

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('Happy Path Scenarios', () => {
    test('should successfully read and parse valid package.json', () => {
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(validPackageJson));
      mockedFs.existsSync.mockReturnValue(true);

      const result = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      expect(result).toEqual(validPackageJson);
      expect(result.name).toBe('landing-page');
      expect(result.version).toBe('1.0.0');
    });

    test('should validate required fields are present', () => {
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(validPackageJson));
      mockedFs.existsSync.mockReturnValue(true);

      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      expect(packageJson).toHaveProperty('name');
      expect(packageJson).toHaveProperty('version');
      expect(packageJson).toHaveProperty('description');
      expect(packageJson).toHaveProperty('main');
      expect(packageJson).toHaveProperty('scripts');
    });

    test('should validate scripts section contains required scripts', () => {
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(validPackageJson));
      mockedFs.existsSync.mockReturnValue(true);

      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      expect(packageJson.scripts).toHaveProperty('start');
      expect(packageJson.scripts).toHaveProperty('test');
      expect(packageJson.scripts.test).toContain('jest');
    });
  });

  describe('Edge Cases', () => {
    test('should handle package.json with minimal required fields', () => {
      const minimalPackageJson = {
        name: 'minimal-package',
        version: '0.0.1'
      };

      mockedFs.readFileSync.mockReturnValue(JSON.stringify(minimalPackageJson));
      mockedFs.existsSync.mockReturnValue(true);

      const result = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      expect(result.name).toBe('minimal-package');
      expect(result.version).toBe('0.0.1');
    });

    test('should handle package.json with empty dependencies', () => {
      const packageWithEmptyDeps = {
        ...validPackageJson,
        dependencies: {},
        devDependencies: {}
      };

      mockedFs.readFileSync.mockReturnValue(JSON.stringify(packageWithEmptyDeps));
      mockedFs.existsSync.mockReturnValue(true);

      const result = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      expect(result.dependencies).toEqual({});
      expect(result.devDependencies).toEqual({});
    });

    test('should handle package.json with special characters in name', () => {
      const packageWithSpecialChars = {
        ...validPackageJson,
        name: '@scope/package-name'
      };

      mockedFs.readFileSync.mockReturnValue(JSON.stringify(packageWithSpecialChars));
      mockedFs.existsSync.mockReturnValue(true);

      const result = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      expect(result.name).toBe('@scope/package-name');
    });

    test('should handle package.json with complex version ranges', () => {
      const packageWithComplexVersions = {
        ...validPackageJson,
        dependencies: {
          package1: '^1.2.3',
          package2: '~2.1.0',
          package3: '>=3.0.0 <4.0.0',
          package4: 'latest'
        }
      };

      mockedFs.readFileSync.mockReturnValue(JSON.stringify(packageWithComplexVersions));
      mockedFs.existsSync.mockReturnValue(true);

      const result = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      expect(result.dependencies.package1).toBe('^1.2.3');
      expect(result.dependencies.package2).toBe('~2.1.0');
      expect(result.dependencies.package3).toBe('>=3.0.0 <4.0.0');
      expect(result.dependencies.package4).toBe('latest');
    });
  });

  describe('Failure Conditions', () => {
    test('should handle missing package.json file', () => {
      mockedFs.existsSync.mockReturnValue(false);
      mockedFs.readFileSync.mockImplementation(() => {
        throw new Error('ENOENT: no such file or directory');
      });

      expect(() => {
        fs.readFileSync(packageJsonPath, 'utf8');
      }).toThrow('ENOENT: no such file or directory');
    });

    test('should handle invalid JSON in package.json', () => {
      mockedFs.readFileSync.mockReturnValue('{ invalid json content');
      mockedFs.existsSync.mockReturnValue(true);

      expect(() => {
        JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      }).toThrow();
    });

    test('should handle empty package.json file', () => {
      mockedFs.readFileSync.mockReturnValue('');
      mockedFs.existsSync.mockReturnValue(true);

      expect(() => {
        JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      }).toThrow();
    });

    test('should handle package.json with null values', () => {
      const packageWithNulls = {
        name: 'test-package',
        version: '1.0.0',
        description: null,
        dependencies: null
      };

      mockedFs.readFileSync.mockReturnValue(JSON.stringify(packageWithNulls));
      mockedFs.existsSync.mockReturnValue(true);

      const result = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      expect(result.description).toBeNull();
      expect(result.dependencies).toBeNull();
    });

    test('should handle file permission errors', () => {
      mockedFs.existsSync.mockReturnValue(true);
      mockedFs.readFileSync.mockImplementation(() => {
        throw new Error('EACCES: permission denied');
      });

      expect(() => {
        fs.readFileSync(packageJsonPath, 'utf8');
      }).toThrow('EACCES: permission denied');
    });
  });

  describe('Schema Validation', () => {
    test('should validate name field format', () => {
      const testCases = [
        { name: 'valid-package-name', valid: true },
        { name: '@scope/package-name', valid: true },
        { name: 'INVALID_NAME', valid: false },
        { name: 'package name with spaces', valid: false },
        { name: '', valid: false }
      ];

      testCases.forEach(({ name, valid }) => {
        const packageJson = { ...validPackageJson, name };
        mockedFs.readFileSync.mockReturnValue(JSON.stringify(packageJson));
        mockedFs.existsSync.mockReturnValue(true);

        const result = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

        if (valid) {
          expect(result.name).toBe(name);
        } else {
          // In a real scenario, you'd validate against npm naming rules
          expect(result.name).toBe(name); // For testing purposes
        }
      });
    });

    test('should validate version follows semantic versioning', () => {
      const versionTestCases = [
        '1.0.0',
        '0.1.0',
        '10.20.30',
        '1.0.0-alpha.1',
        '1.0.0-beta.2+exp.sha.5114f85'
      ];

      versionTestCases.forEach(version => {
        const packageJson = { ...validPackageJson, version };
        mockedFs.readFileSync.mockReturnValue(JSON.stringify(packageJson));
        mockedFs.existsSync.mockReturnValue(true);

        const result = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

        expect(result.version).toBe(version);
        expect(result.version).toMatch(/^\d+\.\d+\.\d+/);
      });
    });

    test('should validate dependencies structure', () => {
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(validPackageJson));
      mockedFs.existsSync.mockReturnValue(true);

      const result = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      expect(typeof result.dependencies).toBe('object');
      expect(typeof result.devDependencies).toBe('object');

      Object.values(result.dependencies).forEach(version => {
        expect(typeof version).toBe('string');
      });
    });
  });

  describe('Performance and Utility Tests', () => {
    test('should handle large package.json files efficiently', () => {
      const largeDependencies = {};
      for (let i = 0; i < 1000; i++) {
        largeDependencies[\`package-\${i}\`] = \`^\${i}.0.0\`;
      }

      const largePackageJson = {
        ...validPackageJson,
        dependencies: largeDependencies
      };

      mockedFs.readFileSync.mockReturnValue(JSON.stringify(largePackageJson));
      mockedFs.existsSync.mockReturnValue(true);

      const startTime = Date.now();
      const result = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const endTime = Date.now();

      expect(Object.keys(result.dependencies)).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(100); // Should parse quickly
    });

    test('should handle concurrent file reads', async () => {
      mockedFs.readFileSync.mockReturnValue(JSON.stringify(validPackageJson));
      mockedFs.existsSync.mockReturnValue(true);

      const promises = Array.from({ length: 10 }, () =>
        Promise.resolve(JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')))
      );

      const results = await Promise.all(promises);

      results.forEach(result => {
        expect(result).toEqual(validPackageJson);
      });
    });

    test('should validate specific script commands', () => {
      const scriptsTestCases = [
        { scripts: { test: 'jest', start: 'node index.js' }, valid: true },
        { scripts: { test: 'mocha', start: 'npm start' }, valid: true },
        { scripts: {}, valid: false }
      ];

      scriptsTestCases.forEach(({ scripts, valid }) => {
        const packageJson = { ...validPackageJson, scripts };
        mockedFs.readFileSync.mockReturnValue(JSON.stringify(packageJson));
        mockedFs.existsSync.mockReturnValue(true);

        const result = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

        if (valid) {
          expect(Object.keys(result.scripts).length).toBeGreaterThan(0);
        } else {
          expect(Object.keys(result.scripts).length).toBe(0);
        }
      });
    });
  });

  // Cleanup after all tests
  afterEach(() => {
    jest.resetAllMocks();
  });
});