# Transform translations

This module reconciles translations between local and global files

# Usage

`node index.js <pathToSearchFolder> <pathToOutputFolder> <supportedLanguageArray>``

# Example Usage

`node index.js ../DeedMob ../DeedMob/intl/ en,nl`

# Expectations

- [x] Throw error message if missing language key
- [x] Globalized is source of truth for values of keys (if they have one)
- [x] Localized is source of truth on which keys there are

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

# Improvements

- [ ] Currently changing path between executions will yield unexpected results.
