describe( 'Course Settings', () => {
	const CREATE_URL = '/groups/create/step/group-details/?type=course';
	const COURSE = {
		name: 'Test Settings Course',
		desc: 'A test settings course description',
		school: 'tech',
		dept: 'communication-design',
		status: 'private',
	};

	before( () => {
		cy.login('faculty');
		cy.preserveCookies();
	} );

	// Use normal test since we don't have factories.
	it( 'create testing course', () => {
		cy.visit(CREATE_URL);

		// Fill in required fields.
		cy.get('#group-name').type(COURSE.name);
		cy.get('#group-desc').type(COURSE.desc);
		cy.get('input[name="schools[]"]').check(COURSE.school);
		cy.get('input[name="departments[]"]').check(COURSE.dept);

		// Don't create site
		cy.get('#wds_website_check').uncheck();

		cy.get('[name="save"]').click();

		// Set privacy.
		cy.get('input[name="group-status"]').check(COURSE.status);
		cy.get('[name="save"]').click();

		// Skip avatar.
		cy.get('[name="save"]').click();

		// Finish creation.
		cy.get('[name="save"]').click();
	} );

	context( 'Edit Profile', () => {
		before( () => {
			cy.get('#item-buttons').contains('Settings').click();
		} );

		it( 'has submenu', () => {
			cy.get('#openlab-main-content .submenu').should('exist');
		} );

		it( 'displayes correct information', () => {
			cy.get('#group-name').should('have.value', COURSE.name);
			cy.get('#group-desc').should('have.value', COURSE.desc);
			cy.get('input[name="schools[]"]:checked').should('have.value', COURSE.school);
			cy.get('input[name="departments[]"]:checked').should('have.value', COURSE.dept);
		} );

		it( 'checks required fields', () => {
			// Remove School(s) to trigger the error.
			cy.get('[name="schools[]"]').uncheck();

			// Trigger error for School(s).
			cy.get('#save').click();
			cy.get('.error p')
				.should('contain', 'You must provide a school and department.');
		} );

		it( 'can add new site to exsiting course', () => {
			cy.get('#wds_website_check').check();

			// Use exteranl site option. Create new site uses AJAX validation.
			cy.get('input[name="new_or_old"]').check('external');
			cy.get('#external-site-url').type('https://buddypress.org');
		} );
	} );

	// Can't really test image uploads. Cypress limitation.
	// But we're going to check HTML elements.
	context( 'Change Avatar', () => {
		before( () => {
			cy.get('.nav-inline')
				.contains('Change Avatar')
				.click();
		} );

		it( 'can delete avatar', () => {
			// This button exist even if group doesn't have avatar.
			cy.get('.btn-primary').contains('Delete Avatar').should('exist');
		} );

		it( 'can upload avatar', () => {
			cy.get('#upload').should('exist');
		} );
	} );

	context( 'Settings', () => {
		before( () => {
			cy.get('.nav-inline')
				.contains('Settings')
				.click();
		} );

		it( 'can turn off Discussion, Docs, and Files', () => {
			cy.get('[name="openlab-edit-group-forum"]').uncheck();
			cy.get('[name="openlab-edit-group-docs"]').uncheck();
			cy.get('[name="openlab-edit-group-files"]').uncheck();

			// Save changes.
			cy.get('[name="save"]').click();

			cy.get('#item-buttons').should('not.contain', 'Discussion');
			cy.get('#item-buttons').should('not.contain', 'Docs');
			cy.get('#item-buttons').should('not.contain', 'Files');
		} );

		it( 'can turn on Discussion, Docs, and Files', () => {
			cy.get('[name="openlab-edit-group-forum"]').check();
			cy.get('[name="openlab-edit-group-docs"]').check();
			cy.get('[name="openlab-edit-group-files"]').check();

			// Save changes.
			cy.get('[name="save"]').click();

			cy.get('#item-buttons').should('contain', 'Discussion');
			cy.get('#item-buttons').should('contain', 'Docs');
			cy.get('#item-buttons').should('contain', 'Files');
		} );

		it( 'can add change Related Link settings', () => {
			cy.get('[name="related-links-list-enable"]').check();
			cy.get('[name="related-links-list-heading"]').type('e2e Related Links');

			cy.get('[name="save"]').click();

			cy.get('[name="related-links-list-enable"]').should('be.checked');
			cy.get('[name="related-links-list-heading"]')
				.should('have.value', 'e2e Related Links');
		} );

		it( 'can add item to Related Link list', () => {
			cy.get('[name="related-links[1][name]"]').type('Example');
			cy.get('[name="related-links[1][url]"]').type('https://example.com');

			cy.get('[name="save"]').click();

			cy.get('[name="related-links[1][name]"]').should('have.value', 'Example');
			cy.get('[name="related-links[1][url]"]').should('have.value', 'https://example.com');
		} );

		it( 'can remove item from Related Link list', () => {
			cy.get('.related-link-actions > .related-link-remove')
				.click();

			cy.get('[name="save"]').click();

			cy.get('[name="related-links[1][name]"]').should('not.have.value');
			cy.get('[name="related-links[1][url]"]').should('not.have.value');
		} );
	} );

	context( 'Delete', () => {
		before( () => {
			cy.get('.nav-inline')
				.contains('Delete Course')
				.click();
		} );

		it( 'cannot click delete without confirming', () => {
			cy.get('#delete-group-button').as('delete');
	
			cy.get('#message > p').should('contain', 'WARNING:');
			cy.get('#delete-group-understand').check('1');
	
			cy.get('@delete').should('not.be.disabled');
			cy.get('@delete').click();
		} );
	} );
} );
