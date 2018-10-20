'use strict';

var Counter = require('../models/counter.js'),
    UrlEntry = require('../models/urlEntry.js'),
    dns      = require('dns');

function getCountAndIncrease (req, res, callback) {
  Counter.findOneAndUpdate({}, {$inc: {'count': 1}}, function (err, data) {
    if (err) {
      return;
    }
    if (data) {
      callback(data.count);
    } else {
      var newCounter = Counter();
      newCounter.save(function(err) {
        if (err) {
          return;
        }
        Counter.findOneAndUpdate({}, {$inc: {'count': 1}}, function (err, data) {
          if (err) {
            return;
          }
          callback(data.count);
        });
      });
    }
  });
}

var protocolChecker = /^https?:\/\/(.*)/i;
var hostnameChecker = /^([a-z0-9\-_]+\.)+[a-z0-9\-_]+/i;

exports.addUrl = function(req, res) {
  var url = req.body.url
  
  // remove / from end of URL's
  if ( url.match(/\/$/i)) {
    url = url.slice(0,-1);
  }
  
  // Check url for protocol use
  var protocolMatches = url.match(protocolChecker);
  if (!protocolMatches) {
    return res.json({"error": "invalid URL"});
  }
  
  var hostAndQuery = protocolMatches[1];
  // Lookup
  var hostnameMatch = hostAndQuery.match(hostnameChecker);
  if (hostnameMatch) {
    dns.lookup(hostnameMatch[0], function(err) {
      if (err) {
        res.json({"error": "invalid URL"});
      } else {
        UrlEntry.findOne({"url": url}, function(err, storedUrl) {
          if (err) {
            return; 
          }
          if (storedUrl) {
            res.json({"original_url": url, "short_url": storedUrl.index});
          } else {
            getCountAndIncrease(req, res, function(count){
              var newUrlEntry = new UrlEntry ({
                    'url': url,
                    'index': count
                  });
              newUrlEntry.save(function(err){
                if (err) {
                  return;
                }
                res.json({"original_url": url, "short_url": count});
              });
            });
          }
        });
      }
    });
  } else {
    res.json({"error": "invalid URL"});
  }
};

exports.processShortUrl = function(req, res) {
  var shortUrl = req.params.shortUrl;
  if (!parseInt(shortUrl, 10)) {
    res.json({"error": "invalid URL"});
    return;
  }
  UrlEntry.findOne({"index": shortUrl}, function(err, data) {
    if (err) {
      return;
    }
    if (data) {
      res.redirect(data.url);
    } else {
      res.json({"error": "No short URL exists for the following input: " + shortUrl});
    }
  });
};