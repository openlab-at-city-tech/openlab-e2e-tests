describe( 'Grade comments as an admin', () => {
	const siteUrl = Cypress.env('site');

	before( () => {
		cy.logout();
		cy.login('faculty');
		cy.preserveCookies();
	});

	context( 'Site', () => {
		before( () => {
			cy.visit(`${siteUrl}/test-grade-comments/`);
		});

		beforeEach( () => {
			cy.get('.comment-list > .comment-has-grade').first().as('gradeComment');
		});

		it( 'can see grade/private comments options', () => {
			cy.get('#olgc-private-comment').should('exist');
			cy.get('#olgc-add-a-grade').should('exist');
			cy.get('#olgc-grade').should('exist');
		});

		it( 'can see grade comments', () => {
			cy.get('.comment-list > .comment-has-grade').should('exist');
		});

		it( 'can see private comments', () => {
			cy.get('.comment-list > .comment-is-private').should('exist');
		});

		it( 'has default state of hidden', () => {
			cy.get('@gradeComment')
				.find('.olgc-grade-display')
				.should('have.class', 'olgc-grade-hidden');
		});

		it( 'can reveal grades', () => {
			cy.get('@gradeComment')
				.find('.olgc-show-grade')
				.each( ( $el ) => cy.wrap($el).click() );

			cy.get('@gradeComment')
				.find('.olgc-grade-display')
				.should('not.have.class', 'olgc-grade-hidden');
		});
	});

	context( 'Dashboard', () => {
		before( () => {
			cy.visit(`${siteUrl}/wp-admin/`);
		});

		it( 'can see grade column for posts', () => {
			cy.get('#menu-posts > a').click();

			cy.get('#grade').should('exist').and('contain', 'Grade');
		});

		it( 'can see grade column for comments', () => {
			cy.get('#menu-comments > a').click();

			cy.get('#grade').should('exist').and('contain', 'Grade');
		});

		it( 'can see grade comments', () => {
			cy.get('#the-comment-list > .comment-has-grade').should('exist');
		});

		it( 'can see private comments', () => {
			cy.get('#the-comment-list > .comment-is-private').should('exist');
		});
	});
});
