describe( 'Course Settings', () => {
	context( 'Group Admin', () => {
		before( () => {
			cy.logout();
			cy.login('mamaduka');
			cy.preserveCookies();
			cy.visit('/groups/e2e-testing-course/admin/manage-members/');
		} );

		it( 'can see change membership controls', () => {
			cy.get('.group-member-actions').should('exist');
		} );

		it( 'can promote group memeber', () => {
			cy.get('.members')
				.first()
				.find('.member-promote-to-mod')
				.click();

			cy.get('.updated p')
				.should('contain', 'User promoted successfully' );
		} );

		it( 'can demote group memeber', () => {
			cy.get('.moderators')
				.first()
				.find('.mod-demote-to-member')
				.click();

			cy.get('.updated p')
				.should('contain', 'User demoted successfully' );
		} );

		it( 'has submenu', () => {
			cy.get('#openlab-main-content .submenu').should('exist');
		} );

		it( 'can see all submenus', () => {
			cy.get('#openlab-main-content .submenu').as('submenu');
			
			cy.get('@submenu').should('contain', 'Member Requests');
			cy.get('@submenu').should('contain', 'Invite New Members');
			cy.get('@submenu').should('contain', 'Email Members');
			cy.get('@submenu').should('contain', 'Your Email Options');
		} );

		// Member selection does AJAX call and fails the tests.
		it.skip( 'can invite new members', () => {
			cy.get('.nav-inline')
				.contains('Invite New Members')
				.click();

			// Choose member from autocomplete.
			cy.get('[name="send-to-input"]').type('Test Student');
			cy.get('.autocomplete .selected').click();
			cy.get('.invite-anyone-invite-list').should('contain', 'Test Student');

			// Send invitation.
			cy.get('[name="submit"]').click();

			cy.get('.updated p')
				.should('contain', 'Your invitation was sent!' );
		} );

		it( 'can send emails to members', () => {
			cy.get('.nav-inline')
				.contains('Email Members')
				.click();

			cy.get('[name="ass_admin_notice_subject"]').type('e2e email subject');
			cy.get('[name="ass_admin_notice"]').type('e2e email content');

			// Send the email.
			cy.get('[name="ass_admin_notice_send"]').click();

			cy.get('.updated p')
				.should('contain', 'The email notice was sent successfully.' );
		} );
	} );

	context( 'Group Member', () => {
		before( () => {
			cy.logout();
			cy.login('student1');
			cy.preserveCookies();
			cy.visit('/groups/e2e-testing-course/');
			cy.get('#item-buttons').contains('Membership').click();
		} );

		it( 'has submenu', () => {
			cy.get('#openlab-main-content .submenu').should('exist');
		} );

		it( 'can see invite members and email options submenus', () => {
			cy.get('#openlab-main-content .submenu').as('submenu');

			cy.get('@submenu').should('contain', 'Invite New Members');
			cy.get('@submenu').should('contain', 'Your Email Options');
		} );
	} );
} );
