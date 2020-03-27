# OpenLab e2e Tests

## Getting Started

Clone or download project repository.

Install package dependencies:
```
npm install
```

Copy distributed Cypress configuration and update credentials:
```
cp cypress.dist.json cypress.json
```

Run tests using Cypress GUI:
```
npx cypress open
```

## Setup Test Data

```
wp eval-file bin/e2e-tests-setup.php --user=<admin-id>
```

## Notes

* The Cypress might fail to authorize users if server has `.htaccess` directive against brute-force password attacks.
