describe( 'Grade comments as a student', () => {
	const siteUrl = Cypress.env('site');

	before( () => {
		cy.logout();
		cy.login('student2');
		cy.preserveCookies();
	});

	context( 'Site', () => {
		before( () => {
			cy.visit(`${siteUrl}/test-grade-comments/`);
		});

		it( 'cannot see grade/private comments options', () => {
			cy.get('#olgc-private-comment').should('not.exist');
			cy.get('#olgc-add-a-grade').should('not.exist');
			cy.get('#olgc-grade').should('not.exist');
		});

		it( 'can see public grade comments', () => {
			cy.get('.comment-list > .comment-has-grade').should('exist');
		});

		it( 'cannot see private comments', () => {
			cy.get('.comment-list > .comment-is-private').should('not.exist');
		});
	});

	context( 'Dashboard', () => {
		before( () => {
			cy.visit(`${siteUrl}/wp-admin/`);
		});

		it( 'cannot see grade column for posts', () => {
			cy.get('#menu-posts > a').click();

			cy.get('#grade').should('not.exist');
		});

		it( 'cannot see grade column for comments', () => {
			cy.get('#menu-comments > a').click();

			cy.get('#grade').should('not.exist');
		});

		it( 'can see public grade comments', () => {
			cy.get('#the-comment-list > .comment-has-grade').should('exist');
		});

		it( 'cannot see private comments', () => {
			cy.get('#the-comment-list > .comment-is-private').should('not.exist');
		});
	});
});
