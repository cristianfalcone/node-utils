import { getPackages } from '@lerna/project'
import filterPackages from '@lerna/filter-packages'
import batchPackages from '@lerna/batch-packages'
import ts from '@wessberg/rollup-plugin-ts'
import path from 'path'
import mri from 'mri'

async function getSortedPackages(include, exclude) {
	const packages = await getPackages(__dirname)
	const filtered = filterPackages(packages, include, exclude, false)
	return batchPackages(filtered).reduce((arr, batch) => arr.concat(batch), [])
}

async function main() {
	const config = [];
	const external = require('module').builtinModules
	const plugins = [ts()]
	const { include, exclude } = mri(process.argv.slice(2))
	const packages = await getSortedPackages(include, exclude)

	packages.forEach(pkg => {
		const basePath = path.relative(__dirname, pkg.location)
		const input = path.join(basePath, 'src/index.ts')
		const { main, module } = pkg.toJSON()

		config.push({
			input,
			output: [
				{
					file: path.join(basePath, main),
					format: 'cjs',
					sourcemap: true,
				},
				{
					file: path.join(basePath, module),
					format: 'esm',
					sourcemap: true,
				},
			],
			external,
			plugins
		})
	})

	return config
}

export default main()
