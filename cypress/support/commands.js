Cypress.Commands.add('login', ( type ) => {
	const account = Cypress.env( type );

	cy.request({
		url: '/wp-login.php',
		method: 'POST',
		form: true,
		body: {
			log: account.user,
			pwd: account.pass,
			rememberme: 'forever',
			testcookie: 1,
		},
	});
});

/**
 * Logout by clearing whitelisted/preserved cookies.
 *
 * Currently `cy.clearCookies()` doesn't work for this.
 *
 * @see https://github.com/cypress-io/cypress/issues/781
 * @see https://github.com/cypress-io/cypress/issues/808
 */
Cypress.Commands.add('logout', () => {
	cy.getCookies().then( ( cookies ) => {
		cookies.forEach( cookie => cy.clearCookie(cookie.name) )
	});
});

/**
 * Preserve cookies accross multiple tests.
 * Useful when running multiple tests in same context.
 */
Cypress.Commands.add('preserveCookies', () => {
	Cypress.Cookies.defaults({
		whitelist: () => true,
	});

	cy.getCookies().then( ( cookies ) => {
		cookies.forEach( cookie => Cypress.Cookies.preserveOnce(cookie.name) )
	});
});

