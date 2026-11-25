import {createWriteStream} from 'node:fs';
import {mkdtemp, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join, win32} from 'node:path';
import {pipeline} from 'node:stream/promises';
import {Buffer} from 'node:buffer';
import {ZipFile} from 'yazl';
import {test} from 'supertape';
import pullout from 'pullout';
import {readzip} from './readzip.js';

test('readzip: traverse: isDirectory', async (t) => {
    const dirPath = new URL('fixture', import.meta.url).pathname;
    const zipPath = join(dirPath, 'dir.zip');
    
    let result;
    
    for await (const path of readzip(zipPath)) {
        result = path.isDirectory('/hello/world');
    }
    
    t.notOk(result);
    t.end();
});

test('readzip: traverse: isDirectory: yes', async (t) => {
    const dirPath = new URL('fixture', import.meta.url).pathname;
    const zipPath = join(dirPath, 'dir.zip');
    
    let result;
    
    for await (const path of readzip(zipPath)) {
        if (path.isDirectory('/dir')) {
            result = true;
            break;
        }
    }
    
    t.ok(result);
    t.end();
});

test('readzip: traverse: isFile: windows', async (t) => {
    const dirPath = new URL('fixture', import.meta.url).pathname;
    const zipPath = join(dirPath, 'dir.zip');
    
    let result;
    
    for await (const path of readzip(zipPath, {path: win32})) {
        result = path.isFile('/dir/hello.txt');
        
        if (result)
            break;
    }
    
    t.ok(result);
    t.end();
});

test('readzip: traverse: read file', async (t) => {
    const dirPath = new URL('fixture', import.meta.url).pathname;
    const zipPath = join(dirPath, 'dir.zip');
    
    let stream;
    
    for await (const path of readzip(zipPath)) {
        if (path.isFile('/dir/hello.txt')) {
            stream = await path.openReadStream();
            path.stop();
        }
    }
    
    const result = await pullout(stream);
    
    t.equal(result, 'world\n');
    t.end();
});

test('readzip: traverse: nested', async (t) => {
    const dirPath = new URL('fixture', import.meta.url).pathname;
    const zipPath = join(dirPath, 'nested.zip');
    
    let result = false;
    
    for await (const path of readzip(zipPath)) {
        if (path.isDirectory()) {
            result = path.isFile();
            path.stop();
        }
    }
    
    t.notOk(result);
    t.end();
});

test('readzip: mode', async (t) => {
    const dirPath = new URL('fixture', import.meta.url).pathname;
    const zipPath = join(dirPath, 'nested.zip');
    
    let mode;
    
    for await (const path of readzip(zipPath)) {
        ({mode} = path);
        break;
    }
    
    t.equal(mode, 438);
    t.end();
});

test('readzip: traverse: date: has time of the day', async (t) => {
    const dir = await mkdtemp(join(tmpdir(), 'readzip-'));
    const zipPath = join(dir, 'time.zip');
    const zip = new ZipFile();
    
    zip.addBuffer(Buffer.from('hello'), 'hello.txt', {
        mtime: new Date(2020, 0, 1, 18, 30, 10),
    });
    zip.end();
    
    await pipeline(zip.outputStream, createWriteStream(zipPath));
    
    let result;
    
    for await (const path of readzip(zipPath)) {
        result = path.date;
    }
    
    await rm(dir, {
        recursive: true,
    });
    
    const expected = new Date(2020, 0, 1, 18, 30, 10);
    
    t.equal(result.getTime(), expected.getTime());
    t.end();
});
