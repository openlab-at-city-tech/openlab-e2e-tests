import faker from 'faker';

describe( 'Account', () => {
	const account = {
		firstName: faker.name.firstName(),
		lastName: faker.name.lastName(),
		email: 'tests@mail.citytech.cuny.edu',
		password: faker.internet.password(),
		type: 'Student',
		friend: 'teststudent'
	};

	account.fullName = `${account.firstName} ${account.lastName}`;
	account.userName = `${account.firstName}${account.lastName}`.toLowerCase(),

	before( () => {
		cy.logout();
	});

	context( 'Sign Up', () => {
		before( () => {
			cy.visit('/register/');
		});

		// Aliases.
		beforeEach( () => {
			cy.get('#signup_username').as('userName');
			cy.get('#field_241').as('firstName');
			cy.get('#field_3').as('lastName');
			cy.get('#signup_email').as('email');
			cy.get('#signup_email_confirm').as('emailConfirm');
			cy.get('#signup_password').as('pass');
			cy.get('#signup_password_confirm').as('passConfirm');
			cy.get('#field_1').as('displayName');
			cy.get('#field_7').as('type');
			cy.get('#signup_submit').as('submit');
		});

		it( 'has required fields', () => {
			// Currenly we have 9 required fields
			cy.get('[data-parsley-required=""]').should('have.length', 9);
		});

		it( 'should display correct error message', () => {
			cy.get('@userName').focus();
			cy.get('@firstName').focus();

			cy.get('#signup_username_error li')
				.should('contain', 'Username is required.');
		});

		it( 'allows to create account', () => {
			cy.get('@userName').type(account.userName);
			cy.get('@firstName').type(account.firstName);
			cy.get('@lastName').type(account.lastName);
			cy.get('@email').clear().type(account.email);
			cy.get('@emailConfirm').type(account.email);
			cy.get('@pass').type(account.password);
			cy.get('@passConfirm').type(account.password);
			cy.get('@displayName').type(`${account.firstName} ${account.lastName}`);
			cy.get('@type').select(account.type);

			cy.wait(2000);

			cy.get('select[name="departments-dropdown"]')
				.select('undecided');

			cy.get('@submit')
				.should('contain', 'Complete Sign Up')
				.click();

			cy.get('#signup_form').should('contain', 'Sign Up Complete!');
		});
	});

	context( 'My OpenLab', () => {
		before( () => {
			cy.visit('/');
		});

		it( 'allows user to login', () => {
			cy.get('#sidebar-user-login').type(account.userName);
			cy.get('#sidebar-user-pass').type(account.password);
			cy.get('#sidebar-wp-submit').click();

			cy.get('#open-lab-login')
				.should('contain', account.fullName);
		});

		it( 'displays account creation activity', () => {
			cy.visit(`/members/${account.userName}`);

			cy.get('#activity-stream .activity-content')
				.should('contain', 'registered member')
		});

		it( 'displays correct information', () => {
			cy.get('#openlab-main-content .profile-name')
				.should('contain', account.fullName);

			cy.get('#openlab-main-content .profile-type')
				.should('contain', account.type);

			cy.get('#course-activity-stream').should('exist');
			cy.get('#project-activity-stream').should('exist');
			cy.get('#club-activity-stream').should('exist');
			cy.get('#members-list').should('exist');
		});

		it( 'displays create portfolio link', () => {
			cy.get('#portfolio-sidebar-widget')
				.should('contain', 'Create an ePortfolio');
		});

		it( 'can edit profile', () => {
			cy.get('#item-buttons').contains('My Settings').click();
			cy.get('.nav-inline').contains('Edit Profile').click();

			// Field IDs are different for "Stuff" and "Student".
			cy.get('#field_196').type('https://exmaple.com');
			cy.get('#field_197').type(`@${account.userName}`);
			cy.get('#profile-group-edit-submit').click();

			cy.get('#message > p').should('contain', 'Changes saved.');
		});

		it( 'can invite new members', () => {
			const newMember = 'e2e_member@example.com';

			cy.get('#item-buttons').contains('My Invitations').click();
			cy.get('.nav-inline').contains('Invite New Members').click();

			cy.get('#invite-anyone-email-addresses').type(newMember);
			cy.get('#invite-anyone-submit').click();

			cy.get('.invite-anyone-sent-invites .col-email')
				.should('contain', newMember);
		});

		it( 'can send messages', () => {
			const message = {
				subject: 'End-to-End Test',
				content: 'This message was sent via Cypress.'
			};

			cy.get('#item-buttons').contains('My Messages').click();
			cy.get('.nav-inline').contains('Compose').click();

			cy.get('#send-to-input').type(account.friend);
			cy.get('#subject').type(message.subject);
			cy.get('#message_content').type(message.content);
			cy.get('#send').click();

			cy.get('#message-subject')
				.should('contain', message.subject);
		});

		it( 'can make friends', () => {
			cy.visit(`/members/${account.friend}`);

			cy.get('#profile-action-wrapper a.friendship-button')
				.as('friendButton');

			cy.get('@friendButton')
				.should('contain', 'Add Friend')
				.click();

			cy.get('@friendButton')
				.should('contain', 'Pending Friend');
		});

		it( 'can delete account', () => {
			cy.visit(`/members/${account.userName}`);

			cy.get('#item-buttons').contains('My Settings').click();
			cy.get('.nav-inline').contains('Delete Account').click();

			cy.get('#delete-account-button').as('delete');

			cy.get('.bp-template-notice > p').should('contain', 'WARNING:');
			cy.get('#delete-account-understand').check('1');

			cy.get('@delete').should('not.be.disabled');
			cy.get('@delete').click();
		});
	});
});
