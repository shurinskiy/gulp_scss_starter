// Генератор файловой структуры
// Описать конфигурацию файловой структуры БЭМ в файле bem.json. В терминале, из корневой папки проекта, выполнить node .\createbem.js

// Пример конфигурации:
/* {
	"blockname1": {
		"mods": "modifier1, modifier2",
		"elems": [{
				"elem": "elemname1",
				"mods": "modifier1"
			},
			{
				"elem": "elemname2",
				"mods": "modifier1"
			}
		]
	},
	"blockname2": {
		"mods": "modifier1, modifier2",
		"elems": [{
				"elem": "elemname1",
				"mods": "modifier1, modifier2"
			},
			{
				"elem": "elemname2",
				"mods": "modifier1, modifier2"
			}
		],
		"js": true
	}
} */


const fs = require('fs');
const mkdirp = require('mkdirp2');
const config = require('./bem.json');


for (const blockName in config) {
	const dirPath = `./src/blocks/${blockName}/`;
	const filePath = `${dirPath}${blockName}.scss`;
	const block = config[blockName];
	let fileContent = `.${blockName} {\n\t$self: &;\n\n`;

	const made = mkdirp.sync(dirPath);
	console.log(`Создание папки: ${made}`);

	if (block.mods) {
		let modfiers = block.mods.split(",");
		modfiers.forEach((modifier) => fileContent += `\t&_${modifier.trim()} {\n\t\t\n\t}\n`);

	}

	if (block.elems.constructor === Array) {
		block.elems.forEach(elements => {

			fileContent += `\t&__${elements.elem} {\n`;
			if (elements.mods) {
				let modfiers = elements.mods.split(",")
				modfiers.forEach((modifier) => fileContent += `\t\t&_${modifier.trim()} {\n\t\t\t\n\t\t}\n`);
			}
			fileContent += `\t}\n`;
		});
	}

	if (block.js) {
		createFile(`${dirPath}${blockName}.js`, `// (function(){\n// код\n// }());\n`);
	}
	fileContent += `}\n`;

	createFile(filePath, fileContent);
}

function createFile(filePath, fileContent) {
	if (fileExist(filePath) === false) {
		fs.writeFile(filePath, fileContent, (err) => {
			if (err) {
				return console.log(`Файл НЕ создан: ${err}`);
			}
			console.log('Файл создан: ' + filePath);
		});
	}
}

function fileExist(path) {
	const fs = require('fs');
	try {
		fs.statSync(path);
	} catch (err) {
		return !(err && err.code === 'ENOENT');
	}
}