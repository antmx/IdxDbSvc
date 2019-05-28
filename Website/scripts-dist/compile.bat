echo compiling custom
rem browserify --debug IdxDbSvc.js -o bundle.js
browserify IdxDbSvc.js --debug | exorcist bundle.map.js > bundle.js
echo done
