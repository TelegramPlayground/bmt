<?php declare(strict_types=1);

use danog\MadelineProto\API;
use danog\MadelineProto\EventHandler\Message;
use danog\MadelineProto\LocalFile;
use Webmozart\Assert\Assert;

/**
 * Example bot. https://t.me/TrollVoiceBot?start=1266
 *
 * Copyright 2016-2020 Daniil Gentili
 * (https://daniil.it)
 * This file is part of MadelineProto.
 * MadelineProto is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * MadelineProto is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 * You should have received a copy of the GNU General Public License along with MadelineProto.
 * If not, see <http://www.gnu.org/licenses/>.
 *
 * @author    Daniil Gentili <daniil@daniil.it>
 * @copyright 2016-2023 Daniil Gentili <daniil@daniil.it>
 * @license   https://opensource.org/licenses/AGPL-3.0 AGPLv3
 * @link https://docs.madelineproto.xyz MadelineProto documentation
 */

/*
 * Various ways to load @MadeLineProto
 */
if (file_exists(__DIR__ . "/vendor/autoload.php")) {
    include __DIR__ . "/vendor/autoload.php";
} else {
    if (!file_exists("madeline.php")) {
        copy("https://phar.madelineproto.xyz/madeline.php", "madeline.php");
    }
    /**
     * @psalm-suppress MissingFile
     */
    include "madeline.php";
}

Assert::true(extension_loaded('uv'), "The uv extension is required for maximum performance");
Assert::true(opcache_get_status(false)['jit']['enabled'], "JIT is required for maximum performance");

/**
 * required environment variables
 */

$TG_API_ID = (int) getenv("TG_API_ID");
$TG_API_HASH = getenv("TG_API_HASH");
$TG_BOT_TOKEN = getenv("TG_BOT_TOKEN");
$messageLink = getenv("TG_MESSAGE_LINK");

/**
 * @MadeLineProto Settings
 */

$settings = new \danog\MadelineProto\Settings;
$settings->getLogger()->setLevel(\danog\MadelineProto\Logger::LEVEL_ULTRA_VERBOSE);

$settings->getConnection()->setMaxMediaSocketCount(50);
$settings->getFiles()->setUploadParallelChunks(50);
$settings->getFiles()->setDownloadParallelChunks(50);
// IMPORTANT: for security reasons, upload by URL will still be allowed
$settings->getFiles()->setAllowAutomaticUpload(true);

$settings->getAppInfo()
    ->setApiId($TG_API_ID)
    ->setApiHash($TG_API_HASH);

$api = new \danog\MadelineProto\API('session.madeline', $settings);
$api->botLogin($TG_BOT_TOKEN);
$api->start();
$api->fullGetSelf();

function getMessageDetails($messageLink) {
    // Extract chat ID and message ID from the link
    preg_match('/t\.me\/(\w+)\/(\d+)/', $messageLink, $matches);
    if (count($matches) !== 3) {
        throw new Exception("Invalid message link format.");
    }
    $chatId = "@" . $matches[1];
    $messageId = (int) $matches[2];

    return [$chatId, $messageId];
}

function downloadFile(API $api, string|int $chatId, int $messageId): array {
    $message = $api->wrapMessage($api->channels->getMessages([
        'channel' => $chatId,
        'id' => [$messageId]
    ])['messages'][0]);
    if (!$message instanceof Message || $message->media === null) {
        throw new AssertionError("No media found in request");
    }

    $startTime = microtime(true);
    $file = $message->media->downloadToDir('/tmp');
    $endTime = microtime(true);
    $downloadTime = $endTime - $startTime;
    echo "Download completed in $downloadTime seconds.\n";

    return [
        "file" => $file,
        "start_time" => $startTime,
        "end_time" => $endTime,
        "time_taken" => $downloadTime,
        'file_name' => $message->media->fileName,
        'file_size' => $message->media->size,
    ];
}

function uploadFile(API $api, string|int $chatId, string $filePath) {
    $startTime = microtime(true);
    $api->sendDocument(
        peer: $chatId,
        file: new LocalFile($filePath),
        fileName: "MadelineProto.zip",
        caption: 'Powered by @MadelineProto!'
    );
    $endTime = microtime(true);
    unlink($filePath);
    $uploadTime = $endTime - $startTime;
    echo "Upload completed in $uploadTime seconds.\n";
    return [
        "start_time" => $startTime,
        "end_time" => $endTime,
        "time_taken" => $uploadTime,
    ];
}

list($chatId, $messageId) = getMessageDetails($messageLink);
$fileMI = downloadFile($api, $chatId, $messageId);
$filePath = $fileMI["file"];
unset($fileMI["file"]);
$uploadMI = uploadFile($api, $chatId, $filePath);

// Throw away first run, used to prime caches & set up connections

$fileMI = downloadFile($api, $chatId, $messageId);
$filePath = $fileMI["file"];
unset($fileMI["file"]);
$uploadMI = uploadFile($api, $chatId, $filePath);

$j = [
    "version" => \danog\MadelineProto\API::RELEASE,
    "layer" => $settings->getSchema()->getLayer(),
    "file_name" => $fileMI['file_name'],
    "file_size" => $fileMI['file_size'],
    "download" => $fileMI,
    "upload" => $uploadMI
];
file_put_contents("/app/outputs/madelineproto.json", json_encode($j, JSON_PRETTY_PRINT));
?>
