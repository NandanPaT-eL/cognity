import { readFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { createInterface } from 'node:readline'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const command = process.argv[2]

const workspaces = [
  { name: '@cognity/api', cwd: resolve(rootDir, 'apps/api') },
  { name: '@cognity/dashboard', cwd: resolve(rootDir, 'apps/dashboard') },
  { name: '@cognity/sdk', cwd: resolve(rootDir, 'packages/sdk') }
]

if (!command) {
  console.error('Usage: node scripts/run-workspaces.mjs <command>')
  process.exit(1)
}

const selectedWorkspaces = await selectWorkspaces(command)

if (command === 'dev') {
  await runInParallel(selectedWorkspaces)
} else if (command === 'db:migrate') {
  await runSequential(selectedWorkspaces)
} else {
  await runSequential(selectedWorkspaces)
}

async function workspaceHasScript(cwd, scriptName) {
  try {
    const packageJson = JSON.parse(await readFile(resolve(cwd, 'package.json'), 'utf8'))
    return Boolean(packageJson.scripts?.[scriptName])
  } catch {
    return false
  }
}

async function selectWorkspaces(scriptName) {
  const checks = await Promise.all(
    workspaces.map(async (workspace) => ({
      workspace,
      hasScript: await workspaceHasScript(workspace.cwd, scriptName)
    }))
  )

  return checks.filter(({ hasScript }) => hasScript).map(({ workspace }) => workspace)
}

async function runSequential(targets) {
  for (const workspace of targets) {
    await runScript(workspace, command)
  }
}

async function runInParallel(targets) {
  if (targets.length === 0) return

  const children = targets.map((workspace) => startScript(workspace, command))

  const cleanup = () => {
    for (const child of children) {
      if (!child.child.killed) child.child.kill('SIGINT')
    }
  }

  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)

  const exitCode = await Promise.race(children.map((child) => child.done))
  cleanup()
  process.exit(exitCode)
}

async function runScript(workspace, scriptName) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn('npm', ['run', scriptName], {
      cwd: workspace.cwd,
      stdio: ['inherit', 'pipe', 'pipe']
    })

    prefixStream(child.stdout, workspace.name)
    prefixStream(child.stderr, workspace.name)

    child.on('error', rejectPromise)
    child.on('exit', (code) => {
      if (code === 0) {
        resolvePromise()
      } else {
        rejectPromise(new Error(`${workspace.name} ${scriptName} failed with exit code ${code ?? 'unknown'}`))
      }
    })
  })
}

function startScript(workspace, scriptName) {
  const child = spawn('npm', ['run', scriptName], {
    cwd: workspace.cwd,
    stdio: ['inherit', 'pipe', 'pipe']
  })

  prefixStream(child.stdout, workspace.name)
  prefixStream(child.stderr, workspace.name)

  const done = new Promise((resolvePromise) => {
    child.on('exit', (code) => resolvePromise(code ?? 1))
  })

  return { child, done }
}

function prefixStream(stream, label) {
  const lines = createInterface({ input: stream })
  lines.on('line', (line) => {
    process.stdout.write(`[${label}] ${line}\n`)
  })
}
