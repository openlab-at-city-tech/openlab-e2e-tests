<?php
/**
 * File can be run using `wp eval-file` command:
 * `wp eval-file e2e-tests-teardown.php`
 */
namespace OpenLab\E2ETests\Setup;

use WP_CLI;
use BP_Groups_Group;

function tearDown() {
	$current_site = \get_current_site();

	// Delete the tests site. Handles content deletion.
	$exists = \domain_exists( $current_site->domain, $current_site->path . 'e2e-testing', 1 );
	if ( $exists ) {
		\wp_delete_site( $exists );
		WP_CLI::log( "Deleted site. ID: {$exists}" );
	}

	$exists = BP_Groups_Group::group_exists( 'e2e-testing-course' );
	if ( $exists ) {
		\groups_delete_group( $exists );
		WP_CLI::log( "Deleted group. ID: {$exists}" );
	}
}

tearDown();
exit;
