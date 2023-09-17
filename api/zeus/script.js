/* eslint-disable no-template-curly-in-string */
/* eslint-disable no-console */
const fs = require('fs')
const async = require('async')
const path = require('path')
const util = require('util')
const yaml = require('js-yaml')

const exec = util.promisify(require('child_process').exec)

async function zeus() {
	const directory = path.join(__dirname, '../src/graphql/schemas')
	const destination = path.join(
		__dirname,
		'../src/graphql/schemas/schema.graphql',
	)
	const zeusFile = path.join(__dirname, './index.ts')
	const enumFile = path.join(
		__dirname,
		'../../node_modules/graphql-zeus-core/lib/TreeToTS/templates/returnedTypes/enum.js',
	)

	fs.readFile(enumFile, 'utf8', function (err, data) {
		if (err) {
			return console.log(err)
		}
		const result = data
			.replace('export const enum ${i.name} {', 'export type ${i.name} = ')
			.replace('${f.name} = "${f.name}"', '"${f.name}"')
			.replace("(',", "('|")
			.replace('}`;', '`;')

		fs.writeFileSync(enumFile, result, 'utf8', function (err) {
			if (err) return console.log(err)
		})
	})

	fs.readdir(directory, (err, files) => {
		if (err) return console.log(err)

		files = files
			.filter(file => !file.includes('schema.graphql'))
			.map(file => path.join(directory, file))

		async.map(files, fs.readFile, (err, results) => {
			if (err) return console.log(err)

			fs.writeFileSync(destination, results.join('\n'), err => {
				if (err) return console.log(err)
			})
		})
	})

	await exec('npx graphql-codegen --config codegen.yml')

	await exec('npx zeus ./src/graphql/schemas/schema.graphql ./ --apollo')

	fs.readFile(zeusFile, 'utf8', function (err, data) {
		if (err) {
			return console.log(err)
		}

		const codegen = path.join(__dirname, '../codegen.yml')

		const codegenObj = yaml.load(
			fs.readFileSync(codegen, { encoding: 'utf-8' }),
		)

		const scalars = codegenObj.generates['./src/gql-types.ts'].config.scalars

		const replacements = [
			{
				before: `["Upload"]: "scalar" & { name: "Upload" };`,
				after: '["Upload"]: any;',
			},
			{
				before: `["Null"]: "scalar" & { name: "Null" };`,
				after: '["Null"]: null | undefined;',
			},
			{
				before: `["Date"]:unknown;`,
				after: '["Date"]: string;',
			},
			{
				before: `["Upload"]:unknown;`,
				after: '["Upload"]: any;',
			},
			{
				before: `["Null"]:unknown;`,
				after: '["Null"]: null | undefined;',
			},
		]

		Object.keys(scalars).forEach(key => {
			replacements.push({
				before: `["${key}"]: "scalar" & { name: "${key}" };`,
				after: `["${key}"]: ${scalars[key]};`,
			})

			replacements.push({
				before: `["${key}"]:unknown;`,
				after: `["${key}"]: ${scalars[key]};`,
			})
		})

		replacements.forEach(replacement => {
			data = data.replace(replacement.before, replacement.after)
		})

		data = data.replace(
			'JSON.parse(event.data);',
			'JSON.parse(event.data) as any;',
		)

		fs.writeFileSync(zeusFile, data, 'utf8', function (err) {
			if (err) return console.log(err)
		})
	})
}

zeus()
