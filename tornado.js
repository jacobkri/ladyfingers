let members_template = document.querySelector("#template_members");
let page_template    = document.querySelector("#template_page");
 
let API_URL     = 'https://ladyfingers.beamtic.com/wordpress/wp-json/wp/v2/';

let req_page = GetURLParameter('page'); // The post to fetch from Wordpress


loadJson();


async function loadJson() {
  // Function to load content from Wordpress backend via REST API
	
  let not_found_url = API_URL + 'posts?filter[name]=404-not-found'; // Custom "Not Found" page from wordpress
  
  if (req_page!==false) { // If the "page" parameter is NOT empty, use it to fetch content from wordpress
	API_URL = API_URL + 'posts?filter[name]=' + req_page;
  } else {
	API_URL = API_URL + 'posts?filter[name]=frontpage'; // If the "page" URL parameter was empty, show frontpage 
  }
  
  // Load json into jsonObject, then save it in wp_data for later use
  let jsonObject = await fetch(API_URL);
  wp_data = await jsonObject.json();
  
  // Check if the length of the wp_data object is longer than 0 (to find out if the data was loaded successfully)
  if (wp_data.length < 1) { // If data was NOT successfully returned, fetch 404 page instead (Assume Page Not Found)
    let jsonObjekt = await fetch(not_found_url); // Tries to fetch the custom "Not Found" page from wordpress
    wp_data = await jsonObjekt.json();
      
      // If for some reason the "Not Found" page could not be loaded, suggest what can be done to solve the problem
      // This can happen in the case of network errors, or if the "404-not-found" page was deleted from wordpress (doh!)
      if (wp_data.length < 1) {
        document.querySelector("#application_content").innerHTML = '<h2>FETAL ERROR:</h2> <p>The "404-not-found" page was unable to load. If you are an Admin of this site, check if the page exists in your Wordpress backend.</p>';
        return false; // Return without calling showContent()
      }
  }
  showContent(wp_data);
}

function showContent(wp_data=false) {
    // 1. Clone an HTML <template> element
	// 2. Fill with content fetched from Wordpress via API
	// 3. Insert cloned element in the HTML (renders the content in the browser)
	
        let clone = page_template.cloneNode(true).content;
        clone.querySelector("[data-content]").innerHTML = wp_data[0]['content']['rendered'];
        document.querySelector("#application_content").appendChild(clone);

        load_instagram_plugin(); // Runs the Instagram Gallery Wordpress Plugin

}

function GetURLParameter(sParam) {
  // Function to search for a sParam, and return its value (if found)
  // If sParam does not match a parameter found in the URI, false is returned

  // REMINDER:
  // Parameters are found after the "?" sign in the URL
  //   I.e.: https://example.com/index.html?name=John
	
  // Multiple parameters are seperated with ampersand (&)
  //   I.e.: https://example.com/index.html?name=John&age=20
 
  // To return the value of the "name" parameter in above example, simply do like this:
  // alert(GetURLParameter('name'));
	
  var sPageURL = window.location.search.substring(1);
  var sURLVariables = sPageURL.split('&');
  for (var i = 0; i < sURLVariables.length; i++) {
    var sParameterName = sURLVariables[i].split('=');
    if (sParameterName[0] == sParam) {
      return sParameterName[1]; // Return the content of the parameter
    } else {return false;} // Otherwise return false
  }
}











// ********** Instagram Gallery Wordpress Plugin **********
// This code is taken from:
function load_instagram_plugin() {
  !function(a){function n(){a(".ig-block").each(function(){var n=a(this);if(n.hasClass("ig-block-loaded"))return!0;n.addClass("ig-block-loaded");var i=n.find(".ig-spinner"),e=parseInt(n.data("insgalid"));i.length&&!isNaN(e)&&jQuery.ajax({url:insgalajax.ajax_url,type:"post",dataType:"JSON",data:{action:"load_ig_item",insgalid:e},beforeSend:function(){i.show()},success:function(a){void 0!==a&&null!=a&&0!=a&&"object"==typeof a&&a.success&&a.data&&n.append(a.data)}}).fail(function(a,n){console.log(n)}).always(function(){i.hide(),n.find(".instagallery-actions").length&&i.prependTo(n.find(".instagallery-actions"))})})}a(".ig-block").length&&n(),jQuery(function(a){n(),-1!=navigator.appVersion.indexOf("MSIE 8.")&&(document.body.className+=" instagal-ie-8")})}(jQuery);
}




