import { spawn } from 'node:child_process'
import { existsSync, mkdtempSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { seedTheme } from './lib/theme-fixture.mjs'

// Exercise the actual Windows executable with a fresh database, never the user's projects.
const executable = resolve(process.argv[2] ?? 'dist/1.0.0 - Cherry Pie Version/win-unpacked/Noir Dump Studio.exe')
if (!existsSync(executable)) throw new Error(`Executable not found: ${executable}`)

for (const nativeModule of [
  'better-sqlite3/build/Release/better_sqlite3.node',
  '@img/sharp-win32-x64/lib/sharp-win32-x64.node'
]) {
  const nativePath = join(dirname(executable), 'resources/app.asar.unpacked/node_modules', nativeModule)
  if (!existsSync(nativePath)) throw new Error(`Missing packaged native module: ${nativePath}`)
}

const scratch = mkdtempSync(join(tmpdir(), 'noir-startup-'))
const screenshot = join(scratch, 'startup.png')
const splashScreenshot = join(scratch, 'splash.png')
const userData = join(scratch, 'user-data')
const env = { ...process.env, NOIR_SHOT: screenshot, NOIR_SPLASH_SHOT: splashScreenshot }
for (const key of ['ELECTRON_RUN_AS_NODE', 'NOIR_SEED', 'NOIR_SEED_TAB', 'NOIR_EXPORT', 'NOIR_DIALOG']) {
  delete env[key]
}
if (process.argv[3]) {
  env.NOIR_SEED = resolve(process.argv[3])
  env.NOIR_SEED_TAB = process.argv[4] ?? 'canvas'
}
if (process.argv[5]) await seedTheme(userData, process.argv[5])
if (process.argv[6]) env.NOIR_DIALOG = process.argv[6]

console.log(`Executable: ${executable}`)
console.log(`Test artifacts: ${scratch}`)
const child = spawn(executable, [
  `--user-data-dir=${userData}`,
  '--enable-logging',
  `--log-file=${join(scratch, 'chromium.log')}`
], { env, cwd: scratch, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] })

let output = ''
for (const stream of [child.stdout, child.stderr]) {
  stream.setEncoding('utf8')
  stream.on('data', (chunk) => { output = (output + chunk).slice(-128 * 1024) })
}

const result = await new Promise((resolveResult) => {
  const timer = setTimeout(() => {
    child.kill()
    resolveResult({ error: 'Startup timed out after 45 seconds' })
  }, 45_000)
  child.once('error', (error) => {
    clearTimeout(timer)
    resolveResult({ error: error.message })
  })
  child.once('exit', (code, signal) => {
    clearTimeout(timer)
    resolveResult({ code, signal })
  })
})

writeFileSync(join(scratch, 'startup.log'), output)
console.log(JSON.stringify(result))
if (output.trim()) console.log(output.trim())
if (result.error || result.code !== 0 || !existsSync(screenshot) || statSync(screenshot).size < 1000) {
  console.error('FAIL: the application did not load and capture its window successfully.')
  process.exitCode = 1
} else if (!existsSync(splashScreenshot) || statSync(splashScreenshot).size < 1000) {
  console.error('FAIL: the startup splash did not load and capture successfully.')
  process.exitCode = 1
} else if (!existsSync(join(userData, 'noir-dump-studio.db'))) {
  console.error('FAIL: the application did not initialize its database.')
  process.exitCode = 1
} else if (Number(output.match(/splash-visible-ms=(\d+)/)?.[1] ?? 0) < 4950) {
  console.error('FAIL: the splash did not remain visible for five seconds.')
  process.exitCode = 1
} else {
  console.log(`PASS: splash and application loaded, database initialized. Screenshots: ${splashScreenshot}, ${screenshot}`)
}
