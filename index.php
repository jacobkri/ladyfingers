<?php


$API_URL  = 'https://ladyfingers.beamtic.com/wordpress/wp-json/wp/v2/'; // Wordpress API URL

$api_url_array['API_URL']                = $API_URL;
$api_url_array['global_site_footer_url'] = $API_URL . 'posts?filter[name]=footer';
$api_url_array['not_found_url']          = $API_URL . 'posts?filter[name]=404-not-found'; // Custom "Not Found" page from wordpress
$api_url_array['navigation_url']         = $API_URL . 'posts?filter[category_name]=navigation'; // Fetch all posts in the navigation category


main($api_url_array, $req_page); // Run the show :-D




function main($api_url_array) {
  if (!empty($_GET['page'])) { // Validate input
    $req_page = $_GET['page'];
  } else {
    $req_page = false;
  }
  
  $default_url = false; // Used to fetch content on individual pages I.e. frontpage and about

  if ($req_page!==false) { // If the "page" parameter is NOT empty, use it to fetch content from wordpress
    $default_url = $api_url_array['API_URL'] . 'posts?filter[name]=' . $req_page;
  } else {
    $default_url = $api_url_array['API_URL'] . 'posts?filter[name]=frontpage'; // If the "page" URL parameter was empty, show frontpage
    $req_page    = 'frontpage';
  }
  
  // ###################################
  // <<< Load Content from API <<<<<<<<<
  // ###################################
  $wp_page          = loadJson($default_url); // Attempt to load the requested page
  $wp_navigation    = loadJson($api_url_array['navigation_url']); // Load pages to show in navigation
  $wp_site_footer   = loadJson($api_url_array['global_site_footer_url']); // Load footer content from wordpress back-end
  
  // ###################################
  // <<< Check IF content was loaded <<<
  // ###################################
  $HTML_CONTENT['burger_menu_links'] = create_burger_menu($wp_navigation, $req_page); // Create the Burger Menu and save it in a variable

  // Check if the main content was loaded
  if ($wp_page!==false) {
      $HTML_CONTENT['site_title_content']  = $wp_page[0]['title']['rendered'];
      $HTML_CONTENT['site_header_content'] = $wp_page[0]['acf']['header_content'];
      $HTML_CONTENT['main_content']        = $wp_page[0]['content']['rendered']; 
  } else {
      $HTML_CONTENT['site_header_content'] = ''; // No header content for 404 pages (Maybe change this later)
      $wp_404_page = loadJson($api_url_array['not_found_url']); // Assume that a 404 error has occured (Otherwise something is wrong with the server connection)
      if ($wp_404_page!==false) {
        $HTML_CONTENT['site_title_content']  = '404 - Ikke Fundet';
        $HTML_CONTENT['main_content']        = $wp_404_page[0]['content']['rendered'];
      } else { // If loading the 404 error page failed, show a fetal error message
        $HTML_CONTENT['site_title_content']  = '500 - Server Fejl';
        $HTML_CONTENT['main_content']        = 'Something appears to be wrong with the servers connection. Please try again later.';
      }
  }
  
  // Check if footer content was loaded
  if ($wp_site_footer!==false) { // If footer content was loaded successfully, show in footer
      $HTML_CONTENT['site_footer_content'] = $wp_site_footer[0]['content']['rendered'];
  } else { // If footer content was not loaded, show error message in the footer instead.
      $HTML_CONTENT['site_footer_content'] = '<p>Unable to load footer content!</p>';
  }
  
  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> OUTPUT :-D
  // >>> Show Content >>>>>>>>>>>>>>>>>> OUTPUT :-D
  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> OUTPUT :-D
  require $_SERVER["DOCUMENT_ROOT"].'html_template.php'; // Load and fill out the HTML template
  header('Content-Type: text/html; utf-8'); // Required HTTP header for UTF-8 character set and HTML mime-type
  echo $template; // Send the HTML to the browser
}

function loadJson($req_page) {
  if  (in_array('curl', get_loaded_extensions())) { // Check if cURL is enabled on the server
    
   // ********* cURL GET Request
    // Initialize cURL session
    $ch = curl_init($req_page);
    // Option to Return the Result, rather than just true/false
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    // Perform the request, and save content to $result
    $result = curl_exec($ch);
    // Close the cURL resource, and free up system resources!
    curl_close($ch);
   
    // Return the result
    if ($result !== false) {
      return json_decode($result, true);
    } else {
      return false;
    }
  } else { // In case an update to the (potentially shared hosting) disables cURL
    echo 'cURL is not installed, but required for this site to work. Please show this error to your web-developer.';exit();
  }
}

function create_burger_menu($navigation_array, $req_page) {
    if ($navigation_array !== false) {
        $menu_list_top = '<ol id="menuList">';
        $menu_list = '';
        foreach ($navigation_array as &$element) {
            
            if ($element['slug']=='frontpage') { // If the curent item in the array is the frontpage
                $link_title = 'Forsiden'; // Different title on frontpage link - better for UX?
                $link_src = '/'; // There is no need to link to ?page=frontpage, and doing so might lead to duplicate content in SE
            } else { // If not the frontpage
                $link_title = $element['title']['rendered']; // Title same as title in Wordpress
                $link_src   = '/?page=' . $element['slug']; // Link to URL parameter
            }
            
            if ($req_page!==$element['slug']) { // If the requested page does NOT match the current item in the array, show normal menu link
                $menu_list .= '<li><a href="'.$link_src.'">'.$link_title.'</a></li>';
            } else { // If the requested page DOES match... apply "current_page" styles
                $menu_list .= '<li><a href="'.$link_src.'" class="current_page">'.$link_title.'</a></li>';
            }
        }
            return $menu_list_top . $menu_list . '</ol>';
    } else {
        return '<p>No Content Loaded</p>';
    }
}



