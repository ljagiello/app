<?php
/**
 * Optimizely setup
 *
 * @author Damian Jóźwiak
 *
 */
$dir = dirname(__FILE__) . '/';

//classes
$wgAutoloadClasses['Optimizely'] =  $dir . 'Optimizely.class.php';

// hooks
$wgHooks['OasisSkinAssetGroups'][] = 'Optimizely::onOasisSkinAssetGroupsBlocking';
