import {join, win32} from 'node:path';
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
