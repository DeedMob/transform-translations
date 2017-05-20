var finder = require('findit')(process.argv[2] || '.');
var path = require('path');
const fs = require('fs');
const _ = require('lodash');

const replacer = (key, value) =>
	value instanceof Object ?
		Object.keys(value)
		.sort()
		.reduce((sorted, key) => {
			sorted[key] = value[key];
			return sorted
		}, {}) :
		value;

var supportedLanguages = process.argv[4].split(',');
var sourceOfTruth = process.argv[5] || "local";
if(!(sourceOfTruth === "local" || sourceOfTruth === "global")){
	console.error('Invalid source of truth');
	return;
}
console.log('Source of truth is ' + sourceOfTruth);
var numberOfFiles = 0;
var localTranslations = {}; // Map language => (Map fileName => (Map key => translation))
for(const language of supportedLanguages){
  localTranslations[language] = {};
}

finder.on('directory', function (dir, stat, stop) {
  var base = path.basename(dir);
  if (base === '.git' || base === 'node_modules') stop()
});

finder.on('file', function (file, stat) {
  if(file.includes('translations.js')){
    numberOfFiles++;

    const languageOriented = {};
    for(const language of supportedLanguages){
      languageOriented[language] = {};
    }

    const keyOriented = require(file);
    for(const key in keyOriented){
      // Check we are not missing a language key
      for(const language of supportedLanguages){
        if(!Object.keys(keyOriented[key]).includes(language)){
          console.error('Missing language, fixing automatically ', language, ' for key ', key, ' from ', file);
          languageOriented[language][key] = "";
        }
      }

      for(const language in keyOriented[key]){
        if(!supportedLanguages.includes(language))
          console.error('Unsupported language key in', file);
        else
          languageOriented[language][key] = keyOriented[key][language];
      }
    }

    for(const language in languageOriented){
      localTranslations[language][file] = languageOriented[language];
    }
  }
});

finder.on('end', function () {
  console.log(numberOfFiles + ' local files compiled');
  const mergedTranslations = {};
  for(const language of supportedLanguages){
    mergedTranslations[language] = {};
  }
  for(const language of supportedLanguages){
    const pathToFile = process.argv[3] + language + ".json";
    try {
      const globalTranslation = JSON.parse(fs.readFileSync(pathToFile, 'utf8'));
      const localTranslation = localTranslations[language];
      // Merge the two
      const mergedTranslation = {};
      for(const filePath in localTranslation){
				if(sourceOfTruth === "local"){
					mergedTranslation[filePath] = Object.assign(
						{},
						globalTranslation[filePath],
						_.pick(
							localTranslation[filePath],
							Object.keys(localTranslation[filePath])
						) || {}
					);
				}
				else if(sourceOfTruth === "global"){
					mergedTranslation[filePath] = Object.assign(
	          {},
						localTranslation[filePath],
						_.pick(
							globalTranslation[filePath],
							Object.keys(localTranslation[filePath])
						) || {}
	        );
				}
      }
      mergedTranslations[language] = mergedTranslation;

      // Write global translation
      fs.writeFileSync(
        pathToFile,
        JSON.stringify(
          mergedTranslation,
          replacer,
          2
        ),
        'utf-8'
      );
    }
    catch(err){
      console.log(err);
      // Check err is not exists, otherwise we will be overwriting and thats bad
      mergedTranslations[language] = localTranslations[language];

      // Create new file and write to it.
      fs.writeFileSync(
        pathToFile,
        JSON.stringify(
          localTranslations[language],
          replacer,
          2
        ),
        'utf-8'
      );
    }
  }

  // write local translations
  for(const filePath in mergedTranslations[supportedLanguages[0]]){
    // Recreate keyOriented Object
    const o = {};
    for(const key in mergedTranslations[supportedLanguages[0]][filePath]){
      o[key] = {};
      for(const language in mergedTranslations){
        o[key][language] = mergedTranslations[language][filePath][key];
      }
    }
    // write to local file
    fs.writeFileSync(filePath, 'module.exports = ' + JSON.stringify(o, replacer, 2) , 'utf-8');
  }
});
