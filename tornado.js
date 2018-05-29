
// Define variables globally, for use inside our function
  // Note. Defining the variables (using let) outside the functions will make them global (accessible inside functions..)
let API_URL     = 'https://ladyfingers.beamtic.com/wordpress/wp-json/wp/v2/';
let req_page = GetURLParameter('page'); // The post to fetch from Wordpress


main(); // Run the show :-D


async function main() {
  // Function to load required data from Wordpress back-end
  //
  //
  //
	
  // Depending on what we need to load from the API, we add relevant parts to the "API_URL" variable
  let not_found_url = API_URL + 'posts?filter[name]=404-not-found'; // Custom "Not Found" page from wordpress
  let navigation_url = API_URL + 'posts?filter[categories]=navigation'; // Fetch all posts in the navigation category
  let template_name;
  
  if (req_page!==false) { // If the "page" parameter is NOT empty, use it to fetch content from wordpress
	API_URL = API_URL + 'posts?filter[name]=' + req_page;
	template_name = 'page'; // Default template - uses featured images from wordpress backend in the site header
  } else {
	API_URL = API_URL + 'posts?filter[name]=frontpage'; // If the "page" URL parameter was empty, show frontpage
	template_name = 'frontpage'; // Frontpage template - uses hard-coded background-video in the site header
  }
  
  wp_data = await loadJson(API_URL); // Attempt to load the requested page
  wp_navigation_data = loadJson(navigation_url)
  
  // ***** CHECK FOR PAGE NOT FOUND ****
    // Check if the length of the wp_data object is longer than 0 (to find out if the data was loaded successfully)
    if (wp_data.length < 1) { // If data was NOT successfully returned, fetch 404 page instead (Assume Page Not Found)
      let jsonObjekt = await fetch(not_found_url); // Tries to fetch the custom "Not Found" page from wordpress
	  wp_data = await jsonObjekt.json();
	      
	  // If for some reason the "Not Found" page could not be loaded, show hard-coded error message in the browser
	  if (wp_data.length < 1) {
	    document.querySelector("#application_content").innerHTML = '<h2>FETAL ERROR:</h2> <p>Content was unable to load, and in addition the "404-not-found" page was also unable to load. If you are an Admin of this site, you may want to check if the 404 page exists in your Wordpress backend. This error can also be caused by issues with Network connectivity.</p>';
	    return false; // Return without calling showContent()
	  }
    }
  // ***** CHECK FOR PAGE NOT FOUND **** END
  console.log(wp_data);
  showContent(wp_data, template_name);
}

async function loadJson() {
  // Load json into jsonObject, then save it in wp_data for later use
  let jsonObject = await fetch(API_URL);
  wp_data = await jsonObject.json();
  
  if (wp_data.length < 1) {
    return false;
  } else {
	return wp_data;
  }
}


function showContent(wp_data=false, template_name) {
  // 1. Clone an HTML <template> element
  // 2. Fill with content fetched from Wordpress via API
  // 3. Insert cloned element in the HTML (renders the content in the browser)
  let template = document.querySelector("#template_"+template_name); // Choose the template HTML to be used
	
  let clone = template.cloneNode(true).content;
  clone.querySelector("[data-headerH1]").innerHTML = wp_data[0]['title']['rendered'];
  clone.querySelector("[data-content]").innerHTML = wp_data[0]['content']['rendered'];
  document.querySelector("#application_content").appendChild(clone);
  // Featured media: wp_data[0]['wp:featuredmedia']['href']

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


