import { onBoot, emit, log, computeHash } from './jsxcad-sys.js';

var _require_crypto_ = {};

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
function resolve() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : '/';

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
}
// path.normalize(path)
// posix version
function normalize(path) {
  var isPathAbsolute = isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isPathAbsolute).join('/');

  if (!path && !isPathAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isPathAbsolute ? '/' : '') + path;
}
// posix version
function isAbsolute(path) {
  return path.charAt(0) === '/';
}

// posix version
function join$1() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
}


// path.relative(from, to)
// posix version
function relative(from, to) {
  from = resolve(from).substr(1);
  to = resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
}

var sep = '/';
var delimiter = ':';

function dirname(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
}

function basename(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
}


function extname(path) {
  return splitPath(path)[3];
}
var _require_path_ = {
  extname: extname,
  basename: basename,
  dirname: dirname,
  sep: sep,
  delimiter: delimiter,
  relative: relative,
  join: join$1,
  isAbsolute: isAbsolute,
  normalize: normalize,
  resolve: resolve
};
function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b' ?
    function (str, start, len) { return str.substr(start, len) } :
    function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

var Module = (() => {
  var _scriptName = typeof document != 'undefined' ? document.currentScript?.src : undefined;
  if (typeof __filename != 'undefined') _scriptName = _scriptName || __filename;
  return (
function(moduleArg = {}) {
  var moduleRtn;

var Module=moduleArg;var readyPromiseResolve,readyPromiseReject;var readyPromise=new Promise((resolve,reject)=>{readyPromiseResolve=resolve;readyPromiseReject=reject;});var ENVIRONMENT_IS_WEB=typeof window=="object";var ENVIRONMENT_IS_WORKER=typeof WorkerGlobalScope!="undefined";var ENVIRONMENT_IS_NODE=typeof process=="object"&&typeof process.versions=="object"&&typeof process.versions.node=="string"&&process.type!="renderer";var moduleOverrides=Object.assign({},Module);var thisProgram="./this.program";var quit_=(status,toThrow)=>{throw toThrow};var scriptDirectory="";function locateFile(path){if(Module["locateFile"]){return Module["locateFile"](path,scriptDirectory)}return scriptDirectory+path}var readAsync,readBinary;if(ENVIRONMENT_IS_NODE){var fs=_require_crypto_;var nodePath=_require_path_;scriptDirectory=__dirname+"/";readBinary=filename=>{filename=isFileURI(filename)?new URL(filename):nodePath.normalize(filename);var ret=fs.readFileSync(filename);return ret};readAsync=(filename,binary=true)=>{filename=isFileURI(filename)?new URL(filename):nodePath.normalize(filename);return new Promise((resolve,reject)=>{fs.readFile(filename,binary?undefined:"utf8",(err,data)=>{if(err)reject(err);else resolve(binary?data.buffer:data);});})};if(!Module["thisProgram"]&&process.argv.length>1){thisProgram=process.argv[1].replace(/\\/g,"/");}process.argv.slice(2);quit_=(status,toThrow)=>{process.exitCode=status;throw toThrow};}else if(ENVIRONMENT_IS_WEB||ENVIRONMENT_IS_WORKER){if(ENVIRONMENT_IS_WORKER){scriptDirectory=self.location.href;}else if(typeof document!="undefined"&&document.currentScript){scriptDirectory=document.currentScript.src;}if(_scriptName){scriptDirectory=_scriptName;}if(scriptDirectory.startsWith("blob:")){scriptDirectory="";}else {scriptDirectory=scriptDirectory.substr(0,scriptDirectory.replace(/[?#].*/,"").lastIndexOf("/")+1);}{if(ENVIRONMENT_IS_WORKER){readBinary=url=>{var xhr=new XMLHttpRequest;xhr.open("GET",url,false);xhr.responseType="arraybuffer";xhr.send(null);return new Uint8Array(xhr.response)};}readAsync=url=>{if(isFileURI(url)){return new Promise((resolve,reject)=>{var xhr=new XMLHttpRequest;xhr.open("GET",url,true);xhr.responseType="arraybuffer";xhr.onload=()=>{if(xhr.status==200||xhr.status==0&&xhr.response){resolve(xhr.response);return}reject(xhr.status);};xhr.onerror=reject;xhr.send(null);})}return fetch(url,{credentials:"same-origin"}).then(response=>{if(response.ok){return response.arrayBuffer()}return Promise.reject(new Error(response.status+" : "+response.url))})};}}else;var out=Module["print"]||console.log.bind(console);var err=Module["printErr"]||console.error.bind(console);Object.assign(Module,moduleOverrides);moduleOverrides=null;if(Module["arguments"])Module["arguments"];if(Module["thisProgram"])thisProgram=Module["thisProgram"];var wasmBinary=Module["wasmBinary"];var wasmMemory;var ABORT=false;var EXITSTATUS;var HEAP8,HEAPU8,HEAP16,HEAPU16,HEAP32,HEAPU32,HEAPF32,HEAPF64;function updateMemoryViews(){var b=wasmMemory.buffer;Module["HEAP8"]=HEAP8=new Int8Array(b);Module["HEAP16"]=HEAP16=new Int16Array(b);Module["HEAPU8"]=HEAPU8=new Uint8Array(b);Module["HEAPU16"]=HEAPU16=new Uint16Array(b);Module["HEAP32"]=HEAP32=new Int32Array(b);Module["HEAPU32"]=HEAPU32=new Uint32Array(b);Module["HEAPF32"]=HEAPF32=new Float32Array(b);Module["HEAPF64"]=HEAPF64=new Float64Array(b);}var __ATPRERUN__=[];var __ATINIT__=[];var __ATPOSTRUN__=[];var runtimeInitialized=false;function preRun(){if(Module["preRun"]){if(typeof Module["preRun"]=="function")Module["preRun"]=[Module["preRun"]];while(Module["preRun"].length){addOnPreRun(Module["preRun"].shift());}}callRuntimeCallbacks(__ATPRERUN__);}function initRuntime(){runtimeInitialized=true;if(!Module["noFSInit"]&&!FS.initialized)FS.init();FS.ignorePermissions=false;callRuntimeCallbacks(__ATINIT__);}function postRun(){if(Module["postRun"]){if(typeof Module["postRun"]=="function")Module["postRun"]=[Module["postRun"]];while(Module["postRun"].length){addOnPostRun(Module["postRun"].shift());}}callRuntimeCallbacks(__ATPOSTRUN__);}function addOnPreRun(cb){__ATPRERUN__.unshift(cb);}function addOnInit(cb){__ATINIT__.unshift(cb);}function addOnPostRun(cb){__ATPOSTRUN__.unshift(cb);}var runDependencies=0;var dependenciesFulfilled=null;function getUniqueRunDependency(id){return id}function addRunDependency(id){runDependencies++;Module["monitorRunDependencies"]?.(runDependencies);}function removeRunDependency(id){runDependencies--;Module["monitorRunDependencies"]?.(runDependencies);if(runDependencies==0){if(dependenciesFulfilled){var callback=dependenciesFulfilled;dependenciesFulfilled=null;callback();}}}function abort(what){Module["onAbort"]?.(what);what="Aborted("+what+")";err(what);ABORT=true;what+=". Build with -sASSERTIONS for more info.";if(runtimeInitialized){___trap();}var e=new WebAssembly.RuntimeError(what);readyPromiseReject(e);throw e}var dataURIPrefix="data:application/octet-stream;base64,";var isDataURI=filename=>filename.startsWith(dataURIPrefix);var isFileURI=filename=>filename.startsWith("file://");function findWasmBinary(){var f="cgal_browser.wasm";if(!isDataURI(f)){return locateFile(f)}return f}var wasmBinaryFile;function getBinarySync(file){if(file==wasmBinaryFile&&wasmBinary){return new Uint8Array(wasmBinary)}if(readBinary){return readBinary(file)}throw "both async and sync fetching of the wasm failed"}function getBinaryPromise(binaryFile){if(!wasmBinary){return readAsync(binaryFile).then(response=>new Uint8Array(response),()=>getBinarySync(binaryFile))}return Promise.resolve().then(()=>getBinarySync(binaryFile))}function instantiateArrayBuffer(binaryFile,imports,receiver){return getBinaryPromise(binaryFile).then(binary=>WebAssembly.instantiate(binary,imports)).then(receiver,reason=>{err(`failed to asynchronously prepare wasm: ${reason}`);abort(reason);})}function instantiateAsync(binary,binaryFile,imports,callback){if(!binary&&typeof WebAssembly.instantiateStreaming=="function"&&!isDataURI(binaryFile)&&!isFileURI(binaryFile)&&!ENVIRONMENT_IS_NODE&&typeof fetch=="function"){return fetch(binaryFile,{credentials:"same-origin"}).then(response=>{var result=WebAssembly.instantiateStreaming(response,imports);return result.then(callback,function(reason){err(`wasm streaming compile failed: ${reason}`);err("falling back to ArrayBuffer instantiation");return instantiateArrayBuffer(binaryFile,imports,callback)})})}return instantiateArrayBuffer(binaryFile,imports,callback)}function getWasmImports(){return {a:wasmImports}}function createWasm(){var info=getWasmImports();function receiveInstance(instance,module){wasmExports=instance.exports;wasmExports=applySignatureConversions(wasmExports);wasmMemory=wasmExports["S"];updateMemoryViews();wasmTable=wasmExports["X"];addOnInit(wasmExports["T"]);removeRunDependency();return wasmExports}addRunDependency();function receiveInstantiationResult(result){receiveInstance(result["instance"]);}if(Module["instantiateWasm"]){try{return Module["instantiateWasm"](info,receiveInstance)}catch(e){err(`Module.instantiateWasm callback failed with error: ${e}`);readyPromiseReject(e);}}wasmBinaryFile??=findWasmBinary();instantiateAsync(wasmBinary,wasmBinaryFile,info,receiveInstantiationResult).catch(readyPromiseReject);return {}}var tempDouble;var tempI64;class ExitStatus{name="ExitStatus";constructor(status){this.message=`Program terminated with exit(${status})`;this.status=status;}}var callRuntimeCallbacks=callbacks=>{while(callbacks.length>0){callbacks.shift()(Module);}};var noExitRuntime=Module["noExitRuntime"]||true;var convertI32PairToI53Checked=(lo,hi)=>hi+2097152>>>0<4194305-!!lo?(lo>>>0)+hi*4294967296:NaN;var UTF8Decoder=typeof TextDecoder!="undefined"?new TextDecoder:undefined;var UTF8ArrayToString=(heapOrArray,idx=0,maxBytesToRead=NaN)=>{idx>>>=0;var endIdx=idx+maxBytesToRead;var endPtr=idx;while(heapOrArray[endPtr]&&!(endPtr>=endIdx))++endPtr;if(endPtr-idx>16&&heapOrArray.buffer&&UTF8Decoder){return UTF8Decoder.decode(heapOrArray.subarray(idx,endPtr))}var str="";while(idx<endPtr){var u0=heapOrArray[idx++];if(!(u0&128)){str+=String.fromCharCode(u0);continue}var u1=heapOrArray[idx++]&63;if((u0&224)==192){str+=String.fromCharCode((u0&31)<<6|u1);continue}var u2=heapOrArray[idx++]&63;if((u0&240)==224){u0=(u0&15)<<12|u1<<6|u2;}else {u0=(u0&7)<<18|u1<<12|u2<<6|heapOrArray[idx++]&63;}if(u0<65536){str+=String.fromCharCode(u0);}else {var ch=u0-65536;str+=String.fromCharCode(55296|ch>>10,56320|ch&1023);}}return str};var UTF8ToString=(ptr,maxBytesToRead)=>{ptr>>>=0;return ptr?UTF8ArrayToString(HEAPU8,ptr,maxBytesToRead):""};function ___assert_fail(condition,filename,line,func){condition>>>=0;filename>>>=0;func>>>=0;abort(`Assertion failed: ${UTF8ToString(condition)}, at: `+[filename?UTF8ToString(filename):"unknown filename",line,func?UTF8ToString(func):"unknown function"]);}var syscallGetVarargI=()=>{var ret=HEAP32[+SYSCALLS.varargs>>>2>>>0];SYSCALLS.varargs+=4;return ret};var syscallGetVarargP=syscallGetVarargI;var PATH={isAbs:path=>path.charAt(0)==="/",splitPath:filename=>{var splitPathRe=/^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;return splitPathRe.exec(filename).slice(1)},normalizeArray:(parts,allowAboveRoot)=>{var up=0;for(var i=parts.length-1;i>=0;i--){var last=parts[i];if(last==="."){parts.splice(i,1);}else if(last===".."){parts.splice(i,1);up++;}else if(up){parts.splice(i,1);up--;}}if(allowAboveRoot){for(;up;up--){parts.unshift("..");}}return parts},normalize:path=>{var isAbsolute=PATH.isAbs(path),trailingSlash=path.substr(-1)==="/";path=PATH.normalizeArray(path.split("/").filter(p=>!!p),!isAbsolute).join("/");if(!path&&!isAbsolute){path=".";}if(path&&trailingSlash){path+="/";}return (isAbsolute?"/":"")+path},dirname:path=>{var result=PATH.splitPath(path),root=result[0],dir=result[1];if(!root&&!dir){return "."}if(dir){dir=dir.substr(0,dir.length-1);}return root+dir},basename:path=>{if(path==="/")return "/";path=PATH.normalize(path);path=path.replace(/\/$/,"");var lastSlash=path.lastIndexOf("/");if(lastSlash===-1)return path;return path.substr(lastSlash+1)},join:(...paths)=>PATH.normalize(paths.join("/")),join2:(l,r)=>PATH.normalize(l+"/"+r)};var initRandomFill=()=>{if(typeof crypto=="object"&&typeof crypto["getRandomValues"]=="function"){return view=>crypto.getRandomValues(view)}else if(ENVIRONMENT_IS_NODE){try{var crypto_module=_require_crypto_;var randomFillSync=crypto_module["randomFillSync"];if(randomFillSync){return view=>crypto_module["randomFillSync"](view)}var randomBytes=crypto_module["randomBytes"];return view=>(view.set(randomBytes(view.byteLength)),view)}catch(e){}}abort("initRandomDevice");};var randomFill=view=>(randomFill=initRandomFill())(view);var PATH_FS={resolve:(...args)=>{var resolvedPath="",resolvedAbsolute=false;for(var i=args.length-1;i>=-1&&!resolvedAbsolute;i--){var path=i>=0?args[i]:FS.cwd();if(typeof path!="string"){throw new TypeError("Arguments to path.resolve must be strings")}else if(!path){return ""}resolvedPath=path+"/"+resolvedPath;resolvedAbsolute=PATH.isAbs(path);}resolvedPath=PATH.normalizeArray(resolvedPath.split("/").filter(p=>!!p),!resolvedAbsolute).join("/");return (resolvedAbsolute?"/":"")+resolvedPath||"."},relative:(from,to)=>{from=PATH_FS.resolve(from).substr(1);to=PATH_FS.resolve(to).substr(1);function trim(arr){var start=0;for(;start<arr.length;start++){if(arr[start]!=="")break}var end=arr.length-1;for(;end>=0;end--){if(arr[end]!=="")break}if(start>end)return [];return arr.slice(start,end-start+1)}var fromParts=trim(from.split("/"));var toParts=trim(to.split("/"));var length=Math.min(fromParts.length,toParts.length);var samePartsLength=length;for(var i=0;i<length;i++){if(fromParts[i]!==toParts[i]){samePartsLength=i;break}}var outputParts=[];for(var i=samePartsLength;i<fromParts.length;i++){outputParts.push("..");}outputParts=outputParts.concat(toParts.slice(samePartsLength));return outputParts.join("/")}};var FS_stdin_getChar_buffer=[];var lengthBytesUTF8=str=>{var len=0;for(var i=0;i<str.length;++i){var c=str.charCodeAt(i);if(c<=127){len++;}else if(c<=2047){len+=2;}else if(c>=55296&&c<=57343){len+=4;++i;}else {len+=3;}}return len};var stringToUTF8Array=(str,heap,outIdx,maxBytesToWrite)=>{outIdx>>>=0;if(!(maxBytesToWrite>0))return 0;var startIdx=outIdx;var endIdx=outIdx+maxBytesToWrite-1;for(var i=0;i<str.length;++i){var u=str.charCodeAt(i);if(u>=55296&&u<=57343){var u1=str.charCodeAt(++i);u=65536+((u&1023)<<10)|u1&1023;}if(u<=127){if(outIdx>=endIdx)break;heap[outIdx++>>>0]=u;}else if(u<=2047){if(outIdx+1>=endIdx)break;heap[outIdx++>>>0]=192|u>>6;heap[outIdx++>>>0]=128|u&63;}else if(u<=65535){if(outIdx+2>=endIdx)break;heap[outIdx++>>>0]=224|u>>12;heap[outIdx++>>>0]=128|u>>6&63;heap[outIdx++>>>0]=128|u&63;}else {if(outIdx+3>=endIdx)break;heap[outIdx++>>>0]=240|u>>18;heap[outIdx++>>>0]=128|u>>12&63;heap[outIdx++>>>0]=128|u>>6&63;heap[outIdx++>>>0]=128|u&63;}}heap[outIdx>>>0]=0;return outIdx-startIdx};function intArrayFromString(stringy,dontAddNull,length){var len=length>0?length:lengthBytesUTF8(stringy)+1;var u8array=new Array(len);var numBytesWritten=stringToUTF8Array(stringy,u8array,0,u8array.length);if(dontAddNull)u8array.length=numBytesWritten;return u8array}var FS_stdin_getChar=()=>{if(!FS_stdin_getChar_buffer.length){var result=null;if(ENVIRONMENT_IS_NODE){var BUFSIZE=256;var buf=Buffer.alloc(BUFSIZE);var bytesRead=0;var fd=process.stdin.fd;try{bytesRead=fs.readSync(fd,buf,0,BUFSIZE);}catch(e){if(e.toString().includes("EOF"))bytesRead=0;else throw e}if(bytesRead>0){result=buf.slice(0,bytesRead).toString("utf-8");}}else if(typeof window!="undefined"&&typeof window.prompt=="function"){result=window.prompt("Input: ");if(result!==null){result+="\n";}}else;if(!result){return null}FS_stdin_getChar_buffer=intArrayFromString(result,true);}return FS_stdin_getChar_buffer.shift()};var TTY={ttys:[],init(){},shutdown(){},register(dev,ops){TTY.ttys[dev]={input:[],output:[],ops};FS.registerDevice(dev,TTY.stream_ops);},stream_ops:{open(stream){var tty=TTY.ttys[stream.node.rdev];if(!tty){throw new FS.ErrnoError(43)}stream.tty=tty;stream.seekable=false;},close(stream){stream.tty.ops.fsync(stream.tty);},fsync(stream){stream.tty.ops.fsync(stream.tty);},read(stream,buffer,offset,length,pos){if(!stream.tty||!stream.tty.ops.get_char){throw new FS.ErrnoError(60)}var bytesRead=0;for(var i=0;i<length;i++){var result;try{result=stream.tty.ops.get_char(stream.tty);}catch(e){throw new FS.ErrnoError(29)}if(result===undefined&&bytesRead===0){throw new FS.ErrnoError(6)}if(result===null||result===undefined)break;bytesRead++;buffer[offset+i]=result;}if(bytesRead){stream.node.timestamp=Date.now();}return bytesRead},write(stream,buffer,offset,length,pos){if(!stream.tty||!stream.tty.ops.put_char){throw new FS.ErrnoError(60)}try{for(var i=0;i<length;i++){stream.tty.ops.put_char(stream.tty,buffer[offset+i]);}}catch(e){throw new FS.ErrnoError(29)}if(length){stream.node.timestamp=Date.now();}return i}},default_tty_ops:{get_char(tty){return FS_stdin_getChar()},put_char(tty,val){if(val===null||val===10){out(UTF8ArrayToString(tty.output));tty.output=[];}else {if(val!=0)tty.output.push(val);}},fsync(tty){if(tty.output&&tty.output.length>0){out(UTF8ArrayToString(tty.output));tty.output=[];}},ioctl_tcgets(tty){return {c_iflag:25856,c_oflag:5,c_cflag:191,c_lflag:35387,c_cc:[3,28,127,21,4,0,1,0,17,19,26,0,18,15,23,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}},ioctl_tcsets(tty,optional_actions,data){return 0},ioctl_tiocgwinsz(tty){return [24,80]}},default_tty1_ops:{put_char(tty,val){if(val===null||val===10){err(UTF8ArrayToString(tty.output));tty.output=[];}else {if(val!=0)tty.output.push(val);}},fsync(tty){if(tty.output&&tty.output.length>0){err(UTF8ArrayToString(tty.output));tty.output=[];}}}};var alignMemory=(size,alignment)=>Math.ceil(size/alignment)*alignment;var mmapAlloc=size=>{abort();};var MEMFS={ops_table:null,mount(mount){return MEMFS.createNode(null,"/",16384|511,0)},createNode(parent,name,mode,dev){if(FS.isBlkdev(mode)||FS.isFIFO(mode)){throw new FS.ErrnoError(63)}MEMFS.ops_table||={dir:{node:{getattr:MEMFS.node_ops.getattr,setattr:MEMFS.node_ops.setattr,lookup:MEMFS.node_ops.lookup,mknod:MEMFS.node_ops.mknod,rename:MEMFS.node_ops.rename,unlink:MEMFS.node_ops.unlink,rmdir:MEMFS.node_ops.rmdir,readdir:MEMFS.node_ops.readdir,symlink:MEMFS.node_ops.symlink},stream:{llseek:MEMFS.stream_ops.llseek}},file:{node:{getattr:MEMFS.node_ops.getattr,setattr:MEMFS.node_ops.setattr},stream:{llseek:MEMFS.stream_ops.llseek,read:MEMFS.stream_ops.read,write:MEMFS.stream_ops.write,allocate:MEMFS.stream_ops.allocate,mmap:MEMFS.stream_ops.mmap,msync:MEMFS.stream_ops.msync}},link:{node:{getattr:MEMFS.node_ops.getattr,setattr:MEMFS.node_ops.setattr,readlink:MEMFS.node_ops.readlink},stream:{}},chrdev:{node:{getattr:MEMFS.node_ops.getattr,setattr:MEMFS.node_ops.setattr},stream:FS.chrdev_stream_ops}};var node=FS.createNode(parent,name,mode,dev);if(FS.isDir(node.mode)){node.node_ops=MEMFS.ops_table.dir.node;node.stream_ops=MEMFS.ops_table.dir.stream;node.contents={};}else if(FS.isFile(node.mode)){node.node_ops=MEMFS.ops_table.file.node;node.stream_ops=MEMFS.ops_table.file.stream;node.usedBytes=0;node.contents=null;}else if(FS.isLink(node.mode)){node.node_ops=MEMFS.ops_table.link.node;node.stream_ops=MEMFS.ops_table.link.stream;}else if(FS.isChrdev(node.mode)){node.node_ops=MEMFS.ops_table.chrdev.node;node.stream_ops=MEMFS.ops_table.chrdev.stream;}node.timestamp=Date.now();if(parent){parent.contents[name]=node;parent.timestamp=node.timestamp;}return node},getFileDataAsTypedArray(node){if(!node.contents)return new Uint8Array(0);if(node.contents.subarray)return node.contents.subarray(0,node.usedBytes);return new Uint8Array(node.contents)},expandFileStorage(node,newCapacity){var prevCapacity=node.contents?node.contents.length:0;if(prevCapacity>=newCapacity)return;var CAPACITY_DOUBLING_MAX=1024*1024;newCapacity=Math.max(newCapacity,prevCapacity*(prevCapacity<CAPACITY_DOUBLING_MAX?2:1.125)>>>0);if(prevCapacity!=0)newCapacity=Math.max(newCapacity,256);var oldContents=node.contents;node.contents=new Uint8Array(newCapacity);if(node.usedBytes>0)node.contents.set(oldContents.subarray(0,node.usedBytes),0);},resizeFileStorage(node,newSize){if(node.usedBytes==newSize)return;if(newSize==0){node.contents=null;node.usedBytes=0;}else {var oldContents=node.contents;node.contents=new Uint8Array(newSize);if(oldContents){node.contents.set(oldContents.subarray(0,Math.min(newSize,node.usedBytes)));}node.usedBytes=newSize;}},node_ops:{getattr(node){var attr={};attr.dev=FS.isChrdev(node.mode)?node.id:1;attr.ino=node.id;attr.mode=node.mode;attr.nlink=1;attr.uid=0;attr.gid=0;attr.rdev=node.rdev;if(FS.isDir(node.mode)){attr.size=4096;}else if(FS.isFile(node.mode)){attr.size=node.usedBytes;}else if(FS.isLink(node.mode)){attr.size=node.link.length;}else {attr.size=0;}attr.atime=new Date(node.timestamp);attr.mtime=new Date(node.timestamp);attr.ctime=new Date(node.timestamp);attr.blksize=4096;attr.blocks=Math.ceil(attr.size/attr.blksize);return attr},setattr(node,attr){if(attr.mode!==undefined){node.mode=attr.mode;}if(attr.timestamp!==undefined){node.timestamp=attr.timestamp;}if(attr.size!==undefined){MEMFS.resizeFileStorage(node,attr.size);}},lookup(parent,name){throw FS.genericErrors[44]},mknod(parent,name,mode,dev){return MEMFS.createNode(parent,name,mode,dev)},rename(old_node,new_dir,new_name){if(FS.isDir(old_node.mode)){var new_node;try{new_node=FS.lookupNode(new_dir,new_name);}catch(e){}if(new_node){for(var i in new_node.contents){throw new FS.ErrnoError(55)}}}delete old_node.parent.contents[old_node.name];old_node.parent.timestamp=Date.now();old_node.name=new_name;new_dir.contents[new_name]=old_node;new_dir.timestamp=old_node.parent.timestamp;},unlink(parent,name){delete parent.contents[name];parent.timestamp=Date.now();},rmdir(parent,name){var node=FS.lookupNode(parent,name);for(var i in node.contents){throw new FS.ErrnoError(55)}delete parent.contents[name];parent.timestamp=Date.now();},readdir(node){var entries=[".",".."];for(var key of Object.keys(node.contents)){entries.push(key);}return entries},symlink(parent,newname,oldpath){var node=MEMFS.createNode(parent,newname,511|40960,0);node.link=oldpath;return node},readlink(node){if(!FS.isLink(node.mode)){throw new FS.ErrnoError(28)}return node.link}},stream_ops:{read(stream,buffer,offset,length,position){var contents=stream.node.contents;if(position>=stream.node.usedBytes)return 0;var size=Math.min(stream.node.usedBytes-position,length);if(size>8&&contents.subarray){buffer.set(contents.subarray(position,position+size),offset);}else {for(var i=0;i<size;i++)buffer[offset+i]=contents[position+i];}return size},write(stream,buffer,offset,length,position,canOwn){if(buffer.buffer===HEAP8.buffer){canOwn=false;}if(!length)return 0;var node=stream.node;node.timestamp=Date.now();if(buffer.subarray&&(!node.contents||node.contents.subarray)){if(canOwn){node.contents=buffer.subarray(offset,offset+length);node.usedBytes=length;return length}else if(node.usedBytes===0&&position===0){node.contents=buffer.slice(offset,offset+length);node.usedBytes=length;return length}else if(position+length<=node.usedBytes){node.contents.set(buffer.subarray(offset,offset+length),position);return length}}MEMFS.expandFileStorage(node,position+length);if(node.contents.subarray&&buffer.subarray){node.contents.set(buffer.subarray(offset,offset+length),position);}else {for(var i=0;i<length;i++){node.contents[position+i]=buffer[offset+i];}}node.usedBytes=Math.max(node.usedBytes,position+length);return length},llseek(stream,offset,whence){var position=offset;if(whence===1){position+=stream.position;}else if(whence===2){if(FS.isFile(stream.node.mode)){position+=stream.node.usedBytes;}}if(position<0){throw new FS.ErrnoError(28)}return position},allocate(stream,offset,length){MEMFS.expandFileStorage(stream.node,offset+length);stream.node.usedBytes=Math.max(stream.node.usedBytes,offset+length);},mmap(stream,length,position,prot,flags){if(!FS.isFile(stream.node.mode)){throw new FS.ErrnoError(43)}var ptr;var allocated;var contents=stream.node.contents;if(!(flags&2)&&contents&&contents.buffer===HEAP8.buffer){allocated=false;ptr=contents.byteOffset;}else {allocated=true;ptr=mmapAlloc();if(!ptr){throw new FS.ErrnoError(48)}if(contents){if(position>0||position+length<contents.length){if(contents.subarray){contents=contents.subarray(position,position+length);}else {contents=Array.prototype.slice.call(contents,position,position+length);}}HEAP8.set(contents,ptr>>>0);}}return {ptr,allocated}},msync(stream,buffer,offset,length,mmapFlags){MEMFS.stream_ops.write(stream,buffer,0,length,offset,false);return 0}}};var asyncLoad=(url,onload,onerror,noRunDep)=>{var dep=!noRunDep?getUniqueRunDependency(`al ${url}`):"";readAsync(url).then(arrayBuffer=>{onload(new Uint8Array(arrayBuffer));if(dep)removeRunDependency();},err=>{if(onerror){onerror();}else {throw `Loading data file "${url}" failed.`}});if(dep)addRunDependency();};var FS_createDataFile=(parent,name,fileData,canRead,canWrite,canOwn)=>{FS.createDataFile(parent,name,fileData,canRead,canWrite,canOwn);};var preloadPlugins=Module["preloadPlugins"]||[];var FS_handledByPreloadPlugin=(byteArray,fullname,finish,onerror)=>{if(typeof Browser!="undefined")Browser.init();var handled=false;preloadPlugins.forEach(plugin=>{if(handled)return;if(plugin["canHandle"](fullname)){plugin["handle"](byteArray,fullname,finish,onerror);handled=true;}});return handled};var FS_createPreloadedFile=(parent,name,url,canRead,canWrite,onload,onerror,dontCreateFile,canOwn,preFinish)=>{var fullname=name?PATH_FS.resolve(PATH.join2(parent,name)):parent;function processData(byteArray){function finish(byteArray){preFinish?.();if(!dontCreateFile){FS_createDataFile(parent,name,byteArray,canRead,canWrite,canOwn);}onload?.();removeRunDependency();}if(FS_handledByPreloadPlugin(byteArray,fullname,finish,()=>{onerror?.();removeRunDependency();})){return}finish(byteArray);}addRunDependency();if(typeof url=="string"){asyncLoad(url,processData,onerror);}else {processData(url);}};var FS_modeStringToFlags=str=>{var flagModes={r:0,"r+":2,w:512|64|1,"w+":512|64|2,a:1024|64|1,"a+":1024|64|2};var flags=flagModes[str];if(typeof flags=="undefined"){throw new Error(`Unknown file open mode: ${str}`)}return flags};var FS_getMode=(canRead,canWrite)=>{var mode=0;if(canRead)mode|=292|73;if(canWrite)mode|=146;return mode};var FS={root:null,mounts:[],devices:{},streams:[],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,ErrnoError:class{name="ErrnoError";constructor(errno){this.errno=errno;}},genericErrors:{},filesystems:null,syncFSRequests:0,readFiles:{},FSStream:class{shared={};get object(){return this.node}set object(val){this.node=val;}get isRead(){return (this.flags&2097155)!==1}get isWrite(){return (this.flags&2097155)!==0}get isAppend(){return this.flags&1024}get flags(){return this.shared.flags}set flags(val){this.shared.flags=val;}get position(){return this.shared.position}set position(val){this.shared.position=val;}},FSNode:class{node_ops={};stream_ops={};readMode=292|73;writeMode=146;mounted=null;constructor(parent,name,mode,rdev){if(!parent){parent=this;}this.parent=parent;this.mount=parent.mount;this.id=FS.nextInode++;this.name=name;this.mode=mode;this.rdev=rdev;}get read(){return (this.mode&this.readMode)===this.readMode}set read(val){val?this.mode|=this.readMode:this.mode&=~this.readMode;}get write(){return (this.mode&this.writeMode)===this.writeMode}set write(val){val?this.mode|=this.writeMode:this.mode&=~this.writeMode;}get isFolder(){return FS.isDir(this.mode)}get isDevice(){return FS.isChrdev(this.mode)}},lookupPath(path,opts={}){path=PATH_FS.resolve(path);if(!path)return {path:"",node:null};var defaults={follow_mount:true,recurse_count:0};opts=Object.assign(defaults,opts);if(opts.recurse_count>8){throw new FS.ErrnoError(32)}var parts=path.split("/").filter(p=>!!p);var current=FS.root;var current_path="/";for(var i=0;i<parts.length;i++){var islast=i===parts.length-1;if(islast&&opts.parent){break}current=FS.lookupNode(current,parts[i]);current_path=PATH.join2(current_path,parts[i]);if(FS.isMountpoint(current)){if(!islast||islast&&opts.follow_mount){current=current.mounted.root;}}if(!islast||opts.follow){var count=0;while(FS.isLink(current.mode)){var link=FS.readlink(current_path);current_path=PATH_FS.resolve(PATH.dirname(current_path),link);var lookup=FS.lookupPath(current_path,{recurse_count:opts.recurse_count+1});current=lookup.node;if(count++>40){throw new FS.ErrnoError(32)}}}}return {path:current_path,node:current}},getPath(node){var path;while(true){if(FS.isRoot(node)){var mount=node.mount.mountpoint;if(!path)return mount;return mount[mount.length-1]!=="/"?`${mount}/${path}`:mount+path}path=path?`${node.name}/${path}`:node.name;node=node.parent;}},hashName(parentid,name){var hash=0;for(var i=0;i<name.length;i++){hash=(hash<<5)-hash+name.charCodeAt(i)|0;}return (parentid+hash>>>0)%FS.nameTable.length},hashAddNode(node){var hash=FS.hashName(node.parent.id,node.name);node.name_next=FS.nameTable[hash];FS.nameTable[hash]=node;},hashRemoveNode(node){var hash=FS.hashName(node.parent.id,node.name);if(FS.nameTable[hash]===node){FS.nameTable[hash]=node.name_next;}else {var current=FS.nameTable[hash];while(current){if(current.name_next===node){current.name_next=node.name_next;break}current=current.name_next;}}},lookupNode(parent,name){var errCode=FS.mayLookup(parent);if(errCode){throw new FS.ErrnoError(errCode)}var hash=FS.hashName(parent.id,name);for(var node=FS.nameTable[hash];node;node=node.name_next){var nodeName=node.name;if(node.parent.id===parent.id&&nodeName===name){return node}}return FS.lookup(parent,name)},createNode(parent,name,mode,rdev){var node=new FS.FSNode(parent,name,mode,rdev);FS.hashAddNode(node);return node},destroyNode(node){FS.hashRemoveNode(node);},isRoot(node){return node===node.parent},isMountpoint(node){return !!node.mounted},isFile(mode){return (mode&61440)===32768},isDir(mode){return (mode&61440)===16384},isLink(mode){return (mode&61440)===40960},isChrdev(mode){return (mode&61440)===8192},isBlkdev(mode){return (mode&61440)===24576},isFIFO(mode){return (mode&61440)===4096},isSocket(mode){return (mode&49152)===49152},flagsToPermissionString(flag){var perms=["r","w","rw"][flag&3];if(flag&512){perms+="w";}return perms},nodePermissions(node,perms){if(FS.ignorePermissions){return 0}if(perms.includes("r")&&!(node.mode&292)){return 2}else if(perms.includes("w")&&!(node.mode&146)){return 2}else if(perms.includes("x")&&!(node.mode&73)){return 2}return 0},mayLookup(dir){if(!FS.isDir(dir.mode))return 54;var errCode=FS.nodePermissions(dir,"x");if(errCode)return errCode;if(!dir.node_ops.lookup)return 2;return 0},mayCreate(dir,name){try{var node=FS.lookupNode(dir,name);return 20}catch(e){}return FS.nodePermissions(dir,"wx")},mayDelete(dir,name,isdir){var node;try{node=FS.lookupNode(dir,name);}catch(e){return e.errno}var errCode=FS.nodePermissions(dir,"wx");if(errCode){return errCode}if(isdir){if(!FS.isDir(node.mode)){return 54}if(FS.isRoot(node)||FS.getPath(node)===FS.cwd()){return 10}}else {if(FS.isDir(node.mode)){return 31}}return 0},mayOpen(node,flags){if(!node){return 44}if(FS.isLink(node.mode)){return 32}else if(FS.isDir(node.mode)){if(FS.flagsToPermissionString(flags)!=="r"||flags&512){return 31}}return FS.nodePermissions(node,FS.flagsToPermissionString(flags))},MAX_OPEN_FDS:4096,nextfd(){for(var fd=0;fd<=FS.MAX_OPEN_FDS;fd++){if(!FS.streams[fd]){return fd}}throw new FS.ErrnoError(33)},getStreamChecked(fd){var stream=FS.getStream(fd);if(!stream){throw new FS.ErrnoError(8)}return stream},getStream:fd=>FS.streams[fd],createStream(stream,fd=-1){stream=Object.assign(new FS.FSStream,stream);if(fd==-1){fd=FS.nextfd();}stream.fd=fd;FS.streams[fd]=stream;return stream},closeStream(fd){FS.streams[fd]=null;},dupStream(origStream,fd=-1){var stream=FS.createStream(origStream,fd);stream.stream_ops?.dup?.(stream);return stream},chrdev_stream_ops:{open(stream){var device=FS.getDevice(stream.node.rdev);stream.stream_ops=device.stream_ops;stream.stream_ops.open?.(stream);},llseek(){throw new FS.ErrnoError(70)}},major:dev=>dev>>8,minor:dev=>dev&255,makedev:(ma,mi)=>ma<<8|mi,registerDevice(dev,ops){FS.devices[dev]={stream_ops:ops};},getDevice:dev=>FS.devices[dev],getMounts(mount){var mounts=[];var check=[mount];while(check.length){var m=check.pop();mounts.push(m);check.push(...m.mounts);}return mounts},syncfs(populate,callback){if(typeof populate=="function"){callback=populate;populate=false;}FS.syncFSRequests++;if(FS.syncFSRequests>1){err(`warning: ${FS.syncFSRequests} FS.syncfs operations in flight at once, probably just doing extra work`);}var mounts=FS.getMounts(FS.root.mount);var completed=0;function doCallback(errCode){FS.syncFSRequests--;return callback(errCode)}function done(errCode){if(errCode){if(!done.errored){done.errored=true;return doCallback(errCode)}return}if(++completed>=mounts.length){doCallback(null);}}mounts.forEach(mount=>{if(!mount.type.syncfs){return done(null)}mount.type.syncfs(mount,populate,done);});},mount(type,opts,mountpoint){var root=mountpoint==="/";var pseudo=!mountpoint;var node;if(root&&FS.root){throw new FS.ErrnoError(10)}else if(!root&&!pseudo){var lookup=FS.lookupPath(mountpoint,{follow_mount:false});mountpoint=lookup.path;node=lookup.node;if(FS.isMountpoint(node)){throw new FS.ErrnoError(10)}if(!FS.isDir(node.mode)){throw new FS.ErrnoError(54)}}var mount={type,opts,mountpoint,mounts:[]};var mountRoot=type.mount(mount);mountRoot.mount=mount;mount.root=mountRoot;if(root){FS.root=mountRoot;}else if(node){node.mounted=mount;if(node.mount){node.mount.mounts.push(mount);}}return mountRoot},unmount(mountpoint){var lookup=FS.lookupPath(mountpoint,{follow_mount:false});if(!FS.isMountpoint(lookup.node)){throw new FS.ErrnoError(28)}var node=lookup.node;var mount=node.mounted;var mounts=FS.getMounts(mount);Object.keys(FS.nameTable).forEach(hash=>{var current=FS.nameTable[hash];while(current){var next=current.name_next;if(mounts.includes(current.mount)){FS.destroyNode(current);}current=next;}});node.mounted=null;var idx=node.mount.mounts.indexOf(mount);node.mount.mounts.splice(idx,1);},lookup(parent,name){return parent.node_ops.lookup(parent,name)},mknod(path,mode,dev){var lookup=FS.lookupPath(path,{parent:true});var parent=lookup.node;var name=PATH.basename(path);if(!name||name==="."||name===".."){throw new FS.ErrnoError(28)}var errCode=FS.mayCreate(parent,name);if(errCode){throw new FS.ErrnoError(errCode)}if(!parent.node_ops.mknod){throw new FS.ErrnoError(63)}return parent.node_ops.mknod(parent,name,mode,dev)},create(path,mode){mode=mode!==undefined?mode:438;mode&=4095;mode|=32768;return FS.mknod(path,mode,0)},mkdir(path,mode){mode=mode!==undefined?mode:511;mode&=511|512;mode|=16384;return FS.mknod(path,mode,0)},mkdirTree(path,mode){var dirs=path.split("/");var d="";for(var i=0;i<dirs.length;++i){if(!dirs[i])continue;d+="/"+dirs[i];try{FS.mkdir(d,mode);}catch(e){if(e.errno!=20)throw e}}},mkdev(path,mode,dev){if(typeof dev=="undefined"){dev=mode;mode=438;}mode|=8192;return FS.mknod(path,mode,dev)},symlink(oldpath,newpath){if(!PATH_FS.resolve(oldpath)){throw new FS.ErrnoError(44)}var lookup=FS.lookupPath(newpath,{parent:true});var parent=lookup.node;if(!parent){throw new FS.ErrnoError(44)}var newname=PATH.basename(newpath);var errCode=FS.mayCreate(parent,newname);if(errCode){throw new FS.ErrnoError(errCode)}if(!parent.node_ops.symlink){throw new FS.ErrnoError(63)}return parent.node_ops.symlink(parent,newname,oldpath)},rename(old_path,new_path){var old_dirname=PATH.dirname(old_path);var new_dirname=PATH.dirname(new_path);var old_name=PATH.basename(old_path);var new_name=PATH.basename(new_path);var lookup,old_dir,new_dir;lookup=FS.lookupPath(old_path,{parent:true});old_dir=lookup.node;lookup=FS.lookupPath(new_path,{parent:true});new_dir=lookup.node;if(!old_dir||!new_dir)throw new FS.ErrnoError(44);if(old_dir.mount!==new_dir.mount){throw new FS.ErrnoError(75)}var old_node=FS.lookupNode(old_dir,old_name);var relative=PATH_FS.relative(old_path,new_dirname);if(relative.charAt(0)!=="."){throw new FS.ErrnoError(28)}relative=PATH_FS.relative(new_path,old_dirname);if(relative.charAt(0)!=="."){throw new FS.ErrnoError(55)}var new_node;try{new_node=FS.lookupNode(new_dir,new_name);}catch(e){}if(old_node===new_node){return}var isdir=FS.isDir(old_node.mode);var errCode=FS.mayDelete(old_dir,old_name,isdir);if(errCode){throw new FS.ErrnoError(errCode)}errCode=new_node?FS.mayDelete(new_dir,new_name,isdir):FS.mayCreate(new_dir,new_name);if(errCode){throw new FS.ErrnoError(errCode)}if(!old_dir.node_ops.rename){throw new FS.ErrnoError(63)}if(FS.isMountpoint(old_node)||new_node&&FS.isMountpoint(new_node)){throw new FS.ErrnoError(10)}if(new_dir!==old_dir){errCode=FS.nodePermissions(old_dir,"w");if(errCode){throw new FS.ErrnoError(errCode)}}FS.hashRemoveNode(old_node);try{old_dir.node_ops.rename(old_node,new_dir,new_name);old_node.parent=new_dir;}catch(e){throw e}finally{FS.hashAddNode(old_node);}},rmdir(path){var lookup=FS.lookupPath(path,{parent:true});var parent=lookup.node;var name=PATH.basename(path);var node=FS.lookupNode(parent,name);var errCode=FS.mayDelete(parent,name,true);if(errCode){throw new FS.ErrnoError(errCode)}if(!parent.node_ops.rmdir){throw new FS.ErrnoError(63)}if(FS.isMountpoint(node)){throw new FS.ErrnoError(10)}parent.node_ops.rmdir(parent,name);FS.destroyNode(node);},readdir(path){var lookup=FS.lookupPath(path,{follow:true});var node=lookup.node;if(!node.node_ops.readdir){throw new FS.ErrnoError(54)}return node.node_ops.readdir(node)},unlink(path){var lookup=FS.lookupPath(path,{parent:true});var parent=lookup.node;if(!parent){throw new FS.ErrnoError(44)}var name=PATH.basename(path);var node=FS.lookupNode(parent,name);var errCode=FS.mayDelete(parent,name,false);if(errCode){throw new FS.ErrnoError(errCode)}if(!parent.node_ops.unlink){throw new FS.ErrnoError(63)}if(FS.isMountpoint(node)){throw new FS.ErrnoError(10)}parent.node_ops.unlink(parent,name);FS.destroyNode(node);},readlink(path){var lookup=FS.lookupPath(path);var link=lookup.node;if(!link){throw new FS.ErrnoError(44)}if(!link.node_ops.readlink){throw new FS.ErrnoError(28)}return PATH_FS.resolve(FS.getPath(link.parent),link.node_ops.readlink(link))},stat(path,dontFollow){var lookup=FS.lookupPath(path,{follow:!dontFollow});var node=lookup.node;if(!node){throw new FS.ErrnoError(44)}if(!node.node_ops.getattr){throw new FS.ErrnoError(63)}return node.node_ops.getattr(node)},lstat(path){return FS.stat(path,true)},chmod(path,mode,dontFollow){var node;if(typeof path=="string"){var lookup=FS.lookupPath(path,{follow:!dontFollow});node=lookup.node;}else {node=path;}if(!node.node_ops.setattr){throw new FS.ErrnoError(63)}node.node_ops.setattr(node,{mode:mode&4095|node.mode&~4095,timestamp:Date.now()});},lchmod(path,mode){FS.chmod(path,mode,true);},fchmod(fd,mode){var stream=FS.getStreamChecked(fd);FS.chmod(stream.node,mode);},chown(path,uid,gid,dontFollow){var node;if(typeof path=="string"){var lookup=FS.lookupPath(path,{follow:!dontFollow});node=lookup.node;}else {node=path;}if(!node.node_ops.setattr){throw new FS.ErrnoError(63)}node.node_ops.setattr(node,{timestamp:Date.now()});},lchown(path,uid,gid){FS.chown(path,uid,gid,true);},fchown(fd,uid,gid){var stream=FS.getStreamChecked(fd);FS.chown(stream.node,uid,gid);},truncate(path,len){if(len<0){throw new FS.ErrnoError(28)}var node;if(typeof path=="string"){var lookup=FS.lookupPath(path,{follow:true});node=lookup.node;}else {node=path;}if(!node.node_ops.setattr){throw new FS.ErrnoError(63)}if(FS.isDir(node.mode)){throw new FS.ErrnoError(31)}if(!FS.isFile(node.mode)){throw new FS.ErrnoError(28)}var errCode=FS.nodePermissions(node,"w");if(errCode){throw new FS.ErrnoError(errCode)}node.node_ops.setattr(node,{size:len,timestamp:Date.now()});},ftruncate(fd,len){var stream=FS.getStreamChecked(fd);if((stream.flags&2097155)===0){throw new FS.ErrnoError(28)}FS.truncate(stream.node,len);},utime(path,atime,mtime){var lookup=FS.lookupPath(path,{follow:true});var node=lookup.node;node.node_ops.setattr(node,{timestamp:Math.max(atime,mtime)});},open(path,flags,mode){if(path===""){throw new FS.ErrnoError(44)}flags=typeof flags=="string"?FS_modeStringToFlags(flags):flags;if(flags&64){mode=typeof mode=="undefined"?438:mode;mode=mode&4095|32768;}else {mode=0;}var node;if(typeof path=="object"){node=path;}else {path=PATH.normalize(path);try{var lookup=FS.lookupPath(path,{follow:!(flags&131072)});node=lookup.node;}catch(e){}}var created=false;if(flags&64){if(node){if(flags&128){throw new FS.ErrnoError(20)}}else {node=FS.mknod(path,mode,0);created=true;}}if(!node){throw new FS.ErrnoError(44)}if(FS.isChrdev(node.mode)){flags&=~512;}if(flags&65536&&!FS.isDir(node.mode)){throw new FS.ErrnoError(54)}if(!created){var errCode=FS.mayOpen(node,flags);if(errCode){throw new FS.ErrnoError(errCode)}}if(flags&512&&!created){FS.truncate(node,0);}flags&=~(128|512|131072);var stream=FS.createStream({node,path:FS.getPath(node),flags,seekable:true,position:0,stream_ops:node.stream_ops,ungotten:[],error:false});if(stream.stream_ops.open){stream.stream_ops.open(stream);}if(Module["logReadFiles"]&&!(flags&1)){if(!(path in FS.readFiles)){FS.readFiles[path]=1;}}return stream},close(stream){if(FS.isClosed(stream)){throw new FS.ErrnoError(8)}if(stream.getdents)stream.getdents=null;try{if(stream.stream_ops.close){stream.stream_ops.close(stream);}}catch(e){throw e}finally{FS.closeStream(stream.fd);}stream.fd=null;},isClosed(stream){return stream.fd===null},llseek(stream,offset,whence){if(FS.isClosed(stream)){throw new FS.ErrnoError(8)}if(!stream.seekable||!stream.stream_ops.llseek){throw new FS.ErrnoError(70)}if(whence!=0&&whence!=1&&whence!=2){throw new FS.ErrnoError(28)}stream.position=stream.stream_ops.llseek(stream,offset,whence);stream.ungotten=[];return stream.position},read(stream,buffer,offset,length,position){if(length<0||position<0){throw new FS.ErrnoError(28)}if(FS.isClosed(stream)){throw new FS.ErrnoError(8)}if((stream.flags&2097155)===1){throw new FS.ErrnoError(8)}if(FS.isDir(stream.node.mode)){throw new FS.ErrnoError(31)}if(!stream.stream_ops.read){throw new FS.ErrnoError(28)}var seeking=typeof position!="undefined";if(!seeking){position=stream.position;}else if(!stream.seekable){throw new FS.ErrnoError(70)}var bytesRead=stream.stream_ops.read(stream,buffer,offset,length,position);if(!seeking)stream.position+=bytesRead;return bytesRead},write(stream,buffer,offset,length,position,canOwn){if(length<0||position<0){throw new FS.ErrnoError(28)}if(FS.isClosed(stream)){throw new FS.ErrnoError(8)}if((stream.flags&2097155)===0){throw new FS.ErrnoError(8)}if(FS.isDir(stream.node.mode)){throw new FS.ErrnoError(31)}if(!stream.stream_ops.write){throw new FS.ErrnoError(28)}if(stream.seekable&&stream.flags&1024){FS.llseek(stream,0,2);}var seeking=typeof position!="undefined";if(!seeking){position=stream.position;}else if(!stream.seekable){throw new FS.ErrnoError(70)}var bytesWritten=stream.stream_ops.write(stream,buffer,offset,length,position,canOwn);if(!seeking)stream.position+=bytesWritten;return bytesWritten},allocate(stream,offset,length){if(FS.isClosed(stream)){throw new FS.ErrnoError(8)}if(offset<0||length<=0){throw new FS.ErrnoError(28)}if((stream.flags&2097155)===0){throw new FS.ErrnoError(8)}if(!FS.isFile(stream.node.mode)&&!FS.isDir(stream.node.mode)){throw new FS.ErrnoError(43)}if(!stream.stream_ops.allocate){throw new FS.ErrnoError(138)}stream.stream_ops.allocate(stream,offset,length);},mmap(stream,length,position,prot,flags){if((prot&2)!==0&&(flags&2)===0&&(stream.flags&2097155)!==2){throw new FS.ErrnoError(2)}if((stream.flags&2097155)===1){throw new FS.ErrnoError(2)}if(!stream.stream_ops.mmap){throw new FS.ErrnoError(43)}if(!length){throw new FS.ErrnoError(28)}return stream.stream_ops.mmap(stream,length,position,prot,flags)},msync(stream,buffer,offset,length,mmapFlags){if(!stream.stream_ops.msync){return 0}return stream.stream_ops.msync(stream,buffer,offset,length,mmapFlags)},ioctl(stream,cmd,arg){if(!stream.stream_ops.ioctl){throw new FS.ErrnoError(59)}return stream.stream_ops.ioctl(stream,cmd,arg)},readFile(path,opts={}){opts.flags=opts.flags||0;opts.encoding=opts.encoding||"binary";if(opts.encoding!=="utf8"&&opts.encoding!=="binary"){throw new Error(`Invalid encoding type "${opts.encoding}"`)}var ret;var stream=FS.open(path,opts.flags);var stat=FS.stat(path);var length=stat.size;var buf=new Uint8Array(length);FS.read(stream,buf,0,length,0);if(opts.encoding==="utf8"){ret=UTF8ArrayToString(buf);}else if(opts.encoding==="binary"){ret=buf;}FS.close(stream);return ret},writeFile(path,data,opts={}){opts.flags=opts.flags||577;var stream=FS.open(path,opts.flags,opts.mode);if(typeof data=="string"){var buf=new Uint8Array(lengthBytesUTF8(data)+1);var actualNumBytes=stringToUTF8Array(data,buf,0,buf.length);FS.write(stream,buf,0,actualNumBytes,undefined,opts.canOwn);}else if(ArrayBuffer.isView(data)){FS.write(stream,data,0,data.byteLength,undefined,opts.canOwn);}else {throw new Error("Unsupported data type")}FS.close(stream);},cwd:()=>FS.currentPath,chdir(path){var lookup=FS.lookupPath(path,{follow:true});if(lookup.node===null){throw new FS.ErrnoError(44)}if(!FS.isDir(lookup.node.mode)){throw new FS.ErrnoError(54)}var errCode=FS.nodePermissions(lookup.node,"x");if(errCode){throw new FS.ErrnoError(errCode)}FS.currentPath=lookup.path;},createDefaultDirectories(){FS.mkdir("/tmp");FS.mkdir("/home");FS.mkdir("/home/web_user");},createDefaultDevices(){FS.mkdir("/dev");FS.registerDevice(FS.makedev(1,3),{read:()=>0,write:(stream,buffer,offset,length,pos)=>length});FS.mkdev("/dev/null",FS.makedev(1,3));TTY.register(FS.makedev(5,0),TTY.default_tty_ops);TTY.register(FS.makedev(6,0),TTY.default_tty1_ops);FS.mkdev("/dev/tty",FS.makedev(5,0));FS.mkdev("/dev/tty1",FS.makedev(6,0));var randomBuffer=new Uint8Array(1024),randomLeft=0;var randomByte=()=>{if(randomLeft===0){randomLeft=randomFill(randomBuffer).byteLength;}return randomBuffer[--randomLeft]};FS.createDevice("/dev","random",randomByte);FS.createDevice("/dev","urandom",randomByte);FS.mkdir("/dev/shm");FS.mkdir("/dev/shm/tmp");},createSpecialDirectories(){FS.mkdir("/proc");var proc_self=FS.mkdir("/proc/self");FS.mkdir("/proc/self/fd");FS.mount({mount(){var node=FS.createNode(proc_self,"fd",16384|511,73);node.node_ops={lookup(parent,name){var fd=+name;var stream=FS.getStreamChecked(fd);var ret={parent:null,mount:{mountpoint:"fake"},node_ops:{readlink:()=>stream.path}};ret.parent=ret;return ret}};return node}},{},"/proc/self/fd");},createStandardStreams(input,output,error){if(input){FS.createDevice("/dev","stdin",input);}else {FS.symlink("/dev/tty","/dev/stdin");}if(output){FS.createDevice("/dev","stdout",null,output);}else {FS.symlink("/dev/tty","/dev/stdout");}if(error){FS.createDevice("/dev","stderr",null,error);}else {FS.symlink("/dev/tty1","/dev/stderr");}FS.open("/dev/stdin",0);FS.open("/dev/stdout",1);FS.open("/dev/stderr",1);},staticInit(){[44].forEach(code=>{FS.genericErrors[code]=new FS.ErrnoError(code);FS.genericErrors[code].stack="<generic error, no stack>";});FS.nameTable=new Array(4096);FS.mount(MEMFS,{},"/");FS.createDefaultDirectories();FS.createDefaultDevices();FS.createSpecialDirectories();FS.filesystems={MEMFS};},init(input,output,error){FS.initialized=true;input??=Module["stdin"];output??=Module["stdout"];error??=Module["stderr"];FS.createStandardStreams(input,output,error);},quit(){FS.initialized=false;for(var i=0;i<FS.streams.length;i++){var stream=FS.streams[i];if(!stream){continue}FS.close(stream);}},findObject(path,dontResolveLastLink){var ret=FS.analyzePath(path,dontResolveLastLink);if(!ret.exists){return null}return ret.object},analyzePath(path,dontResolveLastLink){try{var lookup=FS.lookupPath(path,{follow:!dontResolveLastLink});path=lookup.path;}catch(e){}var ret={isRoot:false,exists:false,error:0,name:null,path:null,object:null,parentExists:false,parentPath:null,parentObject:null};try{var lookup=FS.lookupPath(path,{parent:true});ret.parentExists=true;ret.parentPath=lookup.path;ret.parentObject=lookup.node;ret.name=PATH.basename(path);lookup=FS.lookupPath(path,{follow:!dontResolveLastLink});ret.exists=true;ret.path=lookup.path;ret.object=lookup.node;ret.name=lookup.node.name;ret.isRoot=lookup.path==="/";}catch(e){ret.error=e.errno;}return ret},createPath(parent,path,canRead,canWrite){parent=typeof parent=="string"?parent:FS.getPath(parent);var parts=path.split("/").reverse();while(parts.length){var part=parts.pop();if(!part)continue;var current=PATH.join2(parent,part);try{FS.mkdir(current);}catch(e){}parent=current;}return current},createFile(parent,name,properties,canRead,canWrite){var path=PATH.join2(typeof parent=="string"?parent:FS.getPath(parent),name);var mode=FS_getMode(canRead,canWrite);return FS.create(path,mode)},createDataFile(parent,name,data,canRead,canWrite,canOwn){var path=name;if(parent){parent=typeof parent=="string"?parent:FS.getPath(parent);path=name?PATH.join2(parent,name):parent;}var mode=FS_getMode(canRead,canWrite);var node=FS.create(path,mode);if(data){if(typeof data=="string"){var arr=new Array(data.length);for(var i=0,len=data.length;i<len;++i)arr[i]=data.charCodeAt(i);data=arr;}FS.chmod(node,mode|146);var stream=FS.open(node,577);FS.write(stream,data,0,data.length,0,canOwn);FS.close(stream);FS.chmod(node,mode);}},createDevice(parent,name,input,output){var path=PATH.join2(typeof parent=="string"?parent:FS.getPath(parent),name);var mode=FS_getMode(!!input,!!output);FS.createDevice.major??=64;var dev=FS.makedev(FS.createDevice.major++,0);FS.registerDevice(dev,{open(stream){stream.seekable=false;},close(stream){if(output?.buffer?.length){output(10);}},read(stream,buffer,offset,length,pos){var bytesRead=0;for(var i=0;i<length;i++){var result;try{result=input();}catch(e){throw new FS.ErrnoError(29)}if(result===undefined&&bytesRead===0){throw new FS.ErrnoError(6)}if(result===null||result===undefined)break;bytesRead++;buffer[offset+i]=result;}if(bytesRead){stream.node.timestamp=Date.now();}return bytesRead},write(stream,buffer,offset,length,pos){for(var i=0;i<length;i++){try{output(buffer[offset+i]);}catch(e){throw new FS.ErrnoError(29)}}if(length){stream.node.timestamp=Date.now();}return i}});return FS.mkdev(path,mode,dev)},forceLoadFile(obj){if(obj.isDevice||obj.isFolder||obj.link||obj.contents)return true;if(typeof XMLHttpRequest!="undefined"){throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.")}else {try{obj.contents=readBinary(obj.url);obj.usedBytes=obj.contents.length;}catch(e){throw new FS.ErrnoError(29)}}},createLazyFile(parent,name,url,canRead,canWrite){class LazyUint8Array{lengthKnown=false;chunks=[];get(idx){if(idx>this.length-1||idx<0){return undefined}var chunkOffset=idx%this.chunkSize;var chunkNum=idx/this.chunkSize|0;return this.getter(chunkNum)[chunkOffset]}setDataGetter(getter){this.getter=getter;}cacheLength(){var xhr=new XMLHttpRequest;xhr.open("HEAD",url,false);xhr.send(null);if(!(xhr.status>=200&&xhr.status<300||xhr.status===304))throw new Error("Couldn't load "+url+". Status: "+xhr.status);var datalength=Number(xhr.getResponseHeader("Content-length"));var header;var hasByteServing=(header=xhr.getResponseHeader("Accept-Ranges"))&&header==="bytes";var usesGzip=(header=xhr.getResponseHeader("Content-Encoding"))&&header==="gzip";var chunkSize=1024*1024;if(!hasByteServing)chunkSize=datalength;var doXHR=(from,to)=>{if(from>to)throw new Error("invalid range ("+from+", "+to+") or no bytes requested!");if(to>datalength-1)throw new Error("only "+datalength+" bytes available! programmer error!");var xhr=new XMLHttpRequest;xhr.open("GET",url,false);if(datalength!==chunkSize)xhr.setRequestHeader("Range","bytes="+from+"-"+to);xhr.responseType="arraybuffer";if(xhr.overrideMimeType){xhr.overrideMimeType("text/plain; charset=x-user-defined");}xhr.send(null);if(!(xhr.status>=200&&xhr.status<300||xhr.status===304))throw new Error("Couldn't load "+url+". Status: "+xhr.status);if(xhr.response!==undefined){return new Uint8Array(xhr.response||[])}return intArrayFromString(xhr.responseText||"",true)};var lazyArray=this;lazyArray.setDataGetter(chunkNum=>{var start=chunkNum*chunkSize;var end=(chunkNum+1)*chunkSize-1;end=Math.min(end,datalength-1);if(typeof lazyArray.chunks[chunkNum]=="undefined"){lazyArray.chunks[chunkNum]=doXHR(start,end);}if(typeof lazyArray.chunks[chunkNum]=="undefined")throw new Error("doXHR failed!");return lazyArray.chunks[chunkNum]});if(usesGzip||!datalength){chunkSize=datalength=1;datalength=this.getter(0).length;chunkSize=datalength;out("LazyFiles on gzip forces download of the whole file when length is accessed");}this._length=datalength;this._chunkSize=chunkSize;this.lengthKnown=true;}get length(){if(!this.lengthKnown){this.cacheLength();}return this._length}get chunkSize(){if(!this.lengthKnown){this.cacheLength();}return this._chunkSize}}if(typeof XMLHttpRequest!="undefined"){if(!ENVIRONMENT_IS_WORKER)throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";var lazyArray=new LazyUint8Array;var properties={isDevice:false,contents:lazyArray};}else {var properties={isDevice:false,url};}var node=FS.createFile(parent,name,properties,canRead,canWrite);if(properties.contents){node.contents=properties.contents;}else if(properties.url){node.contents=null;node.url=properties.url;}Object.defineProperties(node,{usedBytes:{get:function(){return this.contents.length}}});var stream_ops={};var keys=Object.keys(node.stream_ops);keys.forEach(key=>{var fn=node.stream_ops[key];stream_ops[key]=(...args)=>{FS.forceLoadFile(node);return fn(...args)};});function writeChunks(stream,buffer,offset,length,position){var contents=stream.node.contents;if(position>=contents.length)return 0;var size=Math.min(contents.length-position,length);if(contents.slice){for(var i=0;i<size;i++){buffer[offset+i]=contents[position+i];}}else {for(var i=0;i<size;i++){buffer[offset+i]=contents.get(position+i);}}return size}stream_ops.read=(stream,buffer,offset,length,position)=>{FS.forceLoadFile(node);return writeChunks(stream,buffer,offset,length,position)};stream_ops.mmap=(stream,length,position,prot,flags)=>{FS.forceLoadFile(node);var ptr=mmapAlloc();if(!ptr){throw new FS.ErrnoError(48)}writeChunks(stream,HEAP8,ptr,length,position);return {ptr,allocated:true}};node.stream_ops=stream_ops;return node}};var SYSCALLS={DEFAULT_POLLMASK:5,calculateAt(dirfd,path,allowEmpty){if(PATH.isAbs(path)){return path}var dir;if(dirfd===-100){dir=FS.cwd();}else {var dirstream=SYSCALLS.getStreamFromFD(dirfd);dir=dirstream.path;}if(path.length==0){if(!allowEmpty){throw new FS.ErrnoError(44)}return dir}return PATH.join2(dir,path)},doStat(func,path,buf){var stat=func(path);HEAP32[buf>>>2>>>0]=stat.dev;HEAP32[buf+4>>>2>>>0]=stat.mode;HEAPU32[buf+8>>>2>>>0]=stat.nlink;HEAP32[buf+12>>>2>>>0]=stat.uid;HEAP32[buf+16>>>2>>>0]=stat.gid;HEAP32[buf+20>>>2>>>0]=stat.rdev;tempI64=[stat.size>>>0,(tempDouble=stat.size,+Math.abs(tempDouble)>=1?tempDouble>0?+Math.floor(tempDouble/4294967296)>>>0:~~+Math.ceil((tempDouble-+(~~tempDouble>>>0))/4294967296)>>>0:0)],HEAP32[buf+24>>>2>>>0]=tempI64[0],HEAP32[buf+28>>>2>>>0]=tempI64[1];HEAP32[buf+32>>>2>>>0]=4096;HEAP32[buf+36>>>2>>>0]=stat.blocks;var atime=stat.atime.getTime();var mtime=stat.mtime.getTime();var ctime=stat.ctime.getTime();tempI64=[Math.floor(atime/1e3)>>>0,(tempDouble=Math.floor(atime/1e3),+Math.abs(tempDouble)>=1?tempDouble>0?+Math.floor(tempDouble/4294967296)>>>0:~~+Math.ceil((tempDouble-+(~~tempDouble>>>0))/4294967296)>>>0:0)],HEAP32[buf+40>>>2>>>0]=tempI64[0],HEAP32[buf+44>>>2>>>0]=tempI64[1];HEAPU32[buf+48>>>2>>>0]=atime%1e3*1e3*1e3;tempI64=[Math.floor(mtime/1e3)>>>0,(tempDouble=Math.floor(mtime/1e3),+Math.abs(tempDouble)>=1?tempDouble>0?+Math.floor(tempDouble/4294967296)>>>0:~~+Math.ceil((tempDouble-+(~~tempDouble>>>0))/4294967296)>>>0:0)],HEAP32[buf+56>>>2>>>0]=tempI64[0],HEAP32[buf+60>>>2>>>0]=tempI64[1];HEAPU32[buf+64>>>2>>>0]=mtime%1e3*1e3*1e3;tempI64=[Math.floor(ctime/1e3)>>>0,(tempDouble=Math.floor(ctime/1e3),+Math.abs(tempDouble)>=1?tempDouble>0?+Math.floor(tempDouble/4294967296)>>>0:~~+Math.ceil((tempDouble-+(~~tempDouble>>>0))/4294967296)>>>0:0)],HEAP32[buf+72>>>2>>>0]=tempI64[0],HEAP32[buf+76>>>2>>>0]=tempI64[1];HEAPU32[buf+80>>>2>>>0]=ctime%1e3*1e3*1e3;tempI64=[stat.ino>>>0,(tempDouble=stat.ino,+Math.abs(tempDouble)>=1?tempDouble>0?+Math.floor(tempDouble/4294967296)>>>0:~~+Math.ceil((tempDouble-+(~~tempDouble>>>0))/4294967296)>>>0:0)],HEAP32[buf+88>>>2>>>0]=tempI64[0],HEAP32[buf+92>>>2>>>0]=tempI64[1];return 0},doMsync(addr,stream,len,flags,offset){if(!FS.isFile(stream.node.mode)){throw new FS.ErrnoError(43)}if(flags&2){return 0}var buffer=HEAPU8.slice(addr,addr+len);FS.msync(stream,buffer,offset,len,flags);},getStreamFromFD(fd){var stream=FS.getStreamChecked(fd);return stream},varargs:undefined,getStr(ptr){var ret=UTF8ToString(ptr);return ret}};function ___syscall_fcntl64(fd,cmd,varargs){varargs>>>=0;SYSCALLS.varargs=varargs;try{var stream=SYSCALLS.getStreamFromFD(fd);switch(cmd){case 0:{var arg=syscallGetVarargI();if(arg<0){return -28}while(FS.streams[arg]){arg++;}var newStream;newStream=FS.dupStream(stream,arg);return newStream.fd}case 1:case 2:return 0;case 3:return stream.flags;case 4:{var arg=syscallGetVarargI();stream.flags|=arg;return 0}case 12:{var arg=syscallGetVarargP();var offset=0;HEAP16[arg+offset>>>1>>>0]=2;return 0}case 13:case 14:return 0}return -28}catch(e){if(typeof FS=="undefined"||!(e.name==="ErrnoError"))throw e;return -e.errno}}function ___syscall_ioctl(fd,op,varargs){varargs>>>=0;SYSCALLS.varargs=varargs;try{var stream=SYSCALLS.getStreamFromFD(fd);switch(op){case 21509:{if(!stream.tty)return -59;return 0}case 21505:{if(!stream.tty)return -59;if(stream.tty.ops.ioctl_tcgets){var termios=stream.tty.ops.ioctl_tcgets(stream);var argp=syscallGetVarargP();HEAP32[argp>>>2>>>0]=termios.c_iflag||0;HEAP32[argp+4>>>2>>>0]=termios.c_oflag||0;HEAP32[argp+8>>>2>>>0]=termios.c_cflag||0;HEAP32[argp+12>>>2>>>0]=termios.c_lflag||0;for(var i=0;i<32;i++){HEAP8[argp+i+17>>>0]=termios.c_cc[i]||0;}return 0}return 0}case 21510:case 21511:case 21512:{if(!stream.tty)return -59;return 0}case 21506:case 21507:case 21508:{if(!stream.tty)return -59;if(stream.tty.ops.ioctl_tcsets){var argp=syscallGetVarargP();var c_iflag=HEAP32[argp>>>2>>>0];var c_oflag=HEAP32[argp+4>>>2>>>0];var c_cflag=HEAP32[argp+8>>>2>>>0];var c_lflag=HEAP32[argp+12>>>2>>>0];var c_cc=[];for(var i=0;i<32;i++){c_cc.push(HEAP8[argp+i+17>>>0]);}return stream.tty.ops.ioctl_tcsets(stream.tty,op,{c_iflag,c_oflag,c_cflag,c_lflag,c_cc})}return 0}case 21519:{if(!stream.tty)return -59;var argp=syscallGetVarargP();HEAP32[argp>>>2>>>0]=0;return 0}case 21520:{if(!stream.tty)return -59;return -28}case 21531:{var argp=syscallGetVarargP();return FS.ioctl(stream,op,argp)}case 21523:{if(!stream.tty)return -59;if(stream.tty.ops.ioctl_tiocgwinsz){var winsize=stream.tty.ops.ioctl_tiocgwinsz(stream.tty);var argp=syscallGetVarargP();HEAP16[argp>>>1>>>0]=winsize[0];HEAP16[argp+2>>>1>>>0]=winsize[1];}return 0}case 21524:{if(!stream.tty)return -59;return 0}case 21515:{if(!stream.tty)return -59;return 0}default:return -28}}catch(e){if(typeof FS=="undefined"||!(e.name==="ErrnoError"))throw e;return -e.errno}}function ___syscall_openat(dirfd,path,flags,varargs){path>>>=0;varargs>>>=0;SYSCALLS.varargs=varargs;try{path=SYSCALLS.getStr(path);path=SYSCALLS.calculateAt(dirfd,path);var mode=varargs?syscallGetVarargI():0;return FS.open(path,flags,mode).fd}catch(e){if(typeof FS=="undefined"||!(e.name==="ErrnoError"))throw e;return -e.errno}}var __abort_js=()=>{abort("");};function __embind_register_bigint(primitiveType,name,size,minRange,maxRange){}var embind_init_charCodes=()=>{var codes=new Array(256);for(var i=0;i<256;++i){codes[i]=String.fromCharCode(i);}embind_charCodes=codes;};var embind_charCodes;var readLatin1String=ptr=>{var ret="";var c=ptr;while(HEAPU8[c>>>0]){ret+=embind_charCodes[HEAPU8[c++>>>0]];}return ret};var awaitingDependencies={};var registeredTypes={};var typeDependencies={};var BindingError;var throwBindingError=message=>{throw new BindingError(message)};var InternalError;var throwInternalError=message=>{throw new InternalError(message)};var whenDependentTypesAreResolved=(myTypes,dependentTypes,getTypeConverters)=>{myTypes.forEach(type=>typeDependencies[type]=dependentTypes);function onComplete(typeConverters){var myTypeConverters=getTypeConverters(typeConverters);if(myTypeConverters.length!==myTypes.length){throwInternalError("Mismatched type converter count");}for(var i=0;i<myTypes.length;++i){registerType(myTypes[i],myTypeConverters[i]);}}var typeConverters=new Array(dependentTypes.length);var unregisteredTypes=[];var registered=0;dependentTypes.forEach((dt,i)=>{if(registeredTypes.hasOwnProperty(dt)){typeConverters[i]=registeredTypes[dt];}else {unregisteredTypes.push(dt);if(!awaitingDependencies.hasOwnProperty(dt)){awaitingDependencies[dt]=[];}awaitingDependencies[dt].push(()=>{typeConverters[i]=registeredTypes[dt];++registered;if(registered===unregisteredTypes.length){onComplete(typeConverters);}});}});if(0===unregisteredTypes.length){onComplete(typeConverters);}};function sharedRegisterType(rawType,registeredInstance,options={}){var name=registeredInstance.name;if(!rawType){throwBindingError(`type "${name}" must have a positive integer typeid pointer`);}if(registeredTypes.hasOwnProperty(rawType)){if(options.ignoreDuplicateRegistrations){return}else {throwBindingError(`Cannot register type '${name}' twice`);}}registeredTypes[rawType]=registeredInstance;delete typeDependencies[rawType];if(awaitingDependencies.hasOwnProperty(rawType)){var callbacks=awaitingDependencies[rawType];delete awaitingDependencies[rawType];callbacks.forEach(cb=>cb());}}function registerType(rawType,registeredInstance,options={}){return sharedRegisterType(rawType,registeredInstance,options)}var GenericWireTypeSize=8;function __embind_register_bool(rawType,name,trueValue,falseValue){rawType>>>=0;name>>>=0;name=readLatin1String(name);registerType(rawType,{name,fromWireType:function(wt){return !!wt},toWireType:function(destructors,o){return o?trueValue:falseValue},argPackAdvance:GenericWireTypeSize,readValueFromPointer:function(pointer){return this["fromWireType"](HEAPU8[pointer>>>0])},destructorFunction:null});}var shallowCopyInternalPointer=o=>({count:o.count,deleteScheduled:o.deleteScheduled,preservePointerOnDelete:o.preservePointerOnDelete,ptr:o.ptr,ptrType:o.ptrType,smartPtr:o.smartPtr,smartPtrType:o.smartPtrType});var throwInstanceAlreadyDeleted=obj=>{function getInstanceTypeName(handle){return handle.$$.ptrType.registeredClass.name}throwBindingError(getInstanceTypeName(obj)+" instance already deleted");};var finalizationRegistry=false;var detachFinalizer=handle=>{};var runDestructor=$$=>{if($$.smartPtr){$$.smartPtrType.rawDestructor($$.smartPtr);}else {$$.ptrType.registeredClass.rawDestructor($$.ptr);}};var releaseClassHandle=$$=>{$$.count.value-=1;var toDelete=0===$$.count.value;if(toDelete){runDestructor($$);}};var downcastPointer=(ptr,ptrClass,desiredClass)=>{if(ptrClass===desiredClass){return ptr}if(undefined===desiredClass.baseClass){return null}var rv=downcastPointer(ptr,ptrClass,desiredClass.baseClass);if(rv===null){return null}return desiredClass.downcast(rv)};var registeredPointers={};var registeredInstances={};var getBasestPointer=(class_,ptr)=>{if(ptr===undefined){throwBindingError("ptr should not be undefined");}while(class_.baseClass){ptr=class_.upcast(ptr);class_=class_.baseClass;}return ptr};var getInheritedInstance=(class_,ptr)=>{ptr=getBasestPointer(class_,ptr);return registeredInstances[ptr]};var makeClassHandle=(prototype,record)=>{if(!record.ptrType||!record.ptr){throwInternalError("makeClassHandle requires ptr and ptrType");}var hasSmartPtrType=!!record.smartPtrType;var hasSmartPtr=!!record.smartPtr;if(hasSmartPtrType!==hasSmartPtr){throwInternalError("Both smartPtrType and smartPtr must be specified");}record.count={value:1};return attachFinalizer(Object.create(prototype,{$$:{value:record,writable:true}}))};function RegisteredPointer_fromWireType(ptr){var rawPointer=this.getPointee(ptr);if(!rawPointer){this.destructor(ptr);return null}var registeredInstance=getInheritedInstance(this.registeredClass,rawPointer);if(undefined!==registeredInstance){if(0===registeredInstance.$$.count.value){registeredInstance.$$.ptr=rawPointer;registeredInstance.$$.smartPtr=ptr;return registeredInstance["clone"]()}else {var rv=registeredInstance["clone"]();this.destructor(ptr);return rv}}function makeDefaultHandle(){if(this.isSmartPointer){return makeClassHandle(this.registeredClass.instancePrototype,{ptrType:this.pointeeType,ptr:rawPointer,smartPtrType:this,smartPtr:ptr})}else {return makeClassHandle(this.registeredClass.instancePrototype,{ptrType:this,ptr})}}var actualType=this.registeredClass.getActualType(rawPointer);var registeredPointerRecord=registeredPointers[actualType];if(!registeredPointerRecord){return makeDefaultHandle.call(this)}var toType;if(this.isConst){toType=registeredPointerRecord.constPointerType;}else {toType=registeredPointerRecord.pointerType;}var dp=downcastPointer(rawPointer,this.registeredClass,toType.registeredClass);if(dp===null){return makeDefaultHandle.call(this)}if(this.isSmartPointer){return makeClassHandle(toType.registeredClass.instancePrototype,{ptrType:toType,ptr:dp,smartPtrType:this,smartPtr:ptr})}else {return makeClassHandle(toType.registeredClass.instancePrototype,{ptrType:toType,ptr:dp})}}var attachFinalizer=handle=>{if("undefined"===typeof FinalizationRegistry){attachFinalizer=handle=>handle;return handle}finalizationRegistry=new FinalizationRegistry(info=>{releaseClassHandle(info.$$);});attachFinalizer=handle=>{var $$=handle.$$;var hasSmartPtr=!!$$.smartPtr;if(hasSmartPtr){var info={$$};finalizationRegistry.register(handle,info,handle);}return handle};detachFinalizer=handle=>finalizationRegistry.unregister(handle);return attachFinalizer(handle)};var deletionQueue=[];var flushPendingDeletes=()=>{while(deletionQueue.length){var obj=deletionQueue.pop();obj.$$.deleteScheduled=false;obj["delete"]();}};var delayFunction;var init_ClassHandle=()=>{Object.assign(ClassHandle.prototype,{isAliasOf(other){if(!(this instanceof ClassHandle)){return false}if(!(other instanceof ClassHandle)){return false}var leftClass=this.$$.ptrType.registeredClass;var left=this.$$.ptr;other.$$=other.$$;var rightClass=other.$$.ptrType.registeredClass;var right=other.$$.ptr;while(leftClass.baseClass){left=leftClass.upcast(left);leftClass=leftClass.baseClass;}while(rightClass.baseClass){right=rightClass.upcast(right);rightClass=rightClass.baseClass;}return leftClass===rightClass&&left===right},clone(){if(!this.$$.ptr){throwInstanceAlreadyDeleted(this);}if(this.$$.preservePointerOnDelete){this.$$.count.value+=1;return this}else {var clone=attachFinalizer(Object.create(Object.getPrototypeOf(this),{$$:{value:shallowCopyInternalPointer(this.$$)}}));clone.$$.count.value+=1;clone.$$.deleteScheduled=false;return clone}},delete(){if(!this.$$.ptr){throwInstanceAlreadyDeleted(this);}if(this.$$.deleteScheduled&&!this.$$.preservePointerOnDelete){throwBindingError("Object already scheduled for deletion");}detachFinalizer(this);releaseClassHandle(this.$$);if(!this.$$.preservePointerOnDelete){this.$$.smartPtr=undefined;this.$$.ptr=undefined;}},isDeleted(){return !this.$$.ptr},deleteLater(){if(!this.$$.ptr){throwInstanceAlreadyDeleted(this);}if(this.$$.deleteScheduled&&!this.$$.preservePointerOnDelete){throwBindingError("Object already scheduled for deletion");}deletionQueue.push(this);if(deletionQueue.length===1&&delayFunction){delayFunction(flushPendingDeletes);}this.$$.deleteScheduled=true;return this}});};function ClassHandle(){}var createNamedFunction=(name,body)=>Object.defineProperty(body,"name",{value:name});var ensureOverloadTable=(proto,methodName,humanName)=>{if(undefined===proto[methodName].overloadTable){var prevFunc=proto[methodName];proto[methodName]=function(...args){if(!proto[methodName].overloadTable.hasOwnProperty(args.length)){throwBindingError(`Function '${humanName}' called with an invalid number of arguments (${args.length}) - expects one of (${proto[methodName].overloadTable})!`);}return proto[methodName].overloadTable[args.length].apply(this,args)};proto[methodName].overloadTable=[];proto[methodName].overloadTable[prevFunc.argCount]=prevFunc;}};var exposePublicSymbol=(name,value,numArguments)=>{if(Module.hasOwnProperty(name)){if(undefined===numArguments||undefined!==Module[name].overloadTable&&undefined!==Module[name].overloadTable[numArguments]){throwBindingError(`Cannot register public name '${name}' twice`);}ensureOverloadTable(Module,name,name);if(Module[name].overloadTable.hasOwnProperty(numArguments)){throwBindingError(`Cannot register multiple overloads of a function with the same number of arguments (${numArguments})!`);}Module[name].overloadTable[numArguments]=value;}else {Module[name]=value;Module[name].argCount=numArguments;}};var char_0=48;var char_9=57;var makeLegalFunctionName=name=>{name=name.replace(/[^a-zA-Z0-9_]/g,"$");var f=name.charCodeAt(0);if(f>=char_0&&f<=char_9){return `_${name}`}return name};function RegisteredClass(name,constructor,instancePrototype,rawDestructor,baseClass,getActualType,upcast,downcast){this.name=name;this.constructor=constructor;this.instancePrototype=instancePrototype;this.rawDestructor=rawDestructor;this.baseClass=baseClass;this.getActualType=getActualType;this.upcast=upcast;this.downcast=downcast;this.pureVirtualFunctions=[];}var upcastPointer=(ptr,ptrClass,desiredClass)=>{while(ptrClass!==desiredClass){if(!ptrClass.upcast){throwBindingError(`Expected null or instance of ${desiredClass.name}, got an instance of ${ptrClass.name}`);}ptr=ptrClass.upcast(ptr);ptrClass=ptrClass.baseClass;}return ptr};function constNoSmartPtrRawPointerToWireType(destructors,handle){if(handle===null){if(this.isReference){throwBindingError(`null is not a valid ${this.name}`);}return 0}if(!handle.$$){throwBindingError(`Cannot pass "${embindRepr(handle)}" as a ${this.name}`);}if(!handle.$$.ptr){throwBindingError(`Cannot pass deleted object as a pointer of type ${this.name}`);}var handleClass=handle.$$.ptrType.registeredClass;var ptr=upcastPointer(handle.$$.ptr,handleClass,this.registeredClass);return ptr}function genericPointerToWireType(destructors,handle){var ptr;if(handle===null){if(this.isReference){throwBindingError(`null is not a valid ${this.name}`);}if(this.isSmartPointer){ptr=this.rawConstructor();if(destructors!==null){destructors.push(this.rawDestructor,ptr);}return ptr}else {return 0}}if(!handle||!handle.$$){throwBindingError(`Cannot pass "${embindRepr(handle)}" as a ${this.name}`);}if(!handle.$$.ptr){throwBindingError(`Cannot pass deleted object as a pointer of type ${this.name}`);}if(!this.isConst&&handle.$$.ptrType.isConst){throwBindingError(`Cannot convert argument of type ${handle.$$.smartPtrType?handle.$$.smartPtrType.name:handle.$$.ptrType.name} to parameter type ${this.name}`);}var handleClass=handle.$$.ptrType.registeredClass;ptr=upcastPointer(handle.$$.ptr,handleClass,this.registeredClass);if(this.isSmartPointer){if(undefined===handle.$$.smartPtr){throwBindingError("Passing raw pointer to smart pointer is illegal");}switch(this.sharingPolicy){case 0:if(handle.$$.smartPtrType===this){ptr=handle.$$.smartPtr;}else {throwBindingError(`Cannot convert argument of type ${handle.$$.smartPtrType?handle.$$.smartPtrType.name:handle.$$.ptrType.name} to parameter type ${this.name}`);}break;case 1:ptr=handle.$$.smartPtr;break;case 2:if(handle.$$.smartPtrType===this){ptr=handle.$$.smartPtr;}else {var clonedHandle=handle["clone"]();ptr=this.rawShare(ptr,Emval.toHandle(()=>clonedHandle["delete"]()));if(destructors!==null){destructors.push(this.rawDestructor,ptr);}}break;default:throwBindingError("Unsupporting sharing policy");}}return ptr}function nonConstNoSmartPtrRawPointerToWireType(destructors,handle){if(handle===null){if(this.isReference){throwBindingError(`null is not a valid ${this.name}`);}return 0}if(!handle.$$){throwBindingError(`Cannot pass "${embindRepr(handle)}" as a ${this.name}`);}if(!handle.$$.ptr){throwBindingError(`Cannot pass deleted object as a pointer of type ${this.name}`);}if(handle.$$.ptrType.isConst){throwBindingError(`Cannot convert argument of type ${handle.$$.ptrType.name} to parameter type ${this.name}`);}var handleClass=handle.$$.ptrType.registeredClass;var ptr=upcastPointer(handle.$$.ptr,handleClass,this.registeredClass);return ptr}function readPointer(pointer){return this["fromWireType"](HEAPU32[pointer>>>2>>>0])}var init_RegisteredPointer=()=>{Object.assign(RegisteredPointer.prototype,{getPointee(ptr){if(this.rawGetPointee){ptr=this.rawGetPointee(ptr);}return ptr},destructor(ptr){this.rawDestructor?.(ptr);},argPackAdvance:GenericWireTypeSize,readValueFromPointer:readPointer,fromWireType:RegisteredPointer_fromWireType});};function RegisteredPointer(name,registeredClass,isReference,isConst,isSmartPointer,pointeeType,sharingPolicy,rawGetPointee,rawConstructor,rawShare,rawDestructor){this.name=name;this.registeredClass=registeredClass;this.isReference=isReference;this.isConst=isConst;this.isSmartPointer=isSmartPointer;this.pointeeType=pointeeType;this.sharingPolicy=sharingPolicy;this.rawGetPointee=rawGetPointee;this.rawConstructor=rawConstructor;this.rawShare=rawShare;this.rawDestructor=rawDestructor;if(!isSmartPointer&&registeredClass.baseClass===undefined){if(isConst){this["toWireType"]=constNoSmartPtrRawPointerToWireType;this.destructorFunction=null;}else {this["toWireType"]=nonConstNoSmartPtrRawPointerToWireType;this.destructorFunction=null;}}else {this["toWireType"]=genericPointerToWireType;}}var replacePublicSymbol=(name,value,numArguments)=>{if(!Module.hasOwnProperty(name)){throwInternalError("Replacing nonexistent public symbol");}if(undefined!==Module[name].overloadTable&&undefined!==numArguments){Module[name].overloadTable[numArguments]=value;}else {Module[name]=value;Module[name].argCount=numArguments;}};var dynCallLegacy=(sig,ptr,args)=>{sig=sig.replace(/p/g,"i");var f=Module["dynCall_"+sig];return f(ptr,...args)};var wasmTableMirror=[];var wasmTable;var getWasmTableEntry=funcPtr=>{var func=wasmTableMirror[funcPtr];if(!func){if(funcPtr>=wasmTableMirror.length)wasmTableMirror.length=funcPtr+1;wasmTableMirror[funcPtr]=func=wasmTable.get(funcPtr);}return func};var dynCall=(sig,ptr,args=[])=>{if(sig.includes("j")){return dynCallLegacy(sig,ptr,args)}var rtn=getWasmTableEntry(ptr)(...args);return sig[0]=="p"?rtn>>>0:rtn};var getDynCaller=(sig,ptr)=>(...args)=>dynCall(sig,ptr,args);var embind__requireFunction=(signature,rawFunction)=>{signature=readLatin1String(signature);function makeDynCaller(){if(signature.includes("j")){return getDynCaller(signature,rawFunction)}if(signature.includes("p")){return getDynCaller(signature,rawFunction)}return getWasmTableEntry(rawFunction)}var fp=makeDynCaller();if(typeof fp!="function"){throwBindingError(`unknown function pointer with signature ${signature}: ${rawFunction}`);}return fp};var extendError=(baseErrorType,errorName)=>{var errorClass=createNamedFunction(errorName,function(message){this.name=errorName;this.message=message;var stack=new Error(message).stack;if(stack!==undefined){this.stack=this.toString()+"\n"+stack.replace(/^Error(:[^\n]*)?\n/,"");}});errorClass.prototype=Object.create(baseErrorType.prototype);errorClass.prototype.constructor=errorClass;errorClass.prototype.toString=function(){if(this.message===undefined){return this.name}else {return `${this.name}: ${this.message}`}};return errorClass};var UnboundTypeError;var getTypeName=type=>{var ptr=___getTypeName(type);var rv=readLatin1String(ptr);_free(ptr);return rv};var throwUnboundTypeError=(message,types)=>{var unboundTypes=[];var seen={};function visit(type){if(seen[type]){return}if(registeredTypes[type]){return}if(typeDependencies[type]){typeDependencies[type].forEach(visit);return}unboundTypes.push(type);seen[type]=true;}types.forEach(visit);throw new UnboundTypeError(`${message}: `+unboundTypes.map(getTypeName).join([", "]))};function __embind_register_class(rawType,rawPointerType,rawConstPointerType,baseClassRawType,getActualTypeSignature,getActualType,upcastSignature,upcast,downcastSignature,downcast,name,destructorSignature,rawDestructor){rawType>>>=0;rawPointerType>>>=0;rawConstPointerType>>>=0;baseClassRawType>>>=0;getActualTypeSignature>>>=0;getActualType>>>=0;upcastSignature>>>=0;upcast>>>=0;downcastSignature>>>=0;downcast>>>=0;name>>>=0;destructorSignature>>>=0;rawDestructor>>>=0;name=readLatin1String(name);getActualType=embind__requireFunction(getActualTypeSignature,getActualType);upcast&&=embind__requireFunction(upcastSignature,upcast);downcast&&=embind__requireFunction(downcastSignature,downcast);rawDestructor=embind__requireFunction(destructorSignature,rawDestructor);var legalFunctionName=makeLegalFunctionName(name);exposePublicSymbol(legalFunctionName,function(){throwUnboundTypeError(`Cannot construct ${name} due to unbound types`,[baseClassRawType]);});whenDependentTypesAreResolved([rawType,rawPointerType,rawConstPointerType],baseClassRawType?[baseClassRawType]:[],base=>{base=base[0];var baseClass;var basePrototype;if(baseClassRawType){baseClass=base.registeredClass;basePrototype=baseClass.instancePrototype;}else {basePrototype=ClassHandle.prototype;}var constructor=createNamedFunction(name,function(...args){if(Object.getPrototypeOf(this)!==instancePrototype){throw new BindingError("Use 'new' to construct "+name)}if(undefined===registeredClass.constructor_body){throw new BindingError(name+" has no accessible constructor")}var body=registeredClass.constructor_body[args.length];if(undefined===body){throw new BindingError(`Tried to invoke ctor of ${name} with invalid number of parameters (${args.length}) - expected (${Object.keys(registeredClass.constructor_body).toString()}) parameters instead!`)}return body.apply(this,args)});var instancePrototype=Object.create(basePrototype,{constructor:{value:constructor}});constructor.prototype=instancePrototype;var registeredClass=new RegisteredClass(name,constructor,instancePrototype,rawDestructor,baseClass,getActualType,upcast,downcast);if(registeredClass.baseClass){registeredClass.baseClass.__derivedClasses??=[];registeredClass.baseClass.__derivedClasses.push(registeredClass);}var referenceConverter=new RegisteredPointer(name,registeredClass,true,false,false);var pointerConverter=new RegisteredPointer(name+"*",registeredClass,false,false,false);var constPointerConverter=new RegisteredPointer(name+" const*",registeredClass,false,true,false);registeredPointers[rawType]={pointerType:pointerConverter,constPointerType:constPointerConverter};replacePublicSymbol(legalFunctionName,constructor);return [referenceConverter,pointerConverter,constPointerConverter]});}var heap32VectorToArray=(count,firstElement)=>{var array=[];for(var i=0;i<count;i++){array.push(HEAPU32[firstElement+i*4>>>2>>>0]);}return array};var runDestructors=destructors=>{while(destructors.length){var ptr=destructors.pop();var del=destructors.pop();del(ptr);}};function usesDestructorStack(argTypes){for(var i=1;i<argTypes.length;++i){if(argTypes[i]!==null&&argTypes[i].destructorFunction===undefined){return true}}return false}function newFunc(constructor,argumentList){if(!(constructor instanceof Function)){throw new TypeError(`new_ called with constructor type ${typeof constructor} which is not a function`)}var dummy=createNamedFunction(constructor.name||"unknownFunctionName",function(){});dummy.prototype=constructor.prototype;var obj=new dummy;var r=constructor.apply(obj,argumentList);return r instanceof Object?r:obj}function createJsInvoker(argTypes,isClassMethodFunc,returns,isAsync){var needsDestructorStack=usesDestructorStack(argTypes);var argCount=argTypes.length-2;var argsList=[];var argsListWired=["fn"];if(isClassMethodFunc){argsListWired.push("thisWired");}for(var i=0;i<argCount;++i){argsList.push(`arg${i}`);argsListWired.push(`arg${i}Wired`);}argsList=argsList.join(",");argsListWired=argsListWired.join(",");var invokerFnBody=`return function (${argsList}) {\n`;if(needsDestructorStack){invokerFnBody+="var destructors = [];\n";}var dtorStack=needsDestructorStack?"destructors":"null";var args1=["humanName","throwBindingError","invoker","fn","runDestructors","retType","classParam"];if(isClassMethodFunc){invokerFnBody+=`var thisWired = classParam['toWireType'](${dtorStack}, this);\n`;}for(var i=0;i<argCount;++i){invokerFnBody+=`var arg${i}Wired = argType${i}['toWireType'](${dtorStack}, arg${i});\n`;args1.push(`argType${i}`);}invokerFnBody+=(returns||isAsync?"var rv = ":"")+`invoker(${argsListWired});\n`;if(needsDestructorStack){invokerFnBody+="runDestructors(destructors);\n";}else {for(var i=isClassMethodFunc?1:2;i<argTypes.length;++i){var paramName=i===1?"thisWired":"arg"+(i-2)+"Wired";if(argTypes[i].destructorFunction!==null){invokerFnBody+=`${paramName}_dtor(${paramName});\n`;args1.push(`${paramName}_dtor`);}}}if(returns){invokerFnBody+="var ret = retType['fromWireType'](rv);\n"+"return ret;\n";}invokerFnBody+="}\n";return [args1,invokerFnBody]}function craftInvokerFunction(humanName,argTypes,classType,cppInvokerFunc,cppTargetFunc,isAsync){var argCount=argTypes.length;if(argCount<2){throwBindingError("argTypes array size mismatch! Must at least get return value and 'this' types!");}var isClassMethodFunc=argTypes[1]!==null&&classType!==null;var needsDestructorStack=usesDestructorStack(argTypes);var returns=argTypes[0].name!=="void";var closureArgs=[humanName,throwBindingError,cppInvokerFunc,cppTargetFunc,runDestructors,argTypes[0],argTypes[1]];for(var i=0;i<argCount-2;++i){closureArgs.push(argTypes[i+2]);}if(!needsDestructorStack){for(var i=isClassMethodFunc?1:2;i<argTypes.length;++i){if(argTypes[i].destructorFunction!==null){closureArgs.push(argTypes[i].destructorFunction);}}}let[args,invokerFnBody]=createJsInvoker(argTypes,isClassMethodFunc,returns,isAsync);args.push(invokerFnBody);var invokerFn=newFunc(Function,args)(...closureArgs);return createNamedFunction(humanName,invokerFn)}var __embind_register_class_constructor=function(rawClassType,argCount,rawArgTypesAddr,invokerSignature,invoker,rawConstructor){rawClassType>>>=0;rawArgTypesAddr>>>=0;invokerSignature>>>=0;invoker>>>=0;rawConstructor>>>=0;var rawArgTypes=heap32VectorToArray(argCount,rawArgTypesAddr);invoker=embind__requireFunction(invokerSignature,invoker);whenDependentTypesAreResolved([],[rawClassType],classType=>{classType=classType[0];var humanName=`constructor ${classType.name}`;if(undefined===classType.registeredClass.constructor_body){classType.registeredClass.constructor_body=[];}if(undefined!==classType.registeredClass.constructor_body[argCount-1]){throw new BindingError(`Cannot register multiple constructors with identical number of parameters (${argCount-1}) for class '${classType.name}'! Overload resolution is currently only performed using the parameter count, not actual type info!`)}classType.registeredClass.constructor_body[argCount-1]=()=>{throwUnboundTypeError(`Cannot construct ${classType.name} due to unbound types`,rawArgTypes);};whenDependentTypesAreResolved([],rawArgTypes,argTypes=>{argTypes.splice(1,0,null);classType.registeredClass.constructor_body[argCount-1]=craftInvokerFunction(humanName,argTypes,null,invoker,rawConstructor);return []});return []});};var getFunctionName=signature=>{signature=signature.trim();const argsIndex=signature.indexOf("(");if(argsIndex!==-1){return signature.substr(0,argsIndex)}else {return signature}};var __embind_register_class_function=function(rawClassType,methodName,argCount,rawArgTypesAddr,invokerSignature,rawInvoker,context,isPureVirtual,isAsync,isNonnullReturn){rawClassType>>>=0;methodName>>>=0;rawArgTypesAddr>>>=0;invokerSignature>>>=0;rawInvoker>>>=0;context>>>=0;var rawArgTypes=heap32VectorToArray(argCount,rawArgTypesAddr);methodName=readLatin1String(methodName);methodName=getFunctionName(methodName);rawInvoker=embind__requireFunction(invokerSignature,rawInvoker);whenDependentTypesAreResolved([],[rawClassType],classType=>{classType=classType[0];var humanName=`${classType.name}.${methodName}`;if(methodName.startsWith("@@")){methodName=Symbol[methodName.substring(2)];}if(isPureVirtual){classType.registeredClass.pureVirtualFunctions.push(methodName);}function unboundTypesHandler(){throwUnboundTypeError(`Cannot call ${humanName} due to unbound types`,rawArgTypes);}var proto=classType.registeredClass.instancePrototype;var method=proto[methodName];if(undefined===method||undefined===method.overloadTable&&method.className!==classType.name&&method.argCount===argCount-2){unboundTypesHandler.argCount=argCount-2;unboundTypesHandler.className=classType.name;proto[methodName]=unboundTypesHandler;}else {ensureOverloadTable(proto,methodName,humanName);proto[methodName].overloadTable[argCount-2]=unboundTypesHandler;}whenDependentTypesAreResolved([],rawArgTypes,argTypes=>{var memberFunction=craftInvokerFunction(humanName,argTypes,classType,rawInvoker,context,isAsync);if(undefined===proto[methodName].overloadTable){memberFunction.argCount=argCount-2;proto[methodName]=memberFunction;}else {proto[methodName].overloadTable[argCount-2]=memberFunction;}return []});return []});};var emval_freelist=[];var emval_handles=[];function __emval_decref(handle){handle>>>=0;if(handle>9&&0===--emval_handles[handle+1]){emval_handles[handle]=undefined;emval_freelist.push(handle);}}var count_emval_handles=()=>emval_handles.length/2-5-emval_freelist.length;var init_emval=()=>{emval_handles.push(0,1,undefined,1,null,1,true,1,false,1);Module["count_emval_handles"]=count_emval_handles;};var Emval={toValue:handle=>{if(!handle){throwBindingError("Cannot use deleted val. handle = "+handle);}return emval_handles[handle]},toHandle:value=>{switch(value){case undefined:return 2;case null:return 4;case true:return 6;case false:return 8;default:{const handle=emval_freelist.pop()||emval_handles.length;emval_handles[handle]=value;emval_handles[handle+1]=1;return handle}}}};var EmValType={name:"emscripten::val",fromWireType:handle=>{var rv=Emval.toValue(handle);__emval_decref(handle);return rv},toWireType:(destructors,value)=>Emval.toHandle(value),argPackAdvance:GenericWireTypeSize,readValueFromPointer:readPointer,destructorFunction:null};function __embind_register_emval(rawType){rawType>>>=0;return registerType(rawType,EmValType)}var embindRepr=v=>{if(v===null){return "null"}var t=typeof v;if(t==="object"||t==="array"||t==="function"){return v.toString()}else {return ""+v}};var floatReadValueFromPointer=(name,width)=>{switch(width){case 4:return function(pointer){return this["fromWireType"](HEAPF32[pointer>>>2>>>0])};case 8:return function(pointer){return this["fromWireType"](HEAPF64[pointer>>>3>>>0])};default:throw new TypeError(`invalid float width (${width}): ${name}`)}};var __embind_register_float=function(rawType,name,size){rawType>>>=0;name>>>=0;size>>>=0;name=readLatin1String(name);registerType(rawType,{name,fromWireType:value=>value,toWireType:(destructors,value)=>value,argPackAdvance:GenericWireTypeSize,readValueFromPointer:floatReadValueFromPointer(name,size),destructorFunction:null});};function __embind_register_function(name,argCount,rawArgTypesAddr,signature,rawInvoker,fn,isAsync,isNonnullReturn){name>>>=0;rawArgTypesAddr>>>=0;signature>>>=0;rawInvoker>>>=0;fn>>>=0;var argTypes=heap32VectorToArray(argCount,rawArgTypesAddr);name=readLatin1String(name);name=getFunctionName(name);rawInvoker=embind__requireFunction(signature,rawInvoker);exposePublicSymbol(name,function(){throwUnboundTypeError(`Cannot call ${name} due to unbound types`,argTypes);},argCount-1);whenDependentTypesAreResolved([],argTypes,argTypes=>{var invokerArgsArray=[argTypes[0],null].concat(argTypes.slice(1));replacePublicSymbol(name,craftInvokerFunction(name,invokerArgsArray,null,rawInvoker,fn,isAsync),argCount-1);return []});}var integerReadValueFromPointer=(name,width,signed)=>{switch(width){case 1:return signed?pointer=>HEAP8[pointer>>>0]:pointer=>HEAPU8[pointer>>>0];case 2:return signed?pointer=>HEAP16[pointer>>>1>>>0]:pointer=>HEAPU16[pointer>>>1>>>0];case 4:return signed?pointer=>HEAP32[pointer>>>2>>>0]:pointer=>HEAPU32[pointer>>>2>>>0];default:throw new TypeError(`invalid integer width (${width}): ${name}`)}};function __embind_register_integer(primitiveType,name,size,minRange,maxRange){primitiveType>>>=0;name>>>=0;size>>>=0;name=readLatin1String(name);var fromWireType=value=>value;if(minRange===0){var bitshift=32-8*size;fromWireType=value=>value<<bitshift>>>bitshift;}var isUnsignedType=name.includes("unsigned");var checkAssertions=(value,toTypeName)=>{};var toWireType;if(isUnsignedType){toWireType=function(destructors,value){checkAssertions(value,this.name);return value>>>0};}else {toWireType=function(destructors,value){checkAssertions(value,this.name);return value};}registerType(primitiveType,{name,fromWireType,toWireType,argPackAdvance:GenericWireTypeSize,readValueFromPointer:integerReadValueFromPointer(name,size,minRange!==0),destructorFunction:null});}function __embind_register_memory_view(rawType,dataTypeIndex,name){rawType>>>=0;name>>>=0;var typeMapping=[Int8Array,Uint8Array,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array];var TA=typeMapping[dataTypeIndex];function decodeMemoryView(handle){var size=HEAPU32[handle>>>2>>>0];var data=HEAPU32[handle+4>>>2>>>0];return new TA(HEAP8.buffer,data,size)}name=readLatin1String(name);registerType(rawType,{name,fromWireType:decodeMemoryView,argPackAdvance:GenericWireTypeSize,readValueFromPointer:decodeMemoryView},{ignoreDuplicateRegistrations:true});}var __embind_register_smart_ptr=function(rawType,rawPointeeType,name,sharingPolicy,getPointeeSignature,rawGetPointee,constructorSignature,rawConstructor,shareSignature,rawShare,destructorSignature,rawDestructor){rawType>>>=0;rawPointeeType>>>=0;name>>>=0;getPointeeSignature>>>=0;rawGetPointee>>>=0;constructorSignature>>>=0;rawConstructor>>>=0;shareSignature>>>=0;rawShare>>>=0;destructorSignature>>>=0;rawDestructor>>>=0;name=readLatin1String(name);rawGetPointee=embind__requireFunction(getPointeeSignature,rawGetPointee);rawConstructor=embind__requireFunction(constructorSignature,rawConstructor);rawShare=embind__requireFunction(shareSignature,rawShare);rawDestructor=embind__requireFunction(destructorSignature,rawDestructor);whenDependentTypesAreResolved([rawType],[rawPointeeType],pointeeType=>{pointeeType=pointeeType[0];var registeredPointer=new RegisteredPointer(name,pointeeType.registeredClass,false,false,true,pointeeType,sharingPolicy,rawGetPointee,rawConstructor,rawShare,rawDestructor);return [registeredPointer]});};var stringToUTF8=(str,outPtr,maxBytesToWrite)=>stringToUTF8Array(str,HEAPU8,outPtr,maxBytesToWrite);function __embind_register_std_string(rawType,name){rawType>>>=0;name>>>=0;name=readLatin1String(name);var stdStringIsUTF8=name==="std::string";registerType(rawType,{name,fromWireType(value){var length=HEAPU32[value>>>2>>>0];var payload=value+4;var str;if(stdStringIsUTF8){var decodeStartPtr=payload;for(var i=0;i<=length;++i){var currentBytePtr=payload+i;if(i==length||HEAPU8[currentBytePtr>>>0]==0){var maxRead=currentBytePtr-decodeStartPtr;var stringSegment=UTF8ToString(decodeStartPtr,maxRead);if(str===undefined){str=stringSegment;}else {str+=String.fromCharCode(0);str+=stringSegment;}decodeStartPtr=currentBytePtr+1;}}}else {var a=new Array(length);for(var i=0;i<length;++i){a[i]=String.fromCharCode(HEAPU8[payload+i>>>0]);}str=a.join("");}_free(value);return str},toWireType(destructors,value){if(value instanceof ArrayBuffer){value=new Uint8Array(value);}var length;var valueIsOfTypeString=typeof value=="string";if(!(valueIsOfTypeString||value instanceof Uint8Array||value instanceof Uint8ClampedArray||value instanceof Int8Array)){throwBindingError("Cannot pass non-string to std::string");}if(stdStringIsUTF8&&valueIsOfTypeString){length=lengthBytesUTF8(value);}else {length=value.length;}var base=_malloc(4+length+1);var ptr=base+4;HEAPU32[base>>>2>>>0]=length;if(stdStringIsUTF8&&valueIsOfTypeString){stringToUTF8(value,ptr,length+1);}else {if(valueIsOfTypeString){for(var i=0;i<length;++i){var charCode=value.charCodeAt(i);if(charCode>255){_free(ptr);throwBindingError("String has UTF-16 code units that do not fit in 8 bits");}HEAPU8[ptr+i>>>0]=charCode;}}else {for(var i=0;i<length;++i){HEAPU8[ptr+i>>>0]=value[i];}}}if(destructors!==null){destructors.push(_free,base);}return base},argPackAdvance:GenericWireTypeSize,readValueFromPointer:readPointer,destructorFunction(ptr){_free(ptr);}});}var UTF16Decoder=typeof TextDecoder!="undefined"?new TextDecoder("utf-16le"):undefined;var UTF16ToString=(ptr,maxBytesToRead)=>{var endPtr=ptr;var idx=endPtr>>1;var maxIdx=idx+maxBytesToRead/2;while(!(idx>=maxIdx)&&HEAPU16[idx>>>0])++idx;endPtr=idx<<1;if(endPtr-ptr>32&&UTF16Decoder)return UTF16Decoder.decode(HEAPU8.subarray(ptr>>>0,endPtr>>>0));var str="";for(var i=0;!(i>=maxBytesToRead/2);++i){var codeUnit=HEAP16[ptr+i*2>>>1>>>0];if(codeUnit==0)break;str+=String.fromCharCode(codeUnit);}return str};var stringToUTF16=(str,outPtr,maxBytesToWrite)=>{maxBytesToWrite??=2147483647;if(maxBytesToWrite<2)return 0;maxBytesToWrite-=2;var startPtr=outPtr;var numCharsToWrite=maxBytesToWrite<str.length*2?maxBytesToWrite/2:str.length;for(var i=0;i<numCharsToWrite;++i){var codeUnit=str.charCodeAt(i);HEAP16[outPtr>>>1>>>0]=codeUnit;outPtr+=2;}HEAP16[outPtr>>>1>>>0]=0;return outPtr-startPtr};var lengthBytesUTF16=str=>str.length*2;var UTF32ToString=(ptr,maxBytesToRead)=>{var i=0;var str="";while(!(i>=maxBytesToRead/4)){var utf32=HEAP32[ptr+i*4>>>2>>>0];if(utf32==0)break;++i;if(utf32>=65536){var ch=utf32-65536;str+=String.fromCharCode(55296|ch>>10,56320|ch&1023);}else {str+=String.fromCharCode(utf32);}}return str};var stringToUTF32=(str,outPtr,maxBytesToWrite)=>{outPtr>>>=0;maxBytesToWrite??=2147483647;if(maxBytesToWrite<4)return 0;var startPtr=outPtr;var endPtr=startPtr+maxBytesToWrite-4;for(var i=0;i<str.length;++i){var codeUnit=str.charCodeAt(i);if(codeUnit>=55296&&codeUnit<=57343){var trailSurrogate=str.charCodeAt(++i);codeUnit=65536+((codeUnit&1023)<<10)|trailSurrogate&1023;}HEAP32[outPtr>>>2>>>0]=codeUnit;outPtr+=4;if(outPtr+4>endPtr)break}HEAP32[outPtr>>>2>>>0]=0;return outPtr-startPtr};var lengthBytesUTF32=str=>{var len=0;for(var i=0;i<str.length;++i){var codeUnit=str.charCodeAt(i);if(codeUnit>=55296&&codeUnit<=57343)++i;len+=4;}return len};var __embind_register_std_wstring=function(rawType,charSize,name){rawType>>>=0;charSize>>>=0;name>>>=0;name=readLatin1String(name);var decodeString,encodeString,readCharAt,lengthBytesUTF;if(charSize===2){decodeString=UTF16ToString;encodeString=stringToUTF16;lengthBytesUTF=lengthBytesUTF16;readCharAt=pointer=>HEAPU16[pointer>>>1>>>0];}else if(charSize===4){decodeString=UTF32ToString;encodeString=stringToUTF32;lengthBytesUTF=lengthBytesUTF32;readCharAt=pointer=>HEAPU32[pointer>>>2>>>0];}registerType(rawType,{name,fromWireType:value=>{var length=HEAPU32[value>>>2>>>0];var str;var decodeStartPtr=value+4;for(var i=0;i<=length;++i){var currentBytePtr=value+4+i*charSize;if(i==length||readCharAt(currentBytePtr)==0){var maxReadBytes=currentBytePtr-decodeStartPtr;var stringSegment=decodeString(decodeStartPtr,maxReadBytes);if(str===undefined){str=stringSegment;}else {str+=String.fromCharCode(0);str+=stringSegment;}decodeStartPtr=currentBytePtr+charSize;}}_free(value);return str},toWireType:(destructors,value)=>{if(!(typeof value=="string")){throwBindingError(`Cannot pass non-string to C++ string type ${name}`);}var length=lengthBytesUTF(value);var ptr=_malloc(4+length+charSize);HEAPU32[ptr>>>2>>>0]=length/charSize;encodeString(value,ptr+4,length+charSize);if(destructors!==null){destructors.push(_free,ptr);}return ptr},argPackAdvance:GenericWireTypeSize,readValueFromPointer:readPointer,destructorFunction(ptr){_free(ptr);}});};var __embind_register_void=function(rawType,name){rawType>>>=0;name>>>=0;name=readLatin1String(name);registerType(rawType,{isVoid:true,name,argPackAdvance:0,fromWireType:()=>undefined,toWireType:(destructors,o)=>undefined});};function __emscripten_memcpy_js(dest,src,num){dest>>>=0;src>>>=0;num>>>=0;return HEAPU8.copyWithin(dest>>>0,src>>>0,src+num>>>0)}var runtimeKeepaliveCounter=0;var __emscripten_runtime_keepalive_clear=()=>{noExitRuntime=false;runtimeKeepaliveCounter=0;};var requireRegisteredType=(rawType,humanName)=>{var impl=registeredTypes[rawType];if(undefined===impl){throwBindingError(`${humanName} has unknown type ${getTypeName(rawType)}`);}return impl};var emval_returnValue=(returnType,destructorsRef,handle)=>{var destructors=[];var result=returnType["toWireType"](destructors,handle);if(destructors.length){HEAPU32[destructorsRef>>>2>>>0]=Emval.toHandle(destructors);}return result};function __emval_as(handle,returnType,destructorsRef){handle>>>=0;returnType>>>=0;destructorsRef>>>=0;handle=Emval.toValue(handle);returnType=requireRegisteredType(returnType,"emval::as");return emval_returnValue(returnType,destructorsRef,handle)}var emval_methodCallers=[];function __emval_call(caller,handle,destructorsRef,args){caller>>>=0;handle>>>=0;destructorsRef>>>=0;args>>>=0;caller=emval_methodCallers[caller];handle=Emval.toValue(handle);return caller(null,handle,destructorsRef,args)}var emval_addMethodCaller=caller=>{var id=emval_methodCallers.length;emval_methodCallers.push(caller);return id};var emval_lookupTypes=(argCount,argTypes)=>{var a=new Array(argCount);for(var i=0;i<argCount;++i){a[i]=requireRegisteredType(HEAPU32[argTypes+i*4>>>2>>>0],"parameter "+i);}return a};function __emval_get_method_caller(argCount,argTypes,kind){argTypes>>>=0;var types=emval_lookupTypes(argCount,argTypes);var retType=types.shift();argCount--;var functionBody=`return function (obj, func, destructorsRef, args) {\n`;var offset=0;var argsList=[];if(kind===0){argsList.push("obj");}var params=["retType"];var args=[retType];for(var i=0;i<argCount;++i){argsList.push("arg"+i);params.push("argType"+i);args.push(types[i]);functionBody+=`  var arg${i} = argType${i}.readValueFromPointer(args${offset?"+"+offset:""});\n`;offset+=types[i].argPackAdvance;}var invoker=kind===1?"new func":"func.call";functionBody+=`  var rv = ${invoker}(${argsList.join(", ")});\n`;if(!retType.isVoid){params.push("emval_returnValue");args.push(emval_returnValue);functionBody+="  return emval_returnValue(retType, destructorsRef, rv);\n";}functionBody+="};\n";params.push(functionBody);var invokerFunction=newFunc(Function,params)(...args);var functionName=`methodCaller<(${types.map(t=>t.name).join(", ")}) => ${retType.name}>`;return emval_addMethodCaller(createNamedFunction(functionName,invokerFunction))}function __emval_get_property(handle,key){handle>>>=0;key>>>=0;handle=Emval.toValue(handle);key=Emval.toValue(key);return Emval.toHandle(handle[key])}function __emval_incref(handle){handle>>>=0;if(handle>9){emval_handles[handle+1]+=1;}}function __emval_new_array(){return Emval.toHandle([])}var emval_symbols={};var getStringOrSymbol=address=>{var symbol=emval_symbols[address];if(symbol===undefined){return readLatin1String(address)}return symbol};function __emval_new_cstring(v){v>>>=0;return Emval.toHandle(getStringOrSymbol(v))}function __emval_new_object(){return Emval.toHandle({})}function __emval_run_destructors(handle){handle>>>=0;var destructors=Emval.toValue(handle);runDestructors(destructors);__emval_decref(handle);}function __emval_set_property(handle,key,value){handle>>>=0;key>>>=0;value>>>=0;handle=Emval.toValue(handle);key=Emval.toValue(key);value=Emval.toValue(value);handle[key]=value;}function __emval_take_value(type,arg){type>>>=0;arg>>>=0;type=requireRegisteredType(type,"_emval_take_value");var v=type["readValueFromPointer"](arg);return Emval.toHandle(v)}var timers={};var handleException=e=>{if(e instanceof ExitStatus||e=="unwind"){return EXITSTATUS}quit_(1,e);};var keepRuntimeAlive=()=>noExitRuntime||runtimeKeepaliveCounter>0;var _proc_exit=code=>{EXITSTATUS=code;if(!keepRuntimeAlive()){Module["onExit"]?.(code);ABORT=true;}quit_(code,new ExitStatus(code));};var exitJS=(status,implicit)=>{EXITSTATUS=status;_proc_exit(status);};var _exit=exitJS;var maybeExit=()=>{if(!keepRuntimeAlive()){try{_exit(EXITSTATUS);}catch(e){handleException(e);}}};var callUserCallback=func=>{if(ABORT){return}try{func();maybeExit();}catch(e){handleException(e);}};var _emscripten_get_now=()=>performance.now();var __setitimer_js=(which,timeout_ms)=>{if(timers[which]){clearTimeout(timers[which].id);delete timers[which];}if(!timeout_ms)return 0;var id=setTimeout(()=>{delete timers[which];callUserCallback(()=>__emscripten_timeout(which,_emscripten_get_now()));},timeout_ms);timers[which]={id,timeout_ms};return 0};var __tzset_js=function(timezone,daylight,std_name,dst_name){timezone>>>=0;daylight>>>=0;std_name>>>=0;dst_name>>>=0;var currentYear=(new Date).getFullYear();var winter=new Date(currentYear,0,1);var summer=new Date(currentYear,6,1);var winterOffset=winter.getTimezoneOffset();var summerOffset=summer.getTimezoneOffset();var stdTimezoneOffset=Math.max(winterOffset,summerOffset);HEAPU32[timezone>>>2>>>0]=stdTimezoneOffset*60;HEAP32[daylight>>>2>>>0]=Number(winterOffset!=summerOffset);var extractZone=timezoneOffset=>{var sign=timezoneOffset>=0?"-":"+";var absOffset=Math.abs(timezoneOffset);var hours=String(Math.floor(absOffset/60)).padStart(2,"0");var minutes=String(absOffset%60).padStart(2,"0");return `UTC${sign}${hours}${minutes}`};var winterName=extractZone(winterOffset);var summerName=extractZone(summerOffset);if(summerOffset<winterOffset){stringToUTF8(winterName,std_name,17);stringToUTF8(summerName,dst_name,17);}else {stringToUTF8(winterName,dst_name,17);stringToUTF8(summerName,std_name,17);}};var _emscripten_date_now=()=>Date.now();var getHeapMax=()=>4294901760;var growMemory=size=>{var b=wasmMemory.buffer;var pages=(size-b.byteLength+65535)/65536|0;try{wasmMemory.grow(pages);updateMemoryViews();return 1}catch(e){}};function _emscripten_resize_heap(requestedSize){requestedSize>>>=0;var oldSize=HEAPU8.length;var maxHeapSize=getHeapMax();if(requestedSize>maxHeapSize){return false}for(var cutDown=1;cutDown<=4;cutDown*=2){var overGrownHeapSize=oldSize*(1+.2/cutDown);overGrownHeapSize=Math.min(overGrownHeapSize,requestedSize+100663296);var newSize=Math.min(maxHeapSize,alignMemory(Math.max(requestedSize,overGrownHeapSize),65536));var replacement=growMemory(newSize);if(replacement){return true}}return false}var ENV={};var getExecutableName=()=>thisProgram||"./this.program";var getEnvStrings=()=>{if(!getEnvStrings.strings){var lang=(typeof navigator=="object"&&navigator.languages&&navigator.languages[0]||"C").replace("-","_")+".UTF-8";var env={USER:"web_user",LOGNAME:"web_user",PATH:"/",PWD:"/",HOME:"/home/web_user",LANG:lang,_:getExecutableName()};for(var x in ENV){if(ENV[x]===undefined)delete env[x];else env[x]=ENV[x];}var strings=[];for(var x in env){strings.push(`${x}=${env[x]}`);}getEnvStrings.strings=strings;}return getEnvStrings.strings};var stringToAscii=(str,buffer)=>{for(var i=0;i<str.length;++i){HEAP8[buffer++>>>0]=str.charCodeAt(i);}HEAP8[buffer>>>0]=0;};var _environ_get=function(__environ,environ_buf){__environ>>>=0;environ_buf>>>=0;var bufSize=0;getEnvStrings().forEach((string,i)=>{var ptr=environ_buf+bufSize;HEAPU32[__environ+i*4>>>2>>>0]=ptr;stringToAscii(string,ptr);bufSize+=string.length+1;});return 0};var _environ_sizes_get=function(penviron_count,penviron_buf_size){penviron_count>>>=0;penviron_buf_size>>>=0;var strings=getEnvStrings();HEAPU32[penviron_count>>>2>>>0]=strings.length;var bufSize=0;strings.forEach(string=>bufSize+=string.length+1);HEAPU32[penviron_buf_size>>>2>>>0]=bufSize;return 0};function _fd_close(fd){try{var stream=SYSCALLS.getStreamFromFD(fd);FS.close(stream);return 0}catch(e){if(typeof FS=="undefined"||!(e.name==="ErrnoError"))throw e;return e.errno}}var doReadv=(stream,iov,iovcnt,offset)=>{var ret=0;for(var i=0;i<iovcnt;i++){var ptr=HEAPU32[iov>>>2>>>0];var len=HEAPU32[iov+4>>>2>>>0];iov+=8;var curr=FS.read(stream,HEAP8,ptr,len,offset);if(curr<0)return -1;ret+=curr;if(curr<len)break;if(typeof offset!="undefined"){offset+=curr;}}return ret};function _fd_read(fd,iov,iovcnt,pnum){iov>>>=0;iovcnt>>>=0;pnum>>>=0;try{var stream=SYSCALLS.getStreamFromFD(fd);var num=doReadv(stream,iov,iovcnt);HEAPU32[pnum>>>2>>>0]=num;return 0}catch(e){if(typeof FS=="undefined"||!(e.name==="ErrnoError"))throw e;return e.errno}}function _fd_seek(fd,offset_low,offset_high,whence,newOffset){var offset=convertI32PairToI53Checked(offset_low,offset_high);newOffset>>>=0;try{if(isNaN(offset))return 61;var stream=SYSCALLS.getStreamFromFD(fd);FS.llseek(stream,offset,whence);tempI64=[stream.position>>>0,(tempDouble=stream.position,+Math.abs(tempDouble)>=1?tempDouble>0?+Math.floor(tempDouble/4294967296)>>>0:~~+Math.ceil((tempDouble-+(~~tempDouble>>>0))/4294967296)>>>0:0)],HEAP32[newOffset>>>2>>>0]=tempI64[0],HEAP32[newOffset+4>>>2>>>0]=tempI64[1];if(stream.getdents&&offset===0&&whence===0)stream.getdents=null;return 0}catch(e){if(typeof FS=="undefined"||!(e.name==="ErrnoError"))throw e;return e.errno}}var doWritev=(stream,iov,iovcnt,offset)=>{var ret=0;for(var i=0;i<iovcnt;i++){var ptr=HEAPU32[iov>>>2>>>0];var len=HEAPU32[iov+4>>>2>>>0];iov+=8;var curr=FS.write(stream,HEAP8,ptr,len,offset);if(curr<0)return -1;ret+=curr;if(curr<len){break}if(typeof offset!="undefined"){offset+=curr;}}return ret};function _fd_write(fd,iov,iovcnt,pnum){iov>>>=0;iovcnt>>>=0;pnum>>>=0;try{var stream=SYSCALLS.getStreamFromFD(fd);var num=doWritev(stream,iov,iovcnt);HEAPU32[pnum>>>2>>>0]=num;return 0}catch(e){if(typeof FS=="undefined"||!(e.name==="ErrnoError"))throw e;return e.errno}}FS.createPreloadedFile=FS_createPreloadedFile;FS.staticInit();embind_init_charCodes();BindingError=Module["BindingError"]=class BindingError extends Error{constructor(message){super(message);this.name="BindingError";}};InternalError=Module["InternalError"]=class InternalError extends Error{constructor(message){super(message);this.name="InternalError";}};init_ClassHandle();init_RegisteredPointer();UnboundTypeError=Module["UnboundTypeError"]=extendError(Error,"UnboundTypeError");init_emval();var wasmImports={a:___assert_fail,w:___syscall_fcntl64,R:___syscall_ioctl,Q:___syscall_openat,K:__abort_js,x:__embind_register_bigint,J:__embind_register_bool,u:__embind_register_class,I:__embind_register_class_constructor,i:__embind_register_class_function,H:__embind_register_emval,t:__embind_register_float,d:__embind_register_function,m:__embind_register_integer,l:__embind_register_memory_view,G:__embind_register_smart_ptr,s:__embind_register_std_string,p:__embind_register_std_wstring,F:__embind_register_void,E:__emscripten_memcpy_js,D:__emscripten_runtime_keepalive_clear,h:__emval_as,o:__emval_call,b:__emval_decref,n:__emval_get_method_caller,g:__emval_get_property,C:__emval_incref,j:__emval_new_array,k:__emval_new_cstring,r:__emval_new_object,f:__emval_run_destructors,e:__emval_set_property,c:__emval_take_value,B:__setitimer_js,A:__tzset_js,q:_emscripten_date_now,z:_emscripten_resize_heap,P:_environ_get,O:_environ_sizes_get,v:_fd_close,N:_fd_read,y:_fd_seek,M:_fd_write,L:_proc_exit};var wasmExports=createWasm();var _free=a0=>(_free=wasmExports["U"])(a0);var _malloc=a0=>(_malloc=wasmExports["V"])(a0);var ___getTypeName=a0=>(___getTypeName=wasmExports["W"])(a0);var __emscripten_timeout=(a0,a1)=>(__emscripten_timeout=wasmExports["Y"])(a0,a1);var ___trap=()=>(___trap=wasmExports["Z"])();Module["dynCall_jiji"]=(a0,a1,a2,a3,a4)=>(Module["dynCall_jiji"]=wasmExports["_"])(a0,a1,a2,a3,a4);Module["dynCall_viijii"]=(a0,a1,a2,a3,a4,a5,a6)=>(Module["dynCall_viijii"]=wasmExports["$"])(a0,a1,a2,a3,a4,a5,a6);Module["dynCall_iiiiij"]=(a0,a1,a2,a3,a4,a5,a6)=>(Module["dynCall_iiiiij"]=wasmExports["aa"])(a0,a1,a2,a3,a4,a5,a6);Module["dynCall_iiiiijj"]=(a0,a1,a2,a3,a4,a5,a6,a7,a8)=>(Module["dynCall_iiiiijj"]=wasmExports["ba"])(a0,a1,a2,a3,a4,a5,a6,a7,a8);Module["dynCall_iiiiiijj"]=(a0,a1,a2,a3,a4,a5,a6,a7,a8,a9)=>(Module["dynCall_iiiiiijj"]=wasmExports["ca"])(a0,a1,a2,a3,a4,a5,a6,a7,a8,a9);function applySignatureConversions(wasmExports){wasmExports=Object.assign({},wasmExports);var makeWrapper_pp=f=>a0=>f(a0)>>>0;wasmExports["V"]=makeWrapper_pp(wasmExports["V"]);wasmExports["W"]=makeWrapper_pp(wasmExports["W"]);wasmExports["_emscripten_stack_alloc"]=makeWrapper_pp(wasmExports["_emscripten_stack_alloc"]);return wasmExports}var calledRun;dependenciesFulfilled=function runCaller(){if(!calledRun)run();if(!calledRun)dependenciesFulfilled=runCaller;};function run(){if(runDependencies>0){return}preRun();if(runDependencies>0){return}function doRun(){if(calledRun)return;calledRun=true;Module["calledRun"]=true;if(ABORT)return;initRuntime();readyPromiseResolve(Module);Module["onRuntimeInitialized"]?.();postRun();}if(Module["setStatus"]){Module["setStatus"]("Running...");setTimeout(()=>{setTimeout(()=>Module["setStatus"](""),1);doRun();},1);}else {doRun();}}if(Module["preInit"]){if(typeof Module["preInit"]=="function")Module["preInit"]=[Module["preInit"]];while(Module["preInit"].length>0){Module["preInit"].pop()();}}run();moduleRtn=readyPromise;


  return moduleRtn;
}
);
})();
let _exports_ = {};
const _module_ = {exports: _exports_};
if (typeof _exports_ === 'object' && typeof _module_ === 'object')
  _module_.exports = Module;
else if (typeof define === 'function' && define['amd'])
  define([], () => Module);
var CgalBrowser = _module_.exports;

function pad (hash, len) {
  while (hash.length < len) {
    hash = '0' + hash;
  }
  return hash;
}

function fold (hash, text) {
  var i;
  var chr;
  var len;
  if (text.length === 0) {
    return hash;
  }
  for (i = 0, len = text.length; i < len; i++) {
    chr = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash < 0 ? hash * -2 : hash;
}

function foldObject (hash, o, seen) {
  return Object.keys(o).sort().reduce(foldKey, hash);
  function foldKey (hash, key) {
    return foldValue(hash, o[key], key, seen);
  }
}

function foldValue (input, value, key, seen) {
  var hash = fold(fold(fold(input, key), toString(value)), typeof value);
  if (value === null) {
    return fold(hash, 'null');
  }
  if (value === undefined) {
    return fold(hash, 'undefined');
  }
  if (typeof value === 'object' || typeof value === 'function') {
    if (seen.indexOf(value) !== -1) {
      return fold(hash, '[Circular]' + key);
    }
    seen.push(value);

    var objHash = foldObject(hash, value, seen);

    if (!('valueOf' in value) || typeof value.valueOf !== 'function') {
      return objHash;
    }

    try {
      return fold(objHash, String(value.valueOf()))
    } catch (err) {
      return fold(objHash, '[valueOf exception]' + (err.stack || err.message))
    }
  }
  return fold(hash, value.toString());
}

function toString (o) {
  return Object.prototype.toString.call(o);
}

function sum (o) {
  return pad(foldValue(0, o, '', []).toString(16), 8);
}

var hashSum = sum;

const toPathnameFromUrl = (url) => {
  const { pathname } = new URL(url);
  if (pathname.match(/^[/][A-Z]:[/]/)) {
    // This looks like a windows file url.
    // Unfortunately it has a leading slash that we need to get rid of.
    return pathname.substring(1);
  } else {
    return pathname;
  }
};

// import { emit, isNode, log, onBoot } from './jsxcad-sys.js';

let cgal;

const initCgal = async () => {
  if (cgal === undefined) {
    // const Cgal = isNode ? CgalNode : CgalBrowser;
    const Cgal = CgalBrowser;
    cgal = await Cgal({
      destroy(obj) {
        console.log(`QQ/cgal/destroy`);
      },
      print(...texts) {
        const text = texts.join(' ');
        const level = 'serious';
        const logEntry = { text, level };
        const hash = hashSum(log);
        emit({ log: logEntry, hash });
        log({ op: 'text', text, level });
        console.log(texts);
      },
      printErr(...texts) {
        const text = texts.join(' ');
        const level = 'serious';
        const logEntry = { text, level };
        const hash = hashSum(log);
        emit({ log: logEntry, hash });
        log({ op: 'text', text, level });
        console.log(texts);
      },
      locateFile(path) {
        if (path === 'cgal_node.worker.js') {
          const url = import.meta.url;
          if (url.startsWith('file://')) {
            let pathname = toPathnameFromUrl(import.meta.url);
            const parts = pathname.split('/');
            parts.pop();
            const prefix = parts.join('/');
            const workerPathname = `${prefix}/cgal_node.worker.cjs`;
            return workerPathname;
          }
        } else if (path === 'cgal_node.wasm' || path === 'cgal_browser.wasm') {
          const url = import.meta.url;
          if (url.startsWith('file://')) {
            let pathname = toPathnameFromUrl(import.meta.url);
            const parts = pathname.split('/');
            parts.pop();
            const prefix = parts.join('/');
            const wasmPathname = `${prefix}/${path}`;
            return wasmPathname;
          } else {
            const parts = url.split('/');
            parts.pop();
            parts.push('cgal_browser.wasm');
            return parts.join('/');
          }
        }
        return path;
      },
    });
  }
};

const getCgal = () => {
  if (!cgal) {
    throw Error('CGAL not initialized');
  }
  return cgal;
};

onBoot(initCgal);

const TRANSFORM_COMPOSE = 0;
const TRANSFORM_EXACT = 1;
const TRANSFORM_APPROXIMATE = 2;
const TRANSFORM_INVERT = 3;
const TRANSFORM_ROTATE_X = 4;
const TRANSFORM_ROTATE_Y = 5;
const TRANSFORM_ROTATE_Z = 6;
const TRANSFORM_TRANSLATE = 7;
const TRANSFORM_SCALE = 8;
const TRANSFORM_IDENTITY = 9;

const identityMatrix = [TRANSFORM_IDENTITY];

const makeApproximateMatrix = (approximate) => [
  TRANSFORM_APPROXIMATE,
  approximate,
];
const makeExactMatrix = (exact) => [TRANSFORM_EXACT, exact];

const composeTransforms = (a = identityMatrix, b = identityMatrix) => {
  if (!Number.isInteger(a[0]) || !Number.isInteger(b[0])) {
    throw Error(
      `composeTransforms: a=${JSON.stringify(a)} b=${JSON.stringify(b)}`
    );
  }
  return [TRANSFORM_COMPOSE, a, b];
};

const invertTransform = (a = identityMatrix) => [TRANSFORM_INVERT, a];

const fromRotateXToTransform = (turn) => [TRANSFORM_ROTATE_X, turn];

const fromRotateYToTransform = (turn) => [TRANSFORM_ROTATE_Y, turn];

const fromRotateZToTransform = (turn) => [TRANSFORM_ROTATE_Z, turn];

const fromTranslateToTransform = (x = 0, y = 0, z = 0) => {
  if (typeof x !== 'number') throw Error('die/x');
  if (typeof y !== 'number') throw Error('die/y');
  if (typeof z !== 'number') throw Error('die/z');
  return [TRANSFORM_TRANSLATE, [x, y, z]];
};

const fromScaleToTransform = (x = 1, y = 1, z = 1) => [
  TRANSFORM_SCALE,
  [x, y, z],
];

const fromSegmentToInverseTransform = (
  [[startX = 0, startY = 0, startZ = 0], [endX = 0, endY = 0, endZ = 0]],
  [normalX = 0, normalY = 0, normalZ = 1]
) => {
  try {
    const jsTransform = [];
    getCgal().InverseSegmentTransform(
      startX,
      startY,
      startZ,
      endX,
      endY,
      endZ,
      normalX,
      normalY,
      normalZ,
      jsTransform
    );
    return jsTransform;
  } catch (error) {
    throw Error(error);
  }
};

const toApproximateMatrix = (matrix = identityMatrix) => {
  if (matrix[0] === TRANSFORM_APPROXIMATE) {
    return matrix;
  }
  const transform = [];
  getCgal().ToApproximateMatrix(matrix, transform);
  return transform;
};

// TODO: Remove this.
const identity = () => [TRANSFORM_IDENTITY];

const matrix6 = (a, b, c, d, tx, ty) =>
  makeApproximateMatrix([a, b, 0, 0, c, d, 0, 0, 0, 0, 1, 0, tx, ty, 0, 1]);

const STATUS_OK = 0;
const STATUS_EMPTY = 1;
const STATUS_ZERO_THICKNESS = 2;
const STATUS_UNCHANGED = 3;
const STATUS_INVALID_INPUT = 4;

/* globals WeakRef */

const GEOMETRY_UNKNOWN = 0;
const GEOMETRY_MESH = 1;
const GEOMETRY_POLYGONS_WITH_HOLES = 2;
const GEOMETRY_SEGMENTS = 3;
const GEOMETRY_POINTS = 4;
const GEOMETRY_EMPTY = 5;
const GEOMETRY_REFERENCE = 6;
const GEOMETRY_EDGES = 7;

const meshCache = new WeakMap();

const clearMeshCache = () => {
  console.log(`QQ/clearMeshCache/noop`);
};

const getCachedMesh = (key, mesh) => {
  const ref = meshCache.get(key);
  if (ref === undefined) {
    return;
  }
  return ref.deref();
};

const setCachedMesh = (key, mesh) => {
  const ref = new WeakRef(mesh);
  meshCache.set(key, ref);
};

let testMode = false;

const setTestMode = (mode) => { testMode = mode; };

const fillCgalGeometry = (geometry, inputs) => {
  const g = getCgal();
  geometry.setSize(inputs.length);
  for (let nth = 0; nth < inputs.length; nth++) {
    const { tags = [] } = inputs[nth];
    g.SetTransform(geometry, nth, inputs[nth].matrix || identityMatrix);
    if (tags.includes('type:reference')) {
      geometry.setType(nth, GEOMETRY_REFERENCE);
      continue;
    }
    switch (inputs[nth].type) {
      case 'graph':
        const { graph } = inputs[nth];
        geometry.setType(nth, GEOMETRY_MESH);
        let mesh = getCachedMesh(graph);
        if (mesh) {
          geometry.setInputMesh(nth, mesh);
        } else if (graph.serializedSurfaceMesh) {
          geometry.deserializeInputMesh(nth, graph.serializedSurfaceMesh);
        } else {
          throw Error(`Cannot deserialize surface mesh: ${JSON.stringify(inputs[nth])}`);
        }
        break;
      case 'polygonsWithHoles': {
        const { exactPlane, plane, polygonsWithHoles } = inputs[nth];
        geometry.setType(nth, GEOMETRY_POLYGONS_WITH_HOLES);
        if (exactPlane) {
          geometry.setPolygonsPlaneExact(nth, exactPlane);
        } else {
          const [x, y, z, w] = plane;
          geometry.setPolygonsPlane(nth, x, y, z, w);
        }
        for (const polygon of polygonsWithHoles) {
          geometry.addPolygon(nth);
          if (polygon.exactPoints) {
            for (const exact of polygon.exactPoints) {
              geometry.addPolygonPointExact(nth, exact);
            }
          } else {
            for (const [x, y] of polygon.points) {
              geometry.addPolygonPoint(nth, x, y);
            }
          }
          for (const hole of polygon.holes) {
            geometry.addPolygonHole(nth);
            if (hole.exactPoints) {
              for (const exact of hole.exactPoints) {
                geometry.addPolygonHolePointExact(nth, exact);
              }
            } else {
              for (const [x, y] of hole.points) {
                geometry.addPolygonHolePoint(nth, x, y);
              }
            }
            geometry.finishPolygonHole(nth);
          }
          geometry.finishPolygon(nth);
        }
        break;
      }
      case 'segments': {
        const { segments } = inputs[nth];
        geometry.setType(nth, GEOMETRY_SEGMENTS);
        for (const [[sX = 0, sY = 0, sZ = 0], [eX = 0, eY = 0, eZ = 0], exact] of segments) {
          try {
            if (exact) {
              geometry.addInputSegmentExact(nth, exact);
            } else {
              geometry.addInputSegment(nth, sX, sY, sZ, eX, eY, eZ);
            }
          } catch (error) {
            throw error;
          }
        }
        break;
      }
      case 'points': {
        const { exactPoints, points } = inputs[nth];
        geometry.setType(nth, GEOMETRY_POINTS);
        if (exactPoints) {
          for (const exact of exactPoints) {
            try {
              geometry.addInputPointExact(nth, exact);
            } catch (error) {
              console.log(`QQ/exact: ${JSON.stringify(exact)}`);
              throw error;
            }
          }
        } else if (points) {
          for (const [x = 0, y = 0, z = 0] of points) {
            geometry.addInputPoint(nth, x, y, z);
          }
        }
        break;
      }
      default: {
        geometry.setType(nth, GEOMETRY_UNKNOWN);
        break;
      }
    }
  }
  return geometry;
};

const toCgalGeometry = (inputs, g = getCgal()) => {
  const cgalGeometry = new (g.Geometry)();
  fillCgalGeometry(cgalGeometry, inputs);
  return cgalGeometry;
};

const fromCgalGeometry = (geometry, inputs, length = inputs.length, start = 0, copyOriginal = false) => {
  const g = getCgal();
  if (testMode && g.Validate(geometry, [0, /* 1, */ 2, 3], false, true) !== STATUS_OK) {
    throw Error('fromCgalGeometry: invalid geometry');
  }
  let results = [];
  for (let nth = start; nth < length; nth++) {
    const origin = copyOriginal ? geometry.getOrigin(nth) : nth;
    const tags = [];
    switch (geometry.getType(nth)) {
      case GEOMETRY_MESH: {
        const matrix = [];
        g.GetTransform(geometry, nth, matrix);
        let { graph } = inputs[origin] || {};
        let update = false;
        let newMesh;
        let serializedSurfaceMesh;
        if (geometry.has_mesh(nth)) {
          const oldMesh = getCachedMesh(graph);
          newMesh = geometry.getMesh(nth);
          if (newMesh === oldMesh) {
            serializedSurfaceMesh = graph.serializedSurfaceMesh;
          } else {
            serializedSurfaceMesh = geometry.getSerializedMesh(nth);
            update = true;
          }
        }
        if (update) {
          graph = {
            serializedSurfaceMesh,
          };
          graph.hash = computeHash(graph);
          // Not part of the hash.
          if (newMesh) {
            setCachedMesh(graph, newMesh);
          }
        }
        results[nth] = {
          type: 'graph',
          matrix,
          tags,
          graph
        };
        break;
      }
      case GEOMETRY_POLYGONS_WITH_HOLES: {
        const matrix = [];
        g.GetTransform(geometry, nth, matrix);
        results[nth] = {
          type: 'polygonsWithHoles',
          tags,
          matrix
        };
        g.GetPolygonsWithHoles(geometry, nth, results[nth]);
        break;
      }
      case GEOMETRY_SEGMENTS: {
        const matrix = [];
        g.GetTransform(geometry, nth, matrix);
        results[nth] = {
          type: 'segments',
          matrix,
          tags
        };
        g.GetSegments(geometry, nth, results[nth]);
        break;
      }
      case GEOMETRY_POINTS: {
        const matrix = [];
        g.GetTransform(geometry, nth, matrix);
        results[nth] = {
          type: 'points',
          matrix,
          tags
        };
        g.GetPoints(geometry, nth, results[nth]);
        break;
      }
      case GEOMETRY_EDGES: {
        const matrix = [];
        g.GetTransform(geometry, nth, matrix);
        // TODO: Figure out segments vs edges.
        results[nth] = {
          type: 'segments',
          matrix,
          tags,
        };
        g.GetEdges(geometry, nth, results[nth]);
        break;
      }
      default:
      case GEOMETRY_EMPTY: {
        results[nth] = { type: 'group', content: [], tags: [] };
      }
    }
    g.GetTags(geometry, nth, tags);
  }
  // Coallesce
  for (let nth = start; nth < length; nth++) {
    const origin = geometry.getOrigin(nth);
    // Merge the input tags.
    // This is really the wrong thing to do, as we can't strip tags this way.
    if (inputs[origin]) {
      results[nth].tags = [...inputs[origin].tags, ...results[nth].tags];
    }
    if (origin === nth) {
      continue;
    }
    if (results[origin] === undefined) {
      results[origin] = { type: 'group', content: [], tags: [] };
    } else if (results[origin].type !== 'group') {
      results[origin] = { type: 'group', content: [results[origin]], tags: [] };
    }
    results[origin].content.push(results[nth]);
    results[nth] = undefined;
  }
  let output;
  if (start === 0) {
    output = results;
  } else {
    output = results.slice(start);
  }
  return output.filter(value => value !== undefined);
};

const withCgalGeometry = (name, inputs, op) => {
  const g = getCgal();
  const cgalGeometry = toCgalGeometry(inputs, g);
  try {
    const result = op(cgalGeometry, g);
    return result;
  } catch (error) {
    console.log(`withCgalGeometry error: ${name}`);
    console.log(error.stack);
    throw error;
  } finally {
    cgalGeometry.delete();
  }
};

class ErrorZeroThickness extends Error {}

const approximate = (inputs, faceCount = 0, minErrorDrop = 0) =>
  withCgalGeometry('approximate', inputs, (cgalGeometry, g) => {
    console.log(`QQ/approximate: ${typeof faceCount} ${typeof minErrorDrop}`);
    const status = g.Approximate(
      cgalGeometry,
      Number(faceCount),
      Number(minErrorDrop)
    );
    switch (status) {
      case STATUS_ZERO_THICKNESS:
        throw new ErrorZeroThickness('Zero thickness produced by approximate');
      case STATUS_OK:
        return fromCgalGeometry(cgalGeometry, inputs);
      default:
        throw new Error(`Unexpected status ${status} in approximate`);
    }
  });

const bend = (inputs, targetsLength, edgeLength = 1) =>
  withCgalGeometry('bend', inputs, (cgalGeometry, g) => {
    const status = g.Bend(
      cgalGeometry,
      Number(targetsLength),
      Number(edgeLength)
    );
    switch (status) {
      case STATUS_ZERO_THICKNESS:
        throw new ErrorZeroThickness('Zero thickness produced by bend');
      case STATUS_OK:
        return fromCgalGeometry(cgalGeometry, inputs);
      default:
        throw new Error(`Unexpected status ${status} in bend`);
    }
  });

const graphSymbol = Symbol('graph');
const surfaceMeshSymbol = Symbol('surfaceMeshSymbol');

const cast = (inputs) =>
  withCgalGeometry('cast', inputs, (cgalGeometry, g) => {
    const status = g.Cast(cgalGeometry);
    switch (status) {
      case STATUS_ZERO_THICKNESS:
        throw new ErrorZeroThickness('Zero thickness produced by cast');
      case STATUS_OK:
        return fromCgalGeometry(cgalGeometry, inputs, cgalGeometry.getSize());
      default:
        throw new Error(`Unexpected status ${status} in cast`);
    }
  });

const clip = (inputs, targetsLength, open = false, exact = false) =>
  withCgalGeometry('clip', inputs, (cgalGeometry, g) => {
    const status = g.Clip(
      cgalGeometry,
      Number(targetsLength),
      Boolean(open),
      Boolean(exact)
    );
    switch (status) {
      case STATUS_ZERO_THICKNESS:
        throw new ErrorZeroThickness('Zero thickness produced by clip');
      case STATUS_OK:
        return fromCgalGeometry(cgalGeometry, inputs, cgalGeometry.getSize());
      default:
        throw new Error(`Unexpected status ${status} in clip`);
    }
  });

const computeArea = (linear) =>
  withCgalGeometry('computeArea', linear, (geometry, g) =>
    g.ComputeArea(geometry)
  );

const computeBoundingBox = (inputs) => {
  if (inputs.length === 0) {
    return;
  }
  return withCgalGeometry('computeBoundingBox', inputs, (cgalGeometry, g) => {
    const bbox = [];
    const status = g.ComputeBoundingBox(cgalGeometry, bbox);
    switch (status) {
      case STATUS_ZERO_THICKNESS:
        throw new ErrorZeroThickness(
          'Zero thickness produced by computeBoundingBox'
        );
      case STATUS_OK:
        return bbox;
      case STATUS_EMPTY:
        return;
      default:
        throw new Error(`Unexpected status ${status} in computeBoundingBox`);
    }
  });
};

const computeCentroid = (inputs) =>
  withCgalGeometry('computeCentroid', inputs, (cgalGeometry, g) => {
    const status = g.ComputeCentroid(cgalGeometry);
    switch (status) {
      case STATUS_ZERO_THICKNESS:
        throw new ErrorZeroThickness(
          'Zero thickness produced by computeCentroid'
        );
      case STATUS_OK:
        return fromCgalGeometry(cgalGeometry, inputs);
      default:
        throw new Error(`Unexpected status ${status} in computeCentroid`);
    }
  });

const computeImplicitVolume = (
  op,
  radius = 1,
  angularBound = 30,
  radiusBound = 0.1,
  distanceBound = 0.1,
  errorBound = 0.001
) =>
  withCgalGeometry('computeImplicitVolume', [], (cgalGeometry, g) => {
    const status = g.ComputeImplicitVolume(
      cgalGeometry,
      op,
      Number(radius),
      Number(angularBound),
      Number(radiusBound),
      Number(distanceBound),
      Number(errorBound)
    );
    switch (status) {
      case STATUS_ZERO_THICKNESS:
        throw new ErrorZeroThickness(
          'Zero thickness produced by computeImplicitVolume'
        );
      case STATUS_OK:
        return fromCgalGeometry(cgalGeometry, [], cgalGeometry.getSize());
      default:
        throw new Error(`Unexpected status ${status} in computeImplicitVolume`);
    }
  });

const computeNormal = (inputs) =>
  withCgalGeometry('computeNormal', inputs, (cgalGeometry, g) => {
    const status = g.ComputeNormal(cgalGeometry);
    switch (status) {
      case STATUS_ZERO_THICKNESS:
        throw new ErrorZeroThickness(
          'Zero thickness produced by computeNormal'
        );
      case STATUS_OK:
        return fromCgalGeometry(cgalGeometry, inputs);
      default:
        throw new Error(`Unexpected status ${status} in computeNormal`);
    }
  });

const computeOrientedBoundingBox = (inputs, segments, mesh) => {
  if (inputs.length === 0) {
    return;
  }
  return withCgalGeometry(
    'computeOrientedBoundingBox',
    inputs,
    (cgalGeometry, g) => {
      const status = g.ComputeOrientedBoundingBox(cgalGeometry, segments, mesh);
      // This adds segments with twelve entries: length, depth, height, ...
      switch (status) {
        case STATUS_ZERO_THICKNESS:
          throw new ErrorZeroThickness(
            'Zero thickness produced by computeOrientedBoundingBox'
          );
        case STATUS_OK:
          return fromCgalGeometry(
            cgalGeometry,
            inputs,
            cgalGeometry.getSize(),
            inputs.length
          );
        case STATUS_EMPTY:
          return;
        default:
          throw new Error(
            `Unexpected status ${status} in computeOrientedBoundingBox`
          );
      }
    }
  );
};

const computeReliefFromImage = (
  x,
  y,
  z,
  data,
  angularBound = 30,
  radiusBound = 1,
  distanceBound = 1,
  errorBound = 1,
  extrusion = 10
) =>
  withCgalGeometry('computeReliefFromImage', [], (cgalGeometry, g) => {
    const cStorage = g._malloc(data.length);
    try {
      const cArray = new Uint8Array(g.HEAPU8.buffer, cStorage, data.length);
      cArray.set(data);
      const status = g.ComputeReliefFromImage(
        cgalGeometry,
        Number(x),
        Number(y),
        Number(z),
        cStorage,
        Number(angularBound),
        Number(radiusBound),
        Number(distanceBound),
        Number(errorBound),
        Number(extrusion)
      );
      switch (status) {
        case STATUS_ZERO_THICKNESS:
          throw new ErrorZeroThickness(
            'Zero thickness produced by computeReliefFromImage'
          );
        case STATUS_OK:
          return fromCgalGeometry(cgalGeometry, [], cgalGeometry.getSize());
        default:
          throw new Error(
            `Unexpected status ${status} in computeReliefFromImage`
          );
      }
    } finally {
      g._free(cStorage);
    }
  });

const computeSkeleton = (inputs) =>
  withCgalGeometry('computeSkeleton', inputs, (cgalGeometry, g) => {
    const status = g.ComputeSkeleton(cgalGeometry);
    switch (status) {
      case STATUS_ZERO_THICKNESS:
        throw new ErrorZeroThickness(
          'Zero thickness produced by computeSkeleton'
        );
      case STATUS_OK:
        return fromCgalGeometry(
          cgalGeometry,
          inputs,
          cgalGeometry.getSize(),
          inputs.length
        );
      default:
        throw new Error(`Unexpected status ${status} in computeSkeleton`);
    }
  });

const computeToolpath = (
  inputs,
  materialStart,
  resolution = 1,
  toolSize = 1,
  toolCutDepth = 1,
  annealingMax = 1,
  annealingMin = 0.01,
  annealingDecay = 0.99,
  simple = false
) =>
  withCgalGeometry('computeToolpath', inputs, (cgalGeometry, g) => {
    const status = g.ComputeToolpath(
      cgalGeometry,
      Number(materialStart),
      Number(resolution),
      Number(toolSize),
      Number(toolCutDepth),
      Number(annealingMax),
      Number(annealingMin),
      Number(annealingDecay),
      simple
    );
    switch (status) {
      case STATUS_ZERO_THICKNESS:
        throw new ErrorZeroThickness(
          'Zero thickness produced by computeToolpath'
        );
      case STATUS_OK:
        return fromCgalGeometry(
          cgalGeometry,
          inputs,
          cgalGeometry.getSize(),
          inputs.length
        );
      default:
        throw new Error(`Unexpected status ${status} in computeToolpath`);
    }
  });

const computeVolume = (linear) =>
  withCgalGeometry('computeVolume', linear, (geometry, g) =>
    g.ComputeVolume(geometry)
  );

const convertPolygonsToMeshes = (inputs) =>
  withCgalGeometry('convertPolygonsToMeshes', inputs, (cgalGeometry, g) => {
    const status = g.ConvertPolygonsToMeshes(cgalGeometry);
    switch (status) {
      case STATUS_ZERO_THICKNESS:
        throw new ErrorZeroThickness(
          'Zero thickness produced by convertPolygonsToMeshes'
        );
      case STATUS_OK:
        return fromCgalGeometry(cgalGeometry, inputs);
      default:
        throw new Error(
          `Unexpected status ${status} in convertPolygonsToMeshes`
        );
    }
  });

const convexHull = (inputs) =>
  withCgalGeometry('convexHull', inputs, (cgalGeometry, g) => {
    const status = g.ConvexHull(cgalGeometry);
    switch (status) {
      case STATUS_ZERO_THICKNESS:
        throw new ErrorZeroThickness('Zero thickness produced by convexHull');
      case STATUS_OK:
        return fromCgalGeometry(
          cgalGeometry,
          inputs,
          cgalGeometry.getSize(),
          inputs.length
        );
      default:
        throw new Error(`Unexpected status ${status} in convexHull`);
    }
  });

const cut = (inputs, targetsLength, open = false, exact = false) =>
  withCgalGeometry('cut', inputs, (cgalGeometry, g) => {
    const status = g.Cut(
      cgalGeometry,
      Number(targetsLength),
      Boolean(open),
      Boolean(exact)
    );
    switch (status) {
      case STATUS_ZERO_THICKNESS:
        throw new ErrorZeroThickness('Zero thickness produced by cut');
      case STATUS_OK:
        return fromCgalGeometry(cgalGeometry, inputs, targetsLength);
      default:
        throw new Error(`Unexpected status ${status} in cut`);
    }
  });

// FIX
const deform = (
  inputs,
  length,
  iterations = 1000,
  tolerance = 0.0001,
  alpha = 0.02
) => {
  return withCgalGeometry('deform', inputs, (cgalGeometry, g) => {
    const status = g.Deform(
      cgalGeometry,
      Number(length),
      Number(iterations),
      Number(tolerance),
      Number(alpha)
    );
    switch (status) {
      case STATUS_ZERO_THICKNESS:
        throw new ErrorZeroThickness('Zero thickness produced by deform');
      case STATUS_OK:
        return fromCgalGeometry(cgalGeometry, inputs, 1);
      default:
        throw new Error(`Unexpected status ${status} in deform`);
    }
  });
};

const demesh = (inputs) =>
  withCgalGeometry('demesh', inputs, (cgalGeometry, g) => {
    const status = g.Demesh(cgalGeometry);
    switch (status) {
      case STATUS_ZERO_THICKNESS:
        throw new ErrorZeroThickness('Zero thickness produced by demesh');
      case STATUS_OK:
        return fromCgalGeometry(cgalGeometry, inputs);
      default:
        throw new Error(`Unexpected status ${status} in demesh`);
    }
  });

const dilateXY = (inputs, amount) => {
  return withCgalGeometry('dilateXY', inputs, (cgalGeometry, g) => {
    const status = g.DilateXY(cgalGeometry, Number(amount));
    switch (status) {
      case STATUS_ZERO_THICKNESS:
        throw new ErrorZeroThickness('Zero thickness produced by dilateXY');
      case STATUS_OK:
        return fromCgalGeometry(cgalGeometry, inputs);
      default:
        throw new Error(`Unexpected status ${status} in dilateXY`);
    }
  });
};

const disjoint = (inputs, exact = false) =>
  withCgalGeometry('disjoint', inputs, (geometry, g) => {
    // These are custom inputs.
    const isMasked = inputs.map(
      ({ tags }) => tags && tags.includes('type:masked')
    );
    const status = g.Disjoint(geometry, isMasked, Boolean(exact));
    switch (status) {
      case STATUS_ZERO_THICKNESS:
        throw new ErrorZeroThickness('Zero thickness produced by disjoint');
      case STATUS_OK:
        return fromCgalGeometry(geometry, inputs);
      case STATUS_UNCHANGED:
        return inputs;
      case STATUS_INVALID_INPUT:
        if (!exact) {
          // Retry with exact geometry.
          return disjoint(inputs, true);
        }
        throw new Error(`Disjoint failed due to bad geometry`);
      default:
        throw new Error(`Unexpected status ${status} in disjoint`);
    }
  });

const eachPoint = (inputs, emit) =>
  withCgalGeometry('eachPoint', inputs, (cgalGeometry, g) => {
    const status = g.EachPoint(cgalGeometry, (x, y, z, exact) =>
      emit([x, y, z, exact])
    );
    switch (status) {
      case STATUS_OK:
        return;
      default:
        throw new Error(`Unexpected status ${status} in eachPoint`);
    }
  });

const eachTriangle = (inputs, emitTriangle) => {
  let triangle = [];
  const admitPoint = (x, y, z) => {
    triangle.push([x, y, z]);
    if (triangle.length === 3) {
      emitTriangle(triangle);
      triangle = [];
    }
  };
  return withCgalGeometry('eachTriangle', inputs, (cgalGeometry, g) => {
    const status = g.EachTriangle(cgalGeometry, admitPoint);
    switch (status) {
      case STATUS_ZERO_THICKNESS:
        throw new ErrorZeroThickness(
          'Zero thickness produced by eachTriangles'
        );
      case STATUS_OK:
        return;
      default:
        throw new Error(`Unexpected status ${status} in eachTriangles`);
    }
  });
};

const eagerTransform = (inputs) =>
  withCgalGeometry('eagerTransform', inputs, (cgalGeometry, g) => {
    const status = g.EagerTransform(cgalGeometry, inputs.length - 1);
    switch (status) {
      case STATUS_ZERO_THICKNESS:
        throw new ErrorZeroThickness(
          'Zero thickness produced by eagerTransform'
        );
      case STATUS_OK:
        return fromCgalGeometry(cgalGeometry, inputs, inputs.length - 1);
      default:
        throw new Error(`Unexpected status ${status} in eagerTransform`);
    }
  });

const extrude = (inputs, count) =>
  withCgalGeometry('extrude', inputs, (cgalGeometry, g) => {
    const status = g.Extrude(cgalGeometry, Number(count));
    switch (status) {
      case STATUS_ZERO_THICKNESS:
        throw new ErrorZeroThickness('Zero thickness produced by extrude');
      case STATUS_OK:
        return fromCgalGeometry(cgalGeometry, inputs, cgalGeometry.getSize());
      default:
        throw new Error(`Unexpected status ${status} in extrude`);
    }
  });

const faceEdges = (inputs, count) => {
  return withCgalGeometry('faceEdges', inputs, (cgalGeometry, g) => {
    const status = g.FaceEdges(cgalGeometry, Number(count));
    switch (status) {
      case STATUS_ZERO_THICKNESS:
        throw new ErrorZeroThickness('Zero thickness produced by faceEdges');
      case STATUS_OK:
        return fromCgalGeometry(
          cgalGeometry,
          inputs,
          cgalGeometry.getSize(),
          inputs.length
        );
      default:
        throw new Error(`Unexpected status ${status} in faceEdges`);
    }
  });
};

const fair = (
  inputs,
  count,
  resolution = 1,
  numberOfIterations = 1,
  remeshIterations = 1,
  remeshRelaxationSteps = 1
) =>
  withCgalGeometry('fair', inputs, (cgalGeometry, g) => {
    const status = g.Fair(
      cgalGeometry,
      Number(count),
      Number(resolution),
      Number(numberOfIterations),
      Number(remeshIterations),
      Number(remeshRelaxationSteps)
    );
    switch (status) {
      case STATUS_ZERO_THICKNESS:
        throw new ErrorZeroThickness('Zero thickness produced by fair');
      case STATUS_OK:
        return fromCgalGeometry(cgalGeometry, inputs, count);
      default:
        throw new Error(`Unexpected status ${status} in fair`);
    }
  });

const fill = (inputs, holes = false) =>
  withCgalGeometry('fill', inputs, (cgalGeometry, g) => {
    const status = g.Fill(cgalGeometry, holes);
    switch (status) {
      case STATUS_ZERO_THICKNESS:
        throw new ErrorZeroThickness('Zero thickness produced by fill');
      case STATUS_OK:
        return fromCgalGeometry(
          cgalGeometry,
          inputs,
          cgalGeometry.getSize(),
          inputs.length
        );
      default:
        throw new Error(`Unexpected status ${status} in fill`);
    }
  });

const X = 0;
const Y = 1;
const Z = 2;
const W = 3;

const fitPlaneToPoints = (points) => {
  try {
    const c = getCgal();
    const plane = [0, 0, 1, 0];
    c.FitPlaneToPoints(
      (triples) => {
        let count = 0;
        for (const [x, y, z] of points) {
          c.addDoubleTriple(triples, x, y, z);
          if (count++ > 1000) {
            // We're blowing the stack when this is too high.
            break;
          }
        }
      },
      (x, y, z, w) => {
        plane[X] = x;
        plane[Y] = y;
        plane[Z] = z;
        plane[W] = -w;
      }
    );
    return plane;
  } catch (error) {
    throw Error(error);
  }
};

const fix = (inputs, selfIntersection = true) =>
  withCgalGeometry('fix', inputs, (cgalGeometry, g) => {
    const status = g.Fix(cgalGeometry, Boolean(selfIntersection));
    switch (status) {
      case STATUS_ZERO_THICKNESS:
        throw new ErrorZeroThickness('Zero thickness produced by fix');
      case STATUS_OK:
        return fromCgalGeometry(cgalGeometry, inputs);
      default:
        throw new Error(`Unexpected status ${status} in fix`);
    }
  });

const generateRepairStrategyCodes = (strategies) => {
  const strategyCodes = [];
  for (const strategy of strategies) {
    switch (strategy) {
      case 'auto':
        strategyCodes.push(0);
        break;
      case 'patch':
        strategyCodes.push(1);
        break;
      case 'wrap':
        strategyCodes.push(2);
        break;
      case 'close':
        strategyCodes.push(3);
        break;
      default:
        throw new Error(
          `Repair strategy: ${strategy} not in ['auto', 'close', 'patch', 'wrap'].`
        );
    }
  }
  return strategyCodes;
};

const repair = (inputs, strategies = []) =>
  withCgalGeometry('repair', inputs, (cgalGeometry, g) => {
    const status = g.Repair(
      cgalGeometry,
      generateRepairStrategyCodes(strategies)
    );
    switch (status) {
      case STATUS_ZERO_THICKNESS:
        throw new ErrorZeroThickness('Zero thickness produced by repair');
      case STATUS_OK:
        return fromCgalGeometry(cgalGeometry, inputs, cgalGeometry.getSize());
      default:
        throw new Error(`Unexpected status ${status} in repair`);
    }
  });

const fromPolygonSoup = (
  jsPolygons,
  tolerance = 0,
  faceCountLimit = 0,
  minErrorDrop = 0,
  strategies = []
) =>
  withCgalGeometry('fromPolygonSoup', [], (cgalGeometry, g) => {
    cgalGeometry.setSize(jsPolygons.length);
    for (let nth = 0; nth < jsPolygons.length; nth++) {
      const { points } = jsPolygons[nth];
      cgalGeometry.setType(nth, GEOMETRY_POINTS);
      for (const [x, y, z] of points) {
        cgalGeometry.addInputPoint(nth, x, y, z);
      }
    }
    const status = g.FromPolygonSoup(
      cgalGeometry,
      Number(faceCountLimit),
      Number(minErrorDrop),
      generateRepairStrategyCodes(strategies)
    );
    console.log(`QQ/fromPolygonSoup/1`);
    switch (status) {
      case STATUS_ZERO_THICKNESS:
        throw new ErrorZeroThickness(
          'Zero thickness produced by fromPolygonSoup'
        );
      case STATUS_OK:
        return fromCgalGeometry(
          cgalGeometry,
          [],
          cgalGeometry.getSize(),
          jsPolygons.length
        );
      default:
        throw new Error(`Unexpected status ${status} in fromPolygonSoup`);
    }
  });

const fuse = (inputs, exact = false) =>
  withCgalGeometry('fuse', inputs, (cgalGeometry, g) => {
    const status = g.Fuse(cgalGeometry, Boolean(exact));
    switch (status) {
      case STATUS_ZERO_THICKNESS:
        throw new ErrorZeroThickness('Zero thickness produced by fuse');
      case STATUS_OK:
        return fromCgalGeometry(
          cgalGeometry,
          inputs,
          cgalGeometry.getSize(),
          inputs.length
        );
      default:
        throw new Error(`Unexpected status ${status} in fuse`);
    }
  });

const generateEnvelope = (
  inputs,
  envelopeType,
  { plan, face, edge } = {}
) =>
  withCgalGeometry('generateEnvelope', inputs, (cgalGeometry, g) => {
    const status = g.GenerateEnvelope(
      cgalGeometry,
      Number(envelopeType),
      Boolean(plan),
      Boolean(face),
      Boolean(edge)
    );
    switch (status) {
      case STATUS_ZERO_THICKNESS:
        throw new ErrorZeroThickness(
          'Zero thickness produced by generateEnvelope'
        );
      case STATUS_OK:
        return fromCgalGeometry(
          cgalGeometry,
          inputs,
          cgalGeometry.getSize(),
          inputs.length
        );
      default:
        throw new Error(`Unexpected status ${status} in generateEnvelope`);
    }
  });

const grow = (inputs, count) =>
  withCgalGeometry('grow', inputs, (cgalGeometry, g) => {
    const status = g.Grow(cgalGeometry, Number(count));
    switch (status) {
      case STATUS_ZERO_THICKNESS:
        throw new ErrorZeroThickness('Zero thickness produced by grow');
      case STATUS_OK:
        return fromCgalGeometry(cgalGeometry, inputs, cgalGeometry.getSize());
      default:
        throw new Error(`Unexpected status ${status} in grow`);
    }
  });

const inset = (
  inputs,
  initial = 1,
  step = -1,
  limit = -1,
  segments = 16
) =>
  withCgalGeometry('inset', inputs, (cgalGeometry, g) => {
    const status = g.Inset(
      cgalGeometry,
      Number(initial),
      Number(step),
      Number(limit),
      Number(segments)
    );
    switch (status) {
      case STATUS_ZERO_THICKNESS:
        throw new ErrorZeroThickness('Zero thickness produced by inset');
      case STATUS_OK:
        return fromCgalGeometry(
          cgalGeometry,
          inputs,
          cgalGeometry.getSize(),
          inputs.length
        );
      default:
        throw new Error(`Unexpected status ${status} in inset`);
    }
  });

const involute = (inputs) =>
  withCgalGeometry('involute', inputs, (cgalGeometry, g) => {
    const status = g.Involute(cgalGeometry);
    switch (status) {
      case STATUS_ZERO_THICKNESS:
        throw new ErrorZeroThickness('Zero thickness produced by simplify');
      case STATUS_OK:
        return fromCgalGeometry(cgalGeometry, inputs);
      default:
        throw new Error(`Unexpected status ${status} in simplify`);
    }
  });

const iron = (inputs, turn = 1 / 360) =>
  withCgalGeometry('iron', inputs, (cgalGeometry, g) => {
    const status = g.Iron(cgalGeometry, Number(turn));
    switch (status) {
      case STATUS_ZERO_THICKNESS:
        throw new ErrorZeroThickness('Zero thickness produced by iron');
      case STATUS_OK:
        return fromCgalGeometry(cgalGeometry, inputs);
      default:
        throw new Error(`Unexpected status ${status} in iron`);
    }
  });

const join = (inputs, targetsLength, exact = false) =>
  withCgalGeometry('join', inputs, (cgalGeometry, g) => {
    const status = g.Join(cgalGeometry, Number(targetsLength), Boolean(exact));
    switch (status) {
      case STATUS_ZERO_THICKNESS:
        throw new ErrorZeroThickness('Zero thickness produced by join');
      case STATUS_OK:
        return fromCgalGeometry(cgalGeometry, inputs, targetsLength);
      default:
        throw new Error(`Unexpected status ${status} in join`);
    }
  });

const link = (inputs, close, reverse) =>
  withCgalGeometry('link', inputs, (cgalGeometry, g) => {
    const status = g.Link(cgalGeometry, Boolean(close), Boolean(reverse));
    switch (status) {
      case STATUS_ZERO_THICKNESS:
        throw new ErrorZeroThickness('Zero thickness produced by link');
      case STATUS_OK:
        return fromCgalGeometry(
          cgalGeometry,
          inputs,
          cgalGeometry.getSize(),
          inputs.length
        );
      default:
        throw new Error(`Unexpected status ${status} in link`);
    }
  });

const loft = (inputs, close = true) =>
  withCgalGeometry('loft', inputs, (cgalGeometry, g) => {
    const status = g.Loft(cgalGeometry, Boolean(close));
    switch (status) {
      case STATUS_ZERO_THICKNESS:
        throw new ErrorZeroThickness('Zero thickness produced by loft');
      case STATUS_OK:
        return fromCgalGeometry(
          cgalGeometry,
          inputs,
          cgalGeometry.getSize(),
          inputs.length
        );
      default:
        throw new Error(`Unexpected status ${status} in loft`);
    }
  });

const offset = (
  inputs,
  initial = 1,
  step = -1,
  limit = -1,
  segments = 16
) =>
  withCgalGeometry('offset', inputs, (cgalGeometry, g) => {
    const status = g.Offset(
      cgalGeometry,
      Number(initial),
      Number(step),
      Number(limit),
      Number(segments)
    );
    switch (status) {
      case STATUS_ZERO_THICKNESS:
        throw new ErrorZeroThickness('Zero thickness produced by offset');
      case STATUS_OK:
        return fromCgalGeometry(
          cgalGeometry,
          inputs,
          cgalGeometry.getSize(),
          inputs.length
        );
      default:
        throw new Error(`Unexpected status ${status} in offset`);
    }
  });

const outline = (inputs) => {
  return withCgalGeometry('outline', inputs, (cgalGeometry, g) => {
    const status = g.Outline(cgalGeometry);
    switch (status) {
      case STATUS_ZERO_THICKNESS:
        throw new ErrorZeroThickness('Zero thickness produced by outline');
      case STATUS_OK:
        return fromCgalGeometry(cgalGeometry, inputs);
      default:
        throw new Error(`Unexpected status ${status} in outline`);
    }
  });
};

const makeAbsolute = (inputs) => {
  return withCgalGeometry('makeAbsolute', inputs, (cgalGeometry, g) => {
    const status = g.MakeAbsolute(cgalGeometry);
    switch (status) {
      case STATUS_ZERO_THICKNESS:
        throw new ErrorZeroThickness('Zero thickness produced by outline');
      case STATUS_OK:
        return fromCgalGeometry(cgalGeometry, inputs);
      default:
        throw new Error(`Unexpected status ${status} in outline`);
    }
  });
};

const makeUnitSphere = (angularBound, radiusBound, distanceBound) =>
  withCgalGeometry('makeUnitSphere', [], (cgalGeometry, g) => {
    const status = g.MakeUnitSphere(
      cgalGeometry,
      Number(angularBound),
      Number(radiusBound),
      Number(distanceBound)
    );
    switch (status) {
      case STATUS_ZERO_THICKNESS:
        throw new ErrorZeroThickness('Zero thickness produced by makeOrb');
      case STATUS_OK:
        return fromCgalGeometry(cgalGeometry, [], cgalGeometry.getSize())[0];
      default:
        throw new Error(`Unexpected status ${status} in makeOrb`);
    }
  });

const minimizeOverhang = (inputs, threshold, split = false) =>
  withCgalGeometry('minimizeOverhang', inputs, (cgalGeometry, g) => {
    const status = g.MinimizeOverhang(
      cgalGeometry,
      Number(threshold),
      Boolean(split)
    );
    switch (status) {
      case STATUS_ZERO_THICKNESS:
        throw new ErrorZeroThickness('Zero thickness produced by overhang');
      case STATUS_OK:
        return fromCgalGeometry(cgalGeometry, inputs);
      default:
        throw new Error(`Unexpected status ${status} in overhang`);
    }
  });

const pack = (
  inputs,
  count,
  orientations = [],
  { perimeterWeight = 1, boundsWeight = 1, holesWeight = 1 } = {},
  sheetByInput = []
) =>
  withCgalGeometry('pack', inputs, (cgalGeometry, g) => {
    const status = g.Pack(
      cgalGeometry,
      Number(count),
      orientations,
      perimeterWeight,
      boundsWeight,
      holesWeight,
      sheetByInput
    );
    switch (status) {
      case STATUS_OK:
        return fromCgalGeometry(cgalGeometry, inputs, cgalGeometry.getSize());
      default:
        throw new Error(`Unexpected status ${status} in pack`);
    }
  });

const pushSurfaceMesh = (
  mesh,
  transform,
  force,
  minimumDistance,
  scale = 1
) => {
  try {
    getCgal().PushSurfaceMesh(
      mesh,
      transform,
      Number(force),
      Number(minimumDistance),
      Number(scale)
    );
  } catch (error) {
    throw Error(error);
  }
};

const reconstruct = (inputs, offset = 0) =>
  withCgalGeometry('reconstruct', inputs, (cgalGeometry, g) => {
    const status = g.Reconstruct(cgalGeometry, Number(offset));
    switch (status) {
      case STATUS_ZERO_THICKNESS:
        throw new ErrorZeroThickness('Zero thickness produced by reconstruct');
      case STATUS_INVALID_INPUT:
        throw new ErrorZeroThickness('Reconstruction failed');
      case STATUS_OK:
        return fromCgalGeometry(cgalGeometry, inputs);
      default:
        throw new Error(`Unexpected status ${status} in reconstruct`);
    }
  });

const refine = (inputs, count, density = 0) =>
  withCgalGeometry('fair', inputs, (cgalGeometry, g) => {
    const status = g.Refine(cgalGeometry, Number(count), Number(density));
    switch (status) {
      case STATUS_ZERO_THICKNESS:
        throw new ErrorZeroThickness('Zero thickness produced by refine');
      case STATUS_OK:
        return fromCgalGeometry(cgalGeometry, inputs, count);
      default:
        throw new Error(`Unexpected status ${status} in refine`);
    }
  });

const remesh = (
  inputs,
  count,
  iterations,
  relaxationSteps,
  targetEdgeLength
) =>
  withCgalGeometry('remesh', inputs, (cgalGeometry, g) => {
    const status = g.Remesh(
      cgalGeometry,
      Number(count),
      Number(iterations),
      Number(relaxationSteps),
      Number(targetEdgeLength)
    );
    switch (status) {
      case STATUS_ZERO_THICKNESS:
        throw new ErrorZeroThickness('Zero thickness produced by remesh');
      case STATUS_OK:
        return fromCgalGeometry(cgalGeometry, inputs, count);
      default:
        throw new Error(`Unexpected status ${status} in remesh`);
    }
  });

const route = (inputs, toolCount) =>
  withCgalGeometry('route', inputs, (cgalGeometry, g) => {
    const status = g.Route(cgalGeometry, Number(toolCount));
    switch (status) {
      case STATUS_ZERO_THICKNESS:
        throw new ErrorZeroThickness('Zero thickness produced by route');
      case STATUS_OK:
        return fromCgalGeometry(
          cgalGeometry,
          inputs,
          cgalGeometry.getSize(),
          inputs.length
        );
      default:
        throw new Error(`Unexpected status ${status} in route`);
    }
  });

const seam = (inputs, count) =>
  withCgalGeometry('seam', inputs, (cgalGeometry, g) => {
    const status = g.Seam(cgalGeometry, Number(count));
    switch (status) {
      case STATUS_ZERO_THICKNESS:
        throw new ErrorZeroThickness('Zero thickness produced by seam');
      case STATUS_OK:
        return fromCgalGeometry(cgalGeometry, inputs, count);
      default:
        throw new Error(`Unexpected status ${status} in seam`);
    }
  });

const section = (inputs, count) => {
  return withCgalGeometry('section', inputs, (cgalGeometry, g) => {
    const status = g.Section(cgalGeometry, Number(count));
    switch (status) {
      case STATUS_ZERO_THICKNESS:
        throw new ErrorZeroThickness('Zero thickness produced by section');
      case STATUS_OK: {
        return fromCgalGeometry(cgalGeometry, inputs, cgalGeometry.getSize());
      }
      default:
        throw new Error(`Unexpected status ${status} in section`);
    }
  });
};

const separate = (
  inputs,
  keepShapes = true,
  keepHolesInShapes = true,
  keepHolesAsShapes = false
) =>
  withCgalGeometry('separate', inputs, (cgalGeometry, g) => {
    const status = g.Separate(
      cgalGeometry,
      Boolean(keepShapes),
      Boolean(keepHolesInShapes),
      Boolean(keepHolesAsShapes)
    );
    switch (status) {
      case STATUS_ZERO_THICKNESS:
        throw new ErrorZeroThickness('Zero thickness produced by separate');
      case STATUS_OK:
        return fromCgalGeometry(
          cgalGeometry,
          inputs,
          cgalGeometry.getSize(),
          inputs.length
        );
      default:
        throw new Error(`Unexpected status ${status} in separate`);
    }
  });

const serialize = (inputs) => {
  if (inputs.length === 0) {
    return;
  }
  return withCgalGeometry('serialize', inputs, (cgalGeometry, g) => {
    for (let nth = 0; nth < inputs.length; nth++) {
      const entry = inputs[nth];
      if (entry.type !== 'graph' || entry.graph.serializedSurfaceMesh) {
        continue;
      }
      entry.graph.serializedSurfaceMesh =
        cgalGeometry.getSerializedInputMesh(nth);
      entry.graph.hash = computeHash(entry.graph);
    }
    return inputs;
  });
};

const raycast = (
  inputs,
  {
    xStart = 0,
    xStride = 0,
    xSteps = 0,
    yStart = 0,
    yStride = 0,
    ySteps = 0,
    z = 0,
    points = [],
  }
) =>
  withCgalGeometry('raycast', inputs, (cgalGeometry, g) => {
    const status = g.Raycast(
      cgalGeometry,
      Number(xStart),
      Number(xStride),
      Number(xSteps),
      Number(yStart),
      Number(yStride),
      Number(ySteps),
      Number(z),
      points
    );
    switch (status) {
      case STATUS_OK:
        return true;
      default:
        throw new Error(`Unexpected status ${status} in raycast`);
    }
  });

const shell = (
  inputs,
  innerOffset,
  outerOffset,
  protect = false,
  angle = 30,
  sizing = 1,
  approx = 0.1,
  edgeSize = 1
) => {
  return withCgalGeometry('shell', inputs, (cgalGeometry, g) => {
    const status = g.Shell(
      cgalGeometry,
      Number(innerOffset),
      Number(outerOffset),
      Boolean(protect),
      Number(angle),
      Number(sizing),
      Number(approx),
      Number(edgeSize)
    );
    switch (status) {
      case STATUS_ZERO_THICKNESS:
        throw new ErrorZeroThickness('Zero thickness produced by shell');
      case STATUS_OK:
        return fromCgalGeometry(cgalGeometry, inputs);
      default:
        throw new Error(`Unexpected status ${status} in shell`);
    }
  });
};

const simplify = (inputs, cornerThreshold, eps) =>
  withCgalGeometry('simplify', inputs, (cgalGeometry, g) => {
    const status = g.Simplify(
      cgalGeometry,
      Number(cornerThreshold),
      eps !== undefined,
      Number(eps) || 0,
      false
    );
    switch (status) {
      case STATUS_ZERO_THICKNESS:
        throw new ErrorZeroThickness('Zero thickness produced by simplify');
      case STATUS_OK:
        return fromCgalGeometry(cgalGeometry, inputs, cgalGeometry.getSize());
      default:
        throw new Error(`Unexpected status ${status} in simplify`);
    }
  });

const smooth = (
  inputs,
  count,
  resolution = 0.25,
  steps = 1,
  time = 1,
  remeshIterations = 1,
  remeshRelaxationSteps = 1
) =>
  withCgalGeometry('smooth', inputs, (cgalGeometry, g) => {
    const status = g.Smooth(
      cgalGeometry,
      Number(count),
      Number(resolution),
      Number(steps),
      Number(time),
      Number(remeshIterations),
      Number(remeshRelaxationSteps)
    );
    switch (status) {
      case STATUS_ZERO_THICKNESS:
        throw new ErrorZeroThickness('Zero thickness produced by smooth');
      case STATUS_OK:
        return fromCgalGeometry(cgalGeometry, inputs, count);
      default:
        throw new Error(`Unexpected status ${status} in smooth`);
    }
  });

const trim = (inputs, count) =>
  withCgalGeometry('trim', inputs, (cgalGeometry, g) => {
    const status = g.Trim(cgalGeometry, Number(count));
    switch (status) {
      case STATUS_ZERO_THICKNESS:
        throw new ErrorZeroThickness('Zero thickness produced by trim');
      case STATUS_OK:
        return fromCgalGeometry(cgalGeometry, inputs, cgalGeometry.getSize());
      default:
        throw new Error(`Unexpected status ${status} in trim`);
    }
  });

const twist = (inputs, targetsLength) =>
  withCgalGeometry('twist', inputs, (cgalGeometry, g) => {
    const status = g.Twist(cgalGeometry, Number(targetsLength));
    switch (status) {
      case STATUS_ZERO_THICKNESS:
        throw new ErrorZeroThickness('Zero thickness produced by twist');
      case STATUS_OK:
        return fromCgalGeometry(cgalGeometry, inputs);
      default:
        throw new Error(`Unexpected status ${status} in twist`);
    }
  });

const unfold = (inputs, enableTabs = false) =>
  withCgalGeometry('unfold', inputs, (cgalGeometry, g) => {
    const tags = [];
    // Not sure that passing tags around like this is a sensible idea.
    const status = g.Unfold(
      cgalGeometry,
      Boolean(enableTabs),
      (nth, tag) => (tags[nth] = tag)
    );
    switch (status) {
      case STATUS_ZERO_THICKNESS:
        throw new ErrorZeroThickness('Zero thickness produced by section');
      case STATUS_OK:
        const output = fromCgalGeometry(
          cgalGeometry,
          inputs,
          cgalGeometry.getSize(),
          inputs.length
        );
        for (let nth = 0; nth < tags.length; nth++) {
          if (!tags[nth]) {
            continue;
          }
          const entry = output[nth - inputs.length];
          entry.tags = [...entry.tags, tags[nth]];
        }
        return output;
      default:
        throw new Error(`Unexpected status ${status} in section`);
    }
  });

const kAllStrategies = [
  'isNotSelfIntersecting',
  'isClosed',
  'isManifold',
  'isNotDegenerate',
];

const validate = (inputs, strategies = []) => {
  const strategyCodes = [];
  for (const strategy of strategies) {
    switch (strategy) {
      case 'isNotSelfIntersecting':
        strategyCodes.push(0);
        break;
      case 'isClosed':
        strategyCodes.push(1);
        break;
      case 'isManifold':
        strategyCodes.push(2);
        break;
      case 'isNotDegenerate':
        strategyCodes.push(3);
        break;
      default:
        throw new Error(
          `Repair strategy: ${strategy} not in ${kAllStrategies}.`
        );
    }
  }
  if (strategyCodes.length === 0) {
    strategyCodes.push(0, 1, 2, 3);
  }
  return withCgalGeometry('validate', inputs, (cgalGeometry, g) => {
    const status = g.Validate(cgalGeometry, strategyCodes, true, false);
    switch (status) {
      case STATUS_OK:
        return fromCgalGeometry(cgalGeometry, inputs, cgalGeometry.getSize());
      default:
        throw new Error(`Unexpected status ${status} in validate`);
    }
  });
};

const withIsExteriorPoint = (inputs, op) =>
  withCgalGeometry('withIsExteriorPoint', inputs, (cgalGeometry, g) => {
    const status = g.IsExteriorPointPrepare(cgalGeometry);
    switch (status) {
      case STATUS_OK: {
        const isExteriorPoint = (x = 0, y = 0, z = 0) =>
          g.IsExteriorPoint(cgalGeometry, x, y, z);
        return op(isExteriorPoint);
      }
      default:
        throw new Error(`Unexpected status ${status} in withIsExteriorPoint`);
    }
  });

const wrap = (
  inputs,
  alpha,
  offset,
  faceCount = 0,
  minErrorDrop = 0.0
) =>
  withCgalGeometry('wrap', inputs, (cgalGeometry, g) => {
    console.log(
      `QQ/wrap: ${JSON.stringify({ alpha, offset, faceCount, minErrorDrop })}`
    );
    const status = g.Wrap(
      cgalGeometry,
      Number(alpha),
      Number(offset),
      Number(faceCount),
      Number(minErrorDrop)
    );
    switch (status) {
      case STATUS_ZERO_THICKNESS:
        throw new ErrorZeroThickness('Zero thickness produced by wrap');
      case STATUS_OK:
        return fromCgalGeometry(
          cgalGeometry,
          inputs,
          cgalGeometry.getSize(),
          inputs.length
        );
      default:
        throw new Error(`Unexpected status ${status} in wrap`);
    }
  });

export { STATUS_EMPTY, STATUS_OK, STATUS_UNCHANGED, STATUS_ZERO_THICKNESS, TRANSFORM_APPROXIMATE, TRANSFORM_IDENTITY, approximate, bend, cast, clearMeshCache, clip, composeTransforms, computeArea, computeBoundingBox, computeCentroid, computeImplicitVolume, computeNormal, computeOrientedBoundingBox, computeReliefFromImage, computeSkeleton, computeToolpath, computeVolume, convertPolygonsToMeshes, convexHull, cut, deform, demesh, dilateXY, disjoint, eachPoint, eachTriangle, eagerTransform, extrude, faceEdges, fair, fill, fitPlaneToPoints, fix, fromPolygonSoup, fromRotateXToTransform, fromRotateYToTransform, fromRotateZToTransform, fromScaleToTransform, fromSegmentToInverseTransform, fromTranslateToTransform, fuse, generateEnvelope, graphSymbol, grow, identity, identityMatrix, initCgal, inset, invertTransform, involute, iron, join, link, loft, makeAbsolute, makeApproximateMatrix, makeExactMatrix, makeUnitSphere, matrix6, minimizeOverhang, offset, outline, pack, pushSurfaceMesh, raycast, reconstruct, refine, remesh, repair, route, seam, section, separate, serialize, setTestMode, shell, simplify, smooth, surfaceMeshSymbol, toApproximateMatrix, trim, twist, unfold, validate, withIsExteriorPoint, wrap };
