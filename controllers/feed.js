/**
 * @author Blake Callens <blake@pencilblue.org>
 * @copyright PencilBlue 2014, All rights reserved
 */

//dependencies
var HtmlEncoder    = require('htmlencode');
var ArticleService = require('../include/service/entities/article_service').ArticleService;
var MediaLoader    = require('../include/service/entities/article_service').MediaLoader;

/**
 * Article RSS Feed
 * @class ArticleFeed
 * @constructor
 */
function ArticleFeed(){}

//inheritance
util.inherits(ArticleFeed, pb.BaseController);

ArticleFeed.prototype.render = function(cb) {
	var self = this;

	this.ts.registerLocal('language', pb.config.defaultLanguage ? pb.config.defaultLanguage : 'en-us');
	this.ts.registerLocal('items', function(flag, cb){

        var dao   = new pb.DAO();
        var where = {publish_date: {$lte: new Date()}};
        var sort  = {publish_date: pb.DAO.DESC};
        dao.query('article', where, pb.DAO.PROJECT_ALL, sort).then(function(articles) {

			pb.users.getAuthors(articles, function(err, articlesWithAuthorNames) {
	            articles = articlesWithAuthorNames;

	            self.getSectionNames(articles, function(articlesWithSectionNames) {
	                articles = articlesWithSectionNames;

	                self.getMedia(articles, function(articlesWithMedia) {
	                    articles = articlesWithMedia;



                        var tasks = pb.utils.getTasks(articles, function(articles, i) {
                            return function(callback) {

                                self.ts.registerLocal('url', '/article/' + articles[i].url);
                                self.ts.registerLocal('title', articles[i].headline);
                                self.ts.registerLocal('pub_date', ArticleFeed.getRSSDate(articles[i].publish_date));
                                self.ts.registerLocal('author', articles[i].author_name);
                                self.ts.registerLocal('description', new pb.TemplateValue(articles[i].meta_desc ? articles[i].meta_desc : articles[i].subheading, false));
                                self.ts.registerLocal('content', new pb.TemplateValue(articles[i].article_layout, false));
                                self.ts.registerLocal('categories', function(flag, onFlagProccessed) {
                                    var categories = '';
                                    for(var j = 0; j < articles[i].section_names.length; j++) {
                                        categories = categories.concat('<category>' + HtmlEncoder.htmlEncode(articles[i].section_names[j]) + '</category>');
                                    }
                                    onFlagProccessed(null, new pb.TemplateValue(categories, false));
                                });
                                self.ts.load('xml_feeds/rss/item', callback);
                            };
                        });
                        async.series(tasks, function(err, results) {
                            cb(err, new pb.TemplateValue(results.join(''), false));
                        });
                    });
                });
            });
        });
	});
	self.ts.load('xml_feeds/rss', function(err, content) {
		var data = {
			content: content,
			headers: {
				'Access-Control-Allow-Origin': '*'
			}
		};
		cb(data);
    });
};


ArticleFeed.prototype.getSectionNames = function(articles, cb) {

	var dao = new pb.DAO();
	dao.query('section', pb.DAO.ANYWHERE, {name: 1}, {parent: 1}).then(function(sections) {
        //TODO handle error

		for(var i = 0; i < articles.length; i++) {

			var sectionNames = [];
            for(var j = 0; j < articles[i].article_sections.length; j++) {

            	for(var o = 0; o < sections.length; o++) {

                	if(sections[o]._id.equals(ObjectID(articles[i].article_sections[j]))) {
                        sectionNames.push(sections[o].name);
                        break;
                    }
                }
            }

            articles[i].section_names = sectionNames;
        }

        cb(articles);
    });
};

ArticleFeed.prototype.getMedia = function(articles, cb) {

    var tasks = pb.utils.getTasks(articles, function(articles, i) {
    	return function (callback) {

    		var mediaLoader = new MediaLoader();
    	    mediaLoader.start(articles[i].article_layout, function(err, newLayout) {
    	        articles[i].layout = newLayout;
    	        callback(null, articles[i]);
    	    });
    	};
    });
    async.series(tasks, function(err, articles) {
    	cb(articles);
    });
};

ArticleFeed.getRSSDate = function(date) {

    var dayNames   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    function getTrailingZero(number)  {
        if(number < 10) {
            return '0' + number;
        }
        return number;
    }

    return dayNames[date.getDay()] + ', ' + date.getDate() + ' ' + monthNames[date.getMonth()] + ' ' + date.getFullYear() + ' ' + getTrailingZero(date.getHours()) + ':' + getTrailingZero(date.getMinutes()) + ':' + getTrailingZero(date.getSeconds()) + ' +0000';
};

//exports
module.exports = ArticleFeed;
