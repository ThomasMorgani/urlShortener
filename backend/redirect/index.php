<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>URL REDIRECT</title>
    <link href="styles/style.css" rel="stylesheet" type="text/css" />
</head>

<body>
    <?php
        // ini_set('display_errors', 1);
        // ini_set('display_startup_errors', 1);
        // error_reporting(E_ALL);
        require('./config.php');
        $data = parseData($dbsettings);
        $destUrl = $data['redirectUrl'];
        if ($data && isset($data['id'])) {
            logVisit($dbsettings, $data['id']);
        }

    ?>
    <div align="middle" class="actionSection">
        <p id="redirectText" style="padding: 2em;">
            You will be redirected to the link below in......<span id="countdown"></span>
        </p>
        <p>
            You can stop the redirect by clicking the cancel button below or proceed immediately by clicking the link.
        </p>
        <button id="cancelBtn" class="cancelBtn">CANCEL</button>
    </div>
    <div class="destUrlSection">
        <p id="destinationUrl" data-desturl="<?= $destUrl ?>">
            <?php echo $destUrl ? "<a href=\"$destUrl\">$destUrl</a>" : ''; ?>
        </p>
    </div>
    <script src="scripts/redirect.js"></script>
</body>

</html>