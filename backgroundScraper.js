var options = {
    url: "http://www.rachelelizabethbridal.com/atgb-summer-1",
    filter: ".filler",
    folder: "Summer",
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
    for (var j = 0; j < iframes.length; j++) {
        this.withFrame(j, function() {
            this.echo('inside iframe');
            //var filteredElems = this.getElementsInfo(options.filter);
            //u.dump(filteredElems);
            var filteredStyles = this.getElementsAttribute(options.filter, 'style');
            //u.dump(filteredStyles);
            var backgroundProps = getAttrFromStyles(filteredStyles, 'background-image');
            var urls = getUrlsFromValues(backgroundProps);
            //u.dump(urls);

            var didMake = fs.makeDirectory(options.folder);
            //this.echo(didMake);

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

                this.download(url, options.folder + '/' + fileName);
                this.echo('downloaded file ' + (i + 1) + ' out of ' + urls.length);
            }
            this.echo('download complete');
            this.echo('finished iframe ' + (j+1) + ' of ' + iframes.length);
        });
    }
});

casper.run(function() {
    this.echo('script complete');
    this.exit();
});