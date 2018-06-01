
// Define certain variables globally for use inside our functions
  // Note. Defining the variables (using let) outside the functions will make them global (accessible inside functions..)
let API_URL         = 'https://ladyfingers.beamtic.com/wordpress/wp-json/wp/v2/';
let req_page        = GetURLParameter('page'); // The post to fetch from Wordpress
let wp_page         = false; // Contains the single-view page content I.e. frontpage and about
let wp_site_footer  = false; // Contains the global footer
let menu_state_open = false;

let global_site_footer_url = API_URL + 'posts?filter[name]=footer';
let not_found_url          = API_URL + 'posts?filter[name]=404-not-found'; // Custom "Not Found" page from wordpress
let navigation_url         = API_URL + 'posts?filter[category_name]=navigation'; // Fetch all posts in the navigation category



main(); // Run the show :-D


function scrollFunction() {
    if (document.body.scrollTop > (window.screen.height-100) || document.documentElement.scrollTop > window.screen.height-100) {
    	document.getElementById('burgerBar1').style.background = "#000";
    	document.getElementById('burgerBar2').style.background = "#000";
    	document.getElementById('burgerBar3').style.background = "#000";
    } else {
    	document.getElementById('burgerBar1').style.background = "#fff";
    	document.getElementById('burgerBar2').style.background = "#fff";
    	document.getElementById('burgerBar3').style.background = "#fff";
    }
}


async function main() {
  // Function to load required data from Wordpress back-end
	
  let default_url; // Used to fetch content on individual pages I.e. frontpage and about
  
  if (req_page!==false) { // If the "page" parameter is NOT empty, use it to fetch content from wordpress
	default_url = API_URL + 'posts?filter[name]=' + req_page;
  } else {
	default_url = API_URL + 'posts?filter[name]=frontpage'; // If the "page" URL parameter was empty, show frontpage
  }
  
  wp_page        = await loadJson(default_url); // Attempt to load the requested page
  wp_navigation  = await loadJson(navigation_url); // Load pages to show in navigation
  wp_site_footer = await loadJson(global_site_footer_url); // Load footer content from wordpress back-end
  
  showContent();
  
  // Crazy lazy ass fix for the #burgerMenu
  if (req_page!=='designerne') {
	window.onscroll = function() {scrollFunction()};  
  }
}

async function loadJson(FINAL_API_URL) {
  // Load json into jsonObject, then save it in wp_data for later use
  let jsonObject = await fetch(FINAL_API_URL);
  wp_data = await jsonObject.json();
  
  if (wp_data.length < 1) {
    return false;
  } else {
	return wp_data;
  }
}


async function showContent() {
  let footer_content;
  // 0. Check if content is loaded
  // 1. Clone an HTML <template> element
  // 2. Fill with content fetched from Wordpress via API
  // 3. Insert cloned element in the HTML (renders the content in the browser)
    
  // START ***** CHECK IF CONTENT LOADED **** START
	if (wp_site_footer!==false) { // If footer content was loaded successfully, show in footer
		footer_content = wp_site_footer[0]['content']['rendered'];
	} else { // If footer content was not loaded, show error message in the footer instead.
		footer_content = '<p>Footer content did not load as expected, check your network connection and try again!</p>';
	}
	
    // We need to check if content loaded successfully
    // If not, we show a 404 Not found error message
    if (wp_page == false) { // If data was NOT successfully returned, fetch 404 page instead (Assume Page Not Found)
      let jsonObjekt = await fetch(not_found_url); // Tries to fetch the custom "Not Found" page from wordpress
      wp_page = await jsonObjekt.json();
	  // If for some reason the "Not Found" page could not be loaded, show hard-coded error message in the browser
	  if (wp_page == false) {
	    document.querySelector("#application_content").innerHTML = '<h2>FETAL ERROR:</h2> <p>Content was unable to load, and in addition the "404-not-found" page was also unable to load. If you are an Admin of this site, you may want to check if the 404 page exists in your Wordpress backend. This error can also be caused by issues with Network connectivity.</p>';
	    return false; // Return without doing anything
	  }
    }
  // END ***** CHECK IF CONTENT LOADED **** END
	
  let template = document.querySelector("#template"); // Choose the template HTML to be used
  let clone = template.cloneNode(true).content;
  clone.querySelector("[data-siteHeader").innerHTML        = wp_page[0]['acf']['header_content'];
  clone.querySelector("[data-headerH1]").innerHTML         = wp_page[0]['title']['rendered'];
  clone.querySelector("[data-content]").innerHTML          = wp_page[0]['content']['rendered'];
  clone.querySelector("[data-burgerMenu]").innerHTML       = create_burger_menu(wp_navigation);
  clone.querySelector("[data-GlobalSiteFooter]").innerHTML = footer_content;
  document.querySelector("#application_content").appendChild(clone);
  // Featured media: wp_data[0]['wp:featuredmedia']['href']

  load_instagram_plugin(); // Runs the Instagram Gallery Wordpress Plugin
  add_event_listeners(); // Add <button> Event Listeners after loading content
}

function create_burger_menu(navigation_array) {
  if (navigation_array !== false) {
    menu_list_top = '<button id="burgerMenuButton"><span id="burgerBar1"></span><span id="burgerBar2"></span><span id="burgerBar3"></span></button><ol id="menuList">';
    let menu_list = '';
    navigation_array.forEach(function(element) {
      if (element['slug']=='frontpage') {
        menu_list = '<li><a href="/" id="frontpage_link">Forsiden</a></li>' + menu_list;
      } else {
	    menu_list += '<li><a href=?page='+element['slug']+'>'+element['title']['rendered']+'</a></li>';
      }
    });
    return menu_list_top + menu_list + '</ol>';
  } else {
	return '<p>No Content Loaded</p>';
  }
}

function toggle_burger_menu() {
	let burger_menu = document.getElementById("burgerMenu");
	let menu_list   = document.getElementById("menuList");
	
	if (menu_state_open == true) {
	  burger_menu.className           = "menuClosed";
	  // menu_list.className = "listClosed";
	  setTimeout(function(){
	    burger_menu.className = "";
	  }, 1000);
	  menu_state_open = false;
	} else {
	  burger_menu.className           = "menuOpen";
	 //  menu_list.className = "listOpen";
	  menu_state_open = true;
	}
	
}
function add_event_listeners() {
  let burger_menu = document.getElementById("burgerMenuButton");
  burger_menu.addEventListener('click', toggle_burger_menu, false);
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


