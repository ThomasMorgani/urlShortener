# urlShortener

decoupled url shortner in vanilla js/php

## Setup

Frontend dir is for url management and listings  
Backend is for user redirect page and api

*Copy frontend, api and redirect directories to where they will be hosted
*rename /front/scripts/env.js.example to env.js and update to appropriate values
*rename /backend/redirect/config.php.example to config.php and update db creds
*rename /backend/api/config.php.example to config.php and update to appropriate values

-optional
\*if using sql db import /backend/db/urlShortener.sql.mysql.example

\*profit?

## Todo

*split /redirect config.php to config/func files inline with /api structure
*move js functions to classes
*add url mgmt functions: delete, expiration date
*expand slug generator options, lengh, characters, etc
\*decide include users, auth?
