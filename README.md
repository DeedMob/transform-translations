# Transform translations

This module reconciles translations between local and global files

# Usage

`node index.js <pathToSearchFolder> <pathToOutputFolder> <supportedLanguageArray> <sourceOfValueTruth: default to "local">`

# Example Usage

`node index.js ../DeedMob ../DeedMob/intl/ en,nl global`

# Improvements

- [ ] Currently changing path between executions will yield unexpected results, so path would be better relative to the directory, not this directory.

# Expectations

- [x] Source of truth for values of keys (if they have one) is determined by the last argument
- [x] Throw error message if missing language key
- [x] Localized is source of truth on which keys there are
- [x] Alphabetical/deterministic order of object props & keys to minimize git diff problems

# Output structure

Should create global files of structure in output

/* en.js

module.exports = {
  "../AccountForm/translations": {
    "profile": "User Profile",
    "account": "User Account"
  },
  "../ProfileForm/translations" : {
    "vacancy": "Something"
  }
};

*/
