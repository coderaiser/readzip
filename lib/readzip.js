'use strict';

const events = require('node:events');
const {promisify} = require('node:util');

const once = require('once');
const wraptile = require('wraptile');
const yauzl = require('yauzl');

const {
    sep,
    basename,
    dirname,
    join,
} = require('node:path').posix;

const isEndSlash = (a) => a.at(-1) === sep;
const close = wraptile((a) => a.close());
const open = promisify(yauzl.open);
const {dosDateTimeToDate} = yauzl;
const RW = parseInt('666', 8);

module.exports = async function*(outerPath) {
    const zipfile = await open(outerPath, {
        lazyEntries: true,
    });
    
    const superOnce = once(events.once);
    
    zipfile.readEntry();
    
    let [entry] = await Promise.race([
        events.once(zipfile, 'entry'),
        superOnce(zipfile, 'end'),
    ]);
    
    do {
        const path = new Path(entry, {
            zipfile,
        });
        
        yield path;
        
        if (path.isStop())
            return;
        
        zipfile.readEntry();
        
        [entry] = await Promise.race([
            events.once(zipfile, 'entry'),
            superOnce(zipfile, 'end'),
        ]);
    } while (entry)
};

class Path {
    constructor(entry, {zipfile}) {
        const {fileName} = entry;
        
        this._isStop = false;
        this._openReadStream = promisify(zipfile.openReadStream.bind(zipfile));
        this._zipfile = zipfile;
        this._itIsDirectory = isEndSlash(fileName);
        
        this.entry = entry;
        this.filePath = join(sep, fileName);
        this.directory = join(sep, dirname(fileName), sep);
        
        this.name = basename(fileName);
        this.size = entry.uncompressedSize;
        this.date = dosDateTimeToDate(entry.lastModFileDate);
        this.mode = RW;
    }
    
    isFile(path) {
        if (this._itIsDirectory)
            return false;
        
        return !path || path === this.filePath;
    }
    
    isDirectory(path) {
        if (!this._itIsDirectory)
            return false;
        
        return !path || join(path, '/') === this.filePath;
    }
    
    async openReadStream() {
        this._stream = await this._openReadStream(this.entry);
        return this._stream;
    }
    
    stop() {
        this._stream?.on('end', close(this._zipfile));
        this._isStop = true;
    }
    
    isStop() {
        return this._isStop;
    }
}
