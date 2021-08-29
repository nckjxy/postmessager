const fs = require('fs')
const path = require('path')
import resolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import { uglify } from 'rollup-plugin-uglify'
import typescript from 'rollup-plugin-typescript2'
import pkg from './package.json'

let fileList = []
const readDir = entry => {
    const dirInfo = fs.readdirSync(entry)
    dirInfo.forEach(item => {
        const name = path.join(entry, item)
        const info = fs.statSync(name)
        if (info.isDirectory()) {
            readDir(name)
        } else {
            ;/^[\S]*\.ts$/.test(item) && item !== 'index.ts' && getInfo(name)
        }
    })
}
const getInfo = url => {
    fileList.push(url)
}
readDir('./src')

const production = !process.env.ROLLUP_WATCH

export default [
    {
        input: 'src/index.ts',
        output: [
            {
                file: pkg.main,
                format: 'cjs'
            },
            {
                file: 'lib/index.esm.js',
                format: 'es'
            }
        ],
        plugins: [
            resolve({ extensions: ['.js', '.jsx', '.ts', '.tsx', '.es6', '.es', '.mjs', '.ts', '.json'] }),
            typescript({
                tsconfigOverride: {
                    compilerOptions: {
                        declaration: false
                    },
                    include: ['src/**/*'],
                    exclude: ['node_modules', '__tests__', 'core-js']
                },
                abortOnError: false
            }),
            babel({
                babelHelpers: 'bundled',
                extensions: ['.js', '.jsx', '.ts', '.tsx', '.es6', '.es', '.mjs', '.ts', '.json'],
                // exclude: [/\/core-js\//],
                // runtimeHelpers: true,
                sourceMap: true
            }),
            commonjs()
        ],
        external(id) {
            // return ['core-js', 'tslib'].some(k => new RegExp('^' + k).test(id))
            return ['core-js'].some(k => new RegExp('^' + k).test(id))
        }
    },
    {
        input: fileList,
        output: [
            {
                // file: 'lib/[name].js',
                dir: 'lib',
                preserveModules: true,
                preserveModulesRoot: 'src',
                exports: 'auto',
                format: 'cjs',
                // format: 'iife', // immediately-invoked function expression — suitable for <script> tags
                sourcemap: false
            }
        ],
        plugins: [
            resolve({ extensions: ['.js', '.jsx', '.ts', '.tsx', '.es6', '.es', '.mjs', '.ts', '.json'] }),
            typescript({
                tsconfigOverride: {
                    include: ['src/**/*'],
                    exclude: ['node_modules', '__tests__', 'core-js']
                },
                abortOnError: false
            }),
            babel({
                babelHelpers: 'bundled',
                extensions: ['.js', '.jsx', '.ts', '.tsx', '.es6', '.es', '.mjs', '.ts', '.json'],
                // exclude: [/\/core-js\//],
                // runtimeHelpers: true,
                sourceMap: true
            }),
            commonjs()
        ],
        external(id) {
            return ['core-js'].some(k => new RegExp('^' + k).test(id))
        }
    }
]
