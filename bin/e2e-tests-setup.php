<?php
/**
 * File can be run using `wp eval-file` command:
 * `wp eval-file e2e-tests-setup.php`
 *
 * Steps:
 * 1. Create user "E2ETest Faculty" (admin role).
 * 2. Create user “E2ETest Student 1” (post author).
 * 3. Create user “E2ETest Student 2" (author).
 * 4. Clone course with new site `e2e-testing`.
 * 5. Make sure “WP Grade Comment” plugin is active.
 * 5. Set permalink to use post name.
 * 6. Create post “Test Grade Comment”, author “E2ETest Student 1”.
 * 7. Create comments.
 */
namespace OpenLab\E2ETests\Setup;

use WP_CLI;
use BP_Groups_Group;

function create_user( $username ) {
	$exists = \username_exists( $username );
	if ( $exists ) {
		WP_CLI::log( "User exists. ID: {$exists}" );
		return $exists;
	}

	$password = \wp_generate_password( 24 );
	$email    = \sprintf( '%s@mail.citytech.cuny.edu', $username );
	$user_id  = \wpmu_create_user( $username, $password, $email );

	WP_CLI::log( "Created user. ID: {$user_id}" );
	WP_CLI::log( "Password: {$password}" );

	return $user_id;
}

function create_course( $admin_id = 0 ) {
	$slug   = 'e2e-testing-course';
	$exists = BP_Groups_Group::group_exists( $slug );
	
	if ( $exists ) {
		WP_CLI::log( "Course exists. ID: {$exists}" );
		return $exists;
	}

	$group_id = \groups_create_group( [
		'name'         => 'E2E Testing',
		'slug'         => $slug,
		'description'  => 'Course is used to run Cypress tests',
		'creator_id'   => $admin_id,
		'status'       => 'private',
	] );

	WP_CLI::log( "Created course. ID: {$group_id}" );

	// Set group type.
	\groups_update_groupmeta( $admin_id, 'wds_group_type', 'course' );

	// Promote test faculty user to group admin.
	\groups_promote_member( $admin_id, $group_id, 'admin' );

	return $group_id;
}

function create_site( $admin_id = 0 ) {
	$current_site = \get_current_site();

	$site = [
		'domain'  => $current_site->domain,
		'path'    => $current_site->path . 'e2e-testing/',
		'user_id' => $admin_id,
		'title'   => 'E2E Testing',
		'public'  => 0,
	];

	$site['id'] = \domain_exists( $site['domain'], $site['path'], 1 );
	if ( $site['id'] ) {
		WP_CLI::log( "Domain exists. ID: {$site['id']}" );
		return $site;
	}

	// Disable site templates.
	\remove_action( 'wpmu_new_blog', 'st_wpmu_new_blog', 10, 6 );

	$site['id'] = \wp_insert_site( $site );

	if ( \is_wp_error( $site['id'] ) ) {
		WP_CLI::log( $site['id']->get_error_message() );
		return [ 'id' => 0 ];
	}

	WP_CLI::log( "Created site. ID: {$site['id']}" );

	return $site;
}

function create_content( $author_id, $admin_id ) {
	$post_data = [
		'post_title'   => 'Test Grade Comments',
		'post_name'    => 'test-grade-comments',
		'post_content' => 'Post is used by Cypress for end-to-end testing.',
		'post_status'  => 'publish',
		'post_author'  => $author_id,
	];

	$post_id = \wp_insert_post( $post_data, true );
	if ( \is_wp_error( $post_id ) ) {
		WP_CLI::log( $post_id->get_error_message() );
		return false;
	}

	WP_CLI::log( "Created post. ID: {$post_id}" );

	$comments = [
		[
			'user_id'         => $admin_id,
			'comment_content' => 'Test private comment with grade.',
			'comment_post_ID' => $post_id,
			'comment_meta'    => [
				'olgc_is_private' => 'yes',
				'olgc_grade'      => 'A'
			],
		],
		[
			'user_id'         => $admin_id,
			'comment_content' => 'Test comment with grade.',
			'comment_post_ID' => $post_id,
			'comment_meta'    => [
				'olgc_grade'      => '9'
			],
		],
	];

	foreach ( $comments as $comment ) {
		\wp_insert_comment( $comment );
	}

	WP_CLI::log( "Created test comments" );
	return true;
}

function update_permalink_structure( $permastruct ) {
	global $wp_rewrite;

	$wp_rewrite->set_permalink_structure( $permastruct );

	// Soft flush rewrite rules.
	$wp_rewrite->flush_rules();
}

function setup() {
	if ( ! \is_multisite() ) {
		WP_CLI::error( 'This is not a multisite installation.' );
	}

	$admin_id = create_user( 'e2etestfaculty' );

	$authors = [];
	foreach( [ 'e2eteststudent1', 'e2eteststudent2' ] as $username ) {
		$authors[ $username ] = create_user( $username );
	}

	$group_id = create_course( $admin_id );
	$site     = create_site( $admin_id );
	
	if ( $site['id'] && $group_id ) {
		\groups_update_groupmeta( $group_id, 'wds_bp_group_site_id', $site['id'] );

		\switch_to_blog( $site['id'] );

		foreach ( $authors as $key => $author_id ) {
			$author = \get_userdata( $author_id );

			if ( ! \get_user_meta( $author_id, 'primary_blog', true ) ) {
				\update_user_meta( $author_id, 'primary_blog', $site['id'] );
				\update_user_meta( $author_id, 'source_domain', $site['domain'] );
			}

			$author->set_role( 'author' );
		}

		$is_active = \activate_plugin( 'wp-grade-comments/wp-grade-comments.php' );
		if ( \is_wp_error( $is_active ) ) {
			WP_CLI::log( $is_active->get_error_message() );
		}

		update_permalink_structure( '/%postname%/' );

		create_content( $authors['e2eteststudent1'], $admin_id );

		\restore_current_blog();
	}
	
	$site_url = \trailingslashit( \get_site_url( $site['id'] ) );
	WP_CLI::success( "End-to-end testing env is ready: {$site_url}" );
}

setup();
exit;
