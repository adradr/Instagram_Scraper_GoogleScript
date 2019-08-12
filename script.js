// the name of the sheet within your document
var sheetName = "Sheet1";

// the name of the IG account you want the follower count for
var instagramHashtag = "YangDAO";

function addColumnNames() {
  var sheet = SpreadsheetApp.getActiveSheet();
  // sets up the header row for the sheet
  sheet.appendRow(['User Name', 'Likes Count', 'Comment Count', 'URL', 'Caption', 'Filter', 'Created Time']);
}

 
function getInstagramData(searchTerm) {
     
    var search = instagramHashtag; // search term
    var url = 'https://www.instagram.com/explore/tags/' + search +'?__a=1';
  
    var  result = UrlFetchApp.fetch(url);
     
    if (result.getResponseCode() == 200) {
        var json = JSON.parse(result.getContentText());
      
        var postCount = json.graphql.hashtag.edge_hashtag_to_media.count
        
        // Count posts on the given page
        var pageCount = Object.keys(json.graphql.hashtag.edge_hashtag_to_media.edges).length;
        Logger.log("PageCount:" + pageCount);
        
        // Check if there is more pages to get
        var isMorePage = json.graphql.hashtag.edge_hashtag_to_media.page_info.has_next_page
        Logger.log("isMorePage:" + isMorePage);
        
        // Pointer for next page
        var nextPageCursor = json.graphql.hashtag.edge_hashtag_to_media.page_info.end_cursor
        Logger.log("nextPageCursor:" + nextPageCursor);
        
        var grams = json.graphql.hashtag.edge_hashtag_to_media.edges;
      
      
        // Instagram gives you 20 on the first request
        for (var i = 0; i<=pageCount-1; i++) {
        logGram_(grams[i]);
        }
      
      var totalPosts = pageCount
      
      Logger.log("BeforeWhile_nextPageCursor:" + nextPageCursor);
      while(isMorePage) {
          var url_nextpage = 'https://www.instagram.com/explore/tags/' + search + '?__a=1&max_id=' + nextPageCursor
          var result_nextpage = UrlFetchApp.fetch(url_nextpage);
          if (result_nextpage.getResponseCode() == 200) {
            json = JSON.parse(result_nextpage.getContentText());
            grams = json.graphql.hashtag.edge_hashtag_to_media.edges;
            pageCount = Object.keys(json.graphql.hashtag.edge_hashtag_to_media.edges).length;
            Logger.log("PageCount_inWhile: " + pageCount)
            totalPosts += pageCount
          
          // Instagram gives you 20 on the first request
          for (var i = 0; i<=pageCount-1; i++) {
            logGram_(grams[i]);
          }
          
          nextPageCursor = json.graphql.hashtag.edge_hashtag_to_media.page_info.end_cursor;
          Logger.log("While_nextPageCursor:" + nextPageCursor);
          isMorePage = json.graphql.hashtag.edge_hashtag_to_media.page_info.has_next_page;
            if(!isMorePage){
              Logger.log("EOF")
              Logger.log("Total posts: " + totalPosts)
            }

         }
      }
    }
}
 
 
function logGram_(gram) {
    var log = [];  
    if (gram.node.edge_media_to_caption.edges[0] == undefined) {log.push("No title")} 
    else{log.push(gram.node.edge_media_to_caption.edges[0].node.text)}
    log.push(gram.node.display_url);
    SpreadsheetApp.getActiveSheet().appendRow(log)
}