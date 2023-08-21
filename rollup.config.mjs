import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import terser from '@rollup/plugin-terser'
import { visualizer } from 'rollup-plugin-visualizer'
import execute from 'rollup-plugin-execute'
import cleanup from 'rollup-plugin-cleanup'
import html from '@rollup/plugin-html'
import css from 'rollup-plugin-import-css'
import typescript from '@rollup/plugin-typescript'

const projectName = 'JS13k2023'
const terserCode = true
const production = !process.env.ROLLUP_WATCH
const isWindows = process.platform === 'win32'

export default {
  input: ['src/main.ts'],
  output: {
    dir: 'dist',
    sourcemap: !production
  },
  watch: {
    clearScreen: false
  },
  plugins: [
    resolve(),
    commonjs(),
    typescript({
      sourceMap: !production,
      inlineSources: !production
    }),
    cleanup({
      comments: 'none'
    }),
    visualizer(),
    terserCode && terser({
      parse: {
        ecma: 2022
      },
      compress: {
        ecma: 2022,
        passes: 10,
        unsafe: true,
        unsafe_arrows: true,
        unsafe_comps: true,
        unsafe_Function: true,
        unsafe_math: true,
        unsafe_methods: true,
        unsafe_proto: true,
        unsafe_regexp: true,
        unsafe_undefined: true,
        warnings: true
      },
      mangle: {
        toplevel: true
      },
      output: {
        ecma: 2022,
        beautify: false
      }
    }),
    css(),
    html({
      title: projectName,
      publicPath: './',
      fileName: 'bundle.html',
      template: (template) => `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${template.title}</title>
            <style>
            ${template.files.css?.map((file) => file.source).join()}
            </style>
          </head>
          <body>
            <canvas width="426" height="240" id="canvas" />
            ${template.scripts}
          </body>
          <script>
          ${template.files.js.map((file) => file.code).join()}
          </script>
        </html>
        `
    }),
    execute([
      `npx html-minifier-terser dist/bundle.html  --collapse-whitespace --remove-comments --minify-js ${terserCode} --minify-css true > dist/index.html`,
      'npx bestzip dist/game.zip dist/index.html src/spritesheet.png',
      `${isWindows ? 'utils\\advzip' : 'advzip'} -z -4 -i 100 dist/game.zip`
    ])
  ]
}
