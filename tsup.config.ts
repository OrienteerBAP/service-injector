import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm', 'iife'],
  globalName: 'ServiceInjectorModule',
  dts: true,
  clean: true,
  minify: true,
  sourcemap: true,
  target: 'es2015',
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.cjs' : format === 'iife' ? '.iife.js' : '.js'
    };
  },
  // Ensure the IIFE bundle works standalone in browsers
  platform: 'browser',
  // Add banner for IIFE to handle auto-install
  banner: {
    js: '/* service-injector v1.0.0 | Apache-2.0 License | https://github.com/OrienteerBAP/service-injector */'
  }
});
