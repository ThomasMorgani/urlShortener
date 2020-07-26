<?php
    //DEBUGGING
    // ini_set('display_errors', 1);
    // ini_set('display_startup_errors', 1);
    // error_reporting(E_ALL);

    //TODO:
        //ADD ETAG to query

  require './conf.php'; //$settings, $db lives here
//   var_dump($settings);


  require './func.php';
 
  $db =  mysqli_connect(...$settings['db']['connection']) or die($settings['messages']['dbErr']);
  
  cors($settings['cors']['allowed']);

  $params = parseParams($db, $settings['slug']);
    // var_dump($params);

    if ($params == true) {
        
        if (isset($params['m'])) {
            if ($params['m'] === 'generate') {
                
                $text = generateSlug($db, $params['length'], parseValidCharacters($params['validChars'], $settings['chars']['all']) );
                if (!$text) {
                    sendResponse('error', $settings['messages']['slugGenErr'], []);
                } else {
                    sendResponse('success', '', [$text]);
                }
            }
            if ($params['m'] === 'query') {
                sendResponse('success', '', $params['list']);
            }
            if ($params['m'] === 'save') {
                //These should always pass unless validation functions are modified
                if (!isset($params['text']) || $params['text'] == false) {
                    sendResponse('error', $settings['messages']['slugInvalid']);
                } else {
                    $text = $params['text'];
                }
                if (!isset($params['destinationUrl']) || $params['destinationUrl'] == false) {
                    sendResponse('error', $settings['messages']['destInvalid']);
                } else {
                    $destinationUrl = $params['destinationUrl'];
                }
                $table = $settings['db']['table'];
                $result = mysqli_query($db, "INSERT INTO `$table` (uriText, redirectUrl) VALUES ('$text', '$destinationUrl')");
                if($result == false) {
                    sendResponse('error', $settings['messages']['urlSaveErr'], ['params' => $params, 'error' => mysqli_error($db)]);
                } else {
                    sendResponse('success', $settings['messages']['urlSaveSuccess']);
                }
            } 
        }

    } else {
        //default action here ?
        echo 'Unknown params';   
    }