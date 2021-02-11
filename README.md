# Readzip [![License][LicenseIMGURL]][LicenseURL] [![NPM version][NPMIMGURL]][NPMURL] [![Dependency Status][DependencyStatusIMGURL]][DependencyStatusURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL] [![Coverage Status][CoverageIMGURL]][CoverageURL]

[NPMIMGURL]: https://img.shields.io/npm/v/readzip.svg?style=flat
[BuildStatusURL]: https://github.com/coderaiser/readzip/actions
[BuildStatusIMGURL]: https://github.com/coderaiser/readzip/workflows/CI/badge.svg
[DependencyStatusIMGURL]: https://img.shields.io/david/coderaiser/readzip.svg?style=flat
[LicenseIMGURL]: https://img.shields.io/badge/license-MIT-317BF9.svg?style=flat
[NPMURL]: https://npmjs.org/package/readzip "npm"
[BuildStatusURL]: https://travis-ci.org/coderaiser/readzip "Build Status"
[DependencyStatusURL]: https://david-dm.org/coderaiser/readzip "Dependency Status"
[LicenseURL]: https://tldrlegal.com/license/mit-license "MIT License"
[CoverageURL]: https://coveralls.io/github/coderaiser/readzip?branch=master
[CoverageIMGURL]: https://coveralls.io/repos/coderaiser/readzip/badge.svg?branch=master&service=github

Read zip archive in simplest possible way.

## Install

```
npm i readzip
```

## API

`path` contains information about current file, it has next methods:

- `isFile([name])` check if current `entitiy` is file, also compares path, when `name` passed;
- `isDirectory([name])` checks if current `entity` is directory, also compares path, when `name` passed;
- `openReadStream` - promise, returns file `stream`;
- `stop` - close archive file and break from traversing loop;

Also `path` has fields that can be used to get some information

- `name`
- `size`
- `date`
- `mode`
- `directory`
- `type`
- `owner`

```js
const readzip = require('readzip');
const archivePath = './hello.zip';

for await (const path of readzip(archivePath)) {
    const {name} = path;
    
    if (path.isFile()) {
        console.log('file:', name);
    }
    
    if (path.isDirectory()) {
        console.log('directory:', name);
    }
}
```

Similar to infomration returned by [readify](https://github.com/coderaiser/readify).

## Related

- [redzip](https://github.com/coderaiser/redzip "redzip") - Work with zip archives as it is regular files and directories
- [readify](https://github.com/coderaiser/readify "readify") - read directory content with file attributes: size, date, owner, mode
- [readbox](https://github.com/coderaiser/readbox "readbox") - read file or directory from `dropbox`

## License

MIT
