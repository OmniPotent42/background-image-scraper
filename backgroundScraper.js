var options = {
    url: "http://www.rachelelizabethbridal.com/meetthedesigner",
    filter: ".filler",
    folder: "Designer",
    fullSize: false,
    //iframeIndex: null
}

var getAttrFromStyles = function(styles, property) {
    var urls = [];
    for (var i = 0; i < styles.length; i++) {
        var style = styles[i];
        var firstIndex = style.indexOf(property);
        //casper.echo(firstIndex);
        var indexStr = style.slice(firstIndex);
        var lastIndex = indexStr.indexOf(';');
        //casper.echo(lastIndex);
        var propStr = indexStr.slice(0, lastIndex);
        //casper.echo('prop string is: ' +  propStr);
        
        var justValue = propStr.slice(property.length + 2, propStr.length);
        
        //casper.echo('justValue is: ' + justValue);
        
        urls.push(justValue);
    }
    
    return urls;
}

var getUrlsFromValues = function(values) {
    var urls = [];
    
    for (var i = 0; i < values.length; i++) {
        var value = values[i];
        if (value.indexOf('url') === 0) {
            var justUrl = value.slice(4, value.length - 1);
            urls.push(justUrl);
        }
    }
    
    return urls;
}

var downloadResources = function(iframeIndex) {
    casper.withFrame(iframeIndex, function() {
            casper.echo('inside iframe ' + iframeIndex);
            //var filteredElems = this.getElementsInfo(options.filter);
            //u.dump(filteredElems);
            var filteredStyles = this.getElementsAttribute(options.filter, 'style');
            //u.dump(filteredStyles);
            var backgroundProps = getAttrFromStyles(filteredStyles, 'background-image');
            var urls = getUrlsFromValues(backgroundProps);
            //u.dump(urls);

            
            //this.echo(didMake);
            var subFolder = fs.makeDirectory(options.folder + '/' + 'iframe' + (iframeIndex + 1));
            casper.echo(subFolder);
            
            //download all of the urls we have
            for (var i = 0; i < urls.length; i++) {

                var index = urls[i].lastIndexOf("/") + 1;
                var fileName = urls[i].substr(index);
                var url = urls[i];

                if (options.fullSize) {
                    var extension = urls[i].slice(urls[i].lastIndexOf('.'));
                    var fullSize = urls[i].indexOf(extension);
                    var fullUrl = urls[i].slice(0, fullSize + extension.length);
                    this.echo(fullUrl);
                    url = fullUrl;
                }

                this.download(url, options.folder + '/' + 'iframe' + iframeIndex + '/' + fileName);
                this.echo('downloaded file ' + (i + 1) + ' out of ' + urls.length);
            }
            casper.echo('download complete');
            casper.echo('finished iframe ' + iframeIndex);
    })
}

var casper = require('casper').create({
    //verbose: true,
    //logLevel: "debug"
});

var u = require('utils');
var fs = require('fs');

casper.start(options.url, function() {
    this.echo(this.getTitle());
    //var styles = this.getElementsAttribute(options.filter, 'style');
});

casper.waitForSelector('iframe', function() {
    if (this.exists('iframe')) {
        this.echo('the iframe is found');
    } else {
        this.echo('the iframe is not found');
        this.exit();
    }
    
    var iframes = this.getElementsInfo('iframe');
    
    //require('utils').dump(iframes);
    var didMake = fs.makeDirectory(options.folder);
    for (var j = 0; j < iframes.length; j++) {
        this.echo('running loop ' + j + ' times');
        
        downloadResources(j);
    }
});

casper.run(function() {
    this.echo('script complete');
    this.exit();
});