import { promises as fs } from 'fs'

// We need to slightly modify the binaries so that their file paths take into
// account the new location. Moving the binaries should make the
// `if exists ./node.exe` always fail, so this does not need to be changed.
// Note that global binaries use `cmd-shim` (https://github.com/npm/cmd-shim) to
// produce the shim files. But `npm` and `npx` global binaries shim files are
// slightly different (https://github.com/npm/cli/blob/latest/bin/npm)
export const getContent = async function ({ type, srcBinDir, filename }) {
  const path = `${srcBinDir}/${filename}`
  const content = await fs.readFile(path, 'utf8')
  const distContent = CONTENTS[type](srcBinDir, content)
  return distContent
}

// The *.cmd file changes in `cmd-shim@3.0.0` (shipped with Node `10.17.0`).
// However the RegExp below works regardless of those changes.
const getCmdContent = function (srcBinDir, content) {
  const srcBinDirA = srcBinDir.replace(SLASH_REGEXP, '\\')
  return content.replace(CMD_REGEXP, `${srcBinDirA}$2`)
}

const SLASH_REGEXP = /\//gu
const CMD_REGEXP = /(%~dp0|%dp0%)(\\node_modules)/gu

// The Bash file changes in `cmd-shim@3.0.0` (shipped with Node `10.17.0`).
// However the RegExp below works regardless of those changes.
// This also works with the Powershell file, which was added by `cmd-shim@3.0.0`
// (shipped with Node `10.17.0`).
const getShellContent = function (srcBinDir, content) {
  const srcBinDirA = srcBinDir.replace(BACKSLASH_REGEXP, '/')
  return content.replace(SHELL_REGEXP, `${srcBinDirA}$1`)
}

const BACKSLASH_REGEXP = /\\/gu
const SHELL_REGEXP = /\$basedir(\/node_modules)/gu

const CONTENTS = {
  cmd: getCmdContent,
  bash: getShellContent,
  ps1: getShellContent,
}
