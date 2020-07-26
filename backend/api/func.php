<?php

function cors($allowed_origins) {
    //CORS
if (isset($_SERVER["HTTP_ORIGIN"]) === true) {
    $origin = $_SERVER["HTTP_ORIGIN"];
    if (in_array($origin, $allowed_origins, true) === true) {
      header('Access-Control-Allow-Origin: ' . $origin);
      header('Access-Control-Allow-Methods: GET, OPTIONS');
      //header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS');
      //header('Access-Control-Allow-Credentials: true');
      //header('Access-Control-Allow-Headers: X-PINGOTHER, Origin, X-Requested-With, Content-Type');
    }
    
    if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
      exit; 
    }
  }
}

function generateSlug($db, $length, $validChars ) {
    $tries = 1;
    $maxTries = 50;
    $randText = false;
    $resultCount = 0;
    while(!$randText && $tries < $maxTries) {
        $testText = randomString($length, $validChars);
        $resultCount = queryItemCount($db, 'uriText', $testText);
        if ($resultCount < 1) {
            $randText = $testText;
        } else {
            $randText = false;
         $tries++;
        }
    }
    return $randText;
}

function parseParams($db, $uriTextOptions) {
    $optionsDefaults = [];
    $params = [];
    //TODO: consolidate this function, remove switch
    //SET ASSOC ARRAY OF MODE, ITERATE THAT
    //SET ARRAY OF DEFAULTS mode=>option=>dvalue
    if (isset($_GET['m'])) {
        switch($_GET['m']) {
            case 'g': //generate random customText

                //TODO: $options = ['length', 'characters']
                //characters options (l)ower (u)pper (n)umeric (s)symbol
                //?chars /// explode('', $chars) if x chars .= type
                $optionsDefaults = ['length' => $uriTextOptions['defaultLength'], 'validChars' => 'all' ];
                $params['m'] = 'generate';
                
                foreach($optionsDefaults as $option => $defaultVal) {
                    $params[$option] = isset($_GET["$option"]) ? $_GET["$option"] : $defaultVal;
                }
                return $params;
            break;
            case 'q': //q existing links
                $params['m'] = 'query';
                $q = mysqli_query($db, "SELECT * FROM urlShortener;");
                $result = $q->fetch_all(MYSQLI_ASSOC);
                $params['list'] = $result;
                return $params;
            break;
            case 's':
                $params['m'] = 'save';
                $params['text'] = isset($_GET["t"]) ? validateText($_GET["t"], $uriTextOptions, $db) : false;
                $params['destinationUrl'] = isset($_GET["d"]) ? validateDestUrl($_GET["d"], $db) : false;
                //validate uriText
                //validate destUrl
                return $params;
           
        break;
        default: 
        return false;
        // return ['error' => 'Error Message if Need here'] ;
        //return error
        // echo json_encode(['status' => 'error', 'message' => 'Unknown Request Type']);

        }

    } else {
        echo '404';
    }
}

function parseValidCharacters($charOptions = 'all', $charAll) {
    if ($charOptions === 'all') {
        return $charAll;
    } else {
        //TODO: set array char array Above w/all, lower, upper, sym
        //return string of each concat
        //refer to parseParams() for codes
        return $charAll;
    }
}



function queryItemCount($db, $item = '', $value = '') {
    // var_dump('queryItmeCOunt------');
    //TODO: USE THIS?
    $result =  mysqli_query($db, "SELECT COUNT(*) FROM urlShortener WHERE `$item` = '$value';");
    $count = mysqli_fetch_row($result);
    return isset($count['0']) ? (int) $count['0'] : 0;
}

function randomString($length, $validChars) {
    $randText = '';
    for($i = 0; $i < $length; $i++) {
        $randText .= $validChars[rand(0, strlen($validChars) - 1)];       
    }
    return $randText;
}

function sendResponse($status = 'error', $message = '', $data = []) {
    header('Content-Type: application/json');
    echo json_encode(['status' => $status, 'message' => $message, 'data' => $data]);
    die();
}

function validateDestUrl($url, $db) {
    //TODO: Move to settings
    $maxUrlLength = 65000;

    //mysqli_real_escape_string($db, $url) or error('Could not escape URL.', 500);
    if (substr($url, 0, 8) !== 'https://' && substr($url, 0, 7) !==  'http://') {
        $url = 'http://' . $url;
    }
    if (strlen($url) > $maxUrlLength) {
       sendResponse('error', "Destination Url exceeds max character length ({$maxUrlLength}).");
    }
    if (mysqli_real_escape_string($db, $url)) {
        return mysqli_real_escape_string($db, $url);
    } else {
        sendResponse('error', 'Unable to safely parse Destination Url.');
    }
}

function validateText($text, $uriTextOptions, $db) {
    if (strlen($text) < $uriTextOptions['minLength'] ) {
        sendResponse('error', "Text must be {$uriTextOptions['minLength']} or more characters");
    } else if (strlen($text) > $uriTextOptions['maxLength']){
        sendResponse('error', "Text must be {$uriTextOptions['maxLength']} or more characters");
    } else if(queryItemCount($db, 'uriText', $text) > 0){
        sendResponse('error', "Custom text [{$text}] already exists.");
    } else {
        return trim($text);
    }
}



?>