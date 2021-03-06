// Define certain variables globally for use inside our functions
  // Note. Defining the variables (using let) outside the functions will make them global (accessible inside functions..)
let API_URL         = 'https://ladyfingers.beamtic.com/wordpress/wp-json/wp/v2/';
let req_page        = GetURLParameter('page'); // The post to fetch from Wordpress
let wp_page         = false; // Contains the single-view page content I.e. frontpage and about
let wp_navigation   = false;
let wp_site_footer  = false; // Contains the global footer
let menu_state_open = false;
// https://ladyfingers.beamtic.com/wordpress/wp-json/wp/v2/posts?filter[category_name]=navigation

let global_site_footer_url = API_URL + 'posts?filter[name]=footer';
let not_found_url          = API_URL + 'posts?filter[name]=404-not-found'; // Custom "Not Found" page from wordpress
let navigation_url         = API_URL + 'posts?filter[category_name]=navigation'; // Fetch all posts in the navigation category

document.addEventListener("DOMContentLoaded", main);
// main(); // Run the show :-D

async function main() {
  // Function to load required data from Wordpress back-end
  let default_url; // Used to fetch content on individual pages I.e. frontpage and about
  
  if (req_page!==false) { // If the "page" parameter is NOT empty, use it to fetch content from wordpress
	default_url = API_URL + 'posts?filter[name]=' + req_page;
  } else {
	default_url = API_URL + 'posts?filter[name]=frontpage'; // If the "page" URL parameter was empty, show frontpage
	req_page    = 'frontpage';
  }
  
  wp_page        = await loadJson(default_url); // Attempt to load the requested page
  wp_navigation  = await loadJson(navigation_url); // Load pages to show in navigation
  wp_site_footer = await loadJson(global_site_footer_url); // Load footer content from wordpress back-end
  
  showContent();
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
  document.querySelector('title').innerHTML                = wp_page[0]['title']['rendered']; // Most likely, this will not work in search engines
  clone.querySelector("[data-content]").innerHTML          = wp_page[0]['content']['rendered'];
  clone.querySelector("[data-burgerMenu]").innerHTML       += create_burger_menu(wp_navigation);
  clone.querySelector("[data-GlobalSiteFooter]").innerHTML = footer_content;
  document.querySelector("#application_content").appendChild(clone);
  // Featured media: wp_data[0]['wp:featuredmedia']['href']

  load_instagram_plugin(); // Runs the Instagram Gallery Wordpress Plugin
  add_event_listeners(); // Add <button> Event Listeners after loading content
  
  if (document.querySelector("#map")) { // Only include Google Map if #map id exists in page
    initMap();
  }
  
  //The below code calls "scrollFunction()" to change the color of the burgerMenu when needed
  //Because of design-requirements, this is only needed on some pages. I.e. Some pages has a white #site_header and others has a video or an image.
  if (!document.querySelector('#site_header_follow_black')) {
	// If the header background is dark, switch to white burgerBar's in the #burgerMenu
	window.onscroll = function() {scrollFunction()};
  }
}

function create_burger_menu(navigation_array) {
  if (navigation_array !== false) {
    let menu_list_top = '<ol id="menuList">';
    let menu_list = '';
    navigation_array.forEach(function(element) {
      let link_title; // Used to easily set the title, and avoid more nested if/else statements
      let link_src; // Same as above :-D
      if (element['slug']=='frontpage') { // If the curent item in the array is the frontpage
          link_title = 'Forsiden'; // Different title on frontpage link - better for UX?
          link_src = '/'; // There is no need to link to ?page=frontpage, and doing so might lead to duplicate content in SE
      } else { // If not the frontpage
        link_title = element['title']['rendered']; // Title same as title in Wordpress 
        link_src   = '/?page=' + element['slug']; // Link to URL parameter
      }
      
      if (req_page!==element['slug']) { // If the requested page does NOT match the current item in the array, show normal menu link
	      menu_list += '<li><a href='+link_src+'>'+link_title+'</a></li>';
      } else { // If the requested page DOES match... apply "current_page" styles
    	  menu_list += '<li><a href='+link_src+' class="current_page">'+link_title+'</a></li>';
      }
    });
    return menu_list_top + menu_list + '</ol>';
  } else {
	return '<p>No Content Loaded</p>';
  }
}

function toggle_burger_menu() {
	let burger_menu = document.querySelector("#burgerMenu");
	let menu_list   = document.querySelector("#menuList");
	
	if (menu_state_open == true) {
	  burger_menu.className = "menuClosed";
	  toggleBurgerColor(); // When menu is closed, find out if we need to change burgerBar colors
	  document.querySelector("#burgerMenuButton").disabled = true; // disable button while animation runs
	  
	  setTimeout(function(){ // After the animation 
	    burger_menu.className = "";
	    // document.querySelector("body").style.overflowY = "auto"; // Shows the scrollbar when menu is closed
	    document.querySelector("#burgerMenuButton").disabled = false; // enable button when animation is done
	  }, 1000);
	  
	  menu_state_open = false;
	  
	  document.querySelector('#site_header_logo_black_menu').style.display = "none"; // Instant-Hide black logo in menu
	  document.querySelector('#site_header_follow_black_menu').style.display = "none";  // Instant-Hide black social icons in menu
		
	  // Depending on which page was requested, we need either a white or black logo in #site_header
	  if(document.querySelector('#site_header_logo_white')) {
		document.querySelector('#site_header_logo_white').style.display = "block";
		document.querySelector('#site_header_follow_white').style.display = "block";
	  } else {
		document.querySelector('#site_header_logo_black').style.display = "block";
		document.querySelector('#site_header_follow_black').style.display = "block";  
	  }
	  
	} else {
	  burger_menu.className = "menuOpen";
	  toggleBurgerColor(); // When menu is opened, change burgerBar colors to black
	  
	  document.querySelector("#burgerMenuButton").disabled = true; // disable button while animation runs
	  // Depending on which page was requested, we need either a white or black logo in #site_header
	  if(document.querySelector('#site_header_logo_white')) {
		document.querySelector('#site_header_logo_white').style.display = "none";
		document.querySelector('#site_header_follow_white').style.display = "none";
	  } else {
		document.querySelector('#site_header_logo_black').style.display = "none";
		document.querySelector('#site_header_follow_black').style.display = "none";  
	  }
	  
	  setTimeout(function(){
	    // document.querySelector("body").style.overflowY = "hidden"; // Hides the scrollbar while meny open
		document.querySelector("#burgerMenuButton").disabled = false; // enable button when animation is done
		document.querySelector('#site_header_logo_black_menu').style.display = "block"; // Show black logo in menu
		document.querySelector('#site_header_follow_black_menu').style.display = "block"; // show black social icons in menu
	  }, 1000);
	 //  menu_list.className = "listOpen";
	  menu_state_open = true;
	}
	
}
function add_event_listeners() {
  let burger_menu = document.querySelector("#burgerMenuButton");
  burger_menu.addEventListener('click', toggle_burger_menu, false);
}

function scrollFunction() {
  if (menu_state_open == false) {
    if (document.body.scrollTop > (window.screen.height-100) || document.documentElement.scrollTop > window.screen.height-100) {
      toggleBurgerColor('#000');
    }
  }
}

function toggleBurgerColor() {
	
	let chosenColor = '#000';
	if ((document.querySelector('#site_header_logo_white')) && (menu_state_open!==false)) {
	  // Change burgerBar color to white if burgerMenu is open AND element ID "site_header_logo_white" exists
	  chosenColor = '#fff';
	} else {
	  chosenColor = '#000'; // Else we change color of burgerBars to black
	}
	document.querySelector('#burgerBar1').style.background = chosenColor;
	document.querySelector('#burgerBar2').style.background = chosenColor;
	document.querySelector('#burgerBar3').style.background = chosenColor;
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






function initMap() {
    // Styles a map in night mode.
	let locationLadies = {lat: 55.6919103, lng: 12.5453035};  
    let map = new google.maps.Map(document.querySelector('#map'), {
      center: locationLadies,
      zoom: 17,
      styles: [
    	  {
    		    "elementType": "geometry",
    		    "stylers": [
    		      {
    		        "color": "#f5f5f5"
    		      }
    		    ]
    		  },
    		  {
    		    "elementType": "labels.icon",
    		    "stylers": [
    		      {
    		        "visibility": "off"
    		      }
    		    ]
    		  },
    		  {
    		    "elementType": "labels.text.fill",
    		    "stylers": [
    		      {
    		        "color": "#616161"
    		      }
    		    ]
    		  },
    		  {
    		    "elementType": "labels.text.stroke",
    		    "stylers": [
    		      {
    		        "color": "#f5f5f5"
    		      }
    		    ]
    		  },
    		  {
    		    "featureType": "administrative.land_parcel",
    		    "elementType": "labels.text.fill",
    		    "stylers": [
    		      {
    		        "color": "#bdbdbd"
    		      }
    		    ]
    		  },
    		  {
    		    "featureType": "poi",
    		    "elementType": "geometry",
    		    "stylers": [
    		      {
    		        "color": "#eeeeee"
    		      }
    		    ]
    		  },
    		  {
    		    "featureType": "poi",
    		    "elementType": "labels.text.fill",
    		    "stylers": [
    		      {
    		        "color": "#757575"
    		      }
    		    ]
    		  },
    		  {
    		    "featureType": "poi.park",
    		    "elementType": "geometry",
    		    "stylers": [
    		      {
    		        "color": "#e5e5e5"
    		      }
    		    ]
    		  },
    		  {
    		    "featureType": "poi.park",
    		    "elementType": "labels.text.fill",
    		    "stylers": [
    		      {
    		        "color": "#9e9e9e"
    		      }
    		    ]
    		  },
    		  {
    		    "featureType": "road",
    		    "elementType": "geometry",
    		    "stylers": [
    		      {
    		        "color": "#ffffff"
    		      }
    		    ]
    		  },
    		  {
    		    "featureType": "road.arterial",
    		    "elementType": "labels.text.fill",
    		    "stylers": [
    		      {
    		        "color": "#757575"
    		      }
    		    ]
    		  },
    		  {
    		    "featureType": "road.highway",
    		    "elementType": "geometry",
    		    "stylers": [
    		      {
    		        "color": "#dadada"
    		      }
    		    ]
    		  },
    		  {
    		    "featureType": "road.highway",
    		    "elementType": "labels.text.fill",
    		    "stylers": [
    		      {
    		        "color": "#616161"
    		      }
    		    ]
    		  },
    		  {
    		    "featureType": "road.local",
    		    "elementType": "labels.text.fill",
    		    "stylers": [
    		      {
    		        "color": "#9e9e9e"
    		      }
    		    ]
    		  },
    		  {
    		    "featureType": "transit.line",
    		    "elementType": "geometry",
    		    "stylers": [
    		      {
    		        "color": "#e5e5e5"
    		      }
    		    ]
    		  },
    		  {
    		    "featureType": "transit.station",
    		    "elementType": "geometry",
    		    "stylers": [
    		      {
    		        "color": "#eeeeee"
    		      }
    		    ]
    		  },
    		  {
    		    "featureType": "water",
    		    "elementType": "geometry",
    		    "stylers": [
    		      {
    		        "color": "#c9c9c9"
    		      }
    		    ]
    		  },
    		  {
    		    "featureType": "water",
    		    "elementType": "labels.text.fill",
    		    "stylers": [
    		      {
    		        "color": "#9e9e9e"
    		      }
    		    ]
    		  }
    		]
    });
    let marker = new google.maps.Marker({
        position: locationLadies,
        map: map,
        title: 'Ladyfingers'
    });
  }




// ********** Instagram Gallery Wordpress Plugin **********
// This code is taken from:
function load_instagram_plugin() {
  !function(a){function n(){a(".ig-block").each(function(){var n=a(this);if(n.hasClass("ig-block-loaded"))return!0;n.addClass("ig-block-loaded");var i=n.find(".ig-spinner"),e=parseInt(n.data("insgalid"));i.length&&!isNaN(e)&&jQuery.ajax({url:insgalajax.ajax_url,type:"post",dataType:"JSON",data:{action:"load_ig_item",insgalid:e},beforeSend:function(){i.show()},success:function(a){void 0!==a&&null!=a&&0!=a&&"object"==typeof a&&a.success&&a.data&&n.append(a.data)}}).fail(function(a,n){console.log(n)}).always(function(){i.hide(),n.find(".instagallery-actions").length&&i.prependTo(n.find(".instagallery-actions"))})})}a(".ig-block").length&&n(),jQuery(function(a){n(),-1!=navigator.appVersion.indexOf("MSIE 8.")&&(document.body.className+=" instagal-ie-8")})}(jQuery);
}


