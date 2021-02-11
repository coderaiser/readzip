'use strict';

const {join, win32} = require('path');

const test = require('supertape');
const mockRequire = require('mock-require');
const pullout = require('pullout');

const readzip = require('./readzip');

const {reRequire, stopAll} = mockRequire;

test('redzip: traverse: isDirectory', async (t) => {
    const dirPath = join(__dirname, 'fixture');
    const zipPath = join(dirPath, 'dir.zip');
    
    let result;
    for await (const path of readzip(zipPath)) {
        result = path.isDirectory('/hello/world');
    }
    
    t.notOk(result);
    t.end();
});

test('redzip: traverse: isDirectory: yes', async (t) => {
    const dirPath = join(__dirname, 'fixture');
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

test('redzip: traverse: isFile: windows', async (t) => {
    const dirPath = join(__dirname, 'fixture');
    const zipPath = join(dirPath, 'dir.zip');
    
    mockRequire('path', win32);
    
    const readzip = reRequire('./readzip');
    
    let result;
    for await (const path of readzip(zipPath)) {
        result = path.isFile('/dir/hello.txt');
        
        if (result)
            break;
    }
    
    stopAll();
    
    t.ok(result);
    t.end();
});

test('redzip: traverse: read file', async (t) => {
    const dirPath = join(__dirname, 'fixture');
    const zipPath = join(dirPath, 'dir.zip');
    
    mockRequire('path', win32);
    
    const readzip = reRequire('./readzip');
    
    let stream;
    for await (const path of readzip(zipPath)) {
        if (path.isFile('/dir/hello.txt')) {
            stream = await path.openReadStream();
            path.stop();
        }
    }
    
    const result = await pullout(stream);
    
    stopAll();
    
    t.equal(result, 'world\n');
    t.end();
});

test('redzip: traverse: nested', async (t) => {
    const dirPath = join(__dirname, 'fixture');
    const zipPath = join(dirPath, 'nested.zip');
    
    const readzip = reRequire('./readzip');
    
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

